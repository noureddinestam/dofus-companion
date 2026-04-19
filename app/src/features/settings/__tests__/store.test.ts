import { beforeEach, describe, expect, it } from 'vitest';
import { loadSettings, patchSettings, saveSettings } from '../store';
import { V051_PERSIST_KEY } from '../migrate';

/**
 * Settings store behaves in web-preview fallback mode here (no Tauri runtime
 * in happy-dom), so reads/writes go through the localStorage mirror. That's
 * exactly what runs in the browser preview and in CI, so we validate the
 * fallback codepath end-to-end.
 */

const MIRROR_KEY = 'dofus-companion-settings-v2';

describe('settings store (web fallback)', () => {
  beforeEach(() => {
    localStorage.clear();
    // Reset any module-scoped caches by dynamically reimporting between
    // tests is overkill here — the store module is pure and reads
    // localStorage lazily.
  });

  it('returns hasCompletedFirstRun=false on a fresh localStorage', async () => {
    const s = await loadSettings();
    expect(s.hasCompletedFirstRun).toBe(false);
    expect(s.version).toBe(2);
    // initial persist writes the mirror so subsequent loads are fast.
    expect(localStorage.getItem(MIRROR_KEY)).not.toBeNull();
  });

  it('marks hasCompletedFirstRun=true when the v0.5.1 Zustand key is present (fresh first load)', async () => {
    localStorage.setItem(V051_PERSIST_KEY, JSON.stringify({ state: { lang: 'fr' } }));
    const s = await loadSettings();
    expect(s.hasCompletedFirstRun).toBe(true);
  });

  it('round-trips via saveSettings + loadSettings', async () => {
    const s1 = await loadSettings();
    expect(s1.hasCompletedFirstRun).toBe(false);
    await saveSettings({ ...s1, hasCompletedFirstRun: true });
    const s2 = await loadSettings();
    expect(s2.hasCompletedFirstRun).toBe(true);
  });

  it('patchSettings flips a single field without losing the rest', async () => {
    await loadSettings(); // seeds the mirror
    const next = await patchSettings({ hasCompletedFirstRun: true });
    expect(next.hasCompletedFirstRun).toBe(true);
    const reloaded = await loadSettings();
    expect(reloaded.hasCompletedFirstRun).toBe(true);
  });

  it('recovers gracefully from a corrupted mirror', async () => {
    localStorage.setItem(MIRROR_KEY, '{{{not-json');
    const s = await loadSettings();
    expect(s.version).toBe(2);
    // Corrupted → treated as missing → falls back to legacy detection (none here)
    expect(s.hasCompletedFirstRun).toBe(false);
  });
});
