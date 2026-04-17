import { normalize } from './anchors.ts';

export interface GlossaryReport {
  /** Nombre de termes EN présents dans la source qui apparaissent aussi en forme canonique FR dans la traduction */
  matched: number;
  /** Nombre de termes EN présents dans la source mais dont la forme canonique FR n'est PAS dans la traduction */
  missing: Array<{ enTerm: string; canonical: string }>;
  /** Ratio matched / (matched + missing) — 1 = toutes les traductions canoniques présentes */
  coverage: number;
  /** Ratio de phrases : fr / en. 1.0 = même nombre, 1.2 = 20% en plus */
  sentenceRatio: number;
}

function countSentences(text: string): number {
  return text
    .split(/[.!?\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 3).length;
}

/**
 * Vérifie qu'une traduction FR utilise les termes canoniques du glossaire
 * quand le texte EN source contient leur équivalent anglais.
 *
 * Retourne un rapport — ne lance PAS d'exception. À l'appelant d'interpréter :
 *   - coverage >= 0.6 : acceptable
 *   - coverage < 0.6 : suspect (traduction probablement bâclée ou hors domaine)
 *   - sentenceRatio en dehors de [0.8 ; 1.2] : structure non préservée
 */
export function validateGlossary(
  sourceEn: string,
  translationFr: string,
  glossary: Record<string, string>,
): GlossaryReport {
  const normEn = normalize(sourceEn);
  const normFr = normalize(translationFr);

  let matched = 0;
  const missing: GlossaryReport['missing'] = [];

  for (const [enTerm, canonicalFr] of Object.entries(glossary)) {
    const normEnTerm = normalize(enTerm);
    if (normEnTerm.length === 0) continue;
    if (!containsWord(normEn, normEnTerm)) continue;

    const normCanonical = normalize(canonicalFr);
    if (normCanonical.length === 0) continue;
    if (containsWord(normFr, normCanonical)) {
      matched++;
    } else {
      missing.push({ enTerm, canonical: canonicalFr });
    }
  }

  const total = matched + missing.length;
  const coverage = total === 0 ? 1 : matched / total;
  const sentenceRatio = countSentences(sourceEn) === 0
    ? 1
    : countSentences(translationFr) / countSentences(sourceEn);

  return { matched, missing, coverage, sentenceRatio };
}

/**
 * Word-boundary contains : "AP" trouve "AP" mais pas "CAPE" ou "map".
 */
function containsWord(haystack: string, needle: string): boolean {
  if (needle.length === 0) return false;
  const pattern = new RegExp(
    `(^|\\s)${needle.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}(\\s|$)`,
  );
  return pattern.test(haystack);
}

export const GLOSSARY_MIN_COVERAGE = 0.6;
export const SENTENCE_RATIO_MIN = 0.8;
export const SENTENCE_RATIO_MAX = 1.2;
