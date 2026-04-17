import Fuse, { type IFuseOptions, type FuseIndex } from 'fuse.js';
import type { Dungeon } from '../../types/dungeon';

export const FUSE_OPTIONS: IFuseOptions<Dungeon> = {
  // ignoreLocation: true is CRITICAL — without it Fuse only searches
  // the first 60 chars, missing names deep in long strings
  ignoreLocation: true,
  threshold: 0.35,
  minMatchCharLength: 2,
  includeScore: true,
  shouldSort: true,
  keys: [
    { name: 'name', weight: 3 },
    { name: 'nameEn', weight: 2 },
    { name: 'aliases', weight: 2.5 },
    { name: 'slug', weight: 2 },
    { name: 'boss.name', weight: 1 },
    { name: 'boss.nameEn', weight: 0.8 },
  ],
};

const KEY_NAMES = (FUSE_OPTIONS.keys as Array<{ name: string; weight: number }>).map(
  (k) => k.name,
);

export function buildFuseIndex(dungeons: Dungeon[]): FuseIndex<Dungeon> {
  return Fuse.createIndex(KEY_NAMES, dungeons);
}

export function createFuse(dungeons: Dungeon[], prebuiltIndex?: FuseIndex<Dungeon>): Fuse<Dungeon> {
  return new Fuse(dungeons, FUSE_OPTIONS, prebuiltIndex);
}
