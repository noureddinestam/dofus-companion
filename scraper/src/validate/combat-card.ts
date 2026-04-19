import { fuzzyContains, ANCHOR_MIN_SIMILARITY } from './anchors.ts';
import {
  COMBAT_BLOCK_ORDER_LEGACY,
  MechanicTypeEnum,
  CombatSeverityEnum,
  type Anchor,
  type Bullet,
  type CombatBlockKey,
  type CombatCard,
  type Lang,
  type Provenance,
} from '../validate.ts';

export interface ValidatedBullet extends Bullet {
  anchor: Anchor;
}

export interface CombatCardValidationReport {
  card: CombatCard | null;
  anchors: Anchor[];
  rejected: number;
  rejectReasons: string[];
}

export interface RawBulletCandidate {
  text?: { fr?: unknown; en?: unknown };
  mechanicType?: unknown;
  severity?: unknown;
  quote?: unknown;
}

export interface RawCombatCardCandidate {
  unlock?: unknown;
  constraints?: unknown;
  dangers?: unknown;
  tips?: unknown;
}

const MECHANIC_TYPE_VALUES = new Set(MechanicTypeEnum.options);
const SEVERITY_VALUES = new Set(CombatSeverityEnum.options);

function isString(v: unknown): v is string {
  return typeof v === 'string';
}

function isBulletArray(v: unknown): v is unknown[] {
  return Array.isArray(v);
}

function validateBulletSizes(fr: string, en: string, quote: string): string | null {
  if (fr.length < 3 || fr.length > 160) return `text.fr length ${fr.length} out of [3, 160]`;
  if (en.length < 3 || en.length > 160) return `text.en length ${en.length} out of [3, 160]`;
  if (quote.length < 5 || quote.length > 300) return `quote length ${quote.length} out of [5, 300]`;
  return null;
}

type BulletValidation =
  | { ok: true; bullet: Omit<Bullet, 'provenance'>; anchor: Anchor }
  | { ok: false; rejectReason: string };

function validateOneBullet(
  raw: RawBulletCandidate,
  sourceText: string,
  block: CombatBlockKey,
  seenTexts: Set<string>,
): BulletValidation {
  if (!raw || typeof raw !== 'object') return { ok: false, rejectReason: 'bullet not an object' };
  const fr = raw.text?.fr;
  const en = raw.text?.en;
  const quote = raw.quote;

  if (!isString(fr) || !isString(en) || !isString(quote)) {
    return { ok: false, rejectReason: 'missing text.fr/text.en/quote' };
  }
  const sizeError = validateBulletSizes(fr, en, quote);
  if (sizeError) return { ok: false, rejectReason: sizeError };

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

  // Severity coherence: tips block can't contain critical bullets.
  if (block === 'tips' && severity === 'critical') {
    return { ok: false, rejectReason: 'severity=critical forbidden in tips block' };
  }

  const similarity = fuzzyContains(sourceText, quote);
  if (similarity < ANCHOR_MIN_SIMILARITY) {
    return { ok: false, rejectReason: `anchor similarity ${similarity.toFixed(2)} below ${ANCHOR_MIN_SIMILARITY}` };
  }

  // Duplicate text across the whole card → reject (same info twice is banned).
  const dupKey = `${fr}\u0000${en}`;
  if (seenTexts.has(dupKey)) {
    return { ok: false, rejectReason: 'duplicate bullet text across blocks' };
  }
  seenTexts.add(dupKey);

  return {
    ok: true,
    // v0.5 prompt does not emit `kind`; default every bullet to 'action'. The
    // v0.5.1 migration reassigns `kind` for unlock bullets that used to live
    // in constraints (those become kind='context').
    bullet: { text: { fr, en }, kind: 'action', mechanicType, severity },
    anchor: { bulletIndex: 0, quote: quote.slice(0, 300), similarity },
  };
}

export interface ValidateCombatCardOptions {
  sourceText: string;
  /** Language of sourceText — used to tag per-bullet provenance. */
  sourceLang: Lang;
  /** Source URL in that lang, for the grounded provenance. */
  sourceUrl: string;
  /** Model name (for provenance). */
  model: string;
  /** Prompt version (for provenance). */
  promptVersion: string;
  /** createdAt ISO timestamp (for provenance). */
  generatedAt: string;
}

/**
 * Valide une candidate parsed JSON contre `sourceText`. Produit une CombatCard
 * enrichie en provenance grounded par bullet, ou null si tous les bullets
 * sont rejetés. Report chiffré des rejets inclus.
 */
export function validateCombatCardResponse(
  raw: RawCombatCardCandidate,
  options: ValidateCombatCardOptions,
): CombatCardValidationReport {
  const seenTexts = new Set<string>();
  const anchors: Anchor[] = [];
  const rejectReasons: string[] = [];
  const card: CombatCard = { unlock: [], constraints: [], dangers: [], tips: [] };

  for (const block of COMBAT_BLOCK_ORDER_LEGACY) {
    const rawBlock = raw[block];
    if (rawBlock == null) continue;
    if (!isBulletArray(rawBlock)) {
      rejectReasons.push(`block ${block} is not an array`);
      continue;
    }
    const bucket = card[block] ?? [];
    for (const rawBullet of rawBlock) {
      const result = validateOneBullet(rawBullet as RawBulletCandidate, options.sourceText, block, seenTexts);
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
        anchors: [{ ...result.anchor, bulletIndex: bucket.length }],
        generatedAt: options.generatedAt,
      };
      bucket.push({
        ...result.bullet,
        provenance,
      });
      anchors.push({ ...result.anchor, bulletIndex: anchors.length });
    }
    (card as Record<CombatBlockKey, Bullet[]>)[block] = bucket;
  }

  const totalBullets =
    card.unlock.length +
    (card.constraints?.length ?? 0) +
    card.dangers.length +
    card.tips.length;

  if (totalBullets === 0) {
    return {
      card: null,
      anchors: [],
      rejected: rejectReasons.length,
      rejectReasons,
    };
  }

  return { card, anchors, rejected: rejectReasons.length, rejectReasons };
}
