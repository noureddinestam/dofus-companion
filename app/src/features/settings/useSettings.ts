import { useCallback, useEffect, useState } from 'react';
import { loadSettings, patchSettings } from './store';
import type {
  Appearance,
  ContentDisplay,
  MonstersDisplay,
  Notifications,
  Settings,
} from './schema';

/**
 * React binding for the persisted settings. Reads the store once on mount
 * (async) and exposes setters that both persist to disk and update local
 * state so every consumer re-renders immediately — this is the "toggle
 * takes effect without relaunch" promise of the v0.5.3 brief.
 *
 * `null` while the store is being loaded so consumers can avoid flashing
 * defaults during the first tick.
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
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadSettings().then((s) => {
      if (!cancelled) setSettings(s);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const update = useCallback(async (patch: Partial<Settings>) => {
    const next = await patchSettings(patch);
    setSettings(next);
  }, []);

  const updateAppearance = useCallback(
    async (patch: Partial<Appearance>) => {
      if (!settings) return;
      await update({ appearance: { ...settings.appearance, ...patch } });
    },
    [settings, update],
  );

  const updateContentDisplay = useCallback(
    async (patch: Partial<ContentDisplay>) => {
      if (!settings) return;
      await update({ contentDisplay: { ...settings.contentDisplay, ...patch } });
    },
    [settings, update],
  );

  const updateMonstersDisplay = useCallback(
    async (patch: Partial<MonstersDisplay>) => {
      if (!settings) return;
      await update({ monstersDisplay: { ...settings.monstersDisplay, ...patch } });
    },
    [settings, update],
  );

  const updateNotifications = useCallback(
    async (patch: Partial<Notifications>) => {
      if (!settings) return;
      await update({ notifications: { ...settings.notifications, ...patch } });
    },
    [settings, update],
  );

  return {
    settings,
    update,
    updateAppearance,
    updateContentDisplay,
    updateMonstersDisplay,
    updateNotifications,
  };
}
