import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { useSettings } from '../useSettings';
import { resetSettingsStoreForTests } from '../settingsStore';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement | null = null;
let root: Root | null = null;

function renderHook<T>(hook: () => T): { result: { current: T } } {
  const result = { current: undefined as unknown as T };
  function Probe() {
    result.current = hook();
    return null;
  }
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => {
    root!.render(<Probe />);
  });
  return { result };
}

async function flush(): Promise<void> {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe('useSettings', () => {
  beforeEach(() => {
    localStorage.clear();
    resetSettingsStoreForTests();
  });

  afterEach(() => {
    if (root) {
      act(() => root!.unmount());
      root = null;
    }
    if (container) {
      container.remove();
      container = null;
    }
  });

  it('resolves to a full v3 Settings object after mount', async () => {
    const { result } = renderHook(useSettings);
    expect(result.current.settings).toBeNull();
    await flush();
    expect(result.current.settings).not.toBeNull();
    expect(result.current.settings!.version).toBe(3);
    expect(result.current.settings!.appearance.lang).toBe('fr');
  });

  it('updateAppearance flips a nested field immediately and persists', async () => {
    const { result } = renderHook(useSettings);
    await flush();
    await act(async () => {
      await result.current.updateAppearance({ lang: 'en', opacity: 0.8 });
    });
    expect(result.current.settings!.appearance.lang).toBe('en');
    expect(result.current.settings!.appearance.opacity).toBe(0.8);
  });

  it('updateContentDisplay preserves the other content flags', async () => {
    const { result } = renderHook(useSettings);
    await flush();
    await act(async () => {
      await result.current.updateContentDisplay({ showUnlockContext: false });
    });
    expect(result.current.settings!.contentDisplay.showUnlockContext).toBe(false);
    expect(result.current.settings!.contentDisplay.showUnlockActions).toBe(true);
    expect(result.current.settings!.contentDisplay.showDangersBlock).toBe(true);
  });

  it('updateMonstersDisplay exposes the silence-rule opt-in', async () => {
    const { result } = renderHook(useSettings);
    await flush();
    expect(result.current.settings!.monstersDisplay.showLambdaMonsters).toBe(false);
    await act(async () => {
      await result.current.updateMonstersDisplay({ showLambdaMonsters: true });
    });
    expect(result.current.settings!.monstersDisplay.showLambdaMonsters).toBe(true);
  });

  it('updateNotifications persists the toast toggle', async () => {
    const { result } = renderHook(useSettings);
    await flush();
    await act(async () => {
      await result.current.updateNotifications({ showStartupToast: false });
    });
    expect(result.current.settings!.notifications.showStartupToast).toBe(false);
  });
});
