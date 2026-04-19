import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { useLangSync } from '../useLangSync';
import { SettingsSchema, type Settings } from '../../features/settings/schema';
import { useAppStore } from '../../store/appStore';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function settingsWithLang(lang: 'fr' | 'en'): Settings {
  return SettingsSchema.parse({
    version: 3,
    hasCompletedFirstRun: true,
    appearance: { lang, opacity: 0.95, density: 'comfortable', theme: 'system' },
  });
}

let container: HTMLDivElement | null = null;
let root: Root | null = null;

function mount(settings: Settings | null): void {
  function Probe({ s }: { s: Settings | null }) {
    useLangSync(s);
    return null;
  }
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => {
    root!.render(<Probe s={settings} />);
  });
}

describe('useLangSync', () => {
  beforeEach(() => {
    useAppStore.setState({ lang: 'fr' });
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

  it('mirrors settings.appearance.lang into the app store on mount', () => {
    mount(settingsWithLang('en'));
    expect(useAppStore.getState().lang).toBe('en');
  });

  it('is a no-op when settings is null', () => {
    useAppStore.setState({ lang: 'fr' });
    mount(null);
    expect(useAppStore.getState().lang).toBe('fr');
  });

  it('is a no-op when the store already matches', () => {
    useAppStore.setState({ lang: 'en' });
    mount(settingsWithLang('en'));
    expect(useAppStore.getState().lang).toBe('en');
  });
});
