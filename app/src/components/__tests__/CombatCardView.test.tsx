import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

// Signale à React qu'on est dans un environnement de test compatible act().
(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
import { CombatCardView } from '../CombatCardView';
import { useAppStore } from '../../store/appStore';
import {
  FIXTURE_BOSS_SYLARGH,
  FIXTURE_MONSTER_COUNTER,
  FIXTURE_MONSTER_LAMBDA,
} from '../../features/combat/devFixtures';
import type { CombatCard } from '../../types/combat-card';

let container: HTMLDivElement | null = null;
let root: Root | null = null;

function render(card: CombatCard | null): string {
  if (!container) {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  }
  act(() => {
    root!.render(<CombatCardView card={card} />);
  });
  return container.innerHTML;
}

describe('CombatCardView', () => {
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

  it('renders nothing when card is null (lambda monster)', () => {
    expect(render(FIXTURE_MONSTER_LAMBDA)).toBe('');
  });

  it('renders nothing when every block is empty', () => {
    const empty: CombatCard = { unlock: [], dangers: [], tips: [] };
    expect(render(empty)).toBe('');
  });

  it('renders the 3 v0.5.1 blocks in fixed order for a full boss card (FR)', () => {
    const html = render(FIXTURE_BOSS_SYLARGH);
    expect(html).toContain('DÉLOCK');
    expect(html).not.toContain('CONTRAINTES');
    expect(html).toContain('DANGERS');
    expect(html).toContain('INFOS UTILES');
    const idxUnlock = html.indexOf('DÉLOCK');
    const idxDangers = html.indexOf('DANGERS');
    const idxTips = html.indexOf('INFOS UTILES');
    expect(idxUnlock).toBeLessThan(idxDangers);
    expect(idxDangers).toBeLessThan(idxTips);
  });

  it('omits empty blocks but preserves order for partial card', () => {
    // FIXTURE_MONSTER_COUNTER has unlock (1 context) + dangers, no tips.
    const html = render(FIXTURE_MONSTER_COUNTER);
    expect(html).toContain('DÉLOCK');
    expect(html).toContain('DANGERS');
    expect(html).not.toContain('INFOS UTILES');
    expect(html).not.toContain('CONTRAINTES');
    expect(html.indexOf('DÉLOCK')).toBeLessThan(html.indexOf('DANGERS'));
  });

  it('switches to EN titles when lang is en', () => {
    act(() => {
      useAppStore.setState({ lang: 'en' });
    });
    const html = render(FIXTURE_BOSS_SYLARGH);
    expect(html).toContain('UNLOCK');
    expect(html).not.toContain('CONSTRAINTS');
    expect(html).toContain('DANGERS');
    expect(html).toContain('TIPS');
    expect(html).not.toContain('DÉLOCK');
  });

  it('renders the FR text of each bullet when lang is fr', () => {
    const html = render(FIXTURE_BOSS_SYLARGH);
    expect(html).toContain('Tuer les 3 pions');
    expect(html).not.toContain('Kill the 3 pawns');
  });

  it('renders the EN text of each bullet when lang is en', () => {
    act(() => {
      useAppStore.setState({ lang: 'en' });
    });
    const html = render(FIXTURE_BOSS_SYLARGH);
    expect(html).toContain('Kill the 3 pawns');
    expect(html).not.toContain('Tuer les 3 pions');
  });
});
