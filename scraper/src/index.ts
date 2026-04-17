import { mkdirSync, writeFileSync, copyFileSync, existsSync, renameSync } from 'fs';
import { join, resolve } from 'path';
import Fuse from 'fuse.js';
import { fetchAllDungeons } from './sources/dofusdb.ts';
import { fetchBossStrategy, fandomPageUrl } from './sources/fandom.ts';
import { sleep } from './cache.ts';
import { validateDungeons } from './validate.ts';
import { diffDungeons, loadPreviousDungeons, generateChangelog } from './diff.ts';
import type { Dungeon, Monster, Boss } from './validate.ts';
import type { DbDungeon, DbMonster } from './sources/dofusdb.ts';

const OUTPUT_DIR = join(process.cwd(), 'output');
const OUTPUT_JSON = join(OUTPUT_DIR, 'dungeons.json');
const OUTPUT_FUSE = join(OUTPUT_DIR, 'fuse-index.json');
const OUTPUT_CHANGELOG = join(OUTPUT_DIR, 'CHANGELOG-DATA.md');
const APP_DATA_DIR = resolve(process.cwd(), '../app/src/data');
const APP_DATA = join(APP_DATA_DIR, 'dungeons.json');
const APP_FUSE = join(APP_DATA_DIR, 'fuse-index.json');
const APP_DATA_LEGACY = join(APP_DATA_DIR, 'dungeons.legacy.json');

const DATA_VERSION = '0.3.0';
const FANDOM_DELAY_MS = 700;

mkdirSync(OUTPUT_DIR, { recursive: true });

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toMonster(m: DbMonster): Monster {
  return {
    id: m.id,
    name: m.name,
    nameEn: m.nameEn,
    level: m.level,
    hp: m.hp,
    family: m.family,
    weakElement: m.weakElement,
    resistElement: m.resistElement,
    source: 'dofusdb',
    sourceUrl: m.sourceUrl,
  };
}

async function buildDungeon(db: DbDungeon, onStep?: (s: string) => void): Promise<Dungeon | null> {
  if (!db.boss) return null;
  if (db.recommendedLevel <= 0) return null;

  const now = new Date().toISOString();

  const baseBoss: Monster = toMonster(db.boss);
  let strategy: Boss['strategy'] = null;
  let phases: Boss['phases'] = [];

  // Fandom EN strategy uniquement pour donjons niveau 50+
  if (db.boss.nameEn && db.recommendedLevel >= 50) {
    try {
      const fandom = await fetchBossStrategy(db.boss.nameEn, onStep);
      if (fandom) {
        strategy = {
          text: fandom.text,
          source: 'fandom-en',
          sourceUrl: fandom.url,
        };
      }
      await sleep(FANDOM_DELAY_MS);
    } catch {
      // Silencieux : Fandom peut bloquer/timeout
    }
  }

  const boss: Boss = {
    ...baseBoss,
    strategy,
    phases,
  };

  // Monsters triés par niveau décroissant
  const sortedMonsters = [...db.monsters].sort((a, b) => b.level - a.level);
  const monsters: Monster[] = sortedMonsters.map(toMonster);

  // Filet de sécurité : si aucun monstre standard, garantir au moins le boss en tant que monstre
  const finalMonsters = monsters.length > 0 ? monsters : [baseBoss];

  const levelMin = Math.max(1, db.recommendedLevel - 20);
  const levelMax = db.recommendedLevel + 10;

  return {
    id: slugify(db.name),
    name: db.name,
    nameEn: db.nameEn,
    slug: slugify(db.name),
    aliases: db.nameEn && db.nameEn !== db.name ? [db.nameEn] : [],
    recommendedLevel: db.recommendedLevel,
    levelRange: [levelMin, levelMax],
    monsters: finalMonsters,
    boss,
    externalGuideUrl: fandomPageUrl(db.boss.nameEn) ?? db.sourceUrl,
    lastUpdated: now,
    dataVersion: DATA_VERSION,
  };
}

async function main() {
  console.log('\n🗡️  Dofus Companion — Scraper v0.3 (DofusDB + Fandom EN)\n');

  // 1. Purger ancien fichier app s'il existe (backup legacy)
  if (existsSync(APP_DATA)) {
    try {
      renameSync(APP_DATA, APP_DATA_LEGACY);
      console.log(`📦 Ancien dungeons.json sauvegardé → dungeons.legacy.json`);
    } catch {
      // pas bloquant
    }
  }

  // 2. Fetch DofusDB (source factuelle)
  console.log('\n🔵 Source 1 — DofusDB API (stats factuelles)');
  const dbDungeons = await fetchAllDungeons((done, total) => {
    if (done % 10 === 0 || done === total) process.stdout.write(`   ${done}/${total}\r`);
  });
  console.log(`\n   ✓ ${dbDungeons.length} donjons récupérés`);

  // 3. Construire donjons + enrichir stratégie via Fandom EN
  console.log('\n🟢 Source 2 — Fandom EN (stratégies boss 50+)');
  const built: Dungeon[] = [];
  let fandomFound = 0;
  const eligible = dbDungeons.filter((d) => d.boss && d.recommendedLevel > 0);

  for (let i = 0; i < eligible.length; i++) {
    const db = eligible[i];
    const dungeon = await buildDungeon(db, (s) => {
      process.stdout.write(`   [${i + 1}/${eligible.length}] ${db.name.slice(0, 28)} · ${s}\r`);
    });
    if (dungeon) {
      built.push(dungeon);
      if (dungeon.boss.strategy) fandomFound++;
    }
  }
  console.log(`\n   ✓ ${built.length} donjons construits, ${fandomFound} avec stratégie Fandom`);

  // 4. Validation Zod
  console.log('\n✅ Validation Zod…');
  const { valid, errors } = validateDungeons(built);
  if (errors.length > 0) {
    console.error(`   ⚠ ${errors.length} donjons invalides :`);
    errors.slice(0, 5).forEach(({ name, issues }) => {
      console.error(`   [${name}]`);
      issues.slice(0, 3).forEach((i) => console.error(`     ${i.path.join('.')} — ${i.message}`));
    });
  }
  console.log(`   ✓ ${valid.length} donjons valides`);

  const endgame = valid.filter((d) => d.recommendedLevel >= 160);
  console.log(`   🔴 Endgame 160+ : ${endgame.length}`);

  // 5. Diff
  const prev = loadPreviousDungeons(OUTPUT_JSON);
  const diff = diffDungeons(prev, valid);
  console.log(
    `\n📊 Diff : +${diff.added.length} ajoutés · ~${diff.modified.length} modifiés · -${diff.removed.length} supprimés`,
  );

  // 6. Fuse index
  console.log('\n🔍 Index Fuse.js…');
  const fuseIndex = Fuse.createIndex(
    ['name', 'nameEn', 'aliases', 'slug', 'boss.name', 'boss.nameEn'],
    valid,
  );

  // 7. Écriture outputs
  console.log('\n💾 Écriture…');
  // Tri par niveau décroissant pour que endgame apparaisse en premier par défaut
  const sortedValid = [...valid].sort((a, b) => b.recommendedLevel - a.recommendedLevel);
  writeFileSync(OUTPUT_JSON, JSON.stringify(sortedValid, null, 2));
  writeFileSync(OUTPUT_FUSE, JSON.stringify(fuseIndex.toJSON()));

  const changelog = generateChangelog(diff, DATA_VERSION, new Date().toISOString().slice(0, 10));
  writeFileSync(OUTPUT_CHANGELOG, changelog);

  // 8. Copie vers app/src/data
  try {
    copyFileSync(OUTPUT_JSON, APP_DATA);
    copyFileSync(OUTPUT_FUSE, APP_FUSE);
    console.log(`   ✓ Copié → app/src/data/`);
  } catch (e) {
    console.error('   ⚠ Copie app/src/data/ échouée:', e);
  }

  console.log('\n🎉 Scraper terminé');
  console.log(`   Total : ${valid.length} donjons · Endgame 160+ : ${endgame.length} · Strat Fandom : ${fandomFound}`);

  if (errors.length > 0) process.exit(1);
}

main().catch((e) => {
  console.error('💥 Scraper crash:', e);
  process.exit(1);
});
