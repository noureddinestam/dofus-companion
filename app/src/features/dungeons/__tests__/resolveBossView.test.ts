import { describe, it, expect } from 'vitest';
import { resolveBossView } from '../resolveBossView';
import type { Boss } from '../../../types/dungeon';
import type { CombatCard } from '../../../types/combat-card';

function makeBoss(combat: CombatCard | null, legacyStrategies?: string[]): Boss {
  return {
    id: 'b',
    name: 'Boss',
    nameEn: null,
    level: 100,
    hp: 1000,
    family: 'Inconnu',
    familyEn: null,
    weakElement: null,
    resistElement: null,
    source: 'dofusdb',
    sourceUrl: 'https://dofusdb.fr/fr/database/monsters/1',
    combat,
    strategy: null,
    strategies: null,
    phases: [],
    ...(legacyStrategies ? { legacyStrategies } : {}),
  };
}

describe('resolveBossView', () => {
  it("returns 'legacy' when combat is null", () => {
    expect(resolveBossView(makeBoss(null))).toBe('legacy');
  });

  it("returns 'legacy' when combat has all empty blocks", () => {
    const empty: CombatCard = { unlock: [], constraints: [], dangers: [], tips: [] };
    expect(resolveBossView(makeBoss(empty))).toBe('legacy');
  });

  it("returns 'combat' when at least one bullet exists in any block", () => {
    const card: CombatCard = {
      unlock: [],
      constraints: [],
      dangers: [
        {
          text: { fr: 'Ressuscite les pions adjacents', en: 'Resurrects adjacent pawns' },
          kind: 'action',
          mechanicType: 'reviver',
          severity: 'danger',
          provenance: {
            kind: 'native',
            lang: 'fr',
            source: 'fandom-fr',
            sourceUrl: 'https://dofus-fr.fandom.com/wiki/X',
          },
        },
      ],
      tips: [],
    };
    expect(resolveBossView(makeBoss(card))).toBe('combat');
  });

  it("ignores legacyStrategies in the decision", () => {
    expect(resolveBossView(makeBoss(null, ['legacy note']))).toBe('legacy');
  });
});
