import { useMemo } from 'react';
import { DungeonSchema } from '../../types/dungeon';
import type { Dungeon } from '../../types/dungeon';
import { z } from 'zod';
import { migrateLegacyStrategy } from './migrateLegacyStrategy';

// Loaded at build time — zero network, zero latency
import rawData from '../../data/dungeons.json';

const DungeonsArraySchema = z.array(DungeonSchema);

function loadDungeons(): Dungeon[] {
  const result = DungeonsArraySchema.safeParse(rawData);
  if (!result.success) {
    console.error('[dofus-companion] dungeons.json validation errors:', result.error.flatten());
    return [];
  }
  // Migration legacy v0.3 → v0.4 : hydrate Boss.strategies depuis Boss.strategy
  return result.data.map(migrateLegacyStrategy);
}

// Parsed once at module load, never again
const DUNGEONS: Dungeon[] = loadDungeons();

export function useDungeons() {
  const endgame = useMemo(
    () => DUNGEONS.filter((d) => d.recommendedLevel >= 160),
    [],
  );

  return { dungeons: DUNGEONS, endgame, total: DUNGEONS.length };
}
