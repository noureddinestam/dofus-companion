import { describe, expect, it } from 'vitest';
import { detectAmbiguityFlags } from '../ambiguity-detector.ts';
import type { Bullet, CombatCard, Dungeon } from '../../validate.ts';

function bullet(fr: string, en: string): Bullet {
  return {
    text: { fr, en },
    mechanicType: null,
    severity: null,
    provenance: {
      kind: 'native',
      lang: 'fr',
      source: 'fandom-fr',
      sourceUrl: 'https://dofus-fr.fandom.com/wiki/X',
    },
  };
}

function makeDungeon(card: CombatCard): Dungeon {
  return {
    id: 'd1',
    name: 'Dungeon',
    nameEn: null,
    slug: 'd1',
    aliases: [],
    recommendedLevel: 180,
    levelRange: [170, 200],
    monsters: [
      {
        id: 'boss-1',
        name: 'Boss',
        nameEn: null,
        level: 180,
        hp: 5000,
        family: 'Inconnu',
        familyEn: null,
        weakElement: null,
        resistElement: null,
        source: 'dofusdb',
        sourceUrl: 'https://dofusdb.fr/fr/database/monsters/1',
        combat: null,
      },
    ],
    boss: {
      id: 'boss-1',
      name: 'Boss',
      nameEn: null,
      level: 180,
      hp: 5000,
      family: 'Inconnu',
      familyEn: null,
      weakElement: null,
      resistElement: null,
      source: 'dofusdb',
      sourceUrl: 'https://dofusdb.fr/fr/database/monsters/1',
      combat: card,
      strategy: null,
      strategies: null,
      phases: [],
    },
    externalGuideUrl: null,
    externalGuideUrlFr: null,
    lastUpdated: '2026-04-19T00:00:00.000Z',
    dataVersion: '0.5.0',
  };
}

describe('detectAmbiguityFlags', () => {
  it('returns no flags for a clean v0.5.1-shaped card', () => {
    const card: CombatCard = {
      unlock: [bullet('Tuer les 3 pions avant Sylargh', 'Kill the 3 pawns before Sylargh')],
      constraints: [],
      dangers: [bullet("Attaque ligne portée 8 tue en 1", 'Line attack range 8 one-shots')],
      tips: [bullet("Faible à l'air", 'Weak to air')],
    };
    const flags = detectAmbiguityFlags([makeDungeon(card)]);
    expect(flags).toHaveLength(0);
  });

  it('flags a Dice duplicate between unlock and constraints', () => {
    const card: CombatCard = {
      unlock: [bullet('Tuer les 3 pions avant Sylargh', 'Kill the 3 pawns before Sylargh')],
      constraints: [bullet('Tuer les 3 pions avant Sylargh', 'Kill the 3 pawns before Sylargh')],
      dangers: [],
      tips: [],
    };
    const flags = detectAmbiguityFlags([makeDungeon(card)]);
    const dup = flags.find((f) => f.details.dice !== undefined);
    expect(dup).toBeDefined();
    expect(dup!.bullet!.location.block).toBe('constraints');
    expect(dup!.details.withBlock).toBe('unlock');
    expect(dup!.signal).toBeGreaterThanOrEqual(0.8);
  });

  it('flags an imperative verb inside constraints', () => {
    const card: CombatCard = {
      unlock: [],
      constraints: [bullet('Tuer les pions avant le boss', 'Kill pawns before boss')],
      dangers: [],
      tips: [],
    };
    const flags = detectAmbiguityFlags([makeDungeon(card)]);
    expect(flags.some((f) => f.explanation.includes('action verb'))).toBe(true);
  });

  it('flags a negation prefix in unlock (FR)', () => {
    const card: CombatCard = {
      unlock: [bullet("Ne pas rester au centre", 'Do not stay centre')],
      constraints: [],
      dangers: [],
      tips: [],
    };
    const flags = detectAmbiguityFlags([makeDungeon(card)]);
    expect(flags.some((f) => f.explanation.includes('negation'))).toBe(true);
  });

  it('flags a negation prefix in unlock (EN)', () => {
    const card: CombatCard = {
      unlock: [bullet("Éviter de toucher les glyphes", "Don't touch the glyphs")],
      constraints: [],
      dangers: [],
      tips: [],
    };
    const flags = detectAmbiguityFlags([makeDungeon(card)]);
    expect(flags.some((f) => f.explanation.includes('negation'))).toBe(true);
  });

  it('flags a permanent-rule marker in unlock ("toujours")', () => {
    const card: CombatCard = {
      unlock: [bullet("Toujours rester hors de portée", 'Always stay out of range')],
      constraints: [],
      dangers: [],
      tips: [],
    };
    const flags = detectAmbiguityFlags([makeDungeon(card)]);
    expect(flags.some((f) => f.explanation.includes('permanent-rule'))).toBe(true);
  });

  it('does not flag a clean unlock bullet without negation or permanent markers', () => {
    const card: CombatCard = {
      unlock: [bullet('Isoler les pions', 'Isolate the pawns')],
      constraints: [],
      dangers: [],
      tips: [],
    };
    const flags = detectAmbiguityFlags([makeDungeon(card)]);
    expect(flags).toHaveLength(0);
  });

  it('does not double-flag a duplicate (dedupes by entity+block+index+reason)', () => {
    const card: CombatCard = {
      unlock: [bullet('Tuer les 3 pions', 'Kill the 3 pawns')],
      constraints: [
        bullet('Tuer les 3 pions', 'Kill the 3 pawns'),
        bullet('Tuer les 3 pions', 'Kill the 3 pawns'),
      ],
      dangers: [],
      tips: [],
    };
    const flags = detectAmbiguityFlags([makeDungeon(card)]);
    // Both constraints bullets match unlock → 2 flags on constraints indices 0 and 1, not 4.
    const dupFlags = flags.filter((f) => f.details.dice !== undefined);
    expect(dupFlags).toHaveLength(2);
    const locations = dupFlags.map((f) => `${f.bullet!.location.block}:${f.bullet!.location.index}`);
    expect(locations.sort()).toEqual(['constraints:0', 'constraints:1']);
  });
});
