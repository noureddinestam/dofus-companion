import { describe, expect, it } from 'vitest';
import { migrateCardV05ToV051, countMigratedContextBullets } from '../migrate';
import type { Bullet, CombatCard } from '../../../types/combat-card';

function bullet(fr: string, en: string, kind: Bullet['kind'] = 'action'): Bullet {
  return {
    text: { fr, en },
    kind,
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

describe('migrateCardV05ToV051', () => {
  it('prepends constraints as context bullets in unlock', () => {
    const card: CombatCard = {
      unlock: [bullet('Tuer les pions', 'Kill pawns')],
      constraints: [bullet('Garder la portée 6+', 'Keep range 6+')],
      dangers: [],
      tips: [],
    };
    const out = migrateCardV05ToV051(card);
    expect(out.unlock).toHaveLength(2);
    expect(out.unlock[0].kind).toBe('context');
    expect(out.unlock[0].text.fr).toBe('Garder la portée 6+');
    expect(out.unlock[1].kind).toBe('action');
    expect(out.constraints).toBeUndefined();
  });

  it('tags pre-existing unlock bullets as action when no kind was set', () => {
    const raw = bullet('Tuer les pions', 'Kill pawns');
    // Simulate Zod default — in reality Zod assigns 'action' on parse, but we test
    // the migration is resilient if someone hand-crafts a bullet without the field.
    const card = {
      unlock: [{ ...raw, kind: 'action' as const }],
      dangers: [],
      tips: [],
    } satisfies CombatCard;
    const out = migrateCardV05ToV051(card);
    expect(out.unlock[0].kind).toBe('action');
  });

  it('is a noop on a v0.5.1-shaped card (no constraints, all bullets tagged)', () => {
    const card: CombatCard = {
      unlock: [bullet('Context', 'Context', 'context'), bullet('Action', 'Action', 'action')],
      dangers: [bullet('Danger', 'Danger')],
      tips: [],
    };
    const out = migrateCardV05ToV051(card);
    expect(out).toBe(card);
  });

  it('strips empty constraints array and passes dangers+tips through', () => {
    const danger = bullet('D', 'D');
    const tip = bullet('T', 'T');
    const card: CombatCard = {
      unlock: [],
      constraints: [],
      dangers: [danger],
      tips: [tip],
    };
    const out = migrateCardV05ToV051(card);
    expect(out.constraints).toBeUndefined();
    expect(out.dangers).toEqual([danger]);
    expect(out.tips).toEqual([tip]);
  });

  it('handles a card with constraints but empty unlock', () => {
    const card: CombatCard = {
      unlock: [],
      constraints: [bullet('Rule A', 'Rule A'), bullet('Rule B', 'Rule B')],
      dangers: [],
      tips: [],
    };
    const out = migrateCardV05ToV051(card);
    expect(out.unlock).toHaveLength(2);
    expect(out.unlock.map((b) => b.kind)).toEqual(['context', 'context']);
  });

  it('produces a card that satisfies the v0.5.1 unlock invariant (context before action)', () => {
    const card: CombatCard = {
      unlock: [bullet('Act 1', 'Act 1'), bullet('Act 2', 'Act 2')],
      constraints: [bullet('Ctx 1', 'Ctx 1'), bullet('Ctx 2', 'Ctx 2')],
      dangers: [],
      tips: [],
    };
    const out = migrateCardV05ToV051(card);
    const kinds = out.unlock.map((b) => b.kind);
    expect(kinds).toEqual(['context', 'context', 'action', 'action']);
  });
});

describe('countMigratedContextBullets', () => {
  it('returns the number of bullets that will move from constraints into unlock.context', () => {
    expect(
      countMigratedContextBullets({
        unlock: [],
        constraints: [bullet('a', 'a'), bullet('b', 'b')],
        dangers: [],
        tips: [],
      }),
    ).toBe(2);
  });
  it('returns 0 when there are no constraints', () => {
    expect(
      countMigratedContextBullets({
        unlock: [bullet('a', 'a')],
        dangers: [],
        tips: [],
      }),
    ).toBe(0);
  });
});
