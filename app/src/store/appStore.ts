import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Dungeon } from '../types/dungeon';
import { detectSystemLang } from '../i18n/detectLang';
import type { Lang } from '../i18n/strings';

export type StrategyView = 'short' | 'long';

interface AppState {
  query: string;
  selectedDungeon: Dungeon | null;
  isVisible: boolean;
  lang: Lang;
  strategyView: StrategyView;
  setQuery: (q: string) => void;
  selectDungeon: (d: Dungeon | null) => void;
  setVisible: (v: boolean) => void;
  setLang: (l: Lang) => void;
  setStrategyView: (v: StrategyView) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      query: '',
      selectedDungeon: null,
      isVisible: true,
      lang: detectSystemLang(),
      strategyView: 'short',
      setQuery: (query) => set({ query }),
      selectDungeon: (selectedDungeon) => set({ selectedDungeon }),
      setVisible: (isVisible) => set({ isVisible }),
      setLang: (lang) => set({ lang }),
      setStrategyView: (strategyView) => set({ strategyView }),
    }),
    {
      name: 'dofus-companion-store',
      partialize: (state) => ({
        query: state.query,
        lang: state.lang,
        strategyView: state.strategyView,
      }),
    },
  ),
);
