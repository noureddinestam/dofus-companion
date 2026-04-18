import { describe, it, expect } from 'vitest';
import {
  buildMonsterIndex,
  filterMonsterEntries,
  monsterIndexToSortedList,
} from '../monsterIndex';
import type { Dungeon, Monster } from '../../../types/dungeon';
import type { CombatCard } from '../../../types/combat-card';

function makeMonster(partial: Partial<Monster> & Pick<Monster, 'id' | 'name' | 'level'>): Monster {
  return {
    id: partial.id,
    name: partial.name,
    nameEn: partial.nameEn ?? null,
    level: partial.level,
    hp: null,
    family: 'Inconnu',
    familyEn: null,
    weakElement: null,
    resistElement: null,
    source: 'dofusdb',
    sourceUrl: 'https://dofusdb.fr/fr/database/monsters/1',
    combat: partial.combat ?? null,
  };
}

function populatedCard(): CombatCard {
  return {
    unlock: [],
    constraints: [],
    dangers: [
      {
        text: { fr: 'Ressuscite les adjacents', en: 'Resurrects adjacent' },
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
}

function makeDungeon(
  id: string,
  recommendedLevel: number,
  monsters: Monster[],
  bossId: string = 'boss-' + id,
): Dungeon {
  const boss: Dungeon['boss'] = {
    ...makeMonster({ id: bossId, name: 'Boss', level: recommendedLevel }),
    strategy: null,
    strategies: null,
    phases: [],
  };
  return {
    id,
    name: 'Dungeon ' + id,
    nameEn: null,
    slug: id,
    aliases: [],
    recommendedLevel,
    levelRange: [recommendedLevel - 10, recommendedLevel + 10],
    monsters,
    boss,
    externalGuideUrl: null,
    externalGuideUrlFr: null,
    lastUpdated: '2026-04-18T00:00:00.000Z',
    dataVersion: '0.5.0',
  };
}

describe('buildMonsterIndex', () => {
  it('includes only monsters with populated combat cards', () => {
    const lambda = makeMonster({ id: 'm-lambda', name: 'Crabe', level: 20 });
    const hero = makeMonster({
      id: 'm-hero',
      name: 'Dompteuse',
      level: 186,
      combat: populatedCard(),
    });
    const dungeon = makeDungeon('d1', 180, [lambda, hero]);
    const idx = buildMonsterIndex([dungeon]);
    expect(idx.size).toBe(1);
    expect(idx.has('m-hero')).toBe(true);
    expect(idx.has('m-lambda')).toBe(false);
  });

  it('merges dungeons for a monster that appears in several', () => {
    const hero = makeMonster({
      id: 'm-shared',
      name: 'Transporteur',
      level: 200,
      combat: populatedCard(),
    });
    const idx = buildMonsterIndex([
      makeDungeon('d1', 195, [hero]),
      makeDungeon('d2', 205, [hero]),
      makeDungeon('d3', 180, [hero]),
    ]);
    const entry = idx.get('m-shared');
    expect(entry).toBeDefined();
    expect(entry!.dungeons).toHaveLength(3);
    // sorted by recommendedLevel desc: 205, 195, 180
    expect(entry!.dungeons.map((d) => d.recommendedLevel)).toEqual([205, 195, 180]);
  });

  it("skips boss entries that alias dungeon.boss.id", () => {
    const bossAsMob = makeMonster({
      id: 'boss-d1',
      name: 'Boss-as-mob',
      level: 180,
      combat: populatedCard(),
    });
    const idx = buildMonsterIndex([makeDungeon('d1', 180, [bossAsMob], 'boss-d1')]);
    expect(idx.size).toBe(0);
  });
});

describe('monsterIndexToSortedList', () => {
  it('sorts entries by monster level descending', () => {
    const a = makeMonster({ id: 'a', name: 'A', level: 150, combat: populatedCard() });
    const b = makeMonster({ id: 'b', name: 'B', level: 200, combat: populatedCard() });
    const c = makeMonster({ id: 'c', name: 'C', level: 180, combat: populatedCard() });
    const idx = buildMonsterIndex([makeDungeon('d1', 180, [a, b, c])]);
    const list = monsterIndexToSortedList(idx);
    expect(list.map((e) => e.monster.level)).toEqual([200, 180, 150]);
  });
});

describe('filterMonsterEntries', () => {
  const hero = makeMonster({
    id: 'm1',
    name: 'Dompteuse Perturbée',
    nameEn: 'Perturbed Tamer',
    level: 186,
    combat: populatedCard(),
  });
  const idx = buildMonsterIndex([makeDungeon('d1', 180, [hero])]);
  const list = monsterIndexToSortedList(idx);

  it('returns all entries for empty query', () => {
    expect(filterMonsterEntries(list, '')).toHaveLength(1);
  });

  it('filters by FR name substring', () => {
    expect(filterMonsterEntries(list, 'dompt')).toHaveLength(1);
    expect(filterMonsterEntries(list, 'zzz')).toHaveLength(0);
  });

  it('filters by EN name substring', () => {
    expect(filterMonsterEntries(list, 'perturb')).toHaveLength(1);
    expect(filterMonsterEntries(list, 'tamer')).toHaveLength(1);
  });

  it('is case-insensitive', () => {
    expect(filterMonsterEntries(list, 'DOMPTEUSE')).toHaveLength(1);
  });
});
