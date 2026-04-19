import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { useFirstRun } from '../useFirstRun';

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

async function flushMicrotasks(): Promise<void> {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe('useFirstRun', () => {
  beforeEach(() => {
    localStorage.clear();
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

  it('is null on first render then resolves to true on a fresh install', async () => {
    const { result } = renderHook(useFirstRun);
    expect(result.current.isFirstRun).toBeNull();
    await flushMicrotasks();
    expect(result.current.isFirstRun).toBe(true);
  });

  it('resolves to false when v0.5.1 Zustand persist key is present', async () => {
    localStorage.setItem('dofus-companion-store', JSON.stringify({ state: { lang: 'fr' } }));
    const { result } = renderHook(useFirstRun);
    await flushMicrotasks();
    expect(result.current.isFirstRun).toBe(false);
  });

  it('completeFirstRun flips the flag and persists', async () => {
    const { result } = renderHook(useFirstRun);
    await flushMicrotasks();
    expect(result.current.isFirstRun).toBe(true);
    await act(async () => {
      await result.current.completeFirstRun();
    });
    expect(result.current.isFirstRun).toBe(false);
    // Remount to verify persistence.
    act(() => root!.unmount());
    root = createRoot(container!);
    const probe2 = renderHook(useFirstRun);
    await flushMicrotasks();
    expect(probe2.result.current.isFirstRun).toBe(false);
  });
});
