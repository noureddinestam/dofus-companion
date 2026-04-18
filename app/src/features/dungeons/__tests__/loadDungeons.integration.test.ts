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

  // === v0.5 invariants post-migration ===
  // Le critère d'additivité reste : un monstre lambda reste lambda (combat === null).
  // Les boss peuvent désormais avoir une combat card populated par Phase B, mais
  // chaque boss avec combat populated doit aussi avoir legacyStrategies rempli
  // (footer "Notes legacy v0.4" du brief §8.5). Les boss sans combat restent sur
  // le rendu v0.4 classique.
  it('v0.5 invariant: every monster still has combat === null (lambda silence)', () => {
    if (!parsed.success) throw new Error('parse failed');
    for (const d of parsed.data) {
      for (const m of d.monsters) {
        expect(m.combat).toBeNull();
      }
    }
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
