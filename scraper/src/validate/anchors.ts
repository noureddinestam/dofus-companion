/**
 * Fuzzy matching "contains" pour valider qu'une citation (quote) se retrouve
 * bien dans un texte source.
 *
 * Utilisé en Phase F (summarize) pour valider que chaque bullet LLM a une
 * ancre verbatim dans le texte source. En Phase E (translate), on peut aussi
 * s'en servir pour des sanity checks structurels, mais le principal
 * consommateur est summarize.
 */

/**
 * Normalise une chaîne : lowercase, accents retirés, ponctuation stripped,
 * whitespace normalisé. Stable pour comparaison.
 */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Dice coefficient sur bigrammes de caractères — 0 = aucun match, 1 = identique.
 * Plus robuste que la similarité par token quand on compare des fragments courts.
 */
export function diceCoefficient(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length < 2 || b.length < 2) return 0;

  const bigrams = (s: string): Map<string, number> => {
    const m = new Map<string, number>();
    for (let i = 0; i < s.length - 1; i++) {
      const bg = s.slice(i, i + 2);
      m.set(bg, (m.get(bg) ?? 0) + 1);
    }
    return m;
  };

  const bA = bigrams(a);
  const bB = bigrams(b);
  let intersection = 0;
  for (const [bg, ca] of bA) {
    const cb = bB.get(bg);
    if (cb) intersection += Math.min(ca, cb);
  }

  const total = a.length - 1 + (b.length - 1);
  return total === 0 ? 0 : (2 * intersection) / total;
}

/**
 * Vérifie si `needle` apparaît dans `haystack` avec une similarité ≥ threshold.
 * Sliding window de la taille du needle, pas de 4 caractères pour performance.
 *
 * Retourne la meilleure similarité trouvée (0-1).
 *
 * Utilisation typique :
 *   const sim = fuzzyContains(sourceText, bulletQuote);
 *   if (sim < 0.75) → rejeter le bullet (citation non ancrée).
 */
export function fuzzyContains(haystack: string, needle: string): number {
  const h = normalize(haystack);
  const n = normalize(needle);
  if (n.length === 0) return 0;
  if (h.includes(n)) return 1;
  if (n.length > h.length) {
    return diceCoefficient(h, n);
  }

  let best = 0;
  const step = Math.max(4, Math.floor(n.length / 16));
  const windowSize = n.length;

  for (let i = 0; i <= h.length - windowSize; i += step) {
    const window = h.slice(i, i + windowSize);
    const sim = diceCoefficient(window, n);
    if (sim > best) best = sim;
    if (best >= 0.99) break;
  }

  return best;
}

export const ANCHOR_MIN_SIMILARITY = 0.75;
