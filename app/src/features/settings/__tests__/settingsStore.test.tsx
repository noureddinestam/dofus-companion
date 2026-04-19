import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { useSettings } from '../useSettings';
import {
  resetSettingsStoreForTests,
  useSettingsStore,
} from '../settingsStore';

/**
 * Regression guard for the v0.5.3 bug where every `useSettings()` caller
 * owned its own React `useState`, so the settings panel mutated a local
 * copy and the overlay / dungeon cards never re-rendered.
 *
 * These tests mount two independent React trees and assert that a mutation
 * from one propagates to the other. They would have failed on the v0.5.3
 * implementation; they pass on the Zustand-backed v0.5.4 store.
 */

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

interface Mount {
  container: HTMLDivElement;
  root: Root;
}

function mount(node: React.ReactNode): Mount {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(node);
  });
  return { container, root };
}

async function flush(): Promise<void> {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe('settingsStore — cross-consumer reactivity', () => {
  let mounts: Mount[] = [];

  beforeEach(() => {
    localStorage.clear();
    resetSettingsStoreForTests();
    mounts = [];
  });

  afterEach(() => {
    for (const m of mounts) {
      act(() => m.root.unmount());
      m.container.remove();
    }
    mounts = [];
  });

  it('hydrates once and is shared across independent consumers', async () => {
    const readA = { value: null as string | null };
    const readB = { value: null as string | null };

    function ConsumerA() {
      const { settings } = useSettings();
      readA.value = settings?.appearance.lang ?? null;
      return null;
    }
    function ConsumerB() {
      const { settings } = useSettings();
      readB.value = settings?.appearance.lang ?? null;
      return null;
    }

    mounts.push(mount(<ConsumerA />));
    mounts.push(mount(<ConsumerB />));
    await flush();

    expect(readA.value).toBe('fr');
    expect(readB.value).toBe('fr');
  });

  it('propagates an updateAppearance mutation to every consumer', async () => {
    const seen = { a: null as string | null, b: null as string | null };
    let trigger: (() => Promise<void>) | null = null;

    function ReaderA() {
      const { settings } = useSettings();
      seen.a = settings?.appearance.lang ?? null;
      return null;
    }
    function ReaderB() {
      const { settings } = useSettings();
      seen.b = settings?.appearance.lang ?? null;
      return null;
    }
    function Writer() {
      const { updateAppearance } = useSettings();
      trigger = () => updateAppearance({ lang: 'en' });
      return null;
    }

    mounts.push(mount(<ReaderA />));
    mounts.push(mount(<ReaderB />));
    mounts.push(mount(<Writer />));
    await flush();

    expect(seen.a).toBe('fr');
    expect(seen.b).toBe('fr');

    await act(async () => {
      await trigger!();
    });

    expect(seen.a).toBe('en');
    expect(seen.b).toBe('en');
  });

  it('updateContentDisplay preserves sibling flags and fans out', async () => {
    const seen = { showDangers: null as boolean | null };
    let trigger: (() => Promise<void>) | null = null;

    function Reader() {
      const { settings } = useSettings();
      seen.showDangers = settings?.contentDisplay.showDangersBlock ?? null;
      return null;
    }
    function Writer() {
      const { updateContentDisplay } = useSettings();
      trigger = () => updateContentDisplay({ showDangersBlock: false });
      return null;
    }

    mounts.push(mount(<Reader />));
    mounts.push(mount(<Writer />));
    await flush();

    expect(seen.showDangers).toBe(true);

    await act(async () => {
      await trigger!();
    });

    expect(seen.showDangers).toBe(false);
    const store = useSettingsStore.getState();
    expect(store.settings?.contentDisplay.showTipsBlock).toBe(true);
    expect(store.settings?.contentDisplay.showUnlockBlock).toBe(true);
  });

  it('hydrate is idempotent across concurrent callers', async () => {
    const { hydrate } = useSettingsStore.getState();
    const a = hydrate();
    const b = hydrate();
    await Promise.all([a, b]);
    expect(useSettingsStore.getState()._hydrated).toBe(true);
    expect(useSettingsStore.getState().settings).not.toBeNull();
  });
});
