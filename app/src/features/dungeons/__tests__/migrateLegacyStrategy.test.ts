import { describe, it, expect } from 'vitest';
import { migrateLegacyStrategy } from '../migrateLegacyStrategy';
import type { Dungeon } from '../../../types/dungeon';

function makeDungeon(overrides: Partial<Dungeon['boss']> = {}): Dungeon {
  return {
    id: 'test',
    name: 'Test',
    nameEn: null,
    slug: 'test',
    aliases: [],
    recommendedLevel: 100,
    levelRange: [80, 110],
    monsters: [
      {
        id: 'm1',
        name: 'Mob',
        nameEn: null,
        level: 80,
        hp: 1000,
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
      id: 'b1',
      name: 'Boss',
      nameEn: null,
      level: 110,
      hp: 5000,
      family: 'Inconnu',
      familyEn: null,
      weakElement: null,
      resistElement: null,
      source: 'dofusdb',
      sourceUrl: 'https://dofusdb.fr/fr/database/monsters/999',
      strategy: null,
      strategies: null,
      phases: [],
      combat: null,
      ...overrides,
    },
    externalGuideUrl: null,
    externalGuideUrlFr: null,
    lastUpdated: '2026-04-17T00:00:00.000Z',
    dataVersion: '0.3.0',
  };
}

describe('migrateLegacyStrategy', () => {
  it('leaves dungeon untouched if strategies already populated', () => {
    const d = makeDungeon({
      strategies: {
        long: {
          fr: null,
          en: {
            text: 'Some existing strategy text that is long enough.',
            provenance: {
              kind: 'native',
              lang: 'en',
              source: 'fandom-en',
              sourceUrl: 'https://example.com/wiki/Boss',
            },
          },
        },
        short: { fr: null, en: null },
      },
    });
    expect(migrateLegacyStrategy(d)).toBe(d);
  });

  it('leaves dungeon untouched if no legacy strategy', () => {
    const d = makeDungeon({ strategy: null, strategies: null });
    const result = migrateLegacyStrategy(d);
    expect(result).toBe(d);
    expect(result.boss.strategies).toBeNull();
  });

  it('hydrates strategies.long.en from legacy strategy', () => {
    const d = makeDungeon({
      strategy: {
        text: 'Kolosso is invulnerable until summoned. Focus Professor Xa.',
        source: 'fandom-en',
        sourceUrl: 'https://dofuswiki.fandom.com/wiki/Kolosso',
      },
      strategies: null,
    });

    const result = migrateLegacyStrategy(d);

    expect(result.boss.strategies).not.toBeNull();
    expect(result.boss.strategies!.long.en).toEqual({
      text: 'Kolosso is invulnerable until summoned. Focus Professor Xa.',
      provenance: {
        kind: 'native',
        lang: 'en',
        source: 'fandom-en',
        sourceUrl: 'https://dofuswiki.fandom.com/wiki/Kolosso',
      },
    });
    expect(result.boss.strategies!.long.fr).toBeNull();
    expect(result.boss.strategies!.short.fr).toBeNull();
    expect(result.boss.strategies!.short.en).toBeNull();
  });

  it('preserves the legacy strategy field after migration', () => {
    const d = makeDungeon({
      strategy: {
        text: 'A legacy strategy description for this boss fight.',
        source: 'fandom-en',
        sourceUrl: 'https://dofuswiki.fandom.com/wiki/X',
      },
      strategies: null,
    });

    const result = migrateLegacyStrategy(d);
    expect(result.boss.strategy).toEqual(d.boss.strategy);
  });

  it('does not mutate the input dungeon', () => {
    const d = makeDungeon({
      strategy: {
        text: 'An input dungeon that should not be mutated by the adapter.',
        source: 'fandom-en',
        sourceUrl: 'https://dofuswiki.fandom.com/wiki/Y',
      },
      strategies: null,
    });
    const before = JSON.stringify(d);
    migrateLegacyStrategy(d);
    expect(JSON.stringify(d)).toBe(before);
  });
});
