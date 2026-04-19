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
  | { kind: 'negation-in-action'; matched: string }
  | { kind: 'context-phrased-as-prohibition'; matched: string };

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
    const otherBullets = card[otherBlock] ?? [];
    for (let i = 0; i < otherBullets.length; i++) {
      const other = otherBullets[i];
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

  // 2. Legacy v0.5 rule — action verb without negation in a still-populated
  //    constraints block. After the v0.5.1 schema migration constraints should
  //    be empty across the dataset, but we keep the check to catch regressions.
  if (block === 'constraints') {
    const hasNegation = matchesAny(nFr, NEGATION_PREFIXES_FR) || matchesAny(nEn, NEGATION_PREFIXES_EN);
    const hasPermanent = matchesAny(nFr, PERMANENT_WORDS_FR) || matchesAny(nEn, PERMANENT_WORDS_EN);
    const looksLikeAction = matchesAny(nFr, ACTION_VERBS_FR) || matchesAny(nEn, ACTION_VERBS_EN);
    if (!hasNegation && !hasPermanent && looksLikeAction) {
      signals.push({ kind: 'imperative-in-constraints', matched: bullet.text.fr });
    }
  }

  // 3. Lexical — v0.5.1 kind-aware.
  //    - An ACTION bullet that starts with a negation is almost certainly a
  //      context rule mis-tagged (or a prohibition that belongs in dangers).
  //    - A CONTEXT bullet phrased as a prohibition ("Ne pas …") reads poorly
  //      in the "Contexte" subsection: it should be rewritten positively.
  if (block === 'unlock') {
    const hasNegation = matchesAny(nFr, NEGATION_PREFIXES_FR) || matchesAny(nEn, NEGATION_PREFIXES_EN);
    if (hasNegation) {
      if (bullet.kind === 'action') {
        signals.push({ kind: 'negation-in-action', matched: bullet.text.fr });
      } else if (bullet.kind === 'context') {
        signals.push({ kind: 'context-phrased-as-prohibition', matched: bullet.text.fr });
      }
    }
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
    case 'negation-in-action':
      return {
        bug: 'ambiguity',
        severity: 'medium',
        entity,
        bullet: bulletPayload,
        signal: 1,
        explanation: `Action bullet starts with a negation — actions should be positive verbs; prohibitions belong either in unlock.context (as a rule) or dangers (as a punition).`,
        suggestion: `Retag kind='context' if it's a permanent rule, or rewrite as a positive action.`,
        details: { matchedText: signal.matched },
      };
    case 'context-phrased-as-prohibition':
      return {
        bug: 'ambiguity',
        severity: 'low',
        entity,
        bullet: bulletPayload,
        signal: 1,
        explanation: `Context bullet reads as a prohibition ("Ne pas …") — prefer a positive phrasing so the Contexte subsection reads as facts rather than rules.`,
        suggestion: `Reword positively ("Rester loin du centre" instead of "Ne pas rester au centre").`,
        details: { matchedText: signal.matched },
      };
  }
}

function inspectCard(card: CombatCard, entity: CardFlag['entity']): CardFlag[] {
  const flags: CardFlag[] = [];
  for (const block of ['unlock', 'constraints', 'dangers', 'tips'] as const) {
    const bullets = card[block] ?? [];
    for (let i = 0; i < bullets.length; i++) {
      const b = bullets[i];
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
