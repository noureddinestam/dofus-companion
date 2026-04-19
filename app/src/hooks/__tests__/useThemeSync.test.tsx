import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { useThemeSync } from '../useThemeSync';
import { SettingsSchema, type Settings } from '../../features/settings/schema';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function buildSettings(theme: 'system' | 'light' | 'dark'): Settings {
  return SettingsSchema.parse({
    version: 3,
    hasCompletedFirstRun: true,
    appearance: { lang: 'fr', opacity: 0.9, density: 'comfortable', theme },
  });
}

interface FakeMediaQuery {
  matches: boolean;
  _listeners: Array<(e: MediaQueryListEvent) => void>;
  addEventListener: (type: string, listener: (e: MediaQueryListEvent) => void) => void;
  removeEventListener: (type: string, listener: (e: MediaQueryListEvent) => void) => void;
  fire: (matches: boolean) => void;
}

function installFakeMatchMedia(initialMatches: boolean): FakeMediaQuery {
  const fake: FakeMediaQuery = {
    matches: initialMatches,
    _listeners: [],
    addEventListener(_type, listener) {
      this._listeners.push(listener);
    },
    removeEventListener(_type, listener) {
      this._listeners = this._listeners.filter((l) => l !== listener);
    },
    fire(matches) {
      this.matches = matches;
      for (const l of [...this._listeners]) {
        l({ matches } as MediaQueryListEvent);
      }
    },
  };
  vi.stubGlobal('matchMedia', (() => fake) as unknown as typeof window.matchMedia);
  return fake;
}

let container: HTMLDivElement | null = null;
let root: Root | null = null;

function mount(settings: Settings | null): void {
  function Probe() {
    useThemeSync(settings);
    return null;
  }
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => {
    root!.render(<Probe />);
  });
}

describe('useThemeSync', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('theme-light', 'theme-dark');
    vi.unstubAllGlobals();
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

  it('applies theme-dark when the user picks dark explicitly', () => {
    installFakeMatchMedia(true); // system says light, but explicit dark wins
    mount(buildSettings('dark'));
    expect(document.documentElement.classList.contains('theme-dark')).toBe(true);
    expect(document.documentElement.classList.contains('theme-light')).toBe(false);
  });

  it('applies theme-light when the user picks light explicitly', () => {
    installFakeMatchMedia(false); // system says dark, but explicit light wins
    mount(buildSettings('light'));
    expect(document.documentElement.classList.contains('theme-light')).toBe(true);
    expect(document.documentElement.classList.contains('theme-dark')).toBe(false);
  });

  it('resolves system mode to the OS preference on mount', () => {
    installFakeMatchMedia(true);
    mount(buildSettings('system'));
    expect(document.documentElement.classList.contains('theme-light')).toBe(true);
  });

  it('updates theme when OS preference changes in system mode', () => {
    const mq = installFakeMatchMedia(false);
    mount(buildSettings('system'));
    expect(document.documentElement.classList.contains('theme-dark')).toBe(true);

    act(() => {
      mq.fire(true);
    });
    expect(document.documentElement.classList.contains('theme-light')).toBe(true);
  });

  it('defaults to dark when matchMedia is unavailable and theme is system', () => {
    vi.stubGlobal('matchMedia', undefined);
    mount(buildSettings('system'));
    expect(document.documentElement.classList.contains('theme-dark')).toBe(true);
  });

  it('does nothing when settings is null', () => {
    installFakeMatchMedia(false);
    mount(null);
    expect(document.documentElement.classList.contains('theme-dark')).toBe(true);
  });
});
