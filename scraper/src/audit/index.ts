import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';
import { validateDungeons, type Dungeon } from '../validate.ts';
import { detectAmbiguityFlags } from './ambiguity-detector.ts';
import { detectCrossEntityFlags } from './cross-entity-detector.ts';
import { detectOrderingFlags, estimateOrderingJudgeCost } from './ordering-judge.ts';
import { buildAuditReport, renderAuditMarkdown } from './report.ts';
import { hasApiKey, DEFAULT_MODEL } from '../llm/client.ts';
import type { BugKind, CardFlag } from './types.ts';

const APP_DATA_DIR = resolve(process.cwd(), '../app/src/data');
const APP_DATA = join(APP_DATA_DIR, 'dungeons.json');
const AUDIT_OUT_DIR = join(process.cwd(), 'output', 'v051-audit');

const PRICE_INPUT_PER_MTOK_USD = 3;
const PRICE_OUTPUT_PER_MTOK_USD = 15;
const USD_TO_EUR = 0.92;

export interface AuditOptions {
  /** Restrict the audit to a single bug kind. */
  bug?: BugKind;
  /** Restrict the audit to a single entity id (boss or monster). */
  entityId?: string;
  /** Skip the LLM-driven ordering judge — just emit HTTP + local detectors. */
  dryRunCost?: boolean;
  /** Skip all HTTP + LLM — use cached data only. */
  dryRun?: boolean;
}

function loadDataset(): Dungeon[] {
  const raw = JSON.parse(readFileSync(APP_DATA, 'utf-8')) as unknown[];
  const report = validateDungeons(raw);
  if (report.errors.length > 0) {
    console.warn(`   ⚠ ${report.errors.length} dungeons rejected by Zod during load`);
  }
  return report.valid;
}

function filterByEntity(dungeons: Dungeon[], entityId: string): Dungeon[] {
  return dungeons.filter(
    (d) => d.boss.id === entityId || d.monsters.some((m) => m.id === entityId),
  );
}

export async function runAudit(options: AuditOptions = {}): Promise<void> {
  console.log('\n🔎 v0.5.1 audit — loading dataset');
  let dungeons = loadDataset();
  console.log(`   ✓ ${dungeons.length} dungeons`);

  if (options.entityId) {
    dungeons = filterByEntity(dungeons, options.entityId);
    console.log(`   ✓ filtered to ${dungeons.length} dungeon(s) containing ${options.entityId}`);
  }

  mkdirSync(AUDIT_OUT_DIR, { recursive: true });

  // --- Cost estimate path ---
  if (options.dryRunCost) {
    const est = estimateOrderingJudgeCost(dungeons);
    const priceUsd =
      (est.tokensInputTotal / 1_000_000) * PRICE_INPUT_PER_MTOK_USD +
      (est.tokensOutputTotal / 1_000_000) * PRICE_OUTPUT_PER_MTOK_USD;
    console.log('\n💰 dry-run-cost — no Fandom fetch, no LLM call');
    console.log(`   Ordering judge candidates: ${est.candidates}`);
    console.log(`   Tokens: input ~${est.tokensInputTotal.toLocaleString('en-US')}, output ~${est.tokensOutputTotal.toLocaleString('en-US')}`);
    console.log(`   Price estimate (${DEFAULT_MODEL}): $${priceUsd.toFixed(3)} ≈ €${(priceUsd * USD_TO_EUR).toFixed(3)}`);
    return;
  }

  const shouldRunBug = (b: BugKind) => !options.bug || options.bug === b;

  const flags: CardFlag[] = [];

  // Bug 1 — ambiguity (pure, instant).
  if (shouldRunBug('ambiguity')) {
    console.log('\n🌀 Bug 1 — ambiguity detector');
    const a = detectAmbiguityFlags(dungeons);
    console.log(`   ✓ ${a.length} flags across ${new Set(a.map((f) => f.entity.id)).size} entities`);
    flags.push(...a);
  }

  // Bug 2 — cross-entity (network, slow but cached).
  if (shouldRunBug('cross-entity')) {
    console.log('\n🎯 Bug 2 — cross-entity detector (Fandom cache)');
    const ce = await detectCrossEntityFlags(dungeons, (done, total, label) => {
      if (done % 10 === 0 || done === total) {
        process.stdout.write(`   [${done}/${total}] ${label.slice(0, 30)}\r`);
      }
    });
    process.stdout.write('\n');
    console.log(`   ✓ ${ce.length} flags across ${new Set(ce.map((f) => f.entity.id)).size} entities`);
    flags.push(...ce);
  }

  // Bug 3 — ordering judge (LLM).
  if (shouldRunBug('ordering')) {
    if (!hasApiKey() && !options.dryRun) {
      console.log('\n🧭 Bug 3 — ordering judge skipped (no ANTHROPIC_API_KEY; use --dry-run for cache-only)');
    } else {
      console.log('\n🧭 Bug 3 — ordering judge');
      const o = await detectOrderingFlags(dungeons, {
        dryRun: options.dryRun,
        onProgress: (done, total, label) => {
          if (done % 10 === 0 || done === total) {
            process.stdout.write(`   [${done}/${total}] ${label.slice(0, 30)}\r`);
          }
        },
      });
      process.stdout.write('\n');
      console.log(`   ✓ ${o.length} flags across ${new Set(o.map((f) => f.entity.id)).size} entities`);
      flags.push(...o);
    }
  }

  // Aggregate + render.
  const report = buildAuditReport(dungeons, flags, APP_DATA);
  writeFileSync(join(AUDIT_OUT_DIR, 'diagnostic-report.json'), JSON.stringify(report, null, 2));
  writeFileSync(join(AUDIT_OUT_DIR, 'diagnostic-report.md'), renderAuditMarkdown(report));
  writeFileSync(
    join(AUDIT_OUT_DIR, 'flagged-entity-ids.json'),
    JSON.stringify(report.flaggedEntityIds, null, 2),
  );

  console.log('\n📝 Audit report written');
  for (const b of report.bugs) {
    console.log(`   ${b.bug.padEnd(14)} → ${b.cardsFlagged.toString().padStart(4)} cards (${b.percentCardsFlagged.toFixed(1).padStart(5)}%) · ${b.recommendation}`);
  }
  console.log(`   Output: ${AUDIT_OUT_DIR}/`);
}
