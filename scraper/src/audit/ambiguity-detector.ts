import { diceCoefficient, normalize } from '../validate/anchors.ts';
import type { Bullet, CombatCard, Dungeon } from '../validate.ts';
import type { CardFlag, EntityKind } from './types.ts';

/**
 * Two bullets whose normalized texts match ≥ 0.80 on Dice are considered
 * duplicates — even if they live in different blocks. The smaller-block
 * one is flagged (tie-break: CONSTRAINTS → flagged vs UNLOCK, because in
 * v0.5.1 CONSTRAINTS is the one going away).
 */
const DICE_DUPLICATE_THRESHOLD = 0.8;

/** Normalized pattern tokens used by the lexical heuristic. */
const NEGATION_PREFIXES_FR = [
  /^ne\s/,
  /^n['']/,
  /^pas\s/,
  /^aucun/,
  /^jamais\s/,
  /^interdit\s/,
  /^éviter?\s/,
  /^évite\s/,
];
const NEGATION_PREFIXES_EN = [
  /^don['']?t\s/,
  /^do not\s/,
  /^never\s/,
  /^avoid\s/,
  /^don\s/,
];
const PERMANENT_WORDS_FR = [
  /\btoujours\b/,
  /\bchaque tour\b/,
  /\ben permanence\b/,
  /\btout au long\b/,
];
const PERMANENT_WORDS_EN = [
  /\balways\b/,
  /\bevery turn\b/,
  /\bat all times\b/,
  /\bthroughout\b/,
];
const ACTION_VERBS_FR = [
  /^tuer\b/,
  /^achever\b/,
  /^éloigner\b/,
  /^pousser\b/,
  /^isoler\b/,
  /^focus/,
  /^burst/,
  /^frapper\b/,
  /^placer\b/,
];
const ACTION_VERBS_EN = [
  /^kill\b/,
  /^finish\b/,
  /^pull\b/,
  /^push\b/,
  /^isolate\b/,
  /^focus\b/,
  /^burst\b/,
  /^hit\b/,
  /^place\b/,
];

function matchesAny(text: string, patterns: readonly RegExp[]): boolean {
  return patterns.some((p) => p.test(text));
}

type Signal =
  | { kind: 'duplicate'; withBlock: 'unlock' | 'constraints' | 'dangers' | 'tips'; withIndex: number; dice: number }
  | { kind: 'imperative-in-constraints'; matched: string }
  | { kind: 'negation-in-unlock'; matched: string }
  | { kind: 'permanent-in-unlock'; matched: string };

function detectBulletSignals(
  bullet: Bullet,
  block: 'unlock' | 'constraints' | 'dangers' | 'tips',
  card: CombatCard,
): Signal[] {
  const signals: Signal[] = [];
  const nFr = normalize(bullet.text.fr);
  const nEn = normalize(bullet.text.en);

  // 1. Cross-block duplicate detection — the v0.5.1 problem is unlock ⇄ constraints
  //    bleed. Intra-block duplicates are a different bug class and out of scope here.
  for (const otherBlock of ['unlock', 'constraints', 'dangers', 'tips'] as const) {
    if (otherBlock === block) continue;
    for (let i = 0; i < card[otherBlock].length; i++) {
      const other = card[otherBlock][i];
      const ofr = normalize(other.text.fr);
      const dice = Math.max(diceCoefficient(nFr, ofr), diceCoefficient(nEn, normalize(other.text.en)));
      if (dice >= DICE_DUPLICATE_THRESHOLD) {
        // Prefer to flag the CONSTRAINTS side if it's a unlock/constraints pair —
        // in v0.5.1 constraints is the disappearing block. Otherwise flag the
        // non-unlock side by default.
        const flagThisSide =
          (block === 'constraints' && otherBlock === 'unlock') ||
          block !== 'unlock';
        if (flagThisSide) {
          signals.push({ kind: 'duplicate', withBlock: otherBlock, withIndex: i, dice });
        }
      }
    }
  }

  // 2. Lexical — constraints that read like unlock actions.
  if (block === 'constraints') {
    const hasNegation = matchesAny(nFr, NEGATION_PREFIXES_FR) || matchesAny(nEn, NEGATION_PREFIXES_EN);
    const hasPermanent = matchesAny(nFr, PERMANENT_WORDS_FR) || matchesAny(nEn, PERMANENT_WORDS_EN);
    const looksLikeAction = matchesAny(nFr, ACTION_VERBS_FR) || matchesAny(nEn, ACTION_VERBS_EN);
    if (!hasNegation && !hasPermanent && looksLikeAction) {
      signals.push({ kind: 'imperative-in-constraints', matched: bullet.text.fr });
    }
  }

  // 3. Lexical — unlock bullets that read like permanent rules / forbidden actions.
  if (block === 'unlock') {
    const hasNegation = matchesAny(nFr, NEGATION_PREFIXES_FR) || matchesAny(nEn, NEGATION_PREFIXES_EN);
    const hasPermanent = matchesAny(nFr, PERMANENT_WORDS_FR) || matchesAny(nEn, PERMANENT_WORDS_EN);
    if (hasNegation) signals.push({ kind: 'negation-in-unlock', matched: bullet.text.fr });
    else if (hasPermanent) signals.push({ kind: 'permanent-in-unlock', matched: bullet.text.fr });
  }

  return signals;
}

function signalToFlag(
  signal: Signal,
  bullet: Bullet,
  block: 'unlock' | 'constraints' | 'dangers' | 'tips',
  index: number,
  entity: CardFlag['entity'],
): CardFlag {
  const bulletPayload: CardFlag['bullet'] = {
    location: { block, index },
    textFr: bullet.text.fr,
    textEn: bullet.text.en,
    anchorQuote:
      bullet.provenance.kind === 'llm-grounded' && bullet.provenance.anchors.length > 0
        ? bullet.provenance.anchors[0].quote
        : null,
  };

  switch (signal.kind) {
    case 'duplicate':
      return {
        bug: 'ambiguity',
        severity: signal.dice >= 0.9 ? 'high' : 'medium',
        entity,
        bullet: bulletPayload,
        signal: signal.dice,
        explanation: `Dice ${signal.dice.toFixed(2)} with ${signal.withBlock}[${signal.withIndex}] — bullet text duplicated across blocks.`,
        suggestion: `Drop the weaker copy; keep one authoritative bullet in the block that matches its semantic (usually unlock for actions).`,
        details: { withBlock: signal.withBlock, withIndex: signal.withIndex, dice: signal.dice },
      };
    case 'imperative-in-constraints':
      return {
        bug: 'ambiguity',
        severity: 'medium',
        entity,
        bullet: bulletPayload,
        signal: 1,
        explanation: `Bullet starts with an action verb but lives in constraints — the v0.5.1 doctrine puts action verbs in unlock.action.`,
        suggestion: `Move to unlock with kind="action".`,
        details: { matchedText: signal.matched },
      };
    case 'negation-in-unlock':
      return {
        bug: 'ambiguity',
        severity: 'medium',
        entity,
        bullet: bulletPayload,
        signal: 1,
        explanation: `Bullet starts with a negation but lives in unlock — v0.5.1 puts permanent rules in unlock.context, worded without "ne pas".`,
        suggestion: `Rewrite as a positive context bullet ("Rester loin du centre" instead of "Ne pas rester au centre") or move the punition phrasing to dangers.`,
        details: { matchedText: signal.matched },
      };
    case 'permanent-in-unlock':
      return {
        bug: 'ambiguity',
        severity: 'low',
        entity,
        bullet: bulletPayload,
        signal: 1,
        explanation: `Bullet uses a permanent-rule marker ("toujours" / "always") but is in unlock — likely belongs to unlock.context.`,
        suggestion: `Move to unlock.context (it is a permanent rule, not an ordered action).`,
        details: { matchedText: signal.matched },
      };
  }
}

function inspectCard(card: CombatCard, entity: CardFlag['entity']): CardFlag[] {
  const flags: CardFlag[] = [];
  for (const block of ['unlock', 'constraints', 'dangers', 'tips'] as const) {
    for (let i = 0; i < card[block].length; i++) {
      const b = card[block][i];
      for (const signal of detectBulletSignals(b, block, card)) {
        flags.push(signalToFlag(signal, b, block, i, entity));
      }
    }
  }
  // Deduplicate: a Dice duplicate may surface twice if both sides flag themselves.
  // Already handled via the `flagThisSide` logic, but we still dedupe by a key
  // (bug + entity + location + explanation first 20 chars).
  const seen = new Set<string>();
  return flags.filter((f) => {
    const key = `${f.bug}|${f.entity.id}|${f.bullet?.location.block}|${f.bullet?.location.index}|${f.explanation.slice(0, 40)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Run the Dice + lexical ambiguity detector over the whole dataset.
 * Pure: no network, no LLM, no I/O.
 */
export function detectAmbiguityFlags(dungeons: Dungeon[]): CardFlag[] {
  const flags: CardFlag[] = [];
  for (const d of dungeons) {
    // Boss card
    if (d.boss.combat) {
      flags.push(
        ...inspectCard(d.boss.combat, {
          kind: 'boss' satisfies EntityKind,
          id: d.boss.id,
          name: d.boss.name,
          dungeonId: d.id,
          dungeonName: d.name,
        }),
      );
    }
    // Monsters (skip the boss-alias entry)
    for (const m of d.monsters) {
      if (m.id === d.boss.id) continue;
      if (!m.combat) continue;
      flags.push(
        ...inspectCard(m.combat, {
          kind: 'monster' satisfies EntityKind,
          id: m.id,
          name: m.name,
          dungeonId: d.id,
          dungeonName: d.name,
        }),
      );
    }
  }
  return flags;
}
