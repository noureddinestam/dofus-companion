import { describe, it, expect } from 'vitest';
import {
  validateGlossary,
  GLOSSARY_MIN_COVERAGE,
  SENTENCE_RATIO_MIN,
  SENTENCE_RATIO_MAX,
} from '../glossary.ts';

const GLOSSARY = {
  AP: 'PA',
  MP: 'PM',
  HP: 'PV',
  summon: 'invocation',
  'line of sight': 'ligne de vue',
  tile: 'case',
  invulnerable: 'invulnérable',
  vulnerable: 'vulnérable',
  damage: 'dégâts',
  heal: 'soin',
};

describe('validateGlossary', () => {
  it('returns coverage 1 when source has no glossary terms', () => {
    const report = validateGlossary(
      'The boss appears in the arena.',
      'Le boss apparaît dans l’arène.',
      GLOSSARY,
    );
    expect(report.coverage).toBe(1);
    expect(report.matched).toBe(0);
    expect(report.missing).toHaveLength(0);
  });

  it('accepts translation using all canonical FR terms', () => {
    const source = 'Kolosso is invulnerable. Use a summon to make him vulnerable.';
    const translation = 'Kolosso est invulnérable. Utilisez une invocation pour le rendre vulnérable.';
    const report = validateGlossary(source, translation, GLOSSARY);
    expect(report.coverage).toBe(1);
    expect(report.matched).toBeGreaterThanOrEqual(3);
    expect(report.missing).toHaveLength(0);
  });

  it('flags a translation that forgets canonical terms', () => {
    const source = 'Spend 6 AP to cast. Summon is on cooldown.';
    const translation = 'Dépense 6 points pour lancer. Ton appel est en recharge.';
    const report = validateGlossary(source, translation, GLOSSARY);
    // "AP" → "PA" manquant, "summon" → "invocation" manquant
    expect(report.coverage).toBeLessThan(GLOSSARY_MIN_COVERAGE);
    expect(report.missing.map((m) => m.enTerm)).toEqual(
      expect.arrayContaining(['AP', 'summon']),
    );
  });

  it('computes sentenceRatio close to 1 for equal-length texts', () => {
    const source = 'First sentence. Second one. Third here.';
    const translation = 'Première phrase. Deuxième aussi. Troisième ici.';
    const report = validateGlossary(source, translation, GLOSSARY);
    expect(report.sentenceRatio).toBeGreaterThanOrEqual(SENTENCE_RATIO_MIN);
    expect(report.sentenceRatio).toBeLessThanOrEqual(SENTENCE_RATIO_MAX);
  });

  it('flags a translation that compresses too much', () => {
    const source = 'One. Two. Three. Four. Five. Six.';
    const translation = 'Tout.';
    const report = validateGlossary(source, translation, GLOSSARY);
    expect(report.sentenceRatio).toBeLessThan(SENTENCE_RATIO_MIN);
  });

  it('flags a translation that expands too much', () => {
    const source = 'Two. Sentences.';
    const translation =
      'Une. Deux. Trois. Quatre. Cinq. Six. Sept. Huit. Neuf. Dix. Onze. Douze.';
    const report = validateGlossary(source, translation, GLOSSARY);
    expect(report.sentenceRatio).toBeGreaterThan(SENTENCE_RATIO_MAX);
  });
});
