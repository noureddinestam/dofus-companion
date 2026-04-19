import { useMemo } from 'react';
import { DungeonSchema } from '../../types/dungeon';
import type { Dungeon, Monster, Boss } from '../../types/dungeon';
import { z } from 'zod';
import { migrateLegacyStrategy } from './migrateLegacyStrategy';
import { applyDevFixtures } from './devFixtures';
import { migrateCardV05ToV051 } from '../combat/migrate';

// Loaded at build time — zero network, zero latency
import rawData from '../../data/dungeons.json';

const DungeonsArraySchema = z.array(DungeonSchema);

function migrateMonster(m: Monster): Monster {
  if (!m.combat) return m;
  return { ...m, combat: migrateCardV05ToV051(m.combat) };
}

function migrateBoss(b: Boss): Boss {
  if (!b.combat) return b;
  return { ...b, combat: migrateCardV05ToV051(b.combat) };
}

function migrateDungeonToV051(d: Dungeon): Dungeon {
  return {
    ...d,
    boss: migrateBoss(d.boss),
    monsters: d.monsters.map(migrateMonster),
  };
}

function loadDungeons(): Dungeon[] {
  const result = DungeonsArraySchema.safeParse(rawData);
  if (!result.success) {
    console.error('[dofus-companion] dungeons.json validation errors:', result.error.flatten());
    return [];
  }
  // Legacy v0.3 → v0.4: hydrate Boss.strategies from Boss.strategy.
  // v0.5 → v0.5.1: fuse constraints into unlock.context at the head.
  const migrated = result.data
    .map(migrateLegacyStrategy)
    .map(migrateDungeonToV051);
  // Fixtures dev-only (no-op en prod) pour valider la vue Actionnable
  return applyDevFixtures(migrated);
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
