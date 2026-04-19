import { SETTINGS_SCHEMA_VERSION, type Settings, defaultSettings } from './schema';

/**
 * v0.5.1 used a Zustand-persist key in localStorage. Its mere presence
 * signals an onboarded user: the persist middleware writes the first time
 * the store hydrates (language detected, strategyView default), before the
 * user clicks anything. This lets us avoid showing the welcome overlay to
 * someone who auto-updates from v0.5.1 to v0.5.2.
 */
export const V051_PERSIST_KEY = 'dofus-companion-store';

/**
 * Compute the initial Settings when no `settings.json` exists on disk.
 *
 * - Fresh install (no localStorage either) → `hasCompletedFirstRun: false`
 *   (welcome overlay will render).
 * - v0.5.1 user who auto-updates (localStorage present) → flag pre-set
 *   to `true` so they never see the welcome.
 *
 * Returns the initial Settings object to be written to the store.
 */
export function initialSettingsFromLegacy(legacyPresent: boolean): Settings {
  return {
    ...defaultSettings(),
    hasCompletedFirstRun: legacyPresent,
  };
}

/**
 * Migrate a raw settings object loaded from disk to the current schema.
 * Handles:
 * - `version < 2` → assume the user is onboarded (defensive), bump to 2.
 * - `version === 2` → pass through.
 * - Missing fields → Zod defaults fill the gaps at parse time.
 *
 * The caller is responsible for calling this before handing the object to
 * Zod — the migration is a lossless shape normalization, Zod is the
 * validator.
 */
export function migrateRawSettings(raw: unknown): unknown {
  if (!raw || typeof raw !== 'object') return defaultSettings();
  const obj = raw as Record<string, unknown>;
  const version = typeof obj.version === 'number' ? obj.version : 0;
  if (version >= SETTINGS_SCHEMA_VERSION) {
    return obj;
  }
  return {
    ...obj,
    version: SETTINGS_SCHEMA_VERSION,
    hasCompletedFirstRun: true,
  };
}

/**
 * Read the v0.5.1 Zustand-persist key from localStorage without triggering
 * a parse — we only care about presence. Safe to call in SSR / test envs
 * where `localStorage` may be undefined.
 */
export function detectLegacyPersistKey(): boolean {
  if (typeof localStorage === 'undefined') return false;
  try {
    return localStorage.getItem(V051_PERSIST_KEY) !== null;
  } catch {
    return false;
  }
}
