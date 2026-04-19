import { describe, expect, it } from 'vitest';
import { localizedName } from '../localized';

describe('localizedName', () => {
  it('returns name (FR) when lang is fr, ignoring nameEn', () => {
    expect(
      localizedName({ name: 'Salons privés de Klime', nameEn: "Klime's Private Rooms" }, 'fr'),
    ).toBe('Salons privés de Klime');
  });

  it('returns nameEn when lang is en and nameEn is non-empty', () => {
    expect(
      localizedName({ name: 'Salons privés de Klime', nameEn: "Klime's Private Rooms" }, 'en'),
    ).toBe("Klime's Private Rooms");
  });

  it('falls back to FR name when lang is en and nameEn is null', () => {
    expect(localizedName({ name: 'Fallback FR', nameEn: null }, 'en')).toBe('Fallback FR');
  });

  it('falls back to FR name when lang is en and nameEn is undefined', () => {
    expect(localizedName({ name: 'Fallback FR' }, 'en')).toBe('Fallback FR');
  });

  it('falls back to FR name when lang is en and nameEn is an empty string', () => {
    expect(localizedName({ name: 'Fallback FR', nameEn: '' }, 'en')).toBe('Fallback FR');
  });

  it('falls back to FR name when lang is en and nameEn is whitespace only', () => {
    expect(localizedName({ name: 'Fallback FR', nameEn: '   ' }, 'en')).toBe('Fallback FR');
  });

  it('returns FR name when lang is fr even if nameEn is null/undefined', () => {
    expect(localizedName({ name: 'Peunch', nameEn: null }, 'fr')).toBe('Peunch');
    expect(localizedName({ name: 'Peunch' }, 'fr')).toBe('Peunch');
  });

  it('works on a synthesized family pair', () => {
    const monsterFamily = { name: 'Cuirassés', nameEn: 'Plated' as string | null };
    expect(localizedName(monsterFamily, 'en')).toBe('Plated');
    expect(localizedName(monsterFamily, 'fr')).toBe('Cuirassés');
  });
});
