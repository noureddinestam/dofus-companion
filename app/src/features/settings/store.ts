import { SettingsSchema, type Settings, defaultSettings } from './schema';
import {
  detectLegacyPersistKey,
  initialSettingsFromLegacy,
  migrateRawSettings,
} from './migrate';

/**
 * Thin wrapper over `@tauri-apps/plugin-store`. Loaded lazily so the app
 * still works in a browser dev preview (no Tauri runtime) by falling back
 * to an in-memory copy + localStorage mirror — the flags never reach disk
 * in that mode but the React tree renders.
 *
 * v0.5.3: the settings file now holds the full `Settings` object (v3) —
 * appearance, contentDisplay, monstersDisplay, notifications. We write
 * those as nested objects via `set('appearance', value)` rather than
 * flattening, so the migration code stays symmetrical on read.
 */

const SETTINGS_FILE = 'settings.json';
const WEB_MIRROR_KEY = 'dofus-companion-settings-v3';

type PluginStore = {
  get: (key: string) => Promise<unknown>;
  set: (key: string, value: unknown) => Promise<void>;
  save: () => Promise<void>;
};

let pluginStorePromise: Promise<PluginStore | null> | null = null;

async function loadPluginStore(): Promise<PluginStore | null> {
  if (pluginStorePromise) return pluginStorePromise;
  pluginStorePromise = (async () => {
    if (typeof window === 'undefined') return null;
    const tauriInternals = (window as unknown as { __TAURI_INTERNALS__?: unknown })
      .__TAURI_INTERNALS__;
    if (!tauriInternals) return null;
    try {
      const mod = await import('@tauri-apps/plugin-store');
      const store = await mod.Store.load(SETTINGS_FILE);
      return {
        get: (k) => store.get(k),
        set: (k, v) => store.set(k, v),
        save: () => store.save(),
      };
    } catch (err) {
      console.warn('[settings] plugin-store unavailable, using in-memory fallback', err);
      return null;
    }
  })();
  return pluginStorePromise;
}

function readWebMirror(): Settings | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(WEB_MIRROR_KEY);
    if (!raw) return null;
    const migrated = migrateRawSettings(JSON.parse(raw));
    const parsed = SettingsSchema.safeParse(migrated);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

function writeWebMirror(s: Settings): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(WEB_MIRROR_KEY, JSON.stringify(s));
  } catch {
    // quota / privacy mode — ignore, in-memory copy still holds.
  }
}

const STORE_KEYS = [
  'version',
  'hasCompletedFirstRun',
  'appearance',
  'contentDisplay',
  'monstersDisplay',
  'notifications',
] as const;

async function readFromPluginStore(store: PluginStore): Promise<Settings | null> {
  try {
    const bag: Record<string, unknown> = {};
    let anyPresent = false;
    for (const key of STORE_KEYS) {
      const value = await store.get(key);
      if (value != null) {
        anyPresent = true;
        bag[key] = value;
      }
    }
    if (!anyPresent) return null;
    const migrated = migrateRawSettings(bag);
    const parsed = SettingsSchema.safeParse(migrated);
    return parsed.success ? parsed.data : null;
  } catch (err) {
    console.warn('[settings] read failed, defaulting', err);
    return null;
  }
}

async function writeToPluginStore(store: PluginStore, s: Settings): Promise<void> {
  await store.set('version', s.version);
  await store.set('hasCompletedFirstRun', s.hasCompletedFirstRun);
  await store.set('appearance', s.appearance);
  await store.set('contentDisplay', s.contentDisplay);
  await store.set('monstersDisplay', s.monstersDisplay);
  await store.set('notifications', s.notifications);
  await store.save();
}

/**
 * Load the persisted settings, applying the legacy migration heuristic on
 * first read. If nothing is persisted yet, decide first-run status from
 * the presence of the v0.5.1 Zustand-persist key in localStorage.
 */
export async function loadSettings(): Promise<Settings> {
  const store = await loadPluginStore();

  if (store) {
    const existing = await readFromPluginStore(store);
    if (existing) return existing;
    const initial = initialSettingsFromLegacy(detectLegacyPersistKey());
    await writeToPluginStore(store, initial);
    writeWebMirror(initial);
    return initial;
  }

  // No plugin-store (browser preview or test). Use the web mirror.
  const existing = readWebMirror();
  if (existing) return existing;
  const initial = initialSettingsFromLegacy(detectLegacyPersistKey());
  writeWebMirror(initial);
  return initial;
}

/**
 * Persist the complete settings object. Writes both to plugin-store (when
 * available) and to the localStorage mirror so the next in-session read is
 * fast.
 */
export async function saveSettings(next: Settings): Promise<void> {
  const parsed = SettingsSchema.parse(next);
  const store = await loadPluginStore();
  if (store) await writeToPluginStore(store, parsed);
  writeWebMirror(parsed);
}

/** Convenience: flip a top-level field and persist. */
export async function patchSettings(patch: Partial<Settings>): Promise<Settings> {
  const current = await loadSettings();
  const next: Settings = SettingsSchema.parse({ ...current, ...patch });
  await saveSettings(next);
  return next;
}

export { defaultSettings };
