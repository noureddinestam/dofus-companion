import { beforeEach, describe, expect, it } from 'vitest';
import {
  V051_PERSIST_KEY,
  detectLegacyPersistKey,
  initialSettingsFromLegacy,
  migrateRawSettings,
} from '../migrate';
import { SETTINGS_SCHEMA_VERSION, SettingsSchema } from '../schema';

beforeEach(() => {
  localStorage.clear();
});

describe('initialSettingsFromLegacy', () => {
  it('fresh install → hasCompletedFirstRun=false, defaults everywhere', () => {
    const s = initialSettingsFromLegacy(false);
    expect(s.version).toBe(SETTINGS_SCHEMA_VERSION);
    expect(s.hasCompletedFirstRun).toBe(false);
    expect(s.appearance.lang).toBe('fr');
    expect(s.appearance.opacity).toBe(0.95);
    expect(s.appearance.density).toBe('comfortable');
    expect(s.contentDisplay.showUnlockBlock).toBe(true);
    expect(s.monstersDisplay.showLambdaMonsters).toBe(false);
    expect(s.notifications.showStartupToast).toBe(true);
  });

  it('v0.5.1 user with legacy Zustand lang=en → onboarded + lang seeded', () => {
    localStorage.setItem(
      V051_PERSIST_KEY,
      JSON.stringify({ state: { lang: 'en', strategyView: 'short' } }),
    );
    const s = initialSettingsFromLegacy(true);
    expect(s.hasCompletedFirstRun).toBe(true);
    expect(s.appearance.lang).toBe('en');
  });

  it('v0.5.1 user with unreadable legacy payload → onboarded + default lang', () => {
    localStorage.setItem(V051_PERSIST_KEY, '{{{bad-json');
    const s = initialSettingsFromLegacy(true);
    expect(s.hasCompletedFirstRun).toBe(true);
    expect(s.appearance.lang).toBe('fr');
  });
});

describe('migrateRawSettings', () => {
  it('defaults when raw is null/undefined', () => {
    for (const input of [null, undefined]) {
      const parsed = SettingsSchema.parse(migrateRawSettings(input));
      expect(parsed.version).toBe(SETTINGS_SCHEMA_VERSION);
      expect(parsed.hasCompletedFirstRun).toBe(false);
      expect(parsed.appearance.lang).toBe('fr');
    }
  });

  it('v2 → v3 preserves hasCompletedFirstRun and fills the four new blocks', () => {
    const v2 = { version: 2, hasCompletedFirstRun: true };
    const parsed = SettingsSchema.parse(migrateRawSettings(v2));
    expect(parsed.version).toBe(SETTINGS_SCHEMA_VERSION);
    expect(parsed.hasCompletedFirstRun).toBe(true);
    expect(parsed.appearance.opacity).toBe(0.95);
    expect(parsed.contentDisplay.showDangersBlock).toBe(true);
    expect(parsed.monstersDisplay.showProvenanceBadge).toBe(true);
    expect(parsed.notifications.showStartupToast).toBe(true);
  });

  it('v2 → v3 seeds appearance.lang from the Zustand-persist payload', () => {
    localStorage.setItem(
      V051_PERSIST_KEY,
      JSON.stringify({ state: { lang: 'en' } }),
    );
    const v2 = { version: 2, hasCompletedFirstRun: true };
    const parsed = SettingsSchema.parse(migrateRawSettings(v2));
    expect(parsed.appearance.lang).toBe('en');
  });

  it('hypothetical v1 object is marked onboarded and bumped to current', () => {
    const v1 = { version: 1, lang: 'fr' };
    const parsed = SettingsSchema.parse(migrateRawSettings(v1));
    expect(parsed.version).toBe(SETTINGS_SCHEMA_VERSION);
    expect(parsed.hasCompletedFirstRun).toBe(true);
  });

  it('pass-through when the file is already v3', () => {
    const v3 = {
      version: 3,
      hasCompletedFirstRun: true,
      appearance: { lang: 'en', opacity: 0.8, density: 'compact', theme: 'dark' },
      contentDisplay: {
        showUnlockBlock: true,
        showUnlockContext: false,
        showUnlockActions: true,
        showDangersBlock: true,
        showTipsBlock: false,
      },
      monstersDisplay: { showLambdaMonsters: true, showProvenanceBadge: false },
      notifications: { showStartupToast: false },
    };
    const parsed = SettingsSchema.parse(migrateRawSettings(v3));
    expect(parsed.appearance.opacity).toBe(0.8);
    expect(parsed.contentDisplay.showUnlockContext).toBe(false);
    expect(parsed.monstersDisplay.showLambdaMonsters).toBe(true);
    expect(parsed.notifications.showStartupToast).toBe(false);
  });

  it('missing blocks in a v3 file are filled with defaults by Zod', () => {
    const partial = { version: 3, hasCompletedFirstRun: true };
    const parsed = SettingsSchema.parse(migrateRawSettings(partial));
    expect(parsed.appearance.lang).toBe('fr');
    expect(parsed.contentDisplay.showUnlockBlock).toBe(true);
    expect(parsed.monstersDisplay.showLambdaMonsters).toBe(false);
    expect(parsed.notifications.showStartupToast).toBe(true);
  });
});

describe('detectLegacyPersistKey', () => {
  it('returns false on a clean localStorage', () => {
    expect(detectLegacyPersistKey()).toBe(false);
  });

  it('returns true when the v0.5.1 key is present', () => {
    localStorage.setItem(V051_PERSIST_KEY, JSON.stringify({ state: { lang: 'fr' } }));
    expect(detectLegacyPersistKey()).toBe(true);
  });

  it('returns false when another app store key is present but not ours', () => {
    localStorage.setItem('other-app-store', 'x');
    expect(detectLegacyPersistKey()).toBe(false);
  });
});
