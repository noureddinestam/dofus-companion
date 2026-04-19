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
import type { Settings } from '../../features/settings/schema';
import { resetSettingsStoreForTests } from '../../features/settings/settingsStore';

const SETTINGS_MIRROR_KEY = 'dofus-companion-settings-v3';

function seedSettings(overrides: Partial<Settings['contentDisplay']> = {}, monstersOverrides: Partial<Settings['monstersDisplay']> = {}) {
  const settings: Settings = {
    version: 3,
    hasCompletedFirstRun: true,
    appearance: { lang: 'fr', opacity: 0.95, density: 'comfortable', theme: 'system' },
    contentDisplay: {
      showUnlockBlock: true,
      showUnlockContext: true,
      showUnlockActions: true,
      showDangersBlock: true,
      showTipsBlock: true,
      ...overrides,
    },
    monstersDisplay: {
      showLambdaMonsters: false,
      showProvenanceBadge: true,
      ...monstersOverrides,
    },
    notifications: { showStartupToast: true },
  };
  localStorage.setItem(SETTINGS_MIRROR_KEY, JSON.stringify(settings));
}

let container: HTMLDivElement | null = null;
let root: Root | null = null;

function render(card: CombatCard | null, compact = false): string {
  if (!container) {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  }
  act(() => {
    root!.render(<CombatCardView card={card} compact={compact} />);
  });
  return container.innerHTML;
}

async function flushSettings(): Promise<void> {
  // useSettings() loads asynchronously — wait one microtask tick so any
  // state update driven by localStorage mirror is applied.
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe('CombatCardView', () => {
  beforeEach(() => {
    localStorage.clear();
    resetSettingsStoreForTests();
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

  it('hides the DANGERS block when showDangersBlock=false', async () => {
    seedSettings({ showDangersBlock: false });
    render(FIXTURE_BOSS_SYLARGH);
    await flushSettings();
    expect(container!.innerHTML).toContain('DÉLOCK');
    expect(container!.innerHTML).not.toContain('DANGERS');
    expect(container!.innerHTML).toContain('INFOS UTILES');
  });

  it('hides the unlock Context subsection when showUnlockContext=false', async () => {
    seedSettings({ showUnlockContext: false });
    render(FIXTURE_BOSS_SYLARGH);
    await flushSettings();
    // Sylargh fixture has 1 context + 3 action bullets.
    expect(container!.innerHTML).not.toContain('Sylargh se ressuscite au centre');
    expect(container!.innerHTML).toContain('Éloigner Sylargh du centre');
  });

  it('parent-wins: hiding the unlock block also hides its subsections', async () => {
    seedSettings({ showUnlockBlock: false });
    render(FIXTURE_BOSS_SYLARGH);
    await flushSettings();
    expect(container!.innerHTML).not.toContain('DÉLOCK');
    expect(container!.innerHTML).not.toContain('Éloigner Sylargh');
    expect(container!.innerHTML).toContain('DANGERS');
  });

  it('renders nothing when every visible block is toggled off', async () => {
    seedSettings({
      showUnlockBlock: false,
      showDangersBlock: false,
      showTipsBlock: false,
    });
    render(FIXTURE_BOSS_SYLARGH);
    await flushSettings();
    expect(container!.innerHTML).toBe('');
  });

  it('renders a lambda placeholder in compact mode when showLambdaMonsters=true', async () => {
    seedSettings({}, { showLambdaMonsters: true });
    render(null, true);
    await flushSettings();
    expect(container!.innerHTML).toContain('Pas de mécanique notable');
  });

  it('silence rule applies in compact mode when showLambdaMonsters=false', async () => {
    seedSettings({}, { showLambdaMonsters: false });
    render(null, true);
    await flushSettings();
    expect(container!.innerHTML).toBe('');
  });

  it('hides the provenance badge when showProvenanceBadge=false', async () => {
    seedSettings({}, { showProvenanceBadge: false });
    render(FIXTURE_BOSS_SYLARGH);
    await flushSettings();
    expect(container!.innerHTML).not.toContain('combat-card__provenance');
  });
});
