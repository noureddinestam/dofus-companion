import { useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import type { Settings } from '../features/settings/schema';

/**
 * Bridges the v0.5.3 settings file (source of truth for language) to the
 * existing Zustand store consumed by the i18n layer. The store keeps its
 * own subscription-based API so every useI18n caller keeps working; this
 * hook just makes sure the store follows whatever settings.appearance.lang
 * holds.
 *
 * The reverse direction (store → settings) is owned by the SettingsPanel
 * through `updateAppearance({ lang })`, so we don't need a bidirectional
 * sync here — a one-way mirror from settings to store is sufficient.
 */
export function useLangSync(settings: Settings | null): void {
  const nextLang = settings?.appearance.lang ?? null;
  useEffect(() => {
    if (!nextLang) return;
    const current = useAppStore.getState().lang;
    if (current !== nextLang) {
      useAppStore.getState().setLang(nextLang);
    }
  }, [nextLang]);
}
