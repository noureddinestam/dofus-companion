import { beforeEach, describe, expect, it } from 'vitest';
import {
  V051_PERSIST_KEY,
  detectLegacyPersistKey,
  initialSettingsFromLegacy,
  migrateRawSettings,
} from '../migrate';
import { SETTINGS_SCHEMA_VERSION } from '../schema';

describe('initialSettingsFromLegacy', () => {
  it('returns hasCompletedFirstRun=false when no legacy present (fresh install)', () => {
    const s = initialSettingsFromLegacy(false);
    expect(s.hasCompletedFirstRun).toBe(false);
    expect(s.version).toBe(SETTINGS_SCHEMA_VERSION);
  });

  it('returns hasCompletedFirstRun=true when legacy detected (v0.5.1 user)', () => {
    const s = initialSettingsFromLegacy(true);
    expect(s.hasCompletedFirstRun).toBe(true);
    expect(s.version).toBe(SETTINGS_SCHEMA_VERSION);
  });
});

describe('migrateRawSettings', () => {
  it('defaults when raw is null/undefined', () => {
    const a = migrateRawSettings(null) as { version: number };
    const b = migrateRawSettings(undefined) as { version: number };
    expect(a.version).toBe(SETTINGS_SCHEMA_VERSION);
    expect(b.version).toBe(SETTINGS_SCHEMA_VERSION);
  });

  it('passes through a v2 object unchanged', () => {
    const v2 = { version: 2, hasCompletedFirstRun: true };
    const out = migrateRawSettings(v2) as typeof v2;
    expect(out).toEqual(v2);
  });

  it('upgrades a hypothetical v1 object and marks it onboarded', () => {
    const v1 = { version: 1, lang: 'fr' };
    const out = migrateRawSettings(v1) as { version: number; hasCompletedFirstRun: boolean };
    expect(out.version).toBe(SETTINGS_SCHEMA_VERSION);
    expect(out.hasCompletedFirstRun).toBe(true);
  });

  it('upgrades a version-less object and marks it onboarded', () => {
    const raw = { hasCompletedFirstRun: false };
    const out = migrateRawSettings(raw) as { version: number; hasCompletedFirstRun: boolean };
    expect(out.version).toBe(SETTINGS_SCHEMA_VERSION);
    expect(out.hasCompletedFirstRun).toBe(true);
  });
});

describe('detectLegacyPersistKey', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns false on a clean localStorage', () => {
    expect(detectLegacyPersistKey()).toBe(false);
  });

  it('returns true when the v0.5.1 key is present', () => {
    localStorage.setItem(V051_PERSIST_KEY, JSON.stringify({ state: { lang: 'fr' } }));
    expect(detectLegacyPersistKey()).toBe(true);
  });

  it('returns false when the value is explicitly null-ish but the key is absent', () => {
    localStorage.setItem('other-app-store', 'x');
    expect(detectLegacyPersistKey()).toBe(false);
  });
});
