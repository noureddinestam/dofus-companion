import { readFileSync, writeFileSync, copyFileSync, existsSync, renameSync } from 'fs';
import { join, resolve } from 'path';
import {
  validateDungeons,
  type Boss,
  type CombatCard,
  type Dungeon,
  type Lang,
  type StrategyLong,
  type StrategyShort,
  type Provenance,
} from '../validate.ts';
import {
  extractCombatCard,
  estimateTokens,
  EXTRACT_COMBAT_CARD_PROMPT_VERSION,
} from '../llm/extract-combat-card.ts';
import { hasApiKey, DEFAULT_MODEL, type LlmCallOptions } from '../llm/client.ts';

const APP_DATA_DIR = resolve(process.cwd(), '../app/src/data');
const APP_DATA = join(APP_DATA_DIR, 'dungeons.json');
const APP_DATA_BACKUP = join(APP_DATA_DIR, 'dungeons.pre-v05-migration.json');
const OUTPUT_DIR = join(process.cwd(), 'output');
const OUTPUT_JSON = join(OUTPUT_DIR, 'dungeons.json');
const MIGRATION_REPORT = join(OUTPUT_DIR, 'MIGRATION-V04-TO-V05-BOSS.md');

// Sonnet 4.5 pricing (2026 snapshot) — used for dry-run-cost estimate.
// Input $3/MTok, Output $15/MTok. If Anthropic updates, we re-check.
const PRICE_INPUT_PER_MTOK_USD = 3;
const PRICE_OUTPUT_PER_MTOK_USD = 15;
const USD_TO_EUR = 0.92;

export interface MigrationOptions extends LlmCallOptions {
  /** If true, no LLM call happens — only a candidate/token/price report. */
  dryRunCost?: boolean;
}

export interface MigrationStats {
  totalDungeons: number;
  bossWithStrategy: number;
  bossMigrated: number;
  bossWithNonEmptyCard: number;
  bossEmptyCard: number;
  bossSkippedNoStrategy: number;
  bulletsByBlock: Record<'unlock' | 'constraints' | 'dangers' | 'tips', number>;
  rejected: number;
  rejectReasons: string[];
}

export interface CostEstimate {
  eligibleBoss: number;
  tokensInputTotal: number;
  tokensOutputTotal: number;
  priceUsd: number;
  priceEur: number;
}

function pickSourceLang(boss: Boss): { lang: Lang; long: StrategyLong; url: string } | null {
  const b = boss.strategies;
  if (!b) return null;
  if (b.long.fr) {
    const prov = b.long.fr.provenance;
    const url = prov.kind === 'native' ? prov.sourceUrl : prov.kind === 'llm-grounded' ? prov.baseSourceUrl : prov.prUrl;
    return { lang: 'fr', long: b.long.fr, url };
  }
  if (b.long.en) {
    const prov = b.long.en.provenance;
    const url = prov.kind === 'native' ? prov.sourceUrl : prov.kind === 'llm-grounded' ? prov.baseSourceUrl : prov.prUrl;
    return { lang: 'en', long: b.long.en, url };
  }
  return null;
}

/**
 * Build the legacyStrategies text array from the v0.4 strategies bundle.
 * Format: "• <short bullet>" lines (preferred lang) + the long text trimmed.
 * Stored verbatim so the <details> footer can render them as-is in the UI.
 */
export function buildLegacyStrategies(boss: Boss): string[] {
  const b = boss.strategies;
  if (!b) return [];

  const preferredLong = b.long.fr ?? b.long.en ?? null;
  const preferredShort = b.short.fr ?? b.short.en ?? null;

  const lines: string[] = [];
  if (preferredShort) {
    for (const bullet of (preferredShort as StrategyShort).bullets) {
      lines.push(`• ${bullet.text}`);
    }
  }
  if (preferredLong) {
    lines.push((preferredLong as StrategyLong).text.trim());
  }
  return lines;
}

/**
 * Compute the dry-run-cost report without any LLM call.
 */
export function estimateMigrationCost(dungeons: Dungeon[]): CostEstimate {
  let eligibleBoss = 0;
  let tokensInputTotal = 0;
  let tokensOutputTotal = 0;
  for (const d of dungeons) {
    const source = pickSourceLang(d.boss);
    if (!source) continue;
    eligibleBoss++;
    const est = estimateTokens(source.long.text);
    tokensInputTotal += est.input;
    tokensOutputTotal += est.output;
  }
  const priceUsd =
    (tokensInputTotal / 1_000_000) * PRICE_INPUT_PER_MTOK_USD +
    (tokensOutputTotal / 1_000_000) * PRICE_OUTPUT_PER_MTOK_USD;
  const priceEur = priceUsd * USD_TO_EUR;
  return { eligibleBoss, tokensInputTotal, tokensOutputTotal, priceUsd, priceEur };
}

function freshStats(total: number): MigrationStats {
  return {
    totalDungeons: total,
    bossWithStrategy: 0,
    bossMigrated: 0,
    bossWithNonEmptyCard: 0,
    bossEmptyCard: 0,
    bossSkippedNoStrategy: 0,
    bulletsByBlock: { unlock: 0, constraints: 0, dangers: 0, tips: 0 },
    rejected: 0,
    rejectReasons: [],
  };
}

async function migrateOneBoss(
  boss: Boss,
  stats: MigrationStats,
  options: LlmCallOptions,
): Promise<{ combat: CombatCard | null; legacyStrategies: string[] | undefined; extraProvenance: Provenance | null }> {
  const source = pickSourceLang(boss);
  if (!source) {
    stats.bossSkippedNoStrategy++;
    return { combat: null, legacyStrategies: undefined, extraProvenance: null };
  }
  stats.bossWithStrategy++;

  const result = await extractCombatCard(
    { sourceText: source.long.text, sourceLang: source.lang, sourceUrl: source.url },
    options,
  );
  if (!result) {
    // LLM call failed — leave boss.combat null, no legacyStrategies yet.
    return { combat: null, legacyStrategies: undefined, extraProvenance: null };
  }

  stats.rejected += result.report.rejected;
  stats.rejectReasons.push(...result.report.rejectReasons);
  stats.bossMigrated++;

  const card = result.report.card;
  if (!card) {
    stats.bossEmptyCard++;
    // Keep legacyStrategies so the UI can show v0.4 fallback.
    return { combat: null, legacyStrategies: buildLegacyStrategies(boss), extraProvenance: null };
  }
  stats.bossWithNonEmptyCard++;
  stats.bulletsByBlock.unlock += card.unlock.length;
  stats.bulletsByBlock.constraints += card.constraints.length;
  stats.bulletsByBlock.dangers += card.dangers.length;
  stats.bulletsByBlock.tips += card.tips.length;

  return {
    combat: card,
    legacyStrategies: buildLegacyStrategies(boss),
    extraProvenance: null,
  };
}

export async function migrateBossCombatCards(
  dungeons: Dungeon[],
  options: LlmCallOptions,
): Promise<{ dungeons: Dungeon[]; stats: MigrationStats }> {
  const stats = freshStats(dungeons.length);
  const migrated: Dungeon[] = [];
  for (let i = 0; i < dungeons.length; i++) {
    const d = dungeons[i];
    process.stdout.write(`   [${i + 1}/${dungeons.length}] ${d.name.slice(0, 32)}...\r`);
    const { combat, legacyStrategies } = await migrateOneBoss(d.boss, stats, options);
    const nextBoss: Boss = {
      ...d.boss,
      combat,
      ...(legacyStrategies && legacyStrategies.length > 0 ? { legacyStrategies } : {}),
    };
    migrated.push({ ...d, boss: nextBoss });
  }
  process.stdout.write('\n');
  return { dungeons: migrated, stats };
}

function renderReport(stats: MigrationStats, cost?: CostEstimate): string {
  const lines: string[] = [];
  lines.push('# Migration v0.4 → v0.5 Boss Combat Cards');
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(`Prompt version: ${EXTRACT_COMBAT_CARD_PROMPT_VERSION}`);
  lines.push(`Model: ${DEFAULT_MODEL}`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- Total dungeons scanned: ${stats.totalDungeons}`);
  lines.push(`- Boss with a v0.4 long strategy: ${stats.bossWithStrategy}`);
  lines.push(`- Boss skipped (no strategy): ${stats.bossSkippedNoStrategy}`);
  lines.push(`- Boss with LLM extraction attempted: ${stats.bossMigrated}`);
  lines.push(`- Boss with at least one bullet: ${stats.bossWithNonEmptyCard}`);
  lines.push(`- Boss with empty card after extraction: ${stats.bossEmptyCard}`);
  lines.push(`- Rejected bullets (anchor/enum/length): ${stats.rejected}`);
  lines.push('');
  lines.push('## Bullets by block');
  lines.push('');
  lines.push(`- 🔓 unlock: ${stats.bulletsByBlock.unlock}`);
  lines.push(`- ⚠️ constraints: ${stats.bulletsByBlock.constraints}`);
  lines.push(`- ❌ dangers: ${stats.bulletsByBlock.dangers}`);
  lines.push(`- 💡 tips: ${stats.bulletsByBlock.tips}`);
  if (cost) {
    lines.push('');
    lines.push('## Cost estimate (dry-run)');
    lines.push('');
    lines.push(`- Eligible boss: ${cost.eligibleBoss}`);
    lines.push(`- Input tokens total: ${cost.tokensInputTotal.toLocaleString('en-US')}`);
    lines.push(`- Output tokens total: ${cost.tokensOutputTotal.toLocaleString('en-US')}`);
    lines.push(`- Price estimate: $${cost.priceUsd.toFixed(2)} ≈ €${cost.priceEur.toFixed(2)}`);
  }
  if (stats.rejectReasons.length > 0) {
    lines.push('');
    lines.push('## First 20 reject reasons');
    lines.push('');
    for (const reason of stats.rejectReasons.slice(0, 20)) {
      lines.push(`- ${reason}`);
    }
  }
  return lines.join('\n') + '\n';
}

function loadAppDungeons(): Dungeon[] {
  if (!existsSync(APP_DATA)) {
    throw new Error(`Cannot find ${APP_DATA}. Run the full scraper at least once.`);
  }
  const raw = JSON.parse(readFileSync(APP_DATA, 'utf-8')) as unknown[];
  const report = validateDungeons(raw);
  if (report.errors.length > 0) {
    console.warn(`   ⚠ ${report.errors.length} dungeons rejected by Zod during load:`);
    for (const err of report.errors.slice(0, 3)) {
      console.warn(`     [${err.name}] ${err.issues.slice(0, 2).map((i) => i.message).join(' / ')}`);
    }
  }
  return report.valid;
}

function writeMigrated(dungeons: Dungeon[]): void {
  writeFileSync(OUTPUT_JSON, JSON.stringify(dungeons, null, 2));
  if (existsSync(APP_DATA)) {
    if (!existsSync(APP_DATA_BACKUP)) {
      renameSync(APP_DATA, APP_DATA_BACKUP);
      console.log(`   ✓ Backup: dungeons.json → dungeons.pre-v05-migration.json`);
    }
  }
  copyFileSync(OUTPUT_JSON, APP_DATA);
  console.log(`   ✓ Written ${OUTPUT_JSON} and copied to ${APP_DATA}`);
}

/**
 * CLI entrypoint used by scraper/src/index.ts via the --only-boss-refactor flag.
 */
export async function runBossMigration(options: MigrationOptions): Promise<void> {
  console.log('\n🔄 v0.5 boss migration — loading app/src/data/dungeons.json');
  const dungeons = loadAppDungeons();
  console.log(`   ✓ ${dungeons.length} dungeons loaded`);

  if (options.dryRunCost) {
    const cost = estimateMigrationCost(dungeons);
    const stats = freshStats(dungeons.length);
    for (const d of dungeons) {
      const source = pickSourceLang(d.boss);
      if (source) stats.bossWithStrategy++;
      else stats.bossSkippedNoStrategy++;
    }
    console.log('\n💰 dry-run-cost — no API call made');
    console.log(`   Eligible boss: ${cost.eligibleBoss}`);
    console.log(`   Tokens: input ~${cost.tokensInputTotal.toLocaleString('en-US')}, output ~${cost.tokensOutputTotal.toLocaleString('en-US')}`);
    console.log(`   Price estimate: $${cost.priceUsd.toFixed(2)} ≈ €${cost.priceEur.toFixed(2)} (Sonnet 4.5)`);
    writeFileSync(MIGRATION_REPORT, renderReport(stats, cost));
    console.log(`   ✓ Report written → ${MIGRATION_REPORT}`);
    return;
  }

  if (!hasApiKey() && !options.dryRun) {
    throw new Error(
      'ANTHROPIC_API_KEY is not set. Either export the key, re-run with --dry-run-cost, or pass dryRun to hit cache only.',
    );
  }

  console.log(`\n🤖 Running extractCombatCard on ${dungeons.length} dungeons (model=${DEFAULT_MODEL})`);
  const { dungeons: migrated, stats } = await migrateBossCombatCards(dungeons, options);
  console.log('\n📊 Migration summary');
  console.log(`   boss with long strategy : ${stats.bossWithStrategy}`);
  console.log(`   boss with non-empty card: ${stats.bossWithNonEmptyCard}`);
  console.log(`   boss with empty card    : ${stats.bossEmptyCard}`);
  console.log(`   bullets: unlock=${stats.bulletsByBlock.unlock} constraints=${stats.bulletsByBlock.constraints} dangers=${stats.bulletsByBlock.dangers} tips=${stats.bulletsByBlock.tips}`);
  console.log(`   rejected bullets: ${stats.rejected}`);

  writeMigrated(migrated);
  writeFileSync(MIGRATION_REPORT, renderReport(stats));
  console.log(`   ✓ Report → ${MIGRATION_REPORT}`);
}
