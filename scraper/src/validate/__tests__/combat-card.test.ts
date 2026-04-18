import { describe, it, expect } from 'vitest';
import {
  validateCombatCardResponse,
  type RawCombatCardCandidate,
} from '../combat-card.ts';

const SOURCE = `Sylargh est un boss redoutable. Tuer les 3 pions avant d'attaquer Sylargh est indispensable pour gagner.
Il ressuscite les pions tués à côté de lui, donc éloigner Sylargh du centre pour couper la résurrection.
Garder au moins un joueur à portée 6 pour interrompre les invocations.
Sylargh est faible à l'air et résiste au feu. Un personnage bien placé peut terminer le combat rapidement.`;

const OPTS = {
  sourceText: SOURCE,
  sourceLang: 'fr' as const,
  sourceUrl: 'https://dofus-fr.fandom.com/wiki/Sylargh',
  model: 'claude-sonnet-4-5',
  promptVersion: 'extract-combat-card-v1',
  generatedAt: '2026-04-18T18:00:00.000Z',
};

describe('validateCombatCardResponse', () => {
  it('happy path: produces a valid card with 4 block bullets', () => {
    const raw: RawCombatCardCandidate = {
      unlock: [
        {
          text: {
            fr: 'Tuer les 3 pions avant Sylargh',
            en: 'Kill the 3 pawns before Sylargh',
          },
          mechanicType: 'chain-summon',
          severity: 'critical',
          quote: 'Tuer les 3 pions avant d\'attaquer Sylargh est indispensable',
        },
      ],
      constraints: [
        {
          text: {
            fr: 'Garder un joueur portée 6+',
            en: 'Keep 1 ally at range 6+',
          },
          mechanicType: 'zone-control',
          severity: 'caution',
          quote: 'Garder au moins un joueur à portée 6 pour interrompre',
        },
      ],
      dangers: [
        {
          text: {
            fr: 'Ressuscite les pions à côté',
            en: 'Resurrects pawns adjacent',
          },
          mechanicType: 'reviver',
          severity: 'danger',
          quote: 'Il ressuscite les pions tués à côté de lui',
        },
      ],
      tips: [
        {
          text: { fr: 'Faible air, résiste feu', en: 'Weak air, resists fire' },
          mechanicType: null,
          severity: null,
          quote: 'faible à l\'air et résiste au feu',
        },
      ],
    };

    const report = validateCombatCardResponse(raw, OPTS);
    expect(report.card).not.toBeNull();
    expect(report.rejected).toBe(0);
    expect(report.card!.unlock).toHaveLength(1);
    expect(report.card!.constraints).toHaveLength(1);
    expect(report.card!.dangers).toHaveLength(1);
    expect(report.card!.tips).toHaveLength(1);
    expect(report.card!.unlock[0].provenance.kind).toBe('llm-grounded');
    if (report.card!.unlock[0].provenance.kind === 'llm-grounded') {
      expect(report.card!.unlock[0].provenance.baseLang).toBe('fr');
      expect(report.card!.unlock[0].provenance.baseSource).toBe('fandom-fr');
      expect(report.card!.unlock[0].provenance.anchors[0].similarity).toBeGreaterThanOrEqual(0.75);
    }
  });

  it('returns null when all bullets are rejected', () => {
    const raw: RawCombatCardCandidate = {
      unlock: [
        {
          text: { fr: 'Texte inventé', en: 'Invented text' },
          quote: 'Texte qui n\'apparaît absolument pas dans la source fournie au test',
        },
      ],
    };
    const report = validateCombatCardResponse(raw, OPTS);
    expect(report.card).toBeNull();
    expect(report.rejected).toBe(1);
    expect(report.rejectReasons[0]).toMatch(/anchor similarity/);
  });

  it('rejects bullet with text > 160 chars', () => {
    const long = 'Ne pas frapper la Dompteuse plus de deux fois dans un même tour sous peine de subir un retour de dégâts massif et trois tours consécutifs d\'inactivité totale pour toute l\'équipe.';
    const raw: RawCombatCardCandidate = {
      constraints: [
        {
          text: { fr: long, en: long },
          quote: 'Tuer les 3 pions avant d\'attaquer Sylargh est indispensable',
        },
      ],
    };
    const report = validateCombatCardResponse(raw, OPTS);
    expect(report.card).toBeNull();
    expect(report.rejectReasons[0]).toMatch(/length/);
  });

  it('rejects bullet missing text.fr or text.en', () => {
    const raw: RawCombatCardCandidate = {
      dangers: [
        {
          text: { fr: 'Ressuscite les pions' },
          quote: 'Il ressuscite les pions tués à côté de lui',
        },
      ],
    };
    const report = validateCombatCardResponse(raw, OPTS);
    expect(report.card).toBeNull();
    expect(report.rejectReasons[0]).toMatch(/missing/);
  });

  it('rejects critical severity inside tips block', () => {
    const raw: RawCombatCardCandidate = {
      tips: [
        {
          text: { fr: 'Faible air, résiste feu', en: 'Weak air, resists fire' },
          severity: 'critical',
          quote: 'faible à l\'air et résiste au feu',
        },
      ],
    };
    const report = validateCombatCardResponse(raw, OPTS);
    expect(report.card).toBeNull();
    expect(report.rejectReasons[0]).toMatch(/critical forbidden in tips/);
  });

  it('rejects unknown mechanicType', () => {
    const raw: RawCombatCardCandidate = {
      unlock: [
        {
          text: { fr: 'Tuer les 3 pions', en: 'Kill the 3 pawns' },
          mechanicType: 'super-boss-destroyer',
          quote: 'Tuer les 3 pions avant d\'attaquer Sylargh',
        },
      ],
    };
    const report = validateCombatCardResponse(raw, OPTS);
    expect(report.card).toBeNull();
    expect(report.rejectReasons[0]).toMatch(/mechanicType/);
  });

  it('rejects duplicate bullet text appearing in two blocks', () => {
    const raw: RawCombatCardCandidate = {
      constraints: [
        {
          text: { fr: 'Garder un joueur portée 6+', en: 'Keep 1 ally at range 6+' },
          quote: 'Garder au moins un joueur à portée 6 pour interrompre',
        },
      ],
      dangers: [
        {
          text: { fr: 'Garder un joueur portée 6+', en: 'Keep 1 ally at range 6+' },
          quote: 'Il ressuscite les pions tués à côté de lui',
        },
      ],
    };
    const report = validateCombatCardResponse(raw, OPTS);
    // First is accepted (constraints), second rejected (duplicate)
    expect(report.card).not.toBeNull();
    expect(report.card!.constraints).toHaveLength(1);
    expect(report.card!.dangers).toHaveLength(0);
    expect(report.rejectReasons[0]).toMatch(/duplicate/);
  });

  it('accepts a card with only one block populated (silence is OK)', () => {
    const raw: RawCombatCardCandidate = {
      unlock: [],
      constraints: [],
      dangers: [
        {
          text: { fr: 'Ressuscite les pions adjacents', en: 'Resurrects adjacent pawns' },
          mechanicType: 'reviver',
          severity: 'danger',
          quote: 'Il ressuscite les pions tués à côté de lui',
        },
      ],
      tips: [],
    };
    const report = validateCombatCardResponse(raw, OPTS);
    expect(report.card).not.toBeNull();
    expect(report.card!.unlock).toHaveLength(0);
    expect(report.card!.dangers).toHaveLength(1);
    expect(report.card!.tips).toHaveLength(0);
  });

  it('returns null for empty raw candidate (silence)', () => {
    const report = validateCombatCardResponse({}, OPTS);
    expect(report.card).toBeNull();
    expect(report.rejected).toBe(0);
  });
});
