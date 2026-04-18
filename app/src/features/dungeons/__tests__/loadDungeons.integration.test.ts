import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { DungeonSchema } from '../../../types/dungeon';
import { migrateLegacyStrategy } from '../migrateLegacyStrategy';
import rawData from '../../../data/dungeons.json';

/**
 * Test d'intégration : charge le dungeons.json v0.3 embarqué dans le bundle
 * et vérifie que :
 *  1. Zod le valide avec le nouveau schéma (backward-compat)
 *  2. Après migration, les donjons avec strategy legacy ont strategies peuplé
 *  3. Les donjons sans strategy restent sans strategies
 */
describe('dungeons.json v0.3 + migration', () => {
  const parsed = z.array(DungeonSchema).safeParse(rawData);

  it('parses with the new v0.4 schema (backward-compat)', () => {
    if (!parsed.success) {
      console.error(parsed.error.issues.slice(0, 3));
    }
    expect(parsed.success).toBe(true);
  });

  it('all dungeons pass after migration', () => {
    if (!parsed.success) throw new Error('parse failed');
    const migrated = parsed.data.map(migrateLegacyStrategy);
    expect(migrated.length).toBe(parsed.data.length);
  });

  it('dungeons with legacy strategy have strategies.long.en populated', () => {
    if (!parsed.success) throw new Error('parse failed');
    const migrated = parsed.data.map(migrateLegacyStrategy);

    const withLegacy = migrated.filter((d) => d.boss.strategy !== null);
    expect(withLegacy.length).toBeGreaterThan(0);

    for (const d of withLegacy) {
      expect(d.boss.strategies).not.toBeNull();
      expect(d.boss.strategies!.long.en).not.toBeNull();
      expect(d.boss.strategies!.long.en!.text).toBe(d.boss.strategy!.text);
      expect(d.boss.strategies!.long.en!.provenance.kind).toBe('native');
      if (d.boss.strategies!.long.en!.provenance.kind === 'native') {
        expect(d.boss.strategies!.long.en!.provenance.lang).toBe('en');
        expect(d.boss.strategies!.long.en!.provenance.source).toBe('fandom-en');
      }
    }
  });

  it('dungeons without legacy strategy have null strategies after migration', () => {
    if (!parsed.success) throw new Error('parse failed');
    const migrated = parsed.data.map(migrateLegacyStrategy);

    const withoutLegacy = migrated.filter((d) => d.boss.strategy === null);
    for (const d of withoutLegacy) {
      expect(d.boss.strategies).toBeNull();
    }
  });

  it('reports coverage stats for visibility (non-assertion)', () => {
    if (!parsed.success) throw new Error('parse failed');
    const migrated = parsed.data.map(migrateLegacyStrategy);
    const total = migrated.length;
    const withStrat = migrated.filter((d) => d.boss.strategies !== null).length;
    const pct = ((withStrat / total) * 100).toFixed(1);
    console.log(`\n  📊 Migration v0.3→v0.4 : ${withStrat}/${total} donjons avec strategies (${pct}%)`);
    expect(total).toBeGreaterThan(100);
  });

  // === v0.5 invariants post-migration (Phase B boss + Phase C monstres) ===
  // Certains monstres ont désormais un combat populated (Phase C). Les lambdas
  // sans mécanique sur Fandom restent combat=null (règle du silence). Chaque
  // boss populated doit aussi avoir legacyStrategies (footer §8.5).
  it('v0.5 invariant: monster combat cards are well-formed or null (no half-state)', () => {
    if (!parsed.success) throw new Error('parse failed');
    let monstersWithCombat = 0;
    let monstersLambda = 0;
    for (const d of parsed.data) {
      for (const m of d.monsters) {
        if (m.combat === null) {
          monstersLambda++;
          continue;
        }
        monstersWithCombat++;
        const totalBullets =
          m.combat.unlock.length +
          m.combat.constraints.length +
          m.combat.dangers.length +
          m.combat.tips.length;
        expect(totalBullets).toBeGreaterThan(0);
      }
    }
    console.log(
      `\n  📊 Monsters : ${monstersWithCombat} avec combat · ${monstersLambda} lambda`,
    );
    expect(monstersWithCombat).toBeGreaterThan(100);
  });

  // === Phase C archetype coverage ===
  // Snapshot léger : on ne fige pas des IDs de monstres précis (brittle aux
  // reruns Fandom), on garantit que la diversité archétypale du dataset reste
  // au-dessus d'un seuil. 13/14 types canoniques lors du premier run v0.5.
  it('v0.5 Phase C: monster combat cards span at least 10 distinct mechanicTypes', () => {
    if (!parsed.success) throw new Error('parse failed');
    const types = new Set<string>();
    for (const d of parsed.data) {
      for (const m of d.monsters) {
        if (!m.combat) continue;
        for (const block of ['unlock', 'constraints', 'dangers', 'tips'] as const) {
          for (const bullet of m.combat[block]) {
            if (bullet.mechanicType) types.add(bullet.mechanicType);
          }
        }
      }
    }
    console.log(`\n  📊 Archetypes covered by monster cards: ${types.size}/14 (${[...types].sort().join(', ')})`);
    expect(types.size).toBeGreaterThanOrEqual(10);
  });

  it('v0.5 invariant: every boss with populated combat also has legacyStrategies', () => {
    if (!parsed.success) throw new Error('parse failed');
    let withCombat = 0;
    let withoutCombat = 0;
    for (const d of parsed.data) {
      if (d.boss.combat === null) {
        withoutCombat++;
        continue;
      }
      withCombat++;
      const totalBullets =
        d.boss.combat.unlock.length +
        d.boss.combat.constraints.length +
        d.boss.combat.dangers.length +
        d.boss.combat.tips.length;
      expect(totalBullets).toBeGreaterThan(0);
      expect(d.boss.legacyStrategies).toBeDefined();
      expect(d.boss.legacyStrategies!.length).toBeGreaterThan(0);
    }
    console.log(`\n  📊 Combat cards : ${withCombat}/${withCombat + withoutCombat} boss avec combat populated`);
    expect(withCombat).toBeGreaterThan(100);
  });
});
