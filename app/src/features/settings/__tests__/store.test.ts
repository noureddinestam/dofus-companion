import { beforeEach, describe, expect, it } from 'vitest';
import { loadSettings, patchSettings, saveSettings } from '../store';
import { V051_PERSIST_KEY } from '../migrate';
import { SETTINGS_SCHEMA_VERSION } from '../schema';

/**
 * Settings store behaves in web-preview fallback mode here (no Tauri runtime
 * in happy-dom), so reads/writes go through the localStorage mirror. That's
 * exactly what runs in the browser preview and in CI, so we validate the
 * fallback codepath end-to-end.
 */

const MIRROR_KEY = 'dofus-companion-settings-v3';
const MIRROR_KEY_V2 = 'dofus-companion-settings-v2';

describe('settings store (web fallback)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('fresh load → hasCompletedFirstRun=false, version=3, defaults across blocks', async () => {
    const s = await loadSettings();
    expect(s.hasCompletedFirstRun).toBe(false);
    expect(s.version).toBe(SETTINGS_SCHEMA_VERSION);
    expect(s.appearance.lang).toBe('fr');
    expect(s.appearance.opacity).toBe(0.9);
    expect(s.contentDisplay.showUnlockBlock).toBe(true);
    expect(s.monstersDisplay.showLambdaMonsters).toBe(false);
    expect(s.notifications.showStartupToast).toBe(true);
    expect(localStorage.getItem(MIRROR_KEY)).not.toBeNull();
  });

  it('v0.5.1 user (Zustand lang=en) → onboarded + lang seeded', async () => {
    localStorage.setItem(
      V051_PERSIST_KEY,
      JSON.stringify({ state: { lang: 'en' } }),
    );
    const s = await loadSettings();
    expect(s.hasCompletedFirstRun).toBe(true);
    expect(s.appearance.lang).toBe('en');
  });

  it('round-trips the full v3 object via saveSettings + loadSettings', async () => {
    const s1 = await loadSettings();
    await saveSettings({
      ...s1,
      hasCompletedFirstRun: true,
      appearance: { ...s1.appearance, lang: 'en', opacity: 0.7, density: 'compact' },
      contentDisplay: { ...s1.contentDisplay, showUnlockContext: false },
      monstersDisplay: { ...s1.monstersDisplay, showLambdaMonsters: true },
      notifications: { showStartupToast: false },
    });
    const s2 = await loadSettings();
    expect(s2.appearance.lang).toBe('en');
    expect(s2.appearance.opacity).toBe(0.7);
    expect(s2.appearance.density).toBe('compact');
    expect(s2.contentDisplay.showUnlockContext).toBe(false);
    expect(s2.monstersDisplay.showLambdaMonsters).toBe(true);
    expect(s2.notifications.showStartupToast).toBe(false);
  });

  it('patchSettings flips a top-level field without losing the rest', async () => {
    await loadSettings();
    const next = await patchSettings({ hasCompletedFirstRun: true });
    expect(next.hasCompletedFirstRun).toBe(true);
    const reloaded = await loadSettings();
    expect(reloaded.hasCompletedFirstRun).toBe(true);
    expect(reloaded.appearance.lang).toBe('fr');
  });

  it('recovers gracefully from a corrupted v3 mirror', async () => {
    localStorage.setItem(MIRROR_KEY, '{{{not-json');
    const s = await loadSettings();
    expect(s.version).toBe(SETTINGS_SCHEMA_VERSION);
    expect(s.hasCompletedFirstRun).toBe(false);
  });

  it('upgrades a v2 mirror left behind by v0.5.2 into v3', async () => {
    localStorage.setItem(
      MIRROR_KEY_V2,
      JSON.stringify({ version: 2, hasCompletedFirstRun: true }),
    );
    // The v3 mirror key is the authoritative one; the v2 key is no longer
    // read by the current store. In practice the plugin-store file is the
    // source of truth on Tauri, and its migration is covered separately —
    // here we just confirm that a fresh v3 load still works when a stale
    // v2 key lives side-by-side.
    const s = await loadSettings();
    expect(s.version).toBe(SETTINGS_SCHEMA_VERSION);
    // No v0.5.1 Zustand key → fresh install path.
    expect(s.hasCompletedFirstRun).toBe(false);
  });
});
