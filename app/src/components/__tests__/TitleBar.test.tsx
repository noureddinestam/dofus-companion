import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, createRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { TitleBar } from '../TitleBar';
import { useAppStore } from '../../store/appStore';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement | null = null;
let root: Root | null = null;

function render(node: React.ReactNode): void {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => {
    root!.render(node);
  });
}

describe('TitleBar', () => {
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

  it('calls onOpenSettings when the gear button is clicked', () => {
    const onOpen = vi.fn();
    const searchRef = createRef<HTMLInputElement>();
    render(
      <TitleBar
        query=""
        onQueryChange={() => {}}
        searchRef={searchRef}
        onOpenSettings={onOpen}
      />,
    );
    const btn = container!.querySelector<HTMLButtonElement>('.title-bar__icon-btn');
    expect(btn).not.toBeNull();
    act(() => btn!.click());
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('exposes an accessible label on the gear button', () => {
    const searchRef = createRef<HTMLInputElement>();
    render(
      <TitleBar
        query=""
        onQueryChange={() => {}}
        searchRef={searchRef}
        onOpenSettings={() => {}}
      />,
    );
    const btn = container!.querySelector<HTMLButtonElement>('.title-bar__icon-btn');
    expect(btn?.getAttribute('aria-label')).toBeTruthy();
  });

  it('does not render a LangToggle (gear opens settings instead)', () => {
    const searchRef = createRef<HTMLInputElement>();
    render(
      <TitleBar
        query=""
        onQueryChange={() => {}}
        searchRef={searchRef}
        onOpenSettings={() => {}}
      />,
    );
    // FR / EN toggle used to live in the title bar — ensure it's gone.
    expect(container!.innerHTML).not.toContain('FR');
    expect(container!.innerHTML).not.toContain('EN');
  });
});
