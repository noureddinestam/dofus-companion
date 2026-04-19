import { readFileSync, writeFileSync, copyFileSync, existsSync, renameSync } from 'fs';
import { join, resolve } from 'path';
import {
  validateDungeons,
  type Boss,
  type CombatCard,
  type Dungeon,
  type Lang,
  type Monster,
} from '../validate.ts';
import { extractCombatCard, estimateTokens } from '../llm/extract-combat-card.ts';
import { hasApiKey, DEFAULT_MODEL, type LlmCallOptions } from '../llm/client.ts';
import {
  fetchMonsterStrategy,
  type FandomMonsterStrategy,
} from '../sources/fandom-monster.ts';
import { sleep } from '../cache.ts';

const APP_DATA_DIR = resolve(process.cwd(), '../app/src/data');
const APP_DATA = join(APP_DATA_DIR, 'dungeons.json');
const APP_DATA_BACKUP = join(APP_DATA_DIR, 'dungeons.pre-v05-monsters.json');
const OUTPUT_DIR = join(process.cwd(), 'output');
const OUTPUT_JSON = join(OUTPUT_DIR, 'dungeons.json');
const MIGRATION_REPORT = join(OUTPUT_DIR, 'MIGRATION-V05-MONSTERS.md');
const FANDOM_DELAY_MS = 500;

const PRICE_INPUT_PER_MTOK_USD = 3;
const PRICE_OUTPUT_PER_MTOK_USD = 15;
const USD_TO_EUR = 0.92;

interface MonsterSource {
  text: string;
  lang: Lang;
  url: string;
  /** 'fandom' when the text comes from the Fandom Strategy section, 'boss-mention' when reconstructed from boss excerpts. */
  kind: 'fandom' | 'boss-mention';
}

export interface MonsterMigrationOptions extends LlmCallOptions {
  dryRunCost?: boolean;
}

export interface MonsterMigrationStats {
  uniqueMonsters: number;
  withFandomStrategy: number;
  withBossMentionOnly: number;
  withNoSource: number;
  extractionAttempted: number;
  withNonEmptyCard: number;
  withEmptyCard: number;
  bulletsByBlock: Record<'unlock' | 'constraints' | 'dangers' | 'tips', number>;
  rejected: number;
  rejectReasons: string[];
}

export interface MonsterCostEstimate {
  eligibleMonsters: number;
  tokensInputTotal: number;
  tokensOutputTotal: number;
  priceUsd: number;
  priceEur: number;
}

/**
 * Construit la map { monsterId → unique Monster } depuis l'array de dungeons.
 * Un monstre peut apparaître dans plusieurs donjons — on garde une seule copie
 * pour la scrape. Les boss ne sont PAS inclus (ils ont déjà leur combat via Phase B).
 */
export function collectUniqueMonsters(dungeons: Dungeon[]): Map<string, Monster> {
  const map = new Map<string, Monster>();
  for (const d of dungeons) {
    for (const m of d.monsters) {
      if (d.boss.id === m.id) continue; // skip boss-aliased monster entries
      if (!map.has(m.id)) map.set(m.id, m);
    }
  }
  return map;
}

/**
 * Extrait les paragraphes qui mentionnent un monstre (par nom FR ou EN)
 * depuis un texte de stratégie de boss. Retourne [] si aucune mention.
 * Utilisé en fallback quand le monstre n'a pas de section Strategy sur Fandom.
 */
export function extractMentionsFromBossText(
  text: string,
  monsterNameFr: string,
  monsterNameEn: string | null,
): string[] {
  const paragraphs = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const needles: string[] = [monsterNameFr];
  if (monsterNameEn && monsterNameEn !== monsterNameFr) needles.push(monsterNameEn);

  const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regexes = needles.map((n) => new RegExp(`\\b${escape(n)}\\b`, 'i'));

  const matched: string[] = [];
  for (const p of paragraphs) {
    if (regexes.some((re) => re.test(p))) matched.push(p);
  }
  return matched;
}

/**
 * Pour un monstre donné, trouve toutes les mentions dans les boss strategies
 * du dataset. Retourne un source texte reconstruit ou null.
 */
export function collectBossMentions(
  monster: Monster,
  dungeons: Dungeon[],
): MonsterSource | null {
  // Priorité FR → EN pour la cohérence avec fandom-monster.ts.
  for (const lang of ['fr', 'en'] as const) {
    const excerpts: string[] = [];
    let url: string | null = null;
    for (const d of dungeons) {
      const long = d.boss.strategies?.long[lang];
      if (!long) continue;
      const mentions = extractMentionsFromBossText(long.text, monster.name, monster.nameEn);
      if (mentions.length === 0) continue;
      excerpts.push(...mentions);
      if (!url) {
        url =
          long.provenance.kind === 'native'
            ? long.provenance.sourceUrl
            : long.provenance.kind === 'llm-grounded'
              ? long.provenance.baseSourceUrl
              : long.provenance.prUrl;
      }
    }
    if (excerpts.length > 0 && url) {
      return {
        text: excerpts.join('\n\n').slice(0, 1800),
        lang,
        url,
        kind: 'boss-mention',
      };
    }
  }
  return null;
}

function fandomToSource(f: FandomMonsterStrategy): MonsterSource {
  return { text: f.text, lang: f.lang, url: f.url, kind: 'fandom' };
}

function freshStats(uniqueCount: number): MonsterMigrationStats {
  return {
    uniqueMonsters: uniqueCount,
    withFandomStrategy: 0,
    withBossMentionOnly: 0,
    withNoSource: 0,
    extractionAttempted: 0,
    withNonEmptyCard: 0,
    withEmptyCard: 0,
    bulletsByBlock: { unlock: 0, constraints: 0, dangers: 0, tips: 0 },
    rejected: 0,
    rejectReasons: [],
  };
}

/**
 * Étape 1 : pour chaque monstre unique, résout son source texte
 * (Fandom Strategy en priorité, sinon excerpts boss, sinon null).
 * Cette étape ne consomme PAS d'API LLM — uniquement HTTP Fandom.
 */
export async function resolveMonsterSources(
  monsters: Map<string, Monster>,
  dungeons: Dungeon[],
  onProgress?: (done: number, total: number, label: string) => void,
): Promise<Map<string, MonsterSource>> {
  const sources = new Map<string, MonsterSource>();
  const total = monsters.size;
  let done = 0;
  for (const [id, m] of monsters) {
    done++;
    onProgress?.(done, total, m.name);

    const fandom = await fetchMonsterStrategy(m.name, m.nameEn);
    if (fandom) {
      sources.set(id, fandomToSource(fandom));
      await sleep(FANDOM_DELAY_MS);
      continue;
    }

    const mention = collectBossMentions(m, dungeons);
    if (mention) {
      sources.set(id, mention);
      // no Fandom call made for this one, still sleep a touch to stay friendly
      await sleep(100);
      continue;
    }

    await sleep(100);
  }
  return sources;
}

export function estimateMonsterMigrationCost(
  sources: Map<string, MonsterSource>,
): MonsterCostEstimate {
  let tokensInputTotal = 0;
  let tokensOutputTotal = 0;
  for (const src of sources.values()) {
    const est = estimateTokens(src.text);
    tokensInputTotal += est.input;
    tokensOutputTotal += est.output;
  }
  const priceUsd =
    (tokensInputTotal / 1_000_000) * PRICE_INPUT_PER_MTOK_USD +
    (tokensOutputTotal / 1_000_000) * PRICE_OUTPUT_PER_MTOK_USD;
  return {
    eligibleMonsters: sources.size,
    tokensInputTotal,
    tokensOutputTotal,
    priceUsd,
    priceEur: priceUsd * USD_TO_EUR,
  };
}

async function extractOneMonster(
  monsterId: string,
  source: MonsterSource,
  stats: MonsterMigrationStats,
  options: LlmCallOptions,
): Promise<CombatCard | null> {
  stats.extractionAttempted++;
  const result = await extractCombatCard(
    { sourceText: source.text, sourceLang: source.lang, sourceUrl: source.url },
    options,
  );
  if (!result) return null;

  stats.rejected += result.report.rejected;
  stats.rejectReasons.push(
    ...result.report.rejectReasons.map((r) => `[${monsterId}] ${r}`),
  );
  if (!result.report.card) {
    stats.withEmptyCard++;
    return null;
  }
  stats.withNonEmptyCard++;
  stats.bulletsByBlock.unlock += result.report.card.unlock.length;
  stats.bulletsByBlock.constraints += result.report.card.constraints?.length ?? 0;
  stats.bulletsByBlock.dangers += result.report.card.dangers.length;
  stats.bulletsByBlock.tips += result.report.card.tips.length;
  return result.report.card;
}

async function runExtractionPass(
  sources: Map<string, MonsterSource>,
  options: LlmCallOptions,
  onProgress?: (done: number, total: number, label: string) => void,
): Promise<{ cards: Map<string, CombatCard>; stats: MonsterMigrationStats }> {
  const cards = new Map<string, CombatCard>();
  const stats = freshStats(sources.size);
  const total = sources.size;
  let done = 0;
  for (const [id, source] of sources) {
    done++;
    onProgress?.(done, total, id);
    const card = await extractOneMonster(id, source, stats, options);
    if (card) cards.set(id, card);
  }
  return { cards, stats };
}

function mergeCardsIntoDungeons(
  dungeons: Dungeon[],
  cards: Map<string, CombatCard>,
  sources: Map<string, MonsterSource>,
): Dungeon[] {
  return dungeons.map((d) => {
    const nextMonsters = d.monsters.map((m) => {
      const card = cards.get(m.id);
      if (!card) return m;
      return { ...m, combat: card };
    });
    // boss unchanged — Phase B owns boss.combat.
    const bossAsMonster: Monster = d.monsters.find((m) => m.id === d.boss.id) ?? d.boss;
    void bossAsMonster; // guard against unused warn, keep semantic clarity above.
    void sources;
    return { ...d, monsters: nextMonsters };
  });
}

function renderReport(
  stats: MonsterMigrationStats,
  cost: MonsterCostEstimate | null,
  bossMentionOnlyCount: number,
): string {
  const lines: string[] = [];
  lines.push('# Migration v0.5 Monster Combat Cards');
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(`Model: ${DEFAULT_MODEL}`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- Unique monsters scanned: ${stats.uniqueMonsters}`);
  lines.push(`- Source = Fandom Strategy section: ${stats.withFandomStrategy}`);
  lines.push(`- Source = boss-mention fallback only: ${bossMentionOnlyCount}`);
  lines.push(`- No usable source (skipped): ${stats.withNoSource}`);
  lines.push(`- LLM extraction attempted: ${stats.extractionAttempted}`);
  lines.push(`- Card populated: ${stats.withNonEmptyCard}`);
  lines.push(`- Card empty after extraction: ${stats.withEmptyCard}`);
  lines.push(`- Rejected bullets: ${stats.rejected}`);
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
    lines.push(`- Eligible monsters: ${cost.eligibleMonsters}`);
    lines.push(`- Input tokens: ${cost.tokensInputTotal.toLocaleString('en-US')}`);
    lines.push(`- Output tokens: ${cost.tokensOutputTotal.toLocaleString('en-US')}`);
    lines.push(`- Price estimate: $${cost.priceUsd.toFixed(2)} ≈ €${cost.priceEur.toFixed(2)}`);
  }
  if (stats.rejectReasons.length > 0) {
    lines.push('');
    lines.push('## First 30 reject reasons');
    lines.push('');
    for (const reason of stats.rejectReasons.slice(0, 30)) {
      lines.push(`- ${reason}`);
    }
  }
  return lines.join('\n') + '\n';
}

function loadAppDungeons(): Dungeon[] {
  if (!existsSync(APP_DATA)) {
    throw new Error(`Cannot find ${APP_DATA}. Run the full scraper + Phase B first.`);
  }
  const raw = JSON.parse(readFileSync(APP_DATA, 'utf-8')) as unknown[];
  const report = validateDungeons(raw);
  if (report.errors.length > 0) {
    console.warn(`   ⚠ ${report.errors.length} dungeons rejected by Zod during load`);
  }
  return report.valid;
}

function writeMigrated(dungeons: Dungeon[]): void {
  writeFileSync(OUTPUT_JSON, JSON.stringify(dungeons, null, 2));
  if (existsSync(APP_DATA)) {
    if (!existsSync(APP_DATA_BACKUP)) {
      renameSync(APP_DATA, APP_DATA_BACKUP);
      console.log(`   ✓ Backup: dungeons.json → dungeons.pre-v05-monsters.json`);
    }
  }
  copyFileSync(OUTPUT_JSON, APP_DATA);
  console.log(`   ✓ Written ${OUTPUT_JSON} and copied to ${APP_DATA}`);
}

/** Boss type reference kept for explicit consumers; prevents unused-import warning. */
void ({} as Boss);

export async function runMonsterMigration(options: MonsterMigrationOptions): Promise<void> {
  console.log('\n🔄 v0.5 monster migration — loading app/src/data/dungeons.json');
  const dungeons = loadAppDungeons();
  const unique = collectUniqueMonsters(dungeons);
  console.log(`   ✓ ${dungeons.length} dungeons · ${unique.size} unique monsters`);

  console.log('\n🌐 Scraping Fandom monster pages + building boss-mention fallback…');
  const sources = await resolveMonsterSources(unique, dungeons, (done, total, label) => {
    if (done % 25 === 0 || done === total) {
      process.stdout.write(`   [${done}/${total}] ${label.slice(0, 30)}\r`);
    }
  });
  process.stdout.write('\n');

  let withFandom = 0;
  let withBossMention = 0;
  for (const src of sources.values()) {
    if (src.kind === 'fandom') withFandom++;
    else withBossMention++;
  }
  const withoutSource = unique.size - sources.size;
  console.log(
    `   ✓ sources resolved : Fandom=${withFandom} · boss-mention=${withBossMention} · skipped=${withoutSource}`,
  );

  if (options.dryRunCost) {
    const cost = estimateMonsterMigrationCost(sources);
    const stats = freshStats(unique.size);
    stats.withFandomStrategy = withFandom;
    stats.withBossMentionOnly = withBossMention;
    stats.withNoSource = withoutSource;
    console.log('\n💰 dry-run-cost — no LLM call made');
    console.log(`   Eligible monsters: ${cost.eligibleMonsters}`);
    console.log(
      `   Tokens: input ~${cost.tokensInputTotal.toLocaleString('en-US')}, output ~${cost.tokensOutputTotal.toLocaleString('en-US')}`,
    );
    console.log(`   Price estimate: $${cost.priceUsd.toFixed(2)} ≈ €${cost.priceEur.toFixed(2)}`);
    writeFileSync(MIGRATION_REPORT, renderReport(stats, cost, withBossMention));
    console.log(`   ✓ Report → ${MIGRATION_REPORT}`);
    return;
  }

  if (!hasApiKey() && !options.dryRun) {
    throw new Error(
      'ANTHROPIC_API_KEY is not set. Either export the key, re-run with --dry-run-cost, or pass dryRun to hit cache only.',
    );
  }

  console.log(`\n🤖 extractCombatCard on ${sources.size} monsters (model=${DEFAULT_MODEL})`);
  const { cards, stats } = await runExtractionPass(sources, options, (done, total, label) => {
    if (done % 10 === 0 || done === total) {
      process.stdout.write(`   [${done}/${total}] ${label.slice(0, 30)}\r`);
    }
  });
  process.stdout.write('\n');
  stats.withFandomStrategy = withFandom;
  stats.withBossMentionOnly = withBossMention;
  stats.withNoSource = withoutSource;

  console.log('\n📊 Migration summary');
  console.log(`   unique monsters       : ${unique.size}`);
  console.log(`   sources resolved      : Fandom=${withFandom} · boss-mention=${withBossMention}`);
  console.log(`   extraction attempted  : ${stats.extractionAttempted}`);
  console.log(`   card populated        : ${stats.withNonEmptyCard}`);
  console.log(`   card empty after LLM  : ${stats.withEmptyCard}`);
  console.log(
    `   bullets: unlock=${stats.bulletsByBlock.unlock} constraints=${stats.bulletsByBlock.constraints} dangers=${stats.bulletsByBlock.dangers} tips=${stats.bulletsByBlock.tips}`,
  );
  console.log(`   rejected bullets      : ${stats.rejected}`);

  const migrated = mergeCardsIntoDungeons(dungeons, cards, sources);
  writeMigrated(migrated);
  writeFileSync(MIGRATION_REPORT, renderReport(stats, null, withBossMention));
  console.log(`   ✓ Report → ${MIGRATION_REPORT}`);
}
