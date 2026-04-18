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

  // === v0.5 regression guard ===
  // Aucune donnée v0.4 ne doit produire de combat card populated : tous les
  // boss et monstres doivent sortir du parse avec combat === null, et
  // legacyStrategies absent. Le critère d'additivité : un monstre lambda reste lambda.
  it('v0.5 schema additive: every boss and monster has combat === null after v0.4 parse', () => {
    if (!parsed.success) throw new Error('parse failed');
    for (const d of parsed.data) {
      expect(d.boss.combat).toBeNull();
      expect(d.boss.legacyStrategies).toBeUndefined();
      for (const m of d.monsters) {
        expect(m.combat).toBeNull();
      }
    }
  });
});
