import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { SettingsPanel } from '../SettingsPanel';
import { useAppStore } from '../../store/appStore';
import { resetSettingsStoreForTests } from '../../features/settings/settingsStore';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement | null = null;
let root: Root | null = null;

function render(node: React.ReactNode): void {
  if (!container) {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  }
  act(() => {
    root!.render(node);
  });
}

async function flush(): Promise<void> {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe('SettingsPanel', () => {
  beforeEach(() => {
    localStorage.clear();
    resetSettingsStoreForTests();
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

  it('renders nothing when open is false', () => {
    render(<SettingsPanel open={false} onClose={() => {}} appVersion="0.5.3" />);
    expect(container!.innerHTML).toBe('');
  });

  it('renders the 6 sections when open', async () => {
    render(<SettingsPanel open={true} onClose={() => {}} appVersion="0.5.3" />);
    await flush();
    const html = container!.innerHTML;
    expect(html).toContain('Apparence');
    expect(html).toContain('Contenu');
    expect(html).toContain('Monstres');
    expect(html).toContain('Raccourcis');
    expect(html).toContain('Notifications');
    expect(html).toContain('À propos');
  });

  it('renders the English title when lang is en', async () => {
    useAppStore.setState({ lang: 'en' });
    render(<SettingsPanel open={true} onClose={() => {}} appVersion="0.5.3" />);
    await flush();
    expect(container!.innerHTML).toContain('Settings');
  });

  it('calls onClose when the close button is clicked', async () => {
    const onClose = vi.fn();
    render(<SettingsPanel open={true} onClose={onClose} appVersion="0.5.3" />);
    await flush();
    const close = container!.querySelector('.settings-panel__close') as HTMLButtonElement;
    act(() => close.click());
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose on Escape', async () => {
    const onClose = vi.fn();
    render(<SettingsPanel open={true} onClose={onClose} appVersion="0.5.3" />);
    await flush();
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the backdrop is clicked', async () => {
    const onClose = vi.fn();
    render(<SettingsPanel open={true} onClose={onClose} appVersion="0.5.3" />);
    await flush();
    const backdrop = container!.querySelector('.settings-panel-backdrop') as HTMLElement;
    act(() => {
      const event = new MouseEvent('mousedown', { bubbles: true });
      backdrop.dispatchEvent(event);
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close when clicking inside the aside panel', async () => {
    const onClose = vi.fn();
    render(<SettingsPanel open={true} onClose={onClose} appVersion="0.5.3" />);
    await flush();
    const panel = container!.querySelector('.settings-panel') as HTMLElement;
    act(() => {
      panel.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('shows the version string in the About section', async () => {
    render(<SettingsPanel open={true} onClose={() => {}} appVersion="0.5.3" />);
    await flush();
    expect(container!.innerHTML).toContain('Version 0.5.3');
  });

  it('disables the unlock subsections when the parent block is hidden', async () => {
    render(<SettingsPanel open={true} onClose={() => {}} appVersion="0.5.3" />);
    await flush();
    const checkboxes = Array.from(
      container!.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'),
    );
    // Find the "Show unlock block" checkbox (first one that checks/unchecks
    // the parent) and flip it off.
    const parent = checkboxes[0];
    expect(parent.checked).toBe(true);
    await act(async () => {
      parent.click();
      await Promise.resolve();
    });
    // After the parent unchecks, the two subsection checkboxes must be disabled.
    const refreshed = Array.from(
      container!.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'),
    );
    expect(refreshed[1].disabled).toBe(true);
    expect(refreshed[2].disabled).toBe(true);
  });
});
