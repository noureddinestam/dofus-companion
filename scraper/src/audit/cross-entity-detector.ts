import { fuzzyContains, ANCHOR_MIN_SIMILARITY } from '../validate/anchors.ts';
import { fetchBossStrategy } from '../sources/fandom.ts';
import { fetchBossStrategyFr } from '../sources/fandom-fr.ts';
import { fetchMonsterStrategy } from '../sources/fandom-monster.ts';
import type { Bullet, CombatCard, Dungeon, Monster } from '../validate.ts';
import type { CardFlag, EntityKind } from './types.ts';

/**
 * A bullet is suspected cross-entity if its verbatim anchor is found better
 * (≥ MARGIN) in a sibling entity's Fandom page than in the owner's page.
 * Default 0.10 absolute margin — enough to avoid false positives on near-identical
 * anchors shared between two pages, strict enough to catch real contamination.
 */
const CROSS_ENTITY_MARGIN = 0.1;

/** Below this similarity on the owner page, any sibling match > owner is suspect. */
const OWNER_SOFT_FLOOR = ANCHOR_MIN_SIMILARITY; // 0.75

export interface EntityPageText {
  entityId: string;
  entityName: string;
  kind: EntityKind;
  text: string;
  url: string | null;
}

export interface ContaminationSuggestion {
  suggestedOwnerId: string;
  suggestedOwnerName: string;
  suggestedOwnerKind: EntityKind;
  ownerSimilarity: number;
  candidateSimilarity: number;
}

/**
 * Fetch the Fandom text for one entity. Returns null if Fandom has nothing
 * exploitable (used as a graceful skip — a boss with no Fandom page just
 * can't be cross-entity checked).
 */
async function safely<T>(op: () => Promise<T | null>): Promise<T | null> {
  try {
    return await op();
  } catch (e) {
    // Transient fetch failures (ECONNRESET, timeout, Fandom 5xx) are not fatal
    // for an audit — we degrade to "entity has no Fandom text" and move on.
    const msg = e instanceof Error ? e.message : String(e);
    console.warn(`    ⚠ fetch skipped: ${msg}`);
    return null;
  }
}

async function fetchEntityText(
  kind: EntityKind,
  nameFr: string,
  nameEn: string | null,
): Promise<{ text: string; url: string } | null> {
  // Boss: prefer FR then EN (matching v0.5 boss pipeline).
  if (kind === 'boss') {
    const fr = await safely(() => fetchBossStrategyFr(nameFr, nameEn));
    if (fr) return { text: fr.text, url: fr.url };
    if (nameEn) {
      const en = await safely(() => fetchBossStrategy(nameEn));
      if (en) return { text: en.text, url: en.url };
    }
    return null;
  }
  // Monster: the v0.5 Phase C fetcher.
  const m = await safely(() => fetchMonsterStrategy(nameFr, nameEn));
  if (!m) return null;
  return { text: m.text, url: m.url };
}

/** Collect text of every entity in a dungeon (boss + monsters, minus aliases). */
export async function collectDungeonEntityTexts(d: Dungeon): Promise<EntityPageText[]> {
  const pages: EntityPageText[] = [];

  // Boss
  const bossPage = await fetchEntityText('boss', d.boss.name, d.boss.nameEn);
  if (bossPage) {
    pages.push({
      entityId: d.boss.id,
      entityName: d.boss.name,
      kind: 'boss',
      text: bossPage.text,
      url: bossPage.url,
    });
  }

  // Monsters (skip boss alias, skip those without any combat field — they
  // won't be audited anyway)
  for (const m of d.monsters) {
    if (m.id === d.boss.id) continue;
    const page = await fetchEntityText('monster', m.name, m.nameEn);
    if (!page) continue;
    pages.push({
      entityId: m.id,
      entityName: m.name,
      kind: 'monster',
      text: page.text,
      url: page.url,
    });
  }

  return pages;
}

/**
 * For a given bullet whose anchor.quote we've extracted, find the page text
 * within the provided pool that scores highest on fuzzyContains. Returns
 * { best: { page, similarity }, ownerSimilarity } when the best match is
 * not the owner, `null` when no contamination is detected.
 */
export function detectBulletContamination(
  ownerEntityId: string,
  anchorQuote: string,
  pagesInDungeon: EntityPageText[],
): ContaminationSuggestion | null {
  const ownerPage = pagesInDungeon.find((p) => p.entityId === ownerEntityId);
  if (!ownerPage) return null; // owner has no Fandom page — skip, undecidable
  const ownerSimilarity = fuzzyContains(ownerPage.text, anchorQuote);

  let best: { page: EntityPageText; similarity: number } | null = null;
  for (const page of pagesInDungeon) {
    if (page.entityId === ownerEntityId) continue;
    const s = fuzzyContains(page.text, anchorQuote);
    if (!best || s > best.similarity) best = { page, similarity: s };
  }
  if (!best) return null;

  // Contamination condition:
  //  (a) sibling similarity beats owner similarity by at least MARGIN, AND
  //  (b) owner similarity is below the soft floor (otherwise it's shared vocab)
  if (best.similarity >= ownerSimilarity + CROSS_ENTITY_MARGIN && ownerSimilarity < OWNER_SOFT_FLOOR) {
    return {
      suggestedOwnerId: best.page.entityId,
      suggestedOwnerName: best.page.entityName,
      suggestedOwnerKind: best.page.kind,
      ownerSimilarity,
      candidateSimilarity: best.similarity,
    };
  }
  return null;
}

function bulletAnchorQuote(b: Bullet): string | null {
  if (b.provenance.kind !== 'llm-grounded') return null;
  if (b.provenance.anchors.length === 0) return null;
  return b.provenance.anchors[0].quote;
}

function contaminationToFlag(
  bullet: Bullet,
  block: 'unlock' | 'constraints' | 'dangers' | 'tips',
  index: number,
  entity: CardFlag['entity'],
  anchorQuote: string,
  suggestion: ContaminationSuggestion,
): CardFlag {
  const delta = suggestion.candidateSimilarity - suggestion.ownerSimilarity;
  const severity: CardFlag['severity'] =
    delta >= 0.25 ? 'high' : delta >= 0.15 ? 'medium' : 'low';
  return {
    bug: 'cross-entity',
    severity,
    entity,
    bullet: {
      location: { block, index },
      textFr: bullet.text.fr,
      textEn: bullet.text.en,
      anchorQuote,
    },
    signal: delta,
    explanation: `Anchor matches ${suggestion.suggestedOwnerKind} "${suggestion.suggestedOwnerName}" (${suggestion.candidateSimilarity.toFixed(2)}) better than owner (${suggestion.ownerSimilarity.toFixed(2)}).`,
    suggestion: `Migrate this bullet to ${suggestion.suggestedOwnerKind}.combat of ${suggestion.suggestedOwnerName}.`,
    details: {
      suggestedOwnerId: suggestion.suggestedOwnerId,
      suggestedOwnerName: suggestion.suggestedOwnerName,
      suggestedOwnerKind: suggestion.suggestedOwnerKind,
      ownerSimilarity: suggestion.ownerSimilarity,
      candidateSimilarity: suggestion.candidateSimilarity,
    },
  };
}

function inspectCard(
  card: CombatCard,
  ownerEntityId: string,
  entity: CardFlag['entity'],
  pagesInDungeon: EntityPageText[],
): CardFlag[] {
  const flags: CardFlag[] = [];
  for (const block of ['unlock', 'constraints', 'dangers', 'tips'] as const) {
    for (let i = 0; i < card[block].length; i++) {
      const b = card[block][i];
      const quote = bulletAnchorQuote(b);
      if (!quote) continue;
      const contam = detectBulletContamination(ownerEntityId, quote, pagesInDungeon);
      if (contam) flags.push(contaminationToFlag(b, block, i, entity, quote, contam));
    }
  }
  return flags;
}

/**
 * Per-dungeon cross-entity audit. Pure (given pagesInDungeon), no I/O in this
 * call — caller is responsible for fetching pages upstream (so we keep the
 * network cost visible at orchestrator level).
 */
export function detectCrossEntityFlagsForDungeon(
  d: Dungeon,
  pagesInDungeon: EntityPageText[],
): CardFlag[] {
  const flags: CardFlag[] = [];

  if (d.boss.combat) {
    flags.push(
      ...inspectCard(d.boss.combat, d.boss.id, {
        kind: 'boss',
        id: d.boss.id,
        name: d.boss.name,
        dungeonId: d.id,
        dungeonName: d.name,
      }, pagesInDungeon),
    );
  }

  for (const m of d.monsters) {
    if (m.id === d.boss.id) continue;
    if (!m.combat) continue;
    flags.push(
      ...inspectCard(m.combat, m.id, {
        kind: 'monster',
        id: m.id,
        name: m.name,
        dungeonId: d.id,
        dungeonName: d.name,
      }, pagesInDungeon),
    );
  }
  return flags;
}

/**
 * Orchestrator: for every dungeon, fetches the entity texts, runs the
 * per-dungeon detector, aggregates. Fires HTTP (cached) so treat as async +
 * long-running. Callers should stream progress.
 */
export async function detectCrossEntityFlags(
  dungeons: Dungeon[],
  onProgress?: (done: number, total: number, label: string) => void,
): Promise<CardFlag[]> {
  const flags: CardFlag[] = [];
  const total = dungeons.length;
  for (let i = 0; i < dungeons.length; i++) {
    const d = dungeons[i];
    onProgress?.(i + 1, total, d.name);
    // Skip dungeons with no cards at all.
    const hasAnyCard =
      (d.boss.combat && !isCardEmpty(d.boss.combat)) ||
      d.monsters.some((m) => m.combat && !isCardEmpty(m.combat));
    if (!hasAnyCard) continue;

    const pages = await collectDungeonEntityTexts(d);
    flags.push(...detectCrossEntityFlagsForDungeon(d, pages));
  }
  return flags;
}

function isCardEmpty(card: CombatCard): boolean {
  return (
    card.unlock.length === 0 &&
    card.constraints.length === 0 &&
    card.dangers.length === 0 &&
    card.tips.length === 0
  );
}

// Re-exported for testing / debug.
export { bulletAnchorQuote };
export type { Monster };
