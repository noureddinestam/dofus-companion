import { fuzzyContains, ANCHOR_MIN_SIMILARITY } from './anchors.ts';
import {
  MechanicTypeEnum,
  CombatSeverityEnum,
  BulletKindEnum,
  type Anchor,
  type Bullet,
  type BulletKind,
  type CombatCard,
  type Lang,
  type Provenance,
} from '../validate.ts';

/**
 * v0.5.1 validator — mirrors the v1 validator but:
 * - expects bullets with explicit `kind: 'context' | 'action'`
 * - rejects the legacy `constraints` block entirely (prompt v2 must not emit it)
 * - enforces the unlock ordering invariant (context before action)
 * - rejects action bullets that start with a negation (positive phrasing required)
 * - reuses anchor fuzzy-match ≥ 0.75, length 3–160, enum checks, dedup across blocks
 */

export interface CombatCardV2ValidationReport {
  card: CombatCard | null;
  anchors: Anchor[];
  rejected: number;
  rejectReasons: string[];
}

export interface RawBulletCandidateV2 {
  text?: { fr?: unknown; en?: unknown };
  kind?: unknown;
  mechanicType?: unknown;
  severity?: unknown;
  quote?: unknown;
}

export interface RawCombatCardCandidateV2 {
  unlock?: unknown;
  dangers?: unknown;
  tips?: unknown;
}

const MECHANIC_TYPE_VALUES = new Set(MechanicTypeEnum.options);
const SEVERITY_VALUES = new Set(CombatSeverityEnum.options);
const KIND_VALUES = new Set(BulletKindEnum.options);

const NEGATION_PREFIXES_FR = [/^ne\s/i, /^n['']/i, /^pas\s/i, /^aucun/i, /^jamais\s/i, /^interdit\s/i, /^éviter?\s/i, /^évite\s/i];
const NEGATION_PREFIXES_EN = [/^don['']?t\s/i, /^do not\s/i, /^never\s/i, /^avoid\s/i, /^don\s/i];

function startsWithNegation(text: { fr: string; en: string }): boolean {
  const fr = text.fr.trim();
  const en = text.en.trim();
  return (
    NEGATION_PREFIXES_FR.some((p) => p.test(fr)) || NEGATION_PREFIXES_EN.some((p) => p.test(en))
  );
}

function isString(v: unknown): v is string {
  return typeof v === 'string';
}

function isBulletArray(v: unknown): v is unknown[] {
  return Array.isArray(v);
}

type BulletValidationV2 =
  | { ok: true; bullet: Omit<Bullet, 'provenance'>; anchor: Anchor }
  | { ok: false; rejectReason: string };

function validateOneBullet(
  raw: RawBulletCandidateV2,
  sourceText: string,
  block: 'unlock' | 'dangers' | 'tips',
  seenTexts: Set<string>,
): BulletValidationV2 {
  if (!raw || typeof raw !== 'object') return { ok: false, rejectReason: 'bullet not an object' };
  const fr = raw.text?.fr;
  const en = raw.text?.en;
  const quote = raw.quote;
  if (!isString(fr) || !isString(en) || !isString(quote)) {
    return { ok: false, rejectReason: 'missing text.fr/text.en/quote' };
  }
  if (fr.length < 3 || fr.length > 160) return { ok: false, rejectReason: `text.fr length ${fr.length} out of [3, 160]` };
  if (en.length < 3 || en.length > 160) return { ok: false, rejectReason: `text.en length ${en.length} out of [3, 160]` };
  if (quote.length < 5 || quote.length > 300) return { ok: false, rejectReason: `quote length ${quote.length} out of [5, 300]` };

  // kind default by block: unlock expects explicit kind, dangers/tips default to 'action'.
  let kind: BulletKind;
  if (raw.kind == null) {
    if (block === 'unlock') return { ok: false, rejectReason: 'missing kind on unlock bullet' };
    kind = 'action';
  } else if (isString(raw.kind) && KIND_VALUES.has(raw.kind as BulletKind)) {
    kind = raw.kind as BulletKind;
  } else {
    return { ok: false, rejectReason: `kind "${String(raw.kind)}" not in enum` };
  }

  // Positive-phrasing rule: action bullets must not start with negation.
  if (block === 'unlock' && kind === 'action' && startsWithNegation({ fr, en })) {
    return { ok: false, rejectReason: 'action bullet starts with negation — rewrite positively or move to dangers/context' };
  }

  const mechanicType =
    raw.mechanicType == null
      ? null
      : isString(raw.mechanicType) && MECHANIC_TYPE_VALUES.has(raw.mechanicType as never)
        ? (raw.mechanicType as Bullet['mechanicType'])
        : undefined;
  if (mechanicType === undefined) return { ok: false, rejectReason: `mechanicType "${String(raw.mechanicType)}" not in enum` };

  const severity =
    raw.severity == null
      ? null
      : isString(raw.severity) && SEVERITY_VALUES.has(raw.severity as never)
        ? (raw.severity as Bullet['severity'])
        : undefined;
  if (severity === undefined) return { ok: false, rejectReason: `severity "${String(raw.severity)}" not in enum` };

  if (block === 'tips' && severity === 'critical') {
    return { ok: false, rejectReason: 'severity=critical forbidden in tips block' };
  }

  const similarity = fuzzyContains(sourceText, quote);
  if (similarity < ANCHOR_MIN_SIMILARITY) {
    return { ok: false, rejectReason: `anchor similarity ${similarity.toFixed(2)} below ${ANCHOR_MIN_SIMILARITY}` };
  }

  const dupKey = `${fr}\u0000${en}`;
  if (seenTexts.has(dupKey)) {
    return { ok: false, rejectReason: 'duplicate bullet text across blocks' };
  }
  seenTexts.add(dupKey);

  return {
    ok: true,
    bullet: { text: { fr, en }, kind, mechanicType, severity },
    anchor: { bulletIndex: 0, quote: quote.slice(0, 300), similarity },
  };
}

export interface ValidateCombatCardV2Options {
  sourceText: string;
  sourceLang: Lang;
  sourceUrl: string;
  model: string;
  promptVersion: string;
  generatedAt: string;
}

export function validateCombatCardV2Response(
  raw: RawCombatCardCandidateV2,
  options: ValidateCombatCardV2Options,
): CombatCardV2ValidationReport {
  const seenTexts = new Set<string>();
  const anchors: Anchor[] = [];
  const rejectReasons: string[] = [];
  const card: CombatCard = { unlock: [], dangers: [], tips: [] };

  for (const block of ['unlock', 'dangers', 'tips'] as const) {
    const rawBlock = raw[block];
    if (rawBlock == null) continue;
    if (!isBulletArray(rawBlock)) {
      rejectReasons.push(`block ${block} is not an array`);
      continue;
    }
    for (const rawBullet of rawBlock) {
      const result = validateOneBullet(rawBullet as RawBulletCandidateV2, options.sourceText, block, seenTexts);
      if (!result.ok) {
        rejectReasons.push(`[${block}] ${result.rejectReason}`);
        continue;
      }
      const provenance: Provenance = {
        kind: 'llm-grounded',
        baseLang: options.sourceLang,
        baseSource: options.sourceLang === 'fr' ? 'fandom-fr' : 'fandom-en',
        baseSourceUrl: options.sourceUrl,
        model: options.model,
        promptVersion: options.promptVersion,
        anchors: [{ ...result.anchor, bulletIndex: card[block].length }],
        generatedAt: options.generatedAt,
      };
      card[block].push({ ...result.bullet, provenance });
      anchors.push({ ...result.anchor, bulletIndex: anchors.length });
    }
  }

  // Enforce ordering invariant on unlock: context must precede action.
  let seenAction = false;
  for (let i = 0; i < card.unlock.length; i++) {
    const b = card.unlock[i];
    if (b.kind === 'action') {
      seenAction = true;
      continue;
    }
    if (b.kind === 'context' && seenAction) {
      rejectReasons.push(`[unlock] ordering violation at index ${i}: context follows action — card rejected`);
      return { card: null, anchors: [], rejected: rejectReasons.length, rejectReasons };
    }
  }

  const total = card.unlock.length + card.dangers.length + card.tips.length;
  if (total === 0) {
    return { card: null, anchors: [], rejected: rejectReasons.length, rejectReasons };
  }
  return { card, anchors, rejected: rejectReasons.length, rejectReasons };
}
