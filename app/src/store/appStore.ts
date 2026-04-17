import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Dungeon } from '../types/dungeon';

interface AppState {
  query: string;
  selectedDungeon: Dungeon | null;
  isVisible: boolean;
  setQuery: (q: string) => void;
  selectDungeon: (d: Dungeon | null) => void;
  setVisible: (v: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      query: '',
      selectedDungeon: null,
      isVisible: true,
      setQuery: (query) => set({ query }),
      selectDungeon: (selectedDungeon) => set({ selectedDungeon }),
      setVisible: (isVisible) => set({ isVisible }),
    }),
    {
      name: 'dofus-companion-store',
      partialize: (state) => ({ query: state.query }),
    },
  ),
);
