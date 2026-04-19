import { create } from 'zustand';
import { loadSettings, patchSettings } from './store';
import type {
  Appearance,
  ContentDisplay,
  MonstersDisplay,
  Notifications,
  Settings,
} from './schema';

/**
 * Centralized settings state. Every consumer of `useSettings()` subscribes to
 * this single store, so a mutation from the settings panel propagates to the
 * overlay card and the dungeon list in the same render tick. The v0.5.3
 * symptom where each hook call had its own local `useState` (toggles persisted
 * to disk but the UI didn't re-render until the next launch) is fixed here.
 *
 * The on-disk persistence layer is untouched — `loadSettings` / `patchSettings`
 * from `./store` keep owning the plugin-store + localStorage mirror. This
 * store only adds cross-component reactivity above them.
 */
interface SettingsStoreState {
  settings: Settings | null;
  _hydrated: boolean;
  _hydratePromise: Promise<void> | null;
  hydrate: () => Promise<void>;
  update: (patch: Partial<Settings>) => Promise<void>;
  updateAppearance: (patch: Partial<Appearance>) => Promise<void>;
  updateContentDisplay: (patch: Partial<ContentDisplay>) => Promise<void>;
  updateMonstersDisplay: (patch: Partial<MonstersDisplay>) => Promise<void>;
  updateNotifications: (patch: Partial<Notifications>) => Promise<void>;
}

export const useSettingsStore = create<SettingsStoreState>()((set, get) => ({
  settings: null,
  _hydrated: false,
  _hydratePromise: null,

  hydrate: async () => {
    const state = get();
    if (state._hydrated) return;
    if (state._hydratePromise) return state._hydratePromise;
    const promise = loadSettings().then((s) => {
      set({ settings: s, _hydrated: true });
    });
    set({ _hydratePromise: promise });
    return promise;
  },

  update: async (patch) => {
    const next = await patchSettings(patch);
    set({ settings: next });
  },

  updateAppearance: async (patch) => {
    const current = get().settings;
    if (!current) return;
    await get().update({ appearance: { ...current.appearance, ...patch } });
  },

  updateContentDisplay: async (patch) => {
    const current = get().settings;
    if (!current) return;
    await get().update({
      contentDisplay: { ...current.contentDisplay, ...patch },
    });
  },

  updateMonstersDisplay: async (patch) => {
    const current = get().settings;
    if (!current) return;
    await get().update({
      monstersDisplay: { ...current.monstersDisplay, ...patch },
    });
  },

  updateNotifications: async (patch) => {
    const current = get().settings;
    if (!current) return;
    await get().update({
      notifications: { ...current.notifications, ...patch },
    });
  },
}));

/**
 * Test-only helper: clear the singleton so each test starts with a null
 * settings and an un-hydrated flag, mirroring the behavior of a fresh process.
 * Not exported from the package barrel — tests import it directly.
 */
export function resetSettingsStoreForTests(): void {
  useSettingsStore.setState({
    settings: null,
    _hydrated: false,
    _hydratePromise: null,
  });
}
