import { useEffect, useRef, useState, useCallback } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import './styles/globals.css';
import { TitleBar } from './components/TitleBar';
import { DungeonCard } from './components/DungeonCard';
import { useDungeons } from './features/dungeons/useDungeons';
import { useSearch } from './features/search/useSearch';
import type { Dungeon } from './types/dungeon';

const PRIORITY_ICON: Record<string, string> = {
  critical: '🔴',
  danger: '🟠',
  caution: '🟡',
  manageable: '🟢',
};

export default function App() {
  const { dungeons } = useDungeons();
  const [query, setQuery] = useState('');
  const { results, setQuery: setDebouncedQuery } = useSearch(dungeons);
  const [selected, setSelected] = useState<Dungeon | null>(null);
  const [focusIdx, setFocusIdx] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);

  const handleQueryChange = useCallback(
    (q: string) => {
      setQuery(q);
      setDebouncedQuery(q);
      setFocusIdx(0);
    },
    [setDebouncedQuery],
  );

  const openDungeon = useCallback((d: Dungeon) => {
    setSelected(d);
    searchRef.current?.blur();
  }, []);

  const goBack = useCallback(() => {
    setSelected(null);
    setTimeout(() => searchRef.current?.focus(), 50);
  }, []);

  useEffect(() => {
    const down = async (e: KeyboardEvent) => {
      if (selected) {
        if (e.key === 'Escape' || e.key === 'Backspace') {
          if (e.key === 'Backspace' && document.activeElement === searchRef.current) return;
          e.preventDefault();
          goBack();
        }
        return;
      }

      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          await getCurrentWindow().hide();
          break;

        case '/':
        case 'f':
          if (e.ctrlKey || e.key === '/') {
            e.preventDefault();
            searchRef.current?.focus();
            searchRef.current?.select();
          }
          break;

        case 'ArrowDown':
          e.preventDefault();
          setFocusIdx((i) => Math.min(i + 1, results.length - 1));
          break;

        case 'ArrowUp':
          e.preventDefault();
          setFocusIdx((i) => Math.max(i - 1, 0));
          break;

        case 'Enter':
          e.preventDefault();
          if (results[focusIdx]) openDungeon(results[focusIdx]);
          break;
      }
    };

    window.addEventListener('keydown', down);
    return () => window.removeEventListener('keydown', down);
  }, [selected, results, focusIdx, goBack, openDungeon]);

  // Focus search on mount
  useEffect(() => {
    setTimeout(() => searchRef.current?.focus(), 100);
  }, []);

  // Re-focus search when window comes back into focus (Alt+D toggle from Dofus)
  useEffect(() => {
    const win = getCurrentWindow();
    let unlisten: (() => void) | null = null;
    win.onFocusChanged(({ payload: focused }) => {
      if (focused && !selected) {
        setTimeout(() => searchRef.current?.focus(), 60);
      }
    }).then((fn) => { unlisten = fn; });
    return () => { unlisten?.(); };
  }, [selected]);

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-base)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-default)',
      overflow: 'hidden',
    }}>
      <TitleBar query={query} onQueryChange={handleQueryChange} searchRef={searchRef} />

      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {selected ? (
          <DungeonCard dungeon={selected} onBack={goBack} />
        ) : (
          <SearchView
            results={results}
            focusIdx={focusIdx}
            onSelect={openDungeon}
            onHover={setFocusIdx}
          />
        )}
      </div>

      <Footer selected={selected} />
    </div>
  );
}

function SearchView({
  results,
  focusIdx,
  onSelect,
  onHover,
}: {
  results: Dungeon[];
  focusIdx: number;
  onSelect: (d: Dungeon) => void;
  onHover: (i: number) => void;
}) {
  const rowRef = useRef<HTMLDivElement>(null);

  // Scroll focused item into view
  useEffect(() => {
    const el = rowRef.current?.querySelector(`[data-idx="${focusIdx}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [focusIdx]);

  if (results.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: 8,
      }}>
        <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Aucun donjon trouvé</span>
        <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>Essayez "frigost", "bouf", "vlad"…</span>
      </div>
    );
  }

  return (
    <div ref={rowRef} style={{ height: '100%', overflowY: 'auto' }}>
      {results.map((d, i) => {
        const topPriority = d.boss.priority;
        const isFocused = i === focusIdx;
        return (
          <div
            key={d.id}
            data-idx={i}
            onClick={() => onSelect(d)}
            onMouseEnter={() => onHover(i)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '9px 12px',
              cursor: 'pointer',
              background: isFocused ? 'var(--bg-hover)' : 'transparent',
              borderBottom: '1px solid var(--border-subtle)',
              transition: 'background var(--duration-fast)',
              borderLeft: isFocused ? '2px solid var(--accent)' : '2px solid transparent',
            }}
          >
            <span style={{ fontSize: 13, flexShrink: 0 }}>{PRIORITY_ICON[topPriority]}</span>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                color: 'var(--text-primary)',
                fontSize: 13,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {d.name}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 1 }}>
                {d.zone} · {d.boss.name}
              </div>
            </div>

            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600 }}>
                {d.recommendedLevel}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: 10 }}>
                {d.continent}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Footer({ selected }: { selected: Dungeon | null }) {
  const hints = selected
    ? [['Backspace', 'Retour'], ['Esc', 'Fermer'], ['↑↓', 'Sections']]
    : [['↑↓', 'Naviguer'], ['Enter', 'Ouvrir'], ['Esc', 'Fermer'], ['/', 'Recherche']];

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      gap: 16,
      padding: '5px 12px',
      borderTop: '1px solid var(--border-subtle)',
      background: 'var(--bg-elevated)',
      borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
      flexShrink: 0,
    }}>
      {hints.map(([key, label]) => (
        <span key={key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <kbd style={{
            background: 'var(--bg-hover)',
            border: '1px solid var(--border-default)',
            borderRadius: 3,
            color: 'var(--text-secondary)',
            fontSize: 10,
            padding: '1px 5px',
            fontFamily: 'var(--font-mono)',
          }}>
            {key}
          </kbd>
          <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>{label}</span>
        </span>
      ))}
    </div>
  );
}
