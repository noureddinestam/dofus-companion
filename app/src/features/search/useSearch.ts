import { useMemo, useState, useCallback, useRef } from 'react';
import type { Dungeon } from '../../types/dungeon';
import { createFuse, MONSTER_MATCH_KEYS } from './fuseConfig';

const DEBOUNCE_MS = 60;

export interface SearchResult {
  dungeon: Dungeon;
  /** Monster id matched by the search query, null when the hit was via dungeon/boss keys. */
  matchedMonsterId: string | null;
}

export function useSearch(dungeons: Dungeon[]) {
  const [query, setQueryState] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fuse = useMemo(() => createFuse(dungeons), [dungeons]);

  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim();
    if (!q) {
      return [...dungeons]
        .sort((a, b) => b.recommendedLevel - a.recommendedLevel)
        .slice(0, 20)
        .map((dungeon) => ({ dungeon, matchedMonsterId: null }));
    }
    return fuse.search(q, { limit: 20 }).map((r) => {
      const monsterMatch = r.matches?.find(
        (m): m is typeof m & { refIndex: number } =>
          typeof m.key === 'string' &&
          MONSTER_MATCH_KEYS.includes(m.key) &&
          typeof m.refIndex === 'number',
      );
      const matchedMonsterId =
        monsterMatch && r.item.monsters[monsterMatch.refIndex]
          ? r.item.monsters[monsterMatch.refIndex].id
          : null;
      return { dungeon: r.item, matchedMonsterId };
    });
  }, [query, fuse, dungeons]);

  const setQuery = useCallback((raw: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setQueryState(raw), DEBOUNCE_MS);
  }, []);

  return { query, setQuery, results };
}
