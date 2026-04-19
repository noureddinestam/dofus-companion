import { useEffect, useRef, useState, useCallback } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import './styles/globals.css';
import { TitleBar } from './components/TitleBar';
import { DungeonCard } from './components/DungeonCard';
import { SettingsPanel } from './components/SettingsPanel';
import { useDungeons } from './features/dungeons/useDungeons';
import { useSearch, type SearchResult } from './features/search/useSearch';
import { useUpdater } from './hooks/useUpdater';
import { useFirstRun } from './hooks/useFirstRun';
import { useStartupNotification } from './hooks/useStartupNotification';
import { useOverlayPresentation } from './hooks/useOverlayPresentation';
import { useLangSync } from './hooks/useLangSync';
import { useSettings } from './features/settings/useSettings';
import { useI18n } from './i18n/useI18n';
import { localizedName } from './i18n/localized';
import { useAppStore } from './store/appStore';
import { CombatCardPlayground } from './features/combat/CombatCardPlayground';
import { SettingsPanelPlayground } from './features/settings/SettingsPanelPlayground';
import { MonsterView } from './features/monsters/MonsterView';
import { WelcomeOverlay } from './components/WelcomeOverlay';
import pkg from '../package.json';
import type { Dungeon } from './types/dungeon';

const APP_VERSION: string = pkg.version;

type AppMode = 'search' | 'monster';

function playgroundMode(): 'combat' | 'settings' | null {
  if (typeof window === 'undefined') return null;
  const value = new URLSearchParams(window.location.search).get('playground');
  if (value === 'combat' || value === 'settings') return value;
  return null;
}

function levelBadgeColor(level: number): string {
  if (level >= 180) return 'var(--priority-critical)';
  if (level >= 150) return 'var(--priority-danger)';
  if (level >= 100) return 'var(--priority-caution)';
  return 'var(--priority-manageable)';
}

export default function App() {
  const pg = playgroundMode();
  if (pg === 'combat') return <CombatCardPlayground />;
  if (pg === 'settings') return <SettingsPanelPlayground />;
  return <AppMain />;
}

function AppMain() {
  const { dungeons } = useDungeons();
  const [query, setQuery] = useState('');
  const { results, setQuery: setDebouncedQuery } = useSearch(dungeons);
  const [selected, setSelected] = useState<Dungeon | null>(null);
  const [highlightedMonsterId, setHighlightedMonsterId] = useState<string | null>(null);
  const [mode, setMode] = useState<AppMode>('search');
  const [focusIdx, setFocusIdx] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const { update, install, dismiss } = useUpdater();
  const { isFirstRun, completeFirstRun } = useFirstRun();
  const { settings, updateAppearance } = useSettings();
  const { t } = useI18n();

  useOverlayPresentation(settings);
  useLangSync(settings);

  useStartupNotification({
    title: 'Dofus Companion',
    body: 'Ouvert en arrière-plan · Alt+D pour afficher',
    enabled: settings?.notifications.showStartupToast ?? true,
    // We skip the toast while the welcome overlay is up — the user already
    // sees the app. After dismissal the hook does nothing further because
    // its timer fires once at mount.
    isOverlayVisible: () => isFirstRun === true,
  });

  const openSettings = useCallback(() => setSettingsOpen(true), []);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);

  const toggleLangPersisted = useCallback(() => {
    if (!settings) return;
    const next = settings.appearance.lang === 'fr' ? 'en' : 'fr';
    void updateAppearance({ lang: next });
  }, [settings, updateAppearance]);
  const strategyView = useAppStore((s) => s.strategyView);
  const setStrategyView = useAppStore((s) => s.setStrategyView);

  const toggleView = useCallback(() => {
    setStrategyView(strategyView === 'short' ? 'long' : 'short');
  }, [strategyView, setStrategyView]);

  const handleQueryChange = useCallback(
    (q: string) => {
      setQuery(q);
      setDebouncedQuery(q);
      setFocusIdx(0);
    },
    [setDebouncedQuery],
  );

  const openResult = useCallback((r: SearchResult) => {
    setSelected(r.dungeon);
    setHighlightedMonsterId(r.matchedMonsterId);
    searchRef.current?.blur();
  }, []);

  const goBack = useCallback(() => {
    setSelected(null);
    setHighlightedMonsterId(null);
    setTimeout(() => searchRef.current?.focus(), 50);
  }, []);

  const enterMonsterMode = useCallback(() => {
    setSelected(null);
    setHighlightedMonsterId(null);
    setMode('monster');
  }, []);

  const exitMonsterMode = useCallback(() => {
    setMode('search');
    setTimeout(() => searchRef.current?.focus(), 50);
  }, []);

  const openDungeonFromMonsterView = useCallback((dungeon: Dungeon, monsterId: string) => {
    setMode('search');
    setSelected(dungeon);
    setHighlightedMonsterId(monsterId);
  }, []);

  useEffect(() => {
    const down = async (e: KeyboardEvent) => {
      // Ctrl+L global : bascule langue
      if (e.ctrlKey && e.key.toLowerCase() === 'l') {
        const inInput =
          document.activeElement instanceof HTMLInputElement ||
          document.activeElement instanceof HTMLTextAreaElement;
        if (!inInput) {
          e.preventDefault();
          toggleLangPersisted();
          return;
        }
      }

      // Ctrl+M : bascule vue monstre dédiée (depuis n'importe quel mode)
      if (e.ctrlKey && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        if (mode === 'monster') {
          exitMonsterMode();
        } else {
          enterMonsterMode();
        }
        return;
      }

      // Pendant qu'on est en mode monstre, MonsterView gère ses propres raccourcis.
      if (mode === 'monster') return;

      if (selected) {
        const inInput =
          document.activeElement instanceof HTMLInputElement ||
          document.activeElement instanceof HTMLTextAreaElement;

        // V ou Tab : bascule Actionnable ⇄ Détaillée (hors input)
        if (!inInput && (e.key === 'v' || e.key === 'V' || e.key === 'Tab')) {
          e.preventDefault();
          toggleView();
          return;
        }

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
          if (results[focusIdx]) openResult(results[focusIdx]);
          break;
      }
    };

    window.addEventListener('keydown', down);
    return () => window.removeEventListener('keydown', down);
  }, [
    selected,
    results,
    focusIdx,
    goBack,
    openResult,
    toggleLangPersisted,
    toggleView,
    mode,
    enterMonsterMode,
    exitMonsterMode,
  ]);

  // Focus search on mount
  useEffect(() => {
    setTimeout(() => searchRef.current?.focus(), 100);
  }, []);

  // Re-focus search when window comes back into focus (Alt+D toggle from Dofus)
  useEffect(() => {
    const win = getCurrentWindow();
    let unlisten: (() => void) | null = null;
    win.onFocusChanged(({ payload: focused }) => {
      if (focused && !selected && mode !== 'monster') {
        setTimeout(() => searchRef.current?.focus(), 60);
      }
    }).then((fn) => { unlisten = fn; });
    return () => { unlisten?.(); };
  }, [selected, mode]);

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
      <TitleBar
        query={query}
        onQueryChange={handleQueryChange}
        searchRef={searchRef}
        onOpenSettings={openSettings}
      />

      {update && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: 'var(--density-pad-alert)',
          background: 'rgba(232,181,71,0.12)',
          borderBottom: '1px solid rgba(232,181,71,0.3)',
          flexShrink: 0,
        }}>
          <span style={{ color: 'var(--accent)', fontSize: 11, flex: 1 }}>
            {t.update.available(update.version)}
          </span>
          <button
            onClick={install}
            disabled={update.installing}
            style={{
              background: 'var(--accent)',
              color: '#0c0e12',
              border: 'none',
              borderRadius: 3,
              padding: 'var(--density-pad-chip-sm)',
              fontSize: 10,
              fontWeight: 700,
              cursor: update.installing ? 'wait' : 'pointer',
            }}
          >
            {update.installing ? '…' : t.update.install}
          </button>
          <button
            onClick={dismiss}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: 12,
              cursor: 'pointer',
              padding: '0 2px',
            }}
          >
            ×
          </button>
        </div>
      )}

      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {mode === 'monster' ? (
          <MonsterView
            dungeons={dungeons}
            onExit={exitMonsterMode}
            onOpenDungeon={openDungeonFromMonsterView}
          />
        ) : selected ? (
          <DungeonCard
            dungeon={selected}
            onBack={goBack}
            highlightedMonsterId={highlightedMonsterId}
          />
        ) : (
          <SearchView
            results={results}
            focusIdx={focusIdx}
            onSelect={openResult}
            onHover={setFocusIdx}
          />
        )}
      </div>

      <Footer selected={selected} mode={mode} />

      {isFirstRun === true && <WelcomeOverlay onDismiss={completeFirstRun} />}

      <SettingsPanel open={settingsOpen} onClose={closeSettings} appVersion={APP_VERSION} />
    </div>
  );
}

function SearchView({
  results,
  focusIdx,
  onSelect,
  onHover,
}: {
  results: SearchResult[];
  focusIdx: number;
  onSelect: (r: SearchResult) => void;
  onHover: (i: number) => void;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const { t, lang } = useI18n();

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
        <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{t.search.empty}</span>
        <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{t.search.hintExamples}</span>
      </div>
    );
  }

  return (
    <div ref={rowRef} style={{ height: '100%', overflowY: 'auto' }}>
      {results.map((r, i) => {
        const d = r.dungeon;
        const isFocused = i === focusIdx;
        const matchedMonster = r.matchedMonsterId
          ? d.monsters.find((m) => m.id === r.matchedMonsterId)
          : null;
        return (
          <div
            key={`${d.id}-${r.matchedMonsterId ?? 'boss'}`}
            data-idx={i}
            onClick={() => onSelect(r)}
            onMouseEnter={() => onHover(i)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: 'var(--density-pad-row-lg)',
              cursor: 'pointer',
              background: isFocused ? 'var(--bg-hover)' : 'transparent',
              borderBottom: '1px solid var(--border-subtle)',
              transition: 'background var(--duration-fast)',
              borderLeft: isFocused ? '2px solid var(--accent)' : '2px solid transparent',
            }}
          >
            <span
              style={{
                color: levelBadgeColor(d.recommendedLevel),
                fontSize: 12,
                fontWeight: 700,
                fontVariantNumeric: 'tabular-nums',
                flexShrink: 0,
                minWidth: 30,
                textAlign: 'center',
              }}
            >
              {d.recommendedLevel}
            </span>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                color: 'var(--text-primary)',
                fontSize: 13,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {localizedName(d, lang)}
              </div>
              <div style={{
                color: 'var(--text-muted)',
                fontSize: 11,
                marginTop: 1,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {matchedMonster ? (
                  <span style={{ color: 'var(--accent)' }}>↳ {localizedName(matchedMonster, lang)}</span>
                ) : (
                  <>
                    {t.dungeon.bossPrefix} {localizedName(d.boss, lang)}
                  </>
                )}
              </div>
            </div>

            {d.boss.strategy && (
              <span
                title={t.dungeon.strategyAvailable}
                style={{ fontSize: 10, color: 'var(--accent)', flexShrink: 0 }}
              >
                ✦
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Footer({ selected, mode }: { selected: Dungeon | null; mode: AppMode }) {
  const { t } = useI18n();
  const hints: Array<[string, string]> =
    mode === 'monster'
      ? [
          ['↑↓', t.footer.navigate],
          ['Enter', t.footer.open],
          ['Backspace', t.dungeon.back],
          ['Ctrl+M', t.footer.monsterView],
        ]
      : selected
        ? [
            ['Backspace', t.dungeon.back],
            ['V', t.footer.switchView],
            ['Ctrl+M', t.footer.monsterView],
            ['Esc', t.footer.close],
          ]
        : [
            ['↑↓', t.footer.navigate],
            ['Enter', t.footer.open],
            ['Ctrl+M', t.footer.monsterView],
            ['/', t.footer.search],
            ['Ctrl+L', t.footer.switchLang],
          ];

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      gap: 16,
      padding: 'var(--density-pad-alert-wide)',
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
            padding: 'var(--density-pad-chip-pill)',
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
