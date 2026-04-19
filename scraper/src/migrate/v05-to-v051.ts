import { readFileSync, writeFileSync, copyFileSync, existsSync, renameSync } from 'fs';
import { join, resolve } from 'path';
import {
  validateDungeons,
  type Boss,
  type Bullet,
  type CombatCard,
  type Dungeon,
  type Monster,
} from '../validate.ts';

const APP_DATA_DIR = resolve(process.cwd(), '../app/src/data');
const APP_DATA = join(APP_DATA_DIR, 'dungeons.json');
const APP_DATA_BACKUP = join(APP_DATA_DIR, 'dungeons.pre-v051-schema.json');
const OUTPUT_DIR = join(process.cwd(), 'output');
const OUTPUT_JSON = join(OUTPUT_DIR, 'dungeons.json');
const MIGRATION_REPORT = join(OUTPUT_DIR, 'MIGRATION-V05-TO-V051-SCHEMA.md');

export interface SchemaMigrationStats {
  totalDungeons: number;
  bossCardsMigrated: number;
  monsterCardsMigrated: number;
  constraintsFolded: number;
  unlockContextTagged: number;
  unlockActionTagged: number;
  /** v0.5 unlock bullets reclassified to context by the permanence heuristic. */
  unlockReclassifiedAsContext: number;
}

/**
 * Permanence heuristic: a v0.5 unlock bullet that talks about a duration
 * ("pendant 5 tours", "for 5 turns", "toujours", "at all times") expresses a
 * permanent rule, not an ordered action. Demote it to context during the
 * migration instead of leaving it as an action bullet, which avoids a
 * deluge of "negation-in-action" flags in the v0.5.1 audit.
 *
 * Kept deterministic (regex-based, language-aware for FR + EN).
 */
const PERMANENCE_PATTERNS = [
  /\bpendant\s+\d+\s*tours?\b/i,
  /\bpour\s+\d+\s*tours?\b/i,
  /\bfor\s+\d+\s*turns?\b/i,
  /\bover\s+\d+\s*turns?\b/i,
  /\bchaque\s+tour\b/i,
  /\bevery\s+turn\b/i,
  /\btoujours\b/i,
  /\balways\b/i,
  /\ben permanence\b/i,
  /\bat all times\b/i,
];

function isPermanentRule(text: { fr: string; en: string }): boolean {
  return PERMANENCE_PATTERNS.some((p) => p.test(text.fr) || p.test(text.en));
}

/**
 * Deterministic v0.5 → v0.5.1 migration applied at the disk level.
 *
 * Rules:
 * - For every `combat` object : all bullets in `constraints[]` become
 *   `kind: 'context'` bullets prepended to `unlock[]`. Existing unlock
 *   bullets become `kind: 'action'`. `constraints` is dropped.
 * - The `legacyStrategies` v0.4 collapsed footer on boss entries stays
 *   untouched — it's an orthogonal transitional field already handled.
 * - Idempotent: running twice produces the same result.
 */
export function migrateCardDeterministic(card: CombatCard, stats: SchemaMigrationStats): CombatCard {
  const legacy = card.constraints ?? [];
  const contextFromConstraints: Bullet[] = legacy.map((b) => ({ ...b, kind: 'context' }));

  // Split existing unlock bullets: permanence markers → context, else action.
  const contextFromUnlock: Bullet[] = [];
  const actionFromUnlock: Bullet[] = [];
  for (const b of card.unlock) {
    if (b.kind === 'context') {
      contextFromUnlock.push(b);
      continue;
    }
    if (isPermanentRule(b.text)) {
      contextFromUnlock.push({ ...b, kind: 'context' });
      stats.unlockReclassifiedAsContext++;
    } else {
      actionFromUnlock.push({ ...b, kind: 'action' });
    }
  }

  stats.constraintsFolded += legacy.length;
  const mergedContext = [...contextFromConstraints, ...contextFromUnlock];
  stats.unlockContextTagged += mergedContext.length;
  stats.unlockActionTagged += actionFromUnlock.length;
  return {
    unlock: [...mergedContext, ...actionFromUnlock],
    dangers: card.dangers,
    tips: card.tips,
  };
}

function migrateMonster(m: Monster, stats: SchemaMigrationStats): Monster {
  if (!m.combat) return m;
  stats.monsterCardsMigrated++;
  return { ...m, combat: migrateCardDeterministic(m.combat, stats) };
}

function migrateBoss(b: Boss, stats: SchemaMigrationStats): Boss {
  if (!b.combat) return b;
  stats.bossCardsMigrated++;
  return { ...b, combat: migrateCardDeterministic(b.combat, stats) };
}

export function migrateDungeonsV05ToV051(
  dungeons: Dungeon[],
): { dungeons: Dungeon[]; stats: SchemaMigrationStats } {
  const stats: SchemaMigrationStats = {
    totalDungeons: dungeons.length,
    bossCardsMigrated: 0,
    monsterCardsMigrated: 0,
    constraintsFolded: 0,
    unlockContextTagged: 0,
    unlockActionTagged: 0,
    unlockReclassifiedAsContext: 0,
  };
  const migrated = dungeons.map((d) => ({
    ...d,
    boss: migrateBoss(d.boss, stats),
    monsters: d.monsters.map((m) => migrateMonster(m, stats)),
  }));
  return { dungeons: migrated, stats };
}

function loadAppDungeons(): Dungeon[] {
  if (!existsSync(APP_DATA)) {
    throw new Error(`Cannot find ${APP_DATA}. Run the scraper at least once.`);
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
  if (existsSync(APP_DATA) && !existsSync(APP_DATA_BACKUP)) {
    renameSync(APP_DATA, APP_DATA_BACKUP);
    console.log('   ✓ Backup: dungeons.json → dungeons.pre-v051-schema.json');
  }
  copyFileSync(OUTPUT_JSON, APP_DATA);
  console.log(`   ✓ Written ${OUTPUT_JSON} and copied to ${APP_DATA}`);
}

function renderReport(stats: SchemaMigrationStats): string {
  return (
    [
      '# v0.5 → v0.5.1 schema migration',
      '',
      `Generated: ${new Date().toISOString()}`,
      '',
      '## Summary',
      '',
      `- Total dungeons scanned: ${stats.totalDungeons}`,
      `- Boss cards migrated: ${stats.bossCardsMigrated}`,
      `- Monster cards migrated: ${stats.monsterCardsMigrated}`,
      `- Legacy constraints bullets folded into unlock.context: ${stats.constraintsFolded}`,
      `- v0.5 unlock bullets reclassified as context (permanence heuristic): ${stats.unlockReclassifiedAsContext}`,
      `- Unlock bullets finally tagged kind='context': ${stats.unlockContextTagged}`,
      `- Unlock bullets finally tagged kind='action': ${stats.unlockActionTagged}`,
      '',
      'No LLM calls, no network access. Idempotent — running twice is safe.',
    ].join('\n') + '\n'
  );
}

export async function runSchemaMigration(): Promise<void> {
  console.log('\n🔄 v0.5 → v0.5.1 schema migration — loading dataset');
  const dungeons = loadAppDungeons();
  console.log(`   ✓ ${dungeons.length} dungeons`);

  console.log('\n🧮 Folding constraints into unlock.context…');
  const { dungeons: migrated, stats } = migrateDungeonsV05ToV051(dungeons);
  console.log(`   ✓ Boss cards migrated       : ${stats.bossCardsMigrated}`);
  console.log(`   ✓ Monster cards migrated    : ${stats.monsterCardsMigrated}`);
  console.log(`   ✓ constraints → unlock.ctx  : ${stats.constraintsFolded}`);
  console.log(`   ✓ reclassified to context   : ${stats.unlockReclassifiedAsContext} (permanence heuristic)`);
  console.log(`   ✓ unlock.context tagged     : ${stats.unlockContextTagged}`);
  console.log(`   ✓ unlock.action tagged      : ${stats.unlockActionTagged}`);

  writeMigrated(migrated);
  writeFileSync(MIGRATION_REPORT, renderReport(stats));
  console.log(`   ✓ Report → ${MIGRATION_REPORT}`);
}
