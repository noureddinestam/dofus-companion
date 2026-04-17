import { beforeEach, describe, expect, it } from 'vitest';
import { useAppStore } from '../../store/appStore';
import { UI_STRINGS } from '../strings';

// On teste l'intégration hook ⇄ store via l'API zustand directement.
// Pas besoin de @testing-library/react : le hook est un thin wrapper.

describe('i18n store integration', () => {
  beforeEach(() => {
    useAppStore.setState({ lang: 'fr', strategyView: 'short' });
    localStorage.clear();
  });

  it('default lang is fr after reset', () => {
    expect(useAppStore.getState().lang).toBe('fr');
  });

  it('setLang updates lang and resolves FR strings', () => {
    useAppStore.getState().setLang('en');
    const { lang } = useAppStore.getState();
    expect(lang).toBe('en');
    expect(UI_STRINGS[lang].search.placeholder).toBe('Search a dungeon…');
  });

  it('setLang back to fr restores FR strings', () => {
    useAppStore.getState().setLang('en');
    useAppStore.getState().setLang('fr');
    const { lang } = useAppStore.getState();
    expect(lang).toBe('fr');
    expect(UI_STRINGS[lang].search.placeholder).toBe('Rechercher un donjon…');
  });

  it('strategyView setter persists value', () => {
    expect(useAppStore.getState().strategyView).toBe('short');
    useAppStore.getState().setStrategyView('long');
    expect(useAppStore.getState().strategyView).toBe('long');
  });

  it('partialize only persists query, lang, strategyView', () => {
    useAppStore.setState({ query: 'vlad', lang: 'en', strategyView: 'long' });
    // Force la ré-hydratation (simule reload)
    const raw = localStorage.getItem('dofus-companion-store');
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.state).toMatchObject({
      query: 'vlad',
      lang: 'en',
      strategyView: 'long',
    });
    // selectedDungeon / isVisible ne doivent PAS être persistés
    expect(parsed.state.selectedDungeon).toBeUndefined();
    expect(parsed.state.isVisible).toBeUndefined();
  });
});
