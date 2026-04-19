import { useEffect } from 'react';
import { useSettingsStore } from './settingsStore';
import type {
  Appearance,
  ContentDisplay,
  MonstersDisplay,
  Notifications,
  Settings,
} from './schema';

/**
 * React binding for the persisted settings. Thin adapter over the shared
 * Zustand store in `settingsStore.ts` — all consumers read the same object
 * so a toggle mutation in the settings panel is visible in the overlay card
 * within the same render tick.
 *
 * `settings` is `null` until the first hydrate resolves, matching the
 * v0.5.3 API; consumers already handle that loading tick.
 */
export interface UseSettingsResult {
  settings: Settings | null;
  update: (patch: Partial<Settings>) => Promise<void>;
  updateAppearance: (patch: Partial<Appearance>) => Promise<void>;
  updateContentDisplay: (patch: Partial<ContentDisplay>) => Promise<void>;
  updateMonstersDisplay: (patch: Partial<MonstersDisplay>) => Promise<void>;
  updateNotifications: (patch: Partial<Notifications>) => Promise<void>;
}

export function useSettings(): UseSettingsResult {
  const settings = useSettingsStore((s) => s.settings);
  const hydrate = useSettingsStore((s) => s.hydrate);
  const update = useSettingsStore((s) => s.update);
  const updateAppearance = useSettingsStore((s) => s.updateAppearance);
  const updateContentDisplay = useSettingsStore((s) => s.updateContentDisplay);
  const updateMonstersDisplay = useSettingsStore((s) => s.updateMonstersDisplay);
  const updateNotifications = useSettingsStore((s) => s.updateNotifications);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return {
    settings,
    update,
    updateAppearance,
    updateContentDisplay,
    updateMonstersDisplay,
    updateNotifications,
  };
}
