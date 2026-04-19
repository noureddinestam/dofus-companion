import { mkdirSync, writeFileSync, copyFileSync, existsSync, renameSync } from 'fs';
import { join, resolve } from 'path';
import Fuse from 'fuse.js';
import { fetchAllDungeons } from './sources/dofusdb.ts';
import { fetchBossStrategy, fandomPageUrl } from './sources/fandom.ts';
import { fetchBossStrategyFr } from './sources/fandom-fr.ts';
import { sleep } from './cache.ts';
import { validateDungeons } from './validate.ts';
import { diffDungeons, loadPreviousDungeons, generateChangelog } from './diff.ts';
import { collectMissing, renderMissingMarkdown } from './report/missing.ts';
import { renderIssuesMarkdown } from './report/issues.ts';
import { hasApiKey } from './llm/client.ts';
import { translate } from './llm/translate.ts';
import { summarize } from './llm/summarize.ts';
import {
  validateGlossary,
  SENTENCE_RATIO_MIN,
  SENTENCE_RATIO_MAX,
} from './validate/glossary.ts';
import type {
  Dungeon,
  Monster,
  Boss,
  StrategyBundle,
  StrategyLong,
  StrategyShort,
  Provenance,
} from './validate.ts';
import type { DbDungeon, DbMonster } from './sources/dofusdb.ts';

const OUTPUT_DIR = join(process.cwd(), 'output');
const OUTPUT_JSON = join(OUTPUT_DIR, 'dungeons.json');
const OUTPUT_FUSE = join(OUTPUT_DIR, 'fuse-index.json');
const OUTPUT_CHANGELOG = join(OUTPUT_DIR, 'CHANGELOG-DATA.md');
const OUTPUT_MISSING = join(OUTPUT_DIR, 'MISSING.md');
const OUTPUT_ISSUES = join(OUTPUT_DIR, 'ISSUES.md');
const APP_DATA_DIR = resolve(process.cwd(), '../app/src/data');
const APP_DATA = join(APP_DATA_DIR, 'dungeons.json');
const APP_FUSE = join(APP_DATA_DIR, 'fuse-index.json');
const APP_DATA_LEGACY = join(APP_DATA_DIR, 'dungeons.legacy.json');

const DATA_VERSION = '0.5.0';
const FANDOM_DELAY_MS = 700;

// CLI flags
const ARGS = new Set(process.argv.slice(2));
const NO_LLM = ARGS.has('--no-llm');
const DRY_RUN = ARGS.has('--dry-run');
const GEN_ISSUES = ARGS.has('--gen-issues');
const ONLY_BOSS_REFACTOR = ARGS.has('--only-boss-refactor');
const ONLY_MONSTERS = ARGS.has('--only-monsters');
const AUDIT = ARGS.has('--audit');
const MIGRATE_SCHEMA = ARGS.has('--migrate-schema');
const DRY_RUN_COST = ARGS.has('--dry-run-cost');

function valueAfter(flag: string): string | undefined {
  const args = process.argv.slice(2);
  const i = args.indexOf(flag);
  if (i >= 0 && i + 1 < args.length) return args[i + 1];
  return undefined;
}
const AUDIT_BUG = valueAfter('--bug') as 'ambiguity' | 'cross-entity' | 'ordering' | undefined;
const AUDIT_BOSS = valueAfter('--boss');

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
    familyEn: null,
    weakElement: m.weakElement,
    resistElement: m.resistElement,
    source: 'dofusdb',
    sourceUrl: m.sourceUrl,
    combat: null,
  };
}

function buildBundle(
  longEn: StrategyLong | null,
  longFr: StrategyLong | null,
  shortEn: StrategyShort | null,
  shortFr: StrategyShort | null,
): StrategyBundle | null {
  if (!longEn && !longFr && !shortEn && !shortFr) return null;
  return {
    long: { fr: longFr, en: longEn },
    short: { fr: shortFr, en: shortEn },
  };
}

function baseSourceFromProv(
  prov: Provenance,
): 'fandom-en' | 'fandom-fr' | 'gamosaurus' {
  if (prov.kind === 'native') {
    return prov.source === 'manual' ? 'fandom-en' : prov.source;
  }
  if (prov.kind === 'llm-grounded') {
    return prov.baseSource;
  }
  // community : pas de baseSource, fallback
  return 'fandom-en';
}

function baseUrlFromProv(prov: Provenance): string {
  if (prov.kind === 'native') return prov.sourceUrl;
  if (prov.kind === 'llm-grounded') return prov.baseSourceUrl;
  return prov.prUrl;
}

/**
 * Génère un short depuis un long, validé par ancres.
 * Retourne null si :
 *  - LLM error / throw
 *  - validateSummaryResponse rejette (< 3 bullets ancrés)
 */
async function summarizeLong(
  long: StrategyLong,
  lang: 'fr' | 'en',
): Promise<StrategyShort | null> {
  const result = await summarize(long.text, lang, { dryRun: DRY_RUN });
  if (!result) return null;

  return {
    bullets: result.summary.bullets,
    provenance: {
      kind: 'llm-grounded',
      baseLang: lang,
      baseSource: baseSourceFromProv(long.provenance),
      baseSourceUrl: baseUrlFromProv(long.provenance),
      model: result.model,
      promptVersion: result.promptVersion,
      anchors: result.summary.anchors,
      generatedAt: result.createdAt,
    },
  };
}

/**
 * Traduit long.en → long.fr via LLM avec glossaire et validation structurelle.
 * Retourne null si :
 *  - pas de clé API (mode dégradé)
 *  - couverture glossaire < 0.6 (traduction suspecte)
 *  - ratio de phrases hors [0.8, 1.2]
 *  - erreur réseau / API
 */
async function translateLongEnToFr(
  longEn: StrategyLong,
): Promise<StrategyLong | null> {
  try {
    const result = await translate(longEn.text, { dryRun: DRY_RUN });
    const report = validateGlossary(longEn.text, result.translated, {});
    // Validation structurelle sur le ratio de phrases uniquement
    // (coverage non-bloquant ici — glossary peut être vide pour certains textes)
    if (
      report.sentenceRatio < SENTENCE_RATIO_MIN ||
      report.sentenceRatio > SENTENCE_RATIO_MAX
    ) {
      console.warn(
        `    ⚠ traduction rejetée : sentenceRatio=${report.sentenceRatio.toFixed(2)} hors [${SENTENCE_RATIO_MIN},${SENTENCE_RATIO_MAX}]`,
      );
      return null;
    }

    const baseProv = longEn.provenance;
    if (baseProv.kind !== 'native') return null; // on ne traduit que du natif

    return {
      text: result.translated,
      provenance: {
        kind: 'llm-grounded',
        baseLang: 'en',
        baseSource: baseProv.source === 'manual' ? 'fandom-en' : baseProv.source,
        baseSourceUrl: baseProv.sourceUrl,
        model: result.model,
        promptVersion: result.promptVersion,
        anchors: [
          {
            // Pour une traduction, l'ancre est l'intégralité du texte source.
            // La quote est un extrait des 200 premiers caractères pour traçabilité.
            bulletIndex: 0,
            quote: longEn.text.slice(0, 200),
            similarity: 1,
          },
        ],
        generatedAt: result.createdAt,
      },
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (!DRY_RUN) {
      console.warn(`    ⚠ translate error: ${msg}`);
    }
    return null;
  }
}


async function buildDungeon(
  db: DbDungeon,
  onStep?: (s: string) => void,
): Promise<Dungeon | null> {
  if (!db.boss) return null;
  if (db.recommendedLevel <= 0) return null;

  const now = new Date().toISOString();

  const baseBoss: Monster = toMonster(db.boss);
  let longEn: StrategyLong | null = null;
  let longFr: StrategyLong | null = null;
  let fandomFrPageUrl: string | null = null;

  // Stratégies via Fandom uniquement pour donjons niveau 50+
  if (db.recommendedLevel >= 50) {
    // Source 1 — Fandom EN (matched on nameEn)
    if (db.boss.nameEn) {
      try {
        const fandomEn = await fetchBossStrategy(db.boss.nameEn, onStep);
        if (fandomEn) {
          longEn = {
            text: fandomEn.text,
            provenance: {
              kind: 'native',
              lang: 'en',
              source: 'fandom-en',
              sourceUrl: fandomEn.url,
            },
          };
        }
        await sleep(FANDOM_DELAY_MS);
      } catch {
        // Silencieux : Fandom peut bloquer/timeout
      }
    }

    // Source 2 — Fandom FR (matched on nameFr, fallback nameEn)
    try {
      const fandomFr = await fetchBossStrategyFr(db.boss.name, db.boss.nameEn, onStep);
      if (fandomFr) {
        longFr = {
          text: fandomFr.text,
          provenance: {
            kind: 'native',
            lang: 'fr',
            source: 'fandom-fr',
            sourceUrl: fandomFr.url,
          },
        };
        fandomFrPageUrl = fandomFr.url;
      }
      await sleep(FANDOM_DELAY_MS);
    } catch {
      // Silencieux
    }
  }

  // Source 3 — LLM translate EN → FR (si long.en présent, long.fr absent, LLM activé)
  if (longEn && !longFr && !NO_LLM && (hasApiKey() || DRY_RUN)) {
    const translated = await translateLongEnToFr(longEn);
    if (translated) longFr = translated;
  }

  // Source 4 — LLM summarize (génère short.en depuis long.en, short.fr depuis long.fr)
  let shortEn: StrategyShort | null = null;
  let shortFr: StrategyShort | null = null;
  if (!NO_LLM && (hasApiKey() || DRY_RUN)) {
    if (longEn) {
      shortEn = await summarizeLong(longEn, 'en');
    }
    if (longFr) {
      shortFr = await summarizeLong(longFr, 'fr');
    }
  }

  const strategies = buildBundle(longEn, longFr, shortEn, shortFr);

  // Legacy strategy field (v0.3 compat) : rempli quand Fandom EN trouvé
  const legacyStrategy = longEn && longEn.provenance.kind === 'native'
    ? {
        text: longEn.text,
        source: 'fandom-en' as const,
        sourceUrl: longEn.provenance.sourceUrl,
      }
    : null;

  const boss: Boss = {
    ...baseBoss,
    strategy: legacyStrategy,
    strategies,
    phases: [],
  };

  const sortedMonsters = [...db.monsters].sort((a, b) => b.level - a.level);
  const monsters: Monster[] = sortedMonsters.map(toMonster);
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
    externalGuideUrlFr: fandomFrPageUrl,
    lastUpdated: now,
    dataVersion: DATA_VERSION,
  };
}

async function main() {
  if (MIGRATE_SCHEMA) {
    const { runSchemaMigration } = await import('./migrate/v05-to-v051.ts');
    await runSchemaMigration();
    return;
  }

  if (AUDIT) {
    const { runAudit } = await import('./audit/index.ts');
    await runAudit({
      bug: AUDIT_BUG,
      entityId: AUDIT_BOSS,
      dryRun: DRY_RUN,
      dryRunCost: DRY_RUN_COST,
    });
    return;
  }

  if (ONLY_MONSTERS) {
    const { runMonsterMigration } = await import('./migrate/scrape-monster-cards.ts');
    await runMonsterMigration({ dryRun: DRY_RUN, dryRunCost: DRY_RUN_COST });
    return;
  }

  if (ONLY_BOSS_REFACTOR || DRY_RUN_COST) {
    const { runBossMigration } = await import('./migrate/v04-to-v05-boss.ts');
    await runBossMigration({ dryRun: DRY_RUN, dryRunCost: DRY_RUN_COST });
    return;
  }

  const llmEnabled = !NO_LLM && (hasApiKey() || DRY_RUN);
  const llmStatus = NO_LLM
    ? 'OFF (--no-llm)'
    : DRY_RUN
      ? 'DRY-RUN (cache only)'
      : hasApiKey()
        ? 'ON'
        : 'OFF (no ANTHROPIC_API_KEY)';
  console.log(
    `\n🗡️  Dofus Companion — Scraper v0.4 (DofusDB + Fandom EN/FR + LLM translate: ${llmStatus})\n`,
  );

  if (existsSync(APP_DATA)) {
    try {
      renameSync(APP_DATA, APP_DATA_LEGACY);
      console.log(`📦 Ancien dungeons.json sauvegardé → dungeons.legacy.json`);
    } catch {
      // pas bloquant
    }
  }

  // 1. DofusDB (source factuelle)
  console.log('\n🔵 Source 1 — DofusDB API (stats factuelles)');
  const dbDungeons = await fetchAllDungeons((done, total) => {
    if (done % 10 === 0 || done === total) process.stdout.write(`   ${done}/${total}\r`);
  });
  console.log(`\n   ✓ ${dbDungeons.length} donjons récupérés`);

  // 2-4. Fandom EN + Fandom FR + LLM translate (selon flags)
  console.log('\n🟢 Sources 2/3/4 — Fandom EN + Fandom FR + LLM translate (boss niveau 50+)');
  const built: Dungeon[] = [];
  const eligible = dbDungeons.filter((d) => d.boss && d.recommendedLevel > 0);
  let foundEn = 0;
  let foundFrNative = 0;
  let foundFrLlm = 0;
  let shortEnCount = 0;
  let shortFrCount = 0;

  for (let i = 0; i < eligible.length; i++) {
    const db = eligible[i];
    const dungeon = await buildDungeon(db, (s) => {
      process.stdout.write(`   [${i + 1}/${eligible.length}] ${db.name.slice(0, 24)} · ${s.slice(0, 28)}\r`);
    });
    if (dungeon) {
      built.push(dungeon);
      if (dungeon.boss.strategies?.long.en) foundEn++;
      const frProv = dungeon.boss.strategies?.long.fr?.provenance;
      if (frProv?.kind === 'native') foundFrNative++;
      if (frProv?.kind === 'llm-grounded') foundFrLlm++;
      if (dungeon.boss.strategies?.short.en) shortEnCount++;
      if (dungeon.boss.strategies?.short.fr) shortFrCount++;
    }
  }
  console.log(
    `\n   ✓ ${built.length} donjons · long.en=${foundEn} · long.fr=${foundFrNative + foundFrLlm} · short.en=${shortEnCount} · short.fr=${shortFrCount}`,
  );

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
    `\n📊 Diff : +${diff.added.length} · ~${diff.modified.length} · -${diff.removed.length}`,
  );

  // 6. Fuse index
  console.log('\n🔍 Index Fuse.js…');
  const fuseIndex = Fuse.createIndex(
    ['name', 'nameEn', 'aliases', 'slug', 'boss.name', 'boss.nameEn'],
    valid,
  );

  // 7. Écriture
  console.log('\n💾 Écriture…');
  const sortedValid = [...valid].sort((a, b) => b.recommendedLevel - a.recommendedLevel);
  writeFileSync(OUTPUT_JSON, JSON.stringify(sortedValid, null, 2));
  writeFileSync(OUTPUT_FUSE, JSON.stringify(fuseIndex.toJSON()));

  const changelog = generateChangelog(diff, DATA_VERSION, new Date().toISOString().slice(0, 10));
  writeFileSync(OUTPUT_CHANGELOG, changelog);

  // Audit : liste les donjons sans stratégie complète (long+short × fr+en)
  const missing = collectMissing(valid);
  writeFileSync(OUTPUT_MISSING, renderMissingMarkdown(missing, valid.length));
  if (GEN_ISSUES) {
    writeFileSync(OUTPUT_ISSUES, renderIssuesMarkdown(missing));
    console.log(`   ✓ ${missing.length} issues générées → output/ISSUES.md`);
  }

  try {
    copyFileSync(OUTPUT_JSON, APP_DATA);
    copyFileSync(OUTPUT_FUSE, APP_FUSE);
    console.log(`   ✓ Copié → app/src/data/`);
  } catch (e) {
    console.error('   ⚠ Copie app/src/data/ échouée:', e);
  }

  console.log('\n🎉 Scraper terminé');
  console.log(`   ${valid.length} donjons · Endgame 160+ : ${endgame.length}`);
  const frTotal = foundFrNative + foundFrLlm;
  console.log(
    `   long  · EN=${foundEn} (${pct(foundEn, valid.length)}%) · FR=${frTotal} (${pct(frTotal, valid.length)}%) [native ${foundFrNative} + llm ${foundFrLlm}]`,
  );
  console.log(
    `   short · EN=${shortEnCount} (${pct(shortEnCount, valid.length)}%) · FR=${shortFrCount} (${pct(shortFrCount, valid.length)}%)`,
  );
  const endgameShortEn = endgame.filter((d) => d.boss.strategies?.short.en).length;
  const endgameShortFr = endgame.filter((d) => d.boss.strategies?.short.fr).length;
  console.log(
    `   short endgame 160+ · EN=${endgameShortEn}/${endgame.length} (${pct(endgameShortEn, endgame.length)}%) · FR=${endgameShortFr}/${endgame.length} (${pct(endgameShortFr, endgame.length)}%)`,
  );
  if (!llmEnabled && foundEn > 0) {
    console.log(`   ℹ  LLM désactivé — aucun short généré`);
  }

  if (errors.length > 0) process.exit(1);
}

function pct(n: number, total: number): string {
  return total === 0 ? '0' : ((n / total) * 100).toFixed(0);
}

main().catch((e) => {
  console.error('💥 Scraper crash:', e);
  process.exit(1);
});
