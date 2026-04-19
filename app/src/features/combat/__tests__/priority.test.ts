import { describe, it, expect } from 'vitest';
import { derivePriority } from '../priority';
import type { Bullet, CombatCard, CombatSeverity } from '../../../types/combat-card';

function makeBullet(severity: CombatSeverity | null = null): Bullet {
  return {
    text: { fr: 'bullet fr test', en: 'bullet en test' },
    kind: 'action',
    mechanicType: null,
    severity,
    provenance: {
      kind: 'native',
      lang: 'fr',
      source: 'fandom-fr',
      sourceUrl: 'https://dofus-fr.fandom.com/wiki/X',
    },
  };
}

function emptyCard(): CombatCard {
  return { unlock: [], constraints: [], dangers: [], tips: [] };
}

describe('derivePriority', () => {
  it('returns manageable for null card', () => {
    expect(derivePriority(null)).toBe('manageable');
  });

  it('returns manageable for a card with no bullets', () => {
    expect(derivePriority(emptyCard())).toBe('manageable');
  });

  it('returns critical if any bullet has critical severity', () => {
    const card: CombatCard = {
      ...emptyCard(),
      dangers: [makeBullet('critical')],
      tips: [makeBullet('caution')],
    };
    expect(derivePriority(card)).toBe('critical');
  });

  it('returns danger if the highest severity is danger', () => {
    const card: CombatCard = {
      ...emptyCard(),
      constraints: [makeBullet('danger'), makeBullet('caution')],
    };
    expect(derivePriority(card)).toBe('danger');
  });

  it('returns caution if the highest severity is caution', () => {
    const card: CombatCard = {
      ...emptyCard(),
      tips: [makeBullet('caution')],
    };
    expect(derivePriority(card)).toBe('caution');
  });

  it('returns manageable for bullets without any severity set', () => {
    const card: CombatCard = {
      ...emptyCard(),
      unlock: [makeBullet(null), makeBullet(null)],
      tips: [makeBullet(null)],
    };
    expect(derivePriority(card)).toBe('manageable');
  });

  it('finds critical even when nested across several blocks', () => {
    const card: CombatCard = {
      unlock: [makeBullet('caution')],
      constraints: [makeBullet(null)],
      dangers: [makeBullet('danger')],
      tips: [makeBullet('critical')],
    };
    expect(derivePriority(card)).toBe('critical');
  });
});
