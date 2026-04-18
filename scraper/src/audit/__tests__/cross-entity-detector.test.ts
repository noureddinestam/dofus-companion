import { describe, expect, it } from 'vitest';
import {
  detectBulletContamination,
  detectCrossEntityFlagsForDungeon,
  type EntityPageText,
} from '../cross-entity-detector.ts';
import type { Bullet, CombatCard, Dungeon } from '../../validate.ts';

const SYLARGH_TEXT = `Sylargh se tient au centre de la salle. Il ressuscite ses pions tant qu'il reste dans la zone de résurrection. Son attaque de ligne frappe à portée 8.`;
const ERADICATEUR_TEXT = `Ne pas rester en ligne des Éradicateurs. Ils tirent un rayon perforant qui traverse plusieurs joueurs. Infligent des dégâts feu à ceux qui restent alignés.`;

function makeBullet(fr: string, en: string, quote: string): Bullet {
  return {
    text: { fr, en },
    mechanicType: null,
    severity: null,
    provenance: {
      kind: 'llm-grounded',
      baseLang: 'fr',
      baseSource: 'fandom-fr',
      baseSourceUrl: 'https://dofus-fr.fandom.com/wiki/Sylargh',
      model: 'claude-sonnet-4-5',
      promptVersion: 'extract-combat-card-v1',
      anchors: [{ bulletIndex: 0, quote, similarity: 0.9 }],
      generatedAt: '2026-04-18T00:00:00.000Z',
    },
  };
}

const PAGES: EntityPageText[] = [
  { entityId: 'sylargh', entityName: 'Sylargh', kind: 'boss', text: SYLARGH_TEXT, url: 'https://example.com/sylargh' },
  { entityId: 'eradicateur', entityName: 'Éradicateur', kind: 'monster', text: ERADICATEUR_TEXT, url: 'https://example.com/eradicateur' },
];

describe('detectBulletContamination', () => {
  it('returns null when the anchor matches the owner page clearly', () => {
    const result = detectBulletContamination(
      'sylargh',
      "Sylargh se tient au centre de la salle",
      PAGES,
    );
    expect(result).toBeNull();
  });

  it('flags contamination when the anchor matches a sibling page much better', () => {
    const result = detectBulletContamination(
      'sylargh',
      "Ne pas rester en ligne des Éradicateurs",
      PAGES,
    );
    expect(result).not.toBeNull();
    expect(result!.suggestedOwnerId).toBe('eradicateur');
    expect(result!.candidateSimilarity).toBeGreaterThan(result!.ownerSimilarity);
  });

  it('returns null if owner has no page in the pool (undecidable)', () => {
    const result = detectBulletContamination(
      'ghost-entity',
      'Ne pas rester en ligne des Éradicateurs',
      PAGES,
    );
    expect(result).toBeNull();
  });

  it('returns null when no sibling beats the owner by the margin', () => {
    // Owner slight edge — sibling similar but within 0.05 (< margin 0.10)
    const pool: EntityPageText[] = [
      { entityId: 'a', entityName: 'A', kind: 'boss', text: 'Phrase commune partagée par deux pages', url: null },
      { entityId: 'b', entityName: 'B', kind: 'monster', text: 'Phrase commune partagée par deux pages différent', url: null },
    ];
    const result = detectBulletContamination('a', 'Phrase commune partagée par deux pages', pool);
    expect(result).toBeNull();
  });
});

describe('detectCrossEntityFlagsForDungeon', () => {
  function makeDungeon(bossCombat: CombatCard): Dungeon {
    return {
      id: 'lab-sylargh',
      name: 'Laboratoire de Sylargh',
      nameEn: null,
      slug: 'lab-sylargh',
      aliases: [],
      recommendedLevel: 200,
      levelRange: [190, 210],
      monsters: [
        {
          id: 'eradicateur',
          name: 'Éradicateur',
          nameEn: 'Eradicator',
          level: 195,
          hp: 3000,
          family: 'Inconnu',
          familyEn: null,
          weakElement: null,
          resistElement: null,
          source: 'dofusdb',
          sourceUrl: 'https://dofusdb.fr/fr/database/monsters/2',
          combat: null,
        },
      ],
      boss: {
        id: 'sylargh',
        name: 'Sylargh',
        nameEn: 'Sylargh',
        level: 200,
        hp: 8000,
        family: 'Inconnu',
        familyEn: null,
        weakElement: null,
        resistElement: null,
        source: 'dofusdb',
        sourceUrl: 'https://dofusdb.fr/fr/database/monsters/1',
        combat: bossCombat,
        strategy: null,
        strategies: null,
        phases: [],
      },
      externalGuideUrl: null,
      externalGuideUrlFr: null,
      lastUpdated: '2026-04-18T00:00:00.000Z',
      dataVersion: '0.5.0',
    };
  }

  it('flags a boss constraints bullet whose anchor belongs to a mob page', () => {
    const combat: CombatCard = {
      unlock: [],
      constraints: [
        makeBullet(
          'Ne pas rester en ligne des Éradicateurs',
          "Don't stay in line with Eradicators",
          "Ne pas rester en ligne des Éradicateurs. Ils tirent un rayon perforant",
        ),
      ],
      dangers: [],
      tips: [],
    };
    const flags = detectCrossEntityFlagsForDungeon(makeDungeon(combat), PAGES);
    expect(flags).toHaveLength(1);
    expect(flags[0].bug).toBe('cross-entity');
    expect(flags[0].details.suggestedOwnerName).toBe('Éradicateur');
    expect(flags[0].suggestion).toMatch(/Migrate/);
  });

  it('produces no flag when the boss bullet is anchored on its own page', () => {
    const combat: CombatCard = {
      unlock: [
        makeBullet(
          'Éloigner Sylargh du centre',
          'Pull Sylargh away from centre',
          "Sylargh se tient au centre de la salle. Il ressuscite",
        ),
      ],
      constraints: [],
      dangers: [],
      tips: [],
    };
    const flags = detectCrossEntityFlagsForDungeon(makeDungeon(combat), PAGES);
    expect(flags).toHaveLength(0);
  });
});
