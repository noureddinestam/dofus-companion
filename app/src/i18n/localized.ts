import type { Lang } from './strings';

/**
 * Structural match for any entity carrying an optional English variant of a
 * text field. Dungeon, Monster, Boss (name/nameEn) all satisfy this shape,
 * and so does a synthetic `{ name: m.family, nameEn: m.familyEn }` pair
 * when localizing family labels.
 */
export interface LocalizedField {
  name: string;
  nameEn?: string | null;
}

/**
 * Pick the English variant when `lang === 'en'` and `nameEn` is a non-empty
 * string; fall back to the canonical French `name` otherwise. Pure — safe to
 * call in render paths without memoization.
 *
 * This is the v0.5.4 fix for dungeon/boss/monster titles staying in FR when
 * the user switches the overlay to EN via Ctrl+L or the settings panel.
 */
export function localizedName<T extends LocalizedField>(
  entity: T,
  lang: Lang,
): string {
  if (lang === 'en' && entity.nameEn && entity.nameEn.trim().length > 0) {
    return entity.nameEn;
  }
  return entity.name;
}
