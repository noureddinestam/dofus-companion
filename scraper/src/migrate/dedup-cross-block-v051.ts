import { readFileSync, writeFileSync, copyFileSync, existsSync, renameSync } from 'fs';
import { join, resolve } from 'path';
import { diceCoefficient, normalize } from '../validate/anchors.ts';
import {
  validateDungeons,
  type Bullet,
  type CombatCard,
  type Dungeon,
  type Monster,
} from '../validate.ts';

const APP_DATA_DIR = resolve(process.cwd(), '../app/src/data');
const APP_DATA = join(APP_DATA_DIR, 'dungeons.json');
const APP_DATA_BACKUP = join(APP_DATA_DIR, 'dungeons.pre-v051-dedup.json');
const OUTPUT_DIR = join(process.cwd(), 'output');
const OUTPUT_JSON = join(OUTPUT_DIR, 'dungeons.json');
const REPORT = join(OUTPUT_DIR, 'MIGRATION-V051-DEDUP.md');

const DICE_DUPLICATE_THRESHOLD = 0.8;

/** Render order that decides which copy survives when a bullet appears
 *  in two blocks. unlock comes first (it's the scan-first block), then
 *  dangers, then tips. */
const DEDUP_PRIORITY: readonly ('unlock' | 'dangers' | 'tips')[] = ['unlock', 'dangers', 'tips'];

export interface DedupStats {
  totalCardsScanned: number;
  cardsTouched: number;
  bulletsDropped: number;
  droppedByBlock: Record<'dangers' | 'tips', number>;
}

function bulletText(b: Bullet): { nFr: string; nEn: string } {
  return { nFr: normalize(b.text.fr), nEn: normalize(b.text.en) };
}

function areDuplicate(a: Bullet, b: Bullet): number {
  const { nFr: aFr, nEn: aEn } = bulletText(a);
  const { nFr: bFr, nEn: bEn } = bulletText(b);
  return Math.max(diceCoefficient(aFr, bFr), diceCoefficient(aEn, bEn));
}

export function dedupCrossBlock(card: CombatCard, stats: DedupStats): CombatCard {
  // Iterate in priority order and keep a running "seen" list of (block, bullet).
  // For each subsequent bullet, if it duplicates anything already seen, drop it.
  const seen: Array<{ block: 'unlock' | 'dangers' | 'tips'; bullet: Bullet }> = [];
  const kept: Record<'unlock' | 'dangers' | 'tips', Bullet[]> = {
    unlock: [],
    dangers: [],
    tips: [],
  };
  let dropsInCard = 0;
  for (const block of DEDUP_PRIORITY) {
    const bullets = card[block];
    for (const b of bullets) {
      const dup = seen.find((s) => areDuplicate(s.bullet, b) >= DICE_DUPLICATE_THRESHOLD);
      if (dup) {
        // Drop this one — the earlier-priority copy survives.
        if (block !== 'unlock') {
          stats.droppedByBlock[block as 'dangers' | 'tips']++;
        }
        stats.bulletsDropped++;
        dropsInCard++;
        continue;
      }
      seen.push({ block, bullet: b });
      kept[block].push(b);
    }
  }
  if (dropsInCard > 0) stats.cardsTouched++;
  return kept;
}

function migrateMonster(m: Monster, stats: DedupStats): Monster {
  if (!m.combat) return m;
  stats.totalCardsScanned++;
  return { ...m, combat: dedupCrossBlock(m.combat, stats) };
}

function migrateBoss(b: Dungeon['boss'], stats: DedupStats): Dungeon['boss'] {
  if (!b.combat) return b;
  stats.totalCardsScanned++;
  return { ...b, combat: dedupCrossBlock(b.combat, stats) };
}

function loadAppDungeons(): Dungeon[] {
  if (!existsSync(APP_DATA)) {
    throw new Error(`Cannot find ${APP_DATA}.`);
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
  if (existsSync(APP_DATA) && !existsSync(APP_DATA_BACKUP)) {
    renameSync(APP_DATA, APP_DATA_BACKUP);
    console.log('   ✓ Backup: dungeons.json → dungeons.pre-v051-dedup.json');
  }
  copyFileSync(OUTPUT_JSON, APP_DATA);
  console.log(`   ✓ Written ${OUTPUT_JSON} and copied to ${APP_DATA}`);
}

export async function runDedupCrossBlock(): Promise<void> {
  console.log('\n🧹 v0.5.1 cross-block deduplication (Dice ≥ 0.80)');
  const dungeons = loadAppDungeons();
  const stats: DedupStats = {
    totalCardsScanned: 0,
    cardsTouched: 0,
    bulletsDropped: 0,
    droppedByBlock: { dangers: 0, tips: 0 },
  };

  const migrated = dungeons.map((d) => ({
    ...d,
    boss: migrateBoss(d.boss, stats),
    monsters: d.monsters.map((m) => migrateMonster(m, stats)),
  }));

  console.log(`   ✓ Cards scanned           : ${stats.totalCardsScanned}`);
  console.log(`   ✓ Cards touched           : ${stats.cardsTouched}`);
  console.log(`   ✓ Bullets dropped (total) : ${stats.bulletsDropped}`);
  console.log(`      └ dangers drops        : ${stats.droppedByBlock.dangers}`);
  console.log(`      └ tips drops           : ${stats.droppedByBlock.tips}`);

  writeMigrated(migrated);
  writeFileSync(
    REPORT,
    [
      '# v0.5.1 cross-block deduplication',
      '',
      `Generated: ${new Date().toISOString()}`,
      '',
      `- Cards scanned: ${stats.totalCardsScanned}`,
      `- Cards touched: ${stats.cardsTouched}`,
      `- Bullets dropped (total): ${stats.bulletsDropped}`,
      `  - from dangers: ${stats.droppedByBlock.dangers}`,
      `  - from tips: ${stats.droppedByBlock.tips}`,
      '',
      'Priority order: unlock > dangers > tips. Earlier-priority copies survive.',
      'Threshold: Dice coefficient ≥ 0.80 on normalized FR or EN text.',
    ].join('\n') + '\n',
  );
  console.log(`   ✓ Report → ${REPORT}`);
}
