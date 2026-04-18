import type { Dungeon, Monster } from '../../types/dungeon';
import { isCombatCardEmpty } from '../../types/combat-card';

export interface MonsterIndexEntry {
  /** Canonical monster payload from the first dungeon we encountered it in. */
  monster: Monster;
  /** Every dungeon where this monster appears, sorted by recommendedLevel desc. */
  dungeons: Dungeon[];
}

/**
 * Build a reverse index monsterId → { monster, dungeons[] } for every monster
 * that carries a populated combat card. Monsters without combat are excluded
 * — they have nothing to show in the dedicated view. Boss entries are also
 * excluded: they live in `dungeon.boss`, not `dungeon.monsters` as primary.
 *
 * Pure, memoizable, runs once at app startup (O(Σ monsters) over ~185 dungeons).
 */
export function buildMonsterIndex(dungeons: Dungeon[]): Map<string, MonsterIndexEntry> {
  const index = new Map<string, MonsterIndexEntry>();
  for (const d of dungeons) {
    for (const m of d.monsters) {
      if (isCombatCardEmpty(m.combat)) continue;
      if (d.boss.id === m.id) continue;
      const existing = index.get(m.id);
      if (existing) {
        existing.dungeons.push(d);
      } else {
        index.set(m.id, { monster: m, dungeons: [d] });
      }
    }
  }
  for (const entry of index.values()) {
    entry.dungeons.sort((a, b) => b.recommendedLevel - a.recommendedLevel);
  }
  return index;
}

/**
 * Turn the index into a sorted array ready for rendering. Sorts by monster
 * level descending — the dangerous Songes Infinis targets surface first.
 */
export function monsterIndexToSortedList(
  index: Map<string, MonsterIndexEntry>,
): MonsterIndexEntry[] {
  return [...index.values()].sort((a, b) => b.monster.level - a.monster.level);
}

/**
 * Simple lowercase substring filter. Matches either name (FR) or nameEn (EN)
 * so players typing in either language hit their target.
 */
export function filterMonsterEntries(
  entries: MonsterIndexEntry[],
  query: string,
): MonsterIndexEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return entries;
  return entries.filter((e) => {
    if (e.monster.name.toLowerCase().includes(q)) return true;
    if (e.monster.nameEn && e.monster.nameEn.toLowerCase().includes(q)) return true;
    return false;
  });
}
