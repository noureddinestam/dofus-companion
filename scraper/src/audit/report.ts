import type { AuditReport, BugKind, BugSummary, CardFlag } from './types.ts';
import {
  AMBIGUITY_THRESHOLDS,
  CROSS_ENTITY_THRESHOLDS,
  countCardsFlagged,
  recommend,
} from './recommend.ts';
import type { Dungeon } from '../validate.ts';

const SEVERITY_RANK: Record<CardFlag['severity'], number> = { high: 3, medium: 2, low: 1 };

function sortFlags(a: CardFlag, b: CardFlag): number {
  const ds = SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity];
  if (ds !== 0) return ds;
  return b.signal - a.signal;
}

function summarise(
  bug: BugKind,
  flags: CardFlag[],
  totalCards: number,
): BugSummary {
  const ofBug = flags.filter((f) => f.bug === bug);
  const cardsFlagged = countCardsFlagged(flags, bug);
  const pct = totalCards === 0 ? 0 : (cardsFlagged / totalCards) * 100;
  const top = [...ofBug].sort(sortFlags).slice(0, 5);
  return {
    bug,
    cardsFlagged,
    totalFlags: ofBug.length,
    percentCardsFlagged: Math.round(pct * 10) / 10,
    ...recommend({ bug, cardsFlagged, totalCards }),
    topExamples: top,
  };
}

export function buildAuditReport(
  dungeons: Dungeon[],
  flags: CardFlag[],
  datasetPath: string,
): AuditReport {
  let bossCards = 0;
  let monsterCards = 0;
  for (const d of dungeons) {
    if (d.boss.combat) bossCards++;
    for (const m of d.monsters) {
      if (m.id === d.boss.id) continue;
      if (m.combat) monsterCards++;
    }
  }
  const totalCards = bossCards + monsterCards;
  const bugs: BugSummary[] = [
    summarise('ambiguity', flags, totalCards),
    summarise('cross-entity', flags, totalCards),
    summarise('ordering', flags, totalCards),
  ];
  const flaggedEntityIds = [...new Set(flags.map((f) => f.entity.id))].sort();
  return {
    generatedAt: new Date().toISOString(),
    datasetPath,
    counts: { totalDungeons: dungeons.length, totalBossCards: bossCards, totalMonsterCards: monsterCards },
    bugs,
    flaggedEntityIds,
  };
}

function bugEmoji(bug: BugKind): string {
  switch (bug) {
    case 'ambiguity': return '🌀';
    case 'cross-entity': return '🎯';
    case 'ordering': return '🧭';
  }
}

function bugTitle(bug: BugKind): string {
  switch (bug) {
    case 'ambiguity': return 'Ambiguity (unlock ⇄ constraints duplication or lexical drift)';
    case 'cross-entity': return 'Cross-entity contamination (anchor matches another entity)';
    case 'ordering': return 'Ordering of unlock actions (logical execution order)';
  }
}

function renderFlag(flag: CardFlag, i: number): string {
  const lines: string[] = [];
  lines.push(`### Example ${i + 1} · ${flag.entity.kind}: ${flag.entity.name} (${flag.entity.dungeonName})`);
  lines.push('');
  if (flag.bullet) {
    lines.push(`- Location: \`${flag.bullet.location.block}[${flag.bullet.location.index}]\``);
    lines.push(`- FR: *${flag.bullet.textFr}*`);
    lines.push(`- EN: *${flag.bullet.textEn}*`);
    if (flag.bullet.anchorQuote) {
      lines.push(`- Anchor: \`${flag.bullet.anchorQuote}\``);
    }
  }
  lines.push(`- Severity: **${flag.severity}** · Signal: ${flag.signal.toFixed(2)}`);
  lines.push(`- Why: ${flag.explanation}`);
  lines.push(`- Suggestion: ${flag.suggestion}`);
  lines.push(`- Entity id: \`${flag.entity.id}\` · Dungeon id: \`${flag.entity.dungeonId}\``);
  return lines.join('\n');
}

export function renderAuditMarkdown(report: AuditReport): string {
  const lines: string[] = [];
  lines.push('# v0.5.1 Audit — Combat Cards Diagnostic');
  lines.push('');
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push(`Dataset: \`${report.datasetPath}\``);
  lines.push('');
  lines.push('## Executive summary');
  lines.push('');
  lines.push(`- Dungeons scanned: ${report.counts.totalDungeons}`);
  lines.push(`- Boss cards with \`combat\` populated: ${report.counts.totalBossCards}`);
  lines.push(`- Monster cards with \`combat\` populated: ${report.counts.totalMonsterCards}`);
  lines.push(`- Total cards audited: ${report.counts.totalBossCards + report.counts.totalMonsterCards}`);
  lines.push(`- Distinct entities flagged (any bug): ${report.flaggedEntityIds.length}`);
  lines.push('');
  lines.push('### Decision policy per bug (B4 + B5 fallback)');
  lines.push('');
  lines.push(`- **Ambiguity**: < ${AMBIGUITY_THRESHOLDS.patchTargetedMax}% → patch-targeted · [${AMBIGUITY_THRESHOLDS.patchTargetedMax}%, ${AMBIGUITY_THRESHOLDS.regenerateCompleteMax}%) → regenerate-complete · ≥ ${AMBIGUITY_THRESHOLDS.regenerateCompleteMax}% → regenerate-and-manual-review. Within ±2pp of a boundary → human review.`);
  lines.push(`- **Cross-entity**: < ${CROSS_ENTITY_THRESHOLDS.regenerateCompleteMin}% → patch-targeted · [${CROSS_ENTITY_THRESHOLDS.regenerateCompleteMin}%, ${CROSS_ENTITY_THRESHOLDS.manualReviewMin}%) → regenerate-complete · ≥ ${CROSS_ENTITY_THRESHOLDS.manualReviewMin}% → regenerate-and-manual-review. Within ±2pp of a boundary → human review.`);
  lines.push('- **Ordering**: deterministically patchable — always patch-targeted.');
  lines.push('');

  for (const b of report.bugs) {
    lines.push(`## ${bugEmoji(b.bug)} ${bugTitle(b.bug)}`);
    lines.push('');
    lines.push(`- Cards flagged: **${b.cardsFlagged}** (**${b.percentCardsFlagged.toFixed(1)}%** of ${report.counts.totalBossCards + report.counts.totalMonsterCards})`);
    lines.push(`- Total flags emitted: ${b.totalFlags}`);
    lines.push(`- **Recommendation: \`${b.recommendation}\`** — ${b.recommendationReason}`);
    lines.push('');
    if (b.topExamples.length === 0) {
      lines.push('_No examples for this bug — clean._');
      lines.push('');
      continue;
    }
    lines.push('### Top 5 examples (sorted by severity then signal)');
    lines.push('');
    for (let i = 0; i < b.topExamples.length; i++) {
      lines.push(renderFlag(b.topExamples[i], i));
      lines.push('');
    }
  }

  lines.push('## Annex');
  lines.push('');
  lines.push(`- Machine-readable report: \`diagnostic-report.json\``);
  lines.push(`- Flagged entity ids (for \`--regenerate-flagged\`): \`flagged-entity-ids.json\``);
  return lines.join('\n') + '\n';
}
