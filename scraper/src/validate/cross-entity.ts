import { fuzzyContains, ANCHOR_MIN_SIMILARITY } from './anchors.ts';
import type { Bullet, CombatCard } from '../validate.ts';
import type { EntityPageText } from '../audit/cross-entity-detector.ts';

/**
 * Final gate — per brief §3.3 — blocking any bullet whose anchor is better
 * matched by a sibling entity's Fandom page than by the owner's page.
 *
 * Stricter than the audit detector: the audit uses (sibling > owner + 0.10 AND
 * owner < 0.75) to avoid false positives on an already-shipped dataset. The
 * gate uses a softer check:
 *   - owner similarity ≥ 0.75 → ACCEPT (the anchor is genuinely on the owner's page)
 *   - owner similarity < 0.75 AND best sibling > owner → REJECT (contamination)
 *   - owner similarity < 0.75 AND no sibling better → ACCEPT with warning
 * The goal is to never ship a bullet that clearly belongs somewhere else.
 */

export const OWNER_SOFT_FLOOR = ANCHOR_MIN_SIMILARITY;

export interface CrossEntityRejection {
  reason: string;
  suggestedOwnerId: string;
  suggestedOwnerName: string;
  ownerSimilarity: number;
  candidateSimilarity: number;
}

export interface CrossEntityAccept {
  ok: true;
  ownerSimilarity: number;
}

export type CrossEntityGateResult =
  | CrossEntityAccept
  | ({ ok: false } & CrossEntityRejection);

export function crossEntityGate(
  ownerEntityId: string,
  anchorQuote: string,
  pagesInDungeon: EntityPageText[],
): CrossEntityGateResult {
  const owner = pagesInDungeon.find((p) => p.entityId === ownerEntityId);
  if (!owner) {
    // Undecidable — owner page missing. Accept but caller should log.
    return { ok: true, ownerSimilarity: 0 };
  }
  const ownerSimilarity = fuzzyContains(owner.text, anchorQuote);
  if (ownerSimilarity >= OWNER_SOFT_FLOOR) {
    return { ok: true, ownerSimilarity };
  }

  let bestSibling: { page: EntityPageText; similarity: number } | null = null;
  for (const page of pagesInDungeon) {
    if (page.entityId === ownerEntityId) continue;
    const s = fuzzyContains(page.text, anchorQuote);
    if (!bestSibling || s > bestSibling.similarity) bestSibling = { page, similarity: s };
  }
  if (bestSibling && bestSibling.similarity > ownerSimilarity) {
    return {
      ok: false,
      ownerSimilarity,
      candidateSimilarity: bestSibling.similarity,
      suggestedOwnerId: bestSibling.page.entityId,
      suggestedOwnerName: bestSibling.page.entityName,
      reason: `anchor similarity ${ownerSimilarity.toFixed(2)} on owner, ${bestSibling.similarity.toFixed(2)} on sibling "${bestSibling.page.entityName}" — contamination`,
    };
  }
  // Owner < 0.75 and no sibling beats it — accept reluctantly. This means
  // Fandom's phrasing drifted from the bullet; the upstream validator's
  // anchor check (≥ 0.75) will already have rejected this case, so we
  // should rarely hit this branch.
  return { ok: true, ownerSimilarity };
}

export interface CrossEntityCardGateReport {
  card: CombatCard;
  acceptedCount: number;
  rejectedCount: number;
  rejections: Array<CrossEntityRejection & { bulletIndex: number; block: string }>;
}

/**
 * Apply the gate to every LLM-grounded bullet of a freshly generated card.
 * Returns a filtered card + report. Unchanged bullets without an anchor
 * pass through (e.g. community provenance, native with no quote).
 */
export function applyCrossEntityGate(
  card: CombatCard,
  ownerEntityId: string,
  pagesInDungeon: EntityPageText[],
): CrossEntityCardGateReport {
  const accepted: CombatCard = { unlock: [], dangers: [], tips: [] };
  const rejections: Array<CrossEntityRejection & { bulletIndex: number; block: string }> = [];
  let acceptedCount = 0;
  let rejectedCount = 0;

  const process = (block: 'unlock' | 'dangers' | 'tips') => {
    for (let i = 0; i < card[block].length; i++) {
      const b: Bullet = card[block][i];
      const quote = b.provenance.kind === 'llm-grounded' ? b.provenance.anchors[0]?.quote ?? null : null;
      if (!quote) {
        accepted[block].push(b);
        acceptedCount++;
        continue;
      }
      const res = crossEntityGate(ownerEntityId, quote, pagesInDungeon);
      if (res.ok) {
        accepted[block].push(b);
        acceptedCount++;
      } else {
        rejectedCount++;
        rejections.push({ ...res, bulletIndex: i, block });
      }
    }
  };
  process('unlock');
  process('dangers');
  process('tips');
  return { card: accepted, acceptedCount, rejectedCount, rejections };
}
