import { readFileSync, writeFileSync, copyFileSync, existsSync, renameSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';
import {
  validateDungeons,
  type Boss,
  type CombatCard,
  type Dungeon,
  type Monster,
} from '../validate.ts';
import { fetchBossStrategy } from '../sources/fandom.ts';
import { fetchBossStrategyFr } from '../sources/fandom-fr.ts';
import { fetchMonsterStrategy } from '../sources/fandom-monster.ts';
import {
  collectDungeonEntityTexts,
  type EntityPageText,
} from '../audit/cross-entity-detector.ts';
import { applyCrossEntityGate } from '../validate/cross-entity.ts';
import {
  extractCombatCardV2,
  estimateV2Tokens,
} from '../llm/extract-combat-card-v2.ts';
import { hasApiKey, DEFAULT_MODEL, type LlmCallOptions } from '../llm/client.ts';
import type { EntityKind } from '../audit/types.ts';

const APP_DATA_DIR = resolve(process.cwd(), '../app/src/data');
const APP_DATA = join(APP_DATA_DIR, 'dungeons.json');
const APP_DATA_BACKUP = join(APP_DATA_DIR, 'dungeons.pre-v051-regen.json');
const OUTPUT_DIR = join(process.cwd(), 'output');
const OUTPUT_JSON = join(OUTPUT_DIR, 'dungeons.json');
const AUDIT_OUT_DIR = join(OUTPUT_DIR, 'v051-audit');
const FLAGGED_IDS_FILE = join(AUDIT_OUT_DIR, 'flagged-entity-ids.json');
const REGEN_REPORT = join(OUTPUT_DIR, 'MIGRATION-V051-REGEN.md');

const PRICE_INPUT_PER_MTOK_USD = 3;
const PRICE_OUTPUT_PER_MTOK_USD = 15;
const USD_TO_EUR = 0.92;

interface EntityTarget {
  kind: EntityKind;
  id: string;
  dungeon: Dungeon;
}

export interface RegenStats {
  targetsPlanned: number;
  targetsSkippedNoSource: number;
  llmCalls: number;
  cardsReplaced: number;
  cardsRejectedEmpty: number;
  bulletsAccepted: number;
  bulletsRejectedValidator: number;
  bulletsRejectedCrossEntity: number;
}

export interface RegenOptions extends LlmCallOptions {
  dryRunCost?: boolean;
}

function loadDataset(): Dungeon[] {
  if (!existsSync(APP_DATA)) {
    throw new Error(`Cannot find ${APP_DATA}. Run earlier scraper phases first.`);
  }
  const raw = JSON.parse(readFileSync(APP_DATA, 'utf-8')) as unknown[];
  const report = validateDungeons(raw);
  if (report.errors.length > 0) {
    console.warn(`   ⚠ ${report.errors.length} dungeons rejected by Zod during load`);
  }
  return report.valid;
}

function loadFlaggedIds(): string[] {
  if (!existsSync(FLAGGED_IDS_FILE)) {
    throw new Error(`Cannot find ${FLAGGED_IDS_FILE}. Run pnpm scrape --audit first.`);
  }
  const raw = JSON.parse(readFileSync(FLAGGED_IDS_FILE, 'utf-8')) as unknown;
  if (!Array.isArray(raw)) throw new Error('flagged-entity-ids.json is not an array');
  return (raw as unknown[]).filter((v): v is string => typeof v === 'string');
}

function collectTargets(dungeons: Dungeon[], flaggedIds: Set<string>): EntityTarget[] {
  const out: EntityTarget[] = [];
  const seen = new Set<string>();
  for (const d of dungeons) {
    if (d.boss.combat && flaggedIds.has(d.boss.id) && !seen.has(d.boss.id)) {
      out.push({ kind: 'boss', id: d.boss.id, dungeon: d });
      seen.add(d.boss.id);
    }
    for (const m of d.monsters) {
      if (m.id === d.boss.id) continue;
      if (!m.combat) continue;
      if (!flaggedIds.has(m.id)) continue;
      if (seen.has(m.id)) continue;
      out.push({ kind: 'monster', id: m.id, dungeon: d });
      seen.add(m.id);
    }
  }
  return out;
}

async function fetchEntityText(
  kind: EntityKind,
  nameFr: string,
  nameEn: string | null,
): Promise<{ text: string; url: string } | null> {
  try {
    if (kind === 'boss') {
      const fr = await fetchBossStrategyFr(nameFr, nameEn);
      if (fr) return { text: fr.text, url: fr.url };
      if (nameEn) {
        const en = await fetchBossStrategy(nameEn);
        if (en) return { text: en.text, url: en.url };
      }
      return null;
    }
    const m = await fetchMonsterStrategy(nameFr, nameEn);
    if (!m) return null;
    return { text: m.text, url: m.url };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.warn(`    ⚠ fetch skipped: ${msg}`);
    return null;
  }
}

function findEntity(dungeon: Dungeon, target: EntityTarget): Boss | Monster | null {
  if (target.kind === 'boss' && dungeon.boss.id === target.id) return dungeon.boss;
  return dungeon.monsters.find((m) => m.id === target.id) ?? null;
}

function entityName(entity: Boss | Monster): string {
  return entity.name;
}

function entityNameEn(entity: Boss | Monster): string | null {
  return entity.nameEn;
}

function cardIsEmpty(card: CombatCard): boolean {
  return card.unlock.length === 0 && card.dangers.length === 0 && card.tips.length === 0;
}

function freshStats(planned: number): RegenStats {
  return {
    targetsPlanned: planned,
    targetsSkippedNoSource: 0,
    llmCalls: 0,
    cardsReplaced: 0,
    cardsRejectedEmpty: 0,
    bulletsAccepted: 0,
    bulletsRejectedValidator: 0,
    bulletsRejectedCrossEntity: 0,
  };
}

export async function runRegenerateFlagged(options: RegenOptions): Promise<void> {
  console.log('\n🔁 v0.5.1 regenerate-flagged — loading dataset + audit output');
  mkdirSync(OUTPUT_DIR, { recursive: true });
  const dungeons = loadDataset();
  const flaggedIds = new Set(loadFlaggedIds());
  const targets = collectTargets(dungeons, flaggedIds);
  console.log(`   ✓ ${dungeons.length} dungeons · ${targets.length} targets to regenerate`);

  // --- Dry-run cost estimate ---
  if (options.dryRunCost) {
    let totalIn = 0;
    let totalOut = 0;
    for (const t of targets) {
      const entity = findEntity(t.dungeon, t);
      if (!entity) continue;
      const src = await fetchEntityText(t.kind, entityName(entity), entityNameEn(entity));
      if (!src) continue;
      const est = estimateV2Tokens(src.text);
      totalIn += est.input;
      totalOut += est.output;
    }
    const priceUsd = (totalIn / 1_000_000) * PRICE_INPUT_PER_MTOK_USD + (totalOut / 1_000_000) * PRICE_OUTPUT_PER_MTOK_USD;
    console.log('\n💰 dry-run-cost — no LLM call');
    console.log(`   Targets with fetchable source: ${targets.length} planned, ~${Math.round((totalIn + totalOut) / 1200)} actually resolved`);
    console.log(`   Tokens: input ~${totalIn.toLocaleString('en-US')}, output ~${totalOut.toLocaleString('en-US')}`);
    console.log(`   Price estimate (${DEFAULT_MODEL}): $${priceUsd.toFixed(2)} ≈ €${(priceUsd * USD_TO_EUR).toFixed(2)}`);
    return;
  }

  if (!hasApiKey() && !options.dryRun) {
    throw new Error(
      'ANTHROPIC_API_KEY is not set. Export the key, re-run with --dry-run-cost, or pass --dry-run for cache-only.',
    );
  }

  const stats = freshStats(targets.length);
  const newCards = new Map<string, CombatCard>(); // entityId → regenerated card

  // Precompute per-dungeon Fandom pages once (for cross-entity gate).
  const dungeonPages = new Map<string, EntityPageText[]>();

  console.log(`\n🤖 extractCombatCardV2 on ${targets.length} targets (model=${DEFAULT_MODEL})`);
  for (let i = 0; i < targets.length; i++) {
    const t = targets[i];
    const entity = findEntity(t.dungeon, t);
    if (!entity) continue;
    const label = `${t.kind === 'boss' ? 'B' : 'm'} ${entity.name.slice(0, 24)}`;
    process.stdout.write(`   [${i + 1}/${targets.length}] ${label}\r`);

    const src = await fetchEntityText(t.kind, entityName(entity), entityNameEn(entity));
    if (!src) {
      stats.targetsSkippedNoSource++;
      continue;
    }

    stats.llmCalls++;
    const sourceLang: 'fr' | 'en' = src.url.includes('dofus-fr.fandom') || src.url.includes('dofus.fandom.com/fr')
      ? 'fr'
      : 'en';

    const result = await extractCombatCardV2(
      {
        sourceText: src.text,
        sourceLang,
        sourceUrl: src.url,
        entityKind: t.kind,
        entityName: entity.name,
      },
      { dryRun: options.dryRun },
    );
    if (!result) continue;
    stats.bulletsRejectedValidator += result.report.rejected;
    if (!result.report.card) {
      stats.cardsRejectedEmpty++;
      continue;
    }

    // Cross-entity gate.
    let pages = dungeonPages.get(t.dungeon.id);
    if (!pages) {
      pages = await collectDungeonEntityTexts(t.dungeon);
      dungeonPages.set(t.dungeon.id, pages);
    }
    const gateReport = applyCrossEntityGate(result.report.card, t.id, pages);
    stats.bulletsAccepted += gateReport.acceptedCount;
    stats.bulletsRejectedCrossEntity += gateReport.rejectedCount;
    if (cardIsEmpty(gateReport.card)) {
      stats.cardsRejectedEmpty++;
      continue;
    }
    newCards.set(t.id, gateReport.card);
    stats.cardsReplaced++;
  }
  process.stdout.write('\n');

  // Merge new cards back into dungeons.json (every occurrence of the entity gets the refreshed card).
  const merged: Dungeon[] = dungeons.map((d) => {
    const nextBoss: Boss = newCards.has(d.boss.id) && d.boss.combat
      ? { ...d.boss, combat: newCards.get(d.boss.id)! }
      : d.boss;
    const nextMonsters = d.monsters.map((m) => {
      if (!newCards.has(m.id)) return m;
      return { ...m, combat: newCards.get(m.id)! };
    });
    return { ...d, boss: nextBoss, monsters: nextMonsters };
  });

  // Write backup + output.
  writeFileSync(OUTPUT_JSON, JSON.stringify(merged, null, 2));
  if (existsSync(APP_DATA) && !existsSync(APP_DATA_BACKUP)) {
    renameSync(APP_DATA, APP_DATA_BACKUP);
    console.log('   ✓ Backup: dungeons.json → dungeons.pre-v051-regen.json');
  }
  copyFileSync(OUTPUT_JSON, APP_DATA);
  console.log(`   ✓ Written ${OUTPUT_JSON} and copied to ${APP_DATA}`);

  const report =
    [
      '# v0.5.1 Regenerate-flagged report',
      '',
      `Generated: ${new Date().toISOString()}`,
      `Model: ${DEFAULT_MODEL}`,
      `Prompt: extract-combat-card-v2`,
      '',
      '## Summary',
      '',
      `- Targets planned            : ${stats.targetsPlanned}`,
      `- LLM calls made             : ${stats.llmCalls}`,
      `- Targets skipped (no source): ${stats.targetsSkippedNoSource}`,
      `- Cards replaced             : ${stats.cardsReplaced}`,
      `- Cards rejected (empty)     : ${stats.cardsRejectedEmpty}`,
      '',
      '## Bullet accounting',
      '',
      `- Accepted               : ${stats.bulletsAccepted}`,
      `- Rejected by validator  : ${stats.bulletsRejectedValidator}`,
      `- Rejected by cross-entity gate: ${stats.bulletsRejectedCrossEntity}`,
      '',
      `Average bullets per replaced card: ${stats.cardsReplaced === 0 ? 0 : (stats.bulletsAccepted / stats.cardsReplaced).toFixed(1)}`,
    ].join('\n') + '\n';
  writeFileSync(REGEN_REPORT, report);
  console.log('\n📊 Regen summary');
  console.log(`   targets planned           : ${stats.targetsPlanned}`);
  console.log(`   llm calls                 : ${stats.llmCalls}`);
  console.log(`   skipped (no source)       : ${stats.targetsSkippedNoSource}`);
  console.log(`   cards replaced            : ${stats.cardsReplaced}`);
  console.log(`   cards rejected empty      : ${stats.cardsRejectedEmpty}`);
  console.log(`   bullets accepted          : ${stats.bulletsAccepted}`);
  console.log(`   bullets rejected validator: ${stats.bulletsRejectedValidator}`);
  console.log(`   bullets rejected cross-ent: ${stats.bulletsRejectedCrossEntity}`);
  console.log(`   ✓ Report → ${REGEN_REPORT}`);
}
