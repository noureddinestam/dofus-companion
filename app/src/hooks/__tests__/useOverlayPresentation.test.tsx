import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { useOverlayPresentation } from '../useOverlayPresentation';
import { SettingsSchema, type Settings } from '../../features/settings/schema';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function buildSettings(overrides: {
  opacity?: number;
  density?: 'comfortable' | 'compact';
} = {}): Settings {
  return SettingsSchema.parse({
    version: 3,
    hasCompletedFirstRun: true,
    appearance: {
      lang: 'fr',
      opacity: overrides.opacity ?? 0.95,
      density: overrides.density ?? 'comfortable',
      theme: 'system',
    },
  });
}

let container: HTMLDivElement | null = null;
let root: Root | null = null;

function mount(settings: Settings | null): void {
  function Probe() {
    useOverlayPresentation(settings);
    return null;
  }
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => {
    root!.render(<Probe />);
  });
}

describe('useOverlayPresentation', () => {
  beforeEach(() => {
    document.documentElement.style.removeProperty('--overlay-opacity');
    document.documentElement.classList.remove('density-compact');
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

  it('sets --overlay-opacity from settings', () => {
    mount(buildSettings({ opacity: 0.7 }));
    expect(document.documentElement.style.getPropertyValue('--overlay-opacity')).toBe('0.7');
  });

  it('applies density-compact class when density = compact', () => {
    mount(buildSettings({ density: 'compact' }));
    expect(document.documentElement.classList.contains('density-compact')).toBe(true);
  });

  it('removes density-compact when switching back to comfortable', () => {
    mount(buildSettings({ density: 'compact' }));
    act(() => {
      root!.render(
        // Re-render with new settings to simulate live update
        <ProbeWith settings={buildSettings({ density: 'comfortable' })} />,
      );
    });
    expect(document.documentElement.classList.contains('density-compact')).toBe(false);
  });

  it('defaults to opacity=1 when settings is null', () => {
    mount(null);
    expect(document.documentElement.style.getPropertyValue('--overlay-opacity')).toBe('1');
  });
});

function ProbeWith({ settings }: { settings: Settings | null }) {
  useOverlayPresentation(settings);
  return null;
}
