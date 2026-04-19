import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { WelcomeOverlay } from '../WelcomeOverlay';
import { useAppStore } from '../../store/appStore';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement | null = null;
let root: Root | null = null;

function render(node: React.ReactNode): string {
  if (!container) {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  }
  act(() => {
    root!.render(node);
  });
  return container.innerHTML;
}

describe('WelcomeOverlay', () => {
  beforeEach(() => {
    localStorage.clear();
    useAppStore.setState({ lang: 'fr', strategyView: 'short' });
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

  it('renders the French copy by default', () => {
    const html = render(<WelcomeOverlay onDismiss={() => {}} />);
    expect(html).toContain('Bienvenue dans Dofus Companion');
    expect(html).toContain('Alt+D pour afficher/masquer');
    expect(html).toContain("J'ai compris");
  });

  it('renders the English copy when lang is en', () => {
    useAppStore.setState({ lang: 'en' });
    const html = render(<WelcomeOverlay onDismiss={() => {}} />);
    expect(html).toContain('Welcome to Dofus Companion');
    expect(html).toContain('Alt+D to show/hide');
    expect(html).toContain("Got it");
  });

  it('calls onDismiss when the CTA is clicked', () => {
    const onDismiss = vi.fn();
    render(<WelcomeOverlay onDismiss={onDismiss} />);
    const cta = container!.querySelector('.welcome-overlay__cta') as HTMLButtonElement;
    act(() => {
      cta.click();
    });
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('calls onDismiss when the close cross is clicked', () => {
    const onDismiss = vi.fn();
    render(<WelcomeOverlay onDismiss={onDismiss} />);
    const close = container!.querySelector('.welcome-overlay__close') as HTMLButtonElement;
    act(() => {
      close.click();
    });
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('calls onDismiss on Escape key', () => {
    const onDismiss = vi.fn();
    render(<WelcomeOverlay onDismiss={onDismiss} />);
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
