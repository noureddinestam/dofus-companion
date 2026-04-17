import { useMemo, useState, useCallback, useRef } from 'react';
import type { Dungeon } from '../../types/dungeon';
import { createFuse } from './fuseConfig';

const DEBOUNCE_MS = 60;

export function useSearch(dungeons: Dungeon[]) {
  const [query, setQueryState] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fuse = useMemo(() => createFuse(dungeons), [dungeons]);

  const results = useMemo<Dungeon[]>(() => {
    const q = query.trim();
    if (!q) {
      return [...dungeons]
        .sort((a, b) => b.recommendedLevel - a.recommendedLevel)
        .slice(0, 20);
    }
    return fuse.search(q, { limit: 20 }).map((r) => r.item);
  }, [query, fuse, dungeons]);

  const setQuery = useCallback((raw: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setQueryState(raw), DEBOUNCE_MS);
  }, []);

  return { query, setQuery, results };
}
