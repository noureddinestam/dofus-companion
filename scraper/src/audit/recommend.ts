import type { BugKind, BugSummary, CardFlag } from './types.ts';

/**
 * Per-bug decision policy (B4 brief) with a B5 human-review fallback when a
 * metric lands within ±2 percentage points of any threshold boundary.
 *
 * Tunable centrally — thresholds are exported so the test suite and the
 * CLI help text read the same numbers.
 */

export const AMBIGUITY_THRESHOLDS = {
  patchTargetedMax: 10,
  regenerateCompleteMax: 30,
} as const;

export const CROSS_ENTITY_THRESHOLDS = {
  regenerateCompleteMin: 5,
  manualReviewMin: 15,
} as const;

/** Bug 3 is patchable deterministically so there's no %-threshold — the
 *  orderingFlags just feed the migration step directly. */

const AMBIGUOUS_BAND_PP = 2; // ±2 percentage points

interface RecommendationInput {
  bug: BugKind;
  cardsFlagged: number;
  totalCards: number;
}

function withinBand(value: number, boundary: number): boolean {
  return Math.abs(value - boundary) <= AMBIGUOUS_BAND_PP;
}

function recommendForAmbiguity(pct: number): Pick<BugSummary, 'recommendation' | 'recommendationReason'> {
  if (
    withinBand(pct, AMBIGUITY_THRESHOLDS.patchTargetedMax) ||
    withinBand(pct, AMBIGUITY_THRESHOLDS.regenerateCompleteMax)
  ) {
    return {
      recommendation: 'needs-human-review',
      recommendationReason: `ambiguity=${pct.toFixed(1)}% lands within ±${AMBIGUOUS_BAND_PP}pp of a decision boundary (${AMBIGUITY_THRESHOLDS.patchTargetedMax}% or ${AMBIGUITY_THRESHOLDS.regenerateCompleteMax}%) — defer to human judgment.`,
    };
  }
  if (pct < AMBIGUITY_THRESHOLDS.patchTargetedMax) {
    return {
      recommendation: 'patch-targeted',
      recommendationReason: `ambiguity=${pct.toFixed(1)}% < ${AMBIGUITY_THRESHOLDS.patchTargetedMax}% — patch flagged cards only.`,
    };
  }
  if (pct < AMBIGUITY_THRESHOLDS.regenerateCompleteMax) {
    return {
      recommendation: 'regenerate-complete',
      recommendationReason: `ambiguity=${pct.toFixed(1)}% in [${AMBIGUITY_THRESHOLDS.patchTargetedMax}%, ${AMBIGUITY_THRESHOLDS.regenerateCompleteMax}%) — full regeneration recommended.`,
    };
  }
  return {
    recommendation: 'regenerate-and-manual-review',
    recommendationReason: `ambiguity=${pct.toFixed(1)}% ≥ ${AMBIGUITY_THRESHOLDS.regenerateCompleteMax}% — regenerate everything + manual review of top-played dungeons.`,
  };
}

function recommendForCrossEntity(pct: number): Pick<BugSummary, 'recommendation' | 'recommendationReason'> {
  if (
    withinBand(pct, CROSS_ENTITY_THRESHOLDS.regenerateCompleteMin) ||
    withinBand(pct, CROSS_ENTITY_THRESHOLDS.manualReviewMin)
  ) {
    return {
      recommendation: 'needs-human-review',
      recommendationReason: `cross-entity=${pct.toFixed(1)}% lands within ±${AMBIGUOUS_BAND_PP}pp of a decision boundary (${CROSS_ENTITY_THRESHOLDS.regenerateCompleteMin}% or ${CROSS_ENTITY_THRESHOLDS.manualReviewMin}%) — defer to human judgment.`,
    };
  }
  if (pct < CROSS_ENTITY_THRESHOLDS.regenerateCompleteMin) {
    return {
      recommendation: 'patch-targeted',
      recommendationReason: `cross-entity=${pct.toFixed(1)}% < ${CROSS_ENTITY_THRESHOLDS.regenerateCompleteMin}% — migrate flagged bullets to their suggested owner.`,
    };
  }
  if (pct < CROSS_ENTITY_THRESHOLDS.manualReviewMin) {
    return {
      recommendation: 'regenerate-complete',
      recommendationReason: `cross-entity=${pct.toFixed(1)}% in [${CROSS_ENTITY_THRESHOLDS.regenerateCompleteMin}%, ${CROSS_ENTITY_THRESHOLDS.manualReviewMin}%) — full regeneration with prompt v2 recommended.`,
    };
  }
  return {
    recommendation: 'regenerate-and-manual-review',
    recommendationReason: `cross-entity=${pct.toFixed(1)}% ≥ ${CROSS_ENTITY_THRESHOLDS.manualReviewMin}% — regenerate + manual review of top-played dungeons.`,
  };
}

function recommendForOrdering(cardsFlagged: number, totalCards: number): Pick<BugSummary, 'recommendation' | 'recommendationReason'> {
  if (cardsFlagged === 0) {
    return { recommendation: 'no-op', recommendationReason: 'Ordering judge flagged 0 cards.' };
  }
  return {
    recommendation: 'patch-targeted',
    recommendationReason: `Ordering is deterministically patchable — apply the suggested optimalOrder on each of the ${cardsFlagged}/${totalCards} flagged cards.`,
  };
}

export function recommend({ bug, cardsFlagged, totalCards }: RecommendationInput): Pick<BugSummary, 'recommendation' | 'recommendationReason'> {
  const pct = totalCards === 0 ? 0 : (cardsFlagged / totalCards) * 100;
  switch (bug) {
    case 'ambiguity':
      return recommendForAmbiguity(pct);
    case 'cross-entity':
      return recommendForCrossEntity(pct);
    case 'ordering':
      return recommendForOrdering(cardsFlagged, totalCards);
  }
}

/** Count distinct entity ids that were flagged for a given bug. */
export function countCardsFlagged(flags: CardFlag[], bug: BugKind): number {
  const ids = new Set<string>();
  for (const f of flags) {
    if (f.bug === bug) ids.add(f.entity.id);
  }
  return ids.size;
}
