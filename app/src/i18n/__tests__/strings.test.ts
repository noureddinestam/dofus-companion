import { describe, it, expect } from 'vitest';
import { UI_STRINGS } from '../strings';

describe('UI_STRINGS', () => {
  it('has identical key structure for fr and en', () => {
    function collectKeys(obj: Record<string, unknown>, prefix = ''): string[] {
      return Object.entries(obj).flatMap(([k, v]) => {
        const path = prefix ? `${prefix}.${k}` : k;
        if (v && typeof v === 'object' && !Array.isArray(v) && typeof v !== 'function') {
          return collectKeys(v as Record<string, unknown>, path);
        }
        return [path];
      });
    }

    const frKeys = collectKeys(UI_STRINGS.fr as unknown as Record<string, unknown>).sort();
    const enKeys = collectKeys(UI_STRINGS.en as unknown as Record<string, unknown>).sort();
    expect(enKeys).toEqual(frKeys);
  });

  it('exposes fr strings sanity', () => {
    expect(UI_STRINGS.fr.search.placeholder).toBe('Rechercher un donjon…');
    expect(UI_STRINGS.fr.dungeon.back).toBe('Retour');
    expect(UI_STRINGS.fr.lang.fr).toBe('FR');
  });

  it('exposes en strings sanity', () => {
    expect(UI_STRINGS.en.search.placeholder).toBe('Search a dungeon…');
    expect(UI_STRINGS.en.dungeon.back).toBe('Back');
    expect(UI_STRINGS.en.lang.en).toBe('EN');
  });

  it('function-style strings interpolate arguments (fr + en)', () => {
    expect(UI_STRINGS.fr.update.available('0.4.0')).toBe('↑ v0.4.0 disponible');
    expect(UI_STRINGS.en.update.available('0.4.0')).toBe('↑ v0.4.0 available');
    expect(UI_STRINGS.fr.dungeon.monstersCount(7)).toBe('7 monstres + boss');
    expect(UI_STRINGS.en.dungeon.monstersCount(7)).toBe('7 monsters + boss');
  });
});
