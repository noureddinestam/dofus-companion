import { mkdirSync, readFileSync, writeFileSync, copyFileSync } from 'fs';
import { join, resolve } from 'path';
import Fuse from 'fuse.js';
import { fetchAllDungeons } from './sources/dofusdb.ts';
import { scrapeAllDungeons } from './sources/dofuspourlesnoobs.ts';
import { matchDungeons, slugify } from './normalize/match-dungeons.ts';
import { validateDungeons } from './validate.ts';
import { diffDungeons, loadPreviousDungeons, generateChangelog } from './diff.ts';
import type { Dungeon, Monster, Boss } from './validate.ts';
import type { DbDungeon, DbMonster } from './sources/dofusdb.ts';
import type { ScrapedDungeon } from './sources/dofuspourlesnoobs.ts';

const OUTPUT_DIR = join(process.cwd(), 'output');
const MANUAL_DATA = resolve(process.cwd(), '../app/src/data/dungeons.json');
const OUTPUT_JSON = join(OUTPUT_DIR, 'dungeons.json');
const OUTPUT_FUSE = join(OUTPUT_DIR, 'fuse-index.json');
const OUTPUT_CHANGELOG = join(OUTPUT_DIR, 'CHANGELOG-DATA.md');
const APP_DATA = resolve(process.cwd(), '../app/src/data/dungeons.json');

const DATA_VERSION = '0.2.0';

mkdirSync(OUTPUT_DIR, { recursive: true });

// ── Merge logic ──────────────────────────────────────────────────────────────

function enrichMonsterFromDb(
  existing: Monster,
  db: DbMonster | undefined,
): Monster {
  if (!db) return existing;
  return {
    ...existing,
    level: db.level || existing.level,
    hp: db.hp ?? existing.hp,
    family: db.family && db.family !== 'Inconnu' ? db.family : existing.family,
    weakElement: db.weakElement as Monster['weakElement'] ?? existing.weakElement,
    resistElement: db.resistElement as Monster['resistElement'] ?? existing.resistElement,
    source: 'dofusdb',
    verified: true,
  };
}

function mergeDungeon(
  manual: Dungeon,
  db: DbDungeon | undefined,
  scraped: ScrapedDungeon | undefined,
): Dungeon {
  const now = new Date().toISOString();

  // Enrich monsters with DofusDB stats
  const dbMonsterMap = new Map(
    (db?.monsters ?? []).map((m) => [m.name.toLowerCase(), m]),
  );

  const enrichedMonsters: Monster[] = manual.monsters.map((m) => {
    const dbM = dbMonsterMap.get(m.name.toLowerCase());
    return enrichMonsterFromDb(m, dbM);
  });

  // Enrich boss
  const dbBoss = db?.boss ?? db?.monsters?.find(
    (m) => m.name.toLowerCase() === manual.boss.name.toLowerCase(),
  );
  const enrichedBoss: Boss = {
    ...enrichMonsterFromDb(manual.boss, dbBoss),
    phases:
      scraped?.strategy.bossPhases.length
        ? scraped.strategy.bossPhases
        : manual.boss.phases,
    instantKillConditions:
      scraped?.strategy.instantKillConditions.length
        ? scraped.strategy.instantKillConditions
        : manual.boss.instantKillConditions,
    recommendedStrategy:
      scraped?.strategy.bossStrategy ?? manual.boss.recommendedStrategy,
    recommendedComp: manual.boss.recommendedComp,
    source: scraped ? 'dofuspourlesnoobs' : (dbBoss ? 'dofusdb' : 'manual'),
    sourceUrl: scraped?.url ?? manual.boss.sourceUrl,
    verified: !!(scraped || dbBoss),
  };

  return {
    ...manual,
    recommendedLevel: db?.recommendedLevel || manual.recommendedLevel,
    monsters: enrichedMonsters,
    boss: enrichedBoss,
    lastUpdated: now,
    dataVersion: DATA_VERSION,
  };
}

function dbDungeonToManual(db: DbDungeon): Dungeon | null {
  if (db.monsters.length === 0 && !db.boss) return null;

  const now = new Date().toISOString();
  const slug = slugify(db.name);

  const toMonster = (m: DbMonster, priority: Monster['priority']): Monster => ({
    id: m.id,
    name: m.name,
    level: m.level,
    hp: m.hp ?? undefined,
    family: m.family || 'Inconnu',
    weakElement: m.weakElement as Monster['weakElement'] ?? null,
    resistElement: m.resistElement as Monster['resistElement'] ?? null,
    priority,
    priorityReason: 'Données DofusDB — stratégie non encore vérifiée',
    keyMechanic: null,
    source: 'dofusdb',
    sourceUrl: `https://dofusdb.fr/fr/database/monsters/${m.id}`,
    verified: false,
  });

  const monsters: Monster[] = db.monsters.map((m, i) =>
    toMonster(m, i === 0 ? 'danger' : 'caution'),
  );

  if (!db.boss) return null;

  const boss: Boss = {
    ...toMonster(db.boss, 'critical'),
    phases: [],
    instantKillConditions: [],
    recommendedStrategy: 'Stratégie non encore documentée — contribution bienvenue.',
    recommendedComp: [],
  };

  return {
    id: slug,
    name: db.name,
    slug,
    aliases: [],
    levelRange: [Math.max(1, db.recommendedLevel - 20), db.recommendedLevel + 10],
    recommendedLevel: db.recommendedLevel,
    zone: 'Inconnu',
    continent: 'Inconnu',
    imageUrl: null,
    monsters: monsters.length > 0 ? monsters : [toMonster(db.boss, 'manageable')],
    boss,
    rooms: 5,
    keyRequired: false,
    achievements: [],
    lastUpdated: now,
    dataVersion: DATA_VERSION,
  };
}

// ── Main orchestrator ────────────────────────────────────────────────────────

async function main() {
  console.log('\n🗡️  Dofus Companion — Scraper Pipeline\n');

  // 1. Load manual curated data
  console.log('📂 Chargement données manuelles…');
  let manualDungeons: Dungeon[] = [];
  try {
    manualDungeons = JSON.parse(readFileSync(MANUAL_DATA, 'utf-8')) as Dungeon[];
    console.log(`   ${manualDungeons.length} donjons curated chargés`);
  } catch (e) {
    console.error('   ✗ Impossible de lire dungeons.json:', e);
  }

  // 2. Fetch DofusDB data
  console.log('\n🔵 Source 1 — DofusDB API…');
  const dbDungeons = await fetchAllDungeons((done, total) => {
    if (done % 10 === 0) process.stdout.write(`   ${done}/${total}\r`);
  });
  console.log(`   ✓ ${dbDungeons.length} donjons récupérés depuis DofusDB`);

  // 3. Scrape dofuspourlesnoobs
  console.log('\n🟠 Source 2 — dofuspourlesnoobs…');
  const scrapedDungeons = await scrapeAllDungeons((slug, done, total) => {
    if (done % 5 === 0)
      process.stdout.write(`   [${done}/${total}] ${slug.slice(0, 30)}\r`);
  });
  console.log(`   ✓ ${scrapedDungeons.length} pages scrapées`);

  // 4. Match sources
  console.log('\n🔗 Matching des sources…');
  // Match DofusDB → dofuspourlesnoobs
  const dbToScrape = matchDungeons(dbDungeons, scrapedDungeons);

  // Match manual → DofusDB by name
  const manualToDb = new Map<string, DbDungeon>();
  for (const manual of manualDungeons) {
    const match = dbDungeons.find(
      (db) =>
        db.name.toLowerCase().includes(manual.name.toLowerCase().split(' ').slice(-1)[0]) ||
        manual.name.toLowerCase().includes(db.name.toLowerCase().split(' ').slice(-1)[0]),
    );
    if (match) manualToDb.set(manual.id, match);
  }

  // 5. Merge: enrich manual with DB + scrape data
  console.log('\n⚗️  Fusion des données…');
  const enriched: Dungeon[] = manualDungeons.map((manual) => {
    const db = manualToDb.get(manual.id);
    const scrapedId = db ? dbToScrape.get(db.id) : undefined;
    const scrapedName = scrapedDungeons.find((s) =>
      manual.name.toLowerCase().includes(s.name.toLowerCase().replace(/-/g, ' ').slice(0, 8)),
    );
    const scraped = scrapedId ?? scrapedName;
    return mergeDungeon(manual, db, scraped);
  });

  // 6. Add new dungeons from DofusDB not in manual data
  const existingSlugs = new Set(enriched.map((d) => d.slug));
  const newFromDb: Dungeon[] = [];

  for (const db of dbDungeons) {
    const slug = slugify(db.name);
    if (existingSlugs.has(slug)) continue;

    // Only add if we have boss + some monsters
    const converted = dbDungeonToManual(db);
    if (converted && converted.recommendedLevel > 0) {
      newFromDb.push(converted);
    }
  }

  console.log(`   ✓ ${enriched.length} donjons enrichis`);
  console.log(`   ✓ ${newFromDb.length} nouveaux donjons depuis DofusDB`);

  const allDungeons = [...enriched, ...newFromDb];

  // 7. Validate
  console.log('\n✅ Validation Zod…');
  const { valid, errors } = validateDungeons(allDungeons);

  if (errors.length > 0) {
    console.error(`   ⚠ ${errors.length} donjons invalides :`);
    errors.forEach(({ name, issues }) => {
      console.error(`   [${name}]`);
      issues.slice(0, 3).forEach((i) => console.error(`     ${i.path.join('.')} — ${i.message}`));
    });
  }

  console.log(`   ✓ ${valid.length} donjons valides`);
  const endgame = valid.filter((d) => d.recommendedLevel >= 160);
  console.log(`   🔴 Endgame 160+ : ${endgame.length}`);

  // 8. Diff vs previous
  const prev = loadPreviousDungeons(OUTPUT_JSON);
  const diff = diffDungeons(prev, valid);
  console.log(`\n📊 Diff : +${diff.added.length} ajoutés, ~${diff.modified.length} modifiés, -${diff.removed.length} supprimés`);

  // 9. Build Fuse index
  console.log('\n🔍 Construction index Fuse.js…');
  const fuseIndex = Fuse.createIndex(
    ['name', 'aliases', 'slug', 'zone', 'boss.name'],
    valid,
  );

  // 10. Write outputs
  console.log('\n💾 Écriture des fichiers…');
  writeFileSync(OUTPUT_JSON, JSON.stringify(valid, null, 2));
  writeFileSync(OUTPUT_FUSE, JSON.stringify(fuseIndex.toJSON()));

  const changelog = generateChangelog(diff, DATA_VERSION, new Date().toISOString().slice(0, 10));
  writeFileSync(OUTPUT_CHANGELOG, changelog);

  // 11. Copy to app/src/data/
  try {
    copyFileSync(OUTPUT_JSON, APP_DATA);
    writeFileSync(
      join(resolve(process.cwd(), '../app/src/data'), 'fuse-index.json'),
      JSON.stringify(fuseIndex.toJSON()),
    );
    console.log(`   ✓ Données copiées dans app/src/data/`);
  } catch (e) {
    console.error('   ⚠ Copie app/src/data/ échouée:', e);
  }

  console.log('\n🎉 Scraper terminé !');
  console.log(`   Output : ${OUTPUT_DIR}/`);
  console.log(`   Donjons valides : ${valid.length}`);
  console.log(`   Endgame 160+ : ${endgame.length}`);

  if (errors.length > 0) {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error('💥 Scraper crash:', e);
  process.exit(1);
});
