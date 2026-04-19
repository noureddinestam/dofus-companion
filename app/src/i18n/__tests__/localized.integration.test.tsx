import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MonsterRow } from '../../components/MonsterRow';
import { useAppStore } from '../../store/appStore';
import type { Monster } from '../../types/dungeon';

/**
 * End-to-end wiring of the `localizedName` helper through `useI18n` and
 * `MonsterRow`: toggling the app language must swap both the monster name
 * and the family label. Would have caught the v0.5.3 miss where monster
 * family stayed in FR even when the overlay was switched to EN.
 */

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const FIXTURE: Monster = {
  id: 'm-harrogant',
  name: 'Harrogant',
  nameEn: 'Harrogant',
  level: 212,
  hp: 6600,
  family: 'Cuirassés',
  familyEn: 'Plated',
  weakElement: null,
  resistElement: null,
  source: 'fandom-fr',
  sourceUrl: 'https://dofus-wiki.fandom.com/fr/wiki/Harrogant',
  combat: null,
};

const DUNGEON_FIXTURE: Monster = {
  ...FIXTURE,
  id: 'd-klime',
  name: 'Salons privés de Klime',
  nameEn: "Klime's Private Rooms",
  family: 'Inconnu',
  familyEn: null,
};

let container: HTMLDivElement | null = null;
let root: Root | null = null;

function render(monster: Monster): string {
  if (!container) {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  }
  act(() => {
    root!.render(<MonsterRow monster={monster} />);
  });
  return container.innerHTML;
}

describe('localizedName — integration through MonsterRow', () => {
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

  it('renders FR name and FR family by default', () => {
    const html = render(FIXTURE);
    expect(html).toContain('Harrogant');
    expect(html).toContain('Cuirassés');
    expect(html).not.toContain('Plated');
  });

  it('swaps to EN name and EN family when lang flips to en', () => {
    render(FIXTURE);
    act(() => useAppStore.setState({ lang: 'en' }));
    const html = container!.innerHTML;
    expect(html).toContain('Harrogant');
    expect(html).toContain('Plated');
    expect(html).not.toContain('Cuirassés');
  });

  it('falls back to FR family when familyEn is null', () => {
    useAppStore.setState({ lang: 'en' });
    const monsterNoFamilyEn: Monster = { ...FIXTURE, familyEn: null };
    const html = render(monsterNoFamilyEn);
    expect(html).toContain('Cuirassés');
  });

  it('skips the family span when family is Inconnu (no localization needed)', () => {
    const html = render(DUNGEON_FIXTURE);
    expect(html).not.toContain('Inconnu');
  });
});
