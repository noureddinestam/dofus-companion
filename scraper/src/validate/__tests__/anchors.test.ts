import { describe, it, expect } from 'vitest';
import {
  normalize,
  diceCoefficient,
  fuzzyContains,
  ANCHOR_MIN_SIMILARITY,
} from '../anchors.ts';

describe('normalize', () => {
  it('strips accents and lowercases', () => {
    expect(normalize('Élévé')).toBe('eleve');
  });

  it('strips punctuation', () => {
    expect(normalize('A, B! C?')).toBe('a b c');
  });

  it('collapses whitespace', () => {
    expect(normalize('a   b\t\nc')).toBe('a b c');
  });
});

describe('diceCoefficient', () => {
  it('returns 1 for identical strings', () => {
    expect(diceCoefficient('hello', 'hello')).toBe(1);
  });

  it('returns 0 for totally different short strings', () => {
    expect(diceCoefficient('ab', 'cd')).toBe(0);
  });

  it('returns a number between 0 and 1 for partial match', () => {
    const s = diceCoefficient('kolosso invulnerable', 'kolosso vulnerable');
    expect(s).toBeGreaterThan(0.5);
    expect(s).toBeLessThan(1);
  });
});

describe('fuzzyContains', () => {
  const source =
    'Kolosso is Invulnerable and accompanied by Professor Xa who is vulnerable from the start. To make Kolosso vulnerable he must be hit by a summon. The Professor casts Telepathy which deals 10000 damage to heals.';

  it('returns 1 when quote is exactly present (after normalization)', () => {
    const quote = 'Professor Xa, who is vulnerable from the start';
    expect(fuzzyContains(source, quote)).toBe(1);
  });

  it('returns ≥ 0.85 for a quote with minor variation (punctuation/case)', () => {
    const quote = 'PROFESSOR XA! WHO IS VULNERABLE FROM THE START';
    expect(fuzzyContains(source, quote)).toBeGreaterThanOrEqual(0.85);
  });

  it('returns ≥ 0.75 for a quote with small paraphrase', () => {
    const quote = 'hit Kolosso with a summon to make him vulnerable';
    const s = fuzzyContains(source, quote);
    expect(s).toBeGreaterThanOrEqual(0.6);
  });

  it('returns < 0.5 for a quote not present in source', () => {
    const quote = 'the dragon breathes purple fire across the arena';
    expect(fuzzyContains(source, quote)).toBeLessThan(0.5);
  });

  it('ANCHOR_MIN_SIMILARITY is 0.75', () => {
    expect(ANCHOR_MIN_SIMILARITY).toBe(0.75);
  });

  it('returns 0 for empty needle', () => {
    expect(fuzzyContains(source, '')).toBe(0);
  });
});
