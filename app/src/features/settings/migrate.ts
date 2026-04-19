import {
  SETTINGS_SCHEMA_VERSION,
  AppearanceSchema,
  ContentDisplaySchema,
  MonstersDisplaySchema,
  NotificationsSchema,
  defaultSettings,
  type Lang,
  type Settings,
} from './schema';

/**
 * v0.5.1 used a Zustand-persist key in localStorage. Its mere presence
 * signals an onboarded user: the persist middleware writes the first time
 * the store hydrates (language detected, strategyView default), before the
 * user clicks anything. This lets us avoid showing the welcome overlay to
 * someone who auto-updates from v0.5.1 to v0.5.2/v0.5.3.
 */
export const V051_PERSIST_KEY = 'dofus-companion-store';

/**
 * Shape of the v0.5.1 Zustand-persist payload we care about. Anything else
 * in there is ignored.
 */
interface V051PersistedState {
  lang?: unknown;
}

function readLegacyPersist(): V051PersistedState | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(V051_PERSIST_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: V051PersistedState };
    return parsed.state ?? null;
  } catch {
    return null;
  }
}

function legacyLang(): Lang | null {
  const state = readLegacyPersist();
  const value = state?.lang;
  if (value === 'fr' || value === 'en') return value;
  return null;
}

/**
 * Compute the initial Settings when no `settings.json` exists on disk.
 *
 * - Fresh install (no localStorage either) → first-run = true,
 *   appearance.lang defaults to 'fr'.
 * - v0.5.1 user who auto-updates (localStorage present) → first-run
 *   pre-set to already-onboarded; appearance.lang seeded from the
 *   legacy persisted value when readable.
 */
export function initialSettingsFromLegacy(legacyPresent: boolean): Settings {
  const base = defaultSettings();
  const lang = legacyLang();
  return {
    ...base,
    hasCompletedFirstRun: legacyPresent,
    appearance: {
      ...base.appearance,
      ...(lang ? { lang } : {}),
    },
  };
}

/**
 * Normalize a raw value read from disk before handing it to Zod. Each
 * case matches a concrete v0.5.x shape we might encounter in the wild.
 */
export function migrateRawSettings(raw: unknown): unknown {
  if (!raw || typeof raw !== 'object') return defaultSettings();

  const obj = { ...(raw as Record<string, unknown>) };
  const version = typeof obj.version === 'number' ? obj.version : 0;

  // v >= 3 : schema already matches; Zod will fill any missing field via
  // the per-block defaults.
  if (version >= SETTINGS_SCHEMA_VERSION) {
    return obj;
  }

  // v2 (v0.5.2) → v3 (v0.5.3)
  // Preserve hasCompletedFirstRun, seed lang from the legacy Zustand key
  // when we can, let the remaining blocks fill themselves with defaults.
  const lang = legacyLang();
  return {
    ...obj,
    version: SETTINGS_SCHEMA_VERSION,
    hasCompletedFirstRun:
      typeof obj.hasCompletedFirstRun === 'boolean' ? obj.hasCompletedFirstRun : true,
    appearance: AppearanceSchema.parse(lang ? { lang } : {}),
    contentDisplay: ContentDisplaySchema.parse({}),
    monstersDisplay: MonstersDisplaySchema.parse({}),
    notifications: NotificationsSchema.parse({}),
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
