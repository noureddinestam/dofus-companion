import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import type { Dungeon } from '../../types/dungeon';
import { ELEMENT_ICON } from '../../types/dungeon';
import { useI18n } from '../../i18n/useI18n';
import { localizedName } from '../../i18n/localized';
import { CombatCardView } from '../../components/CombatCardView';
import {
  buildMonsterIndex,
  filterMonsterEntries,
  monsterIndexToSortedList,
  type MonsterIndexEntry,
} from './monsterIndex';

interface MonsterViewProps {
  dungeons: Dungeon[];
  onExit: () => void;
  onOpenDungeon: (dungeon: Dungeon, monsterId: string) => void;
}

function levelColor(level: number): string {
  if (level >= 180) return 'var(--priority-critical)';
  if (level >= 150) return 'var(--priority-danger)';
  if (level >= 100) return 'var(--priority-caution)';
  return 'var(--priority-manageable)';
}

export function MonsterView({ dungeons, onExit, onOpenDungeon }: MonsterViewProps) {
  const { t, lang } = useI18n();
  const [query, setQuery] = useState('');
  const [focusIdx, setFocusIdx] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const allEntries = useMemo(() => monsterIndexToSortedList(buildMonsterIndex(dungeons)), [dungeons]);
  const filtered = useMemo(() => filterMonsterEntries(allEntries, query), [allEntries, query]);
  const selected = useMemo<MonsterIndexEntry | null>(() => {
    if (!selectedId) return null;
    return allEntries.find((e) => e.monster.id === selectedId) ?? null;
  }, [allEntries, selectedId]);

  useEffect(() => {
    setTimeout(() => searchRef.current?.focus(), 50);
  }, []);

  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${focusIdx}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [focusIdx]);

  // When the filter shrinks, bring focus back into range.
  useEffect(() => {
    if (focusIdx >= filtered.length) setFocusIdx(Math.max(0, filtered.length - 1));
  }, [filtered.length, focusIdx]);

  const openSelected = useCallback(
    (entry: MonsterIndexEntry) => {
      setSelectedId(entry.monster.id);
    },
    [],
  );

  const closeDetail = useCallback(() => {
    setSelectedId(null);
    setTimeout(() => searchRef.current?.focus(), 40);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (selectedId) {
        if (e.key === 'Escape' || e.key === 'Backspace') {
          const inInput =
            document.activeElement instanceof HTMLInputElement ||
            document.activeElement instanceof HTMLTextAreaElement;
          if (e.key === 'Backspace' && inInput) return;
          e.preventDefault();
          closeDetail();
        }
        return;
      }
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          onExit();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusIdx((i) => Math.min(i + 1, filtered.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusIdx((i) => Math.max(i - 1, 0));
          break;
        case 'Enter':
          if (filtered[focusIdx]) {
            e.preventDefault();
            openSelected(filtered[focusIdx]);
          }
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedId, filtered, focusIdx, onExit, openSelected, closeDetail]);

  if (selected) {
    return (
      <MonsterDetail
        entry={selected}
        onBack={closeDetail}
        onOpenDungeon={(d) => onOpenDungeon(d, selected.monster.id)}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: 'var(--density-pad-header-sm)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <button
            onClick={onExit}
            title={t.monsterView.backToSearch}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: 'var(--density-pad-backbtn)',
              fontSize: 14,
              lineHeight: 1,
            }}
          >
            ←
          </button>
          <span
            style={{
              color: 'var(--text-muted)',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.08em',
            }}
          >
            {t.monsterView.title} ({allEntries.length})
          </span>
        </div>
        <input
          ref={searchRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setFocusIdx(0);
          }}
          placeholder={t.monsterView.searchPlaceholder}
          style={{
            width: '100%',
            padding: 'var(--density-pad-row-sm)',
            background: 'var(--bg-hover)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-primary)',
            fontSize: 12,
            fontFamily: 'var(--font-ui)',
            outline: 'none',
          }}
        />
      </div>

      <div ref={listRef} style={{ flex: 1, overflowY: 'auto' }}>
        {filtered.length === 0 ? (
          <div
            style={{
              padding: 16,
              color: 'var(--text-muted)',
              fontSize: 12,
              textAlign: 'center',
            }}
          >
            {t.monsterView.noResults}
          </div>
        ) : (
          filtered.map((entry, i) => {
            const m = entry.monster;
            const isFocused = i === focusIdx;
            return (
              <div
                key={m.id}
                data-idx={i}
                onClick={() => openSelected(entry)}
                onMouseEnter={() => setFocusIdx(i)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: 'var(--density-pad-item)',
                  cursor: 'pointer',
                  background: isFocused ? 'var(--bg-hover)' : 'transparent',
                  borderBottom: '1px solid var(--border-subtle)',
                  borderLeft: isFocused ? '2px solid var(--accent)' : '2px solid transparent',
                }}
              >
                <span
                  style={{
                    color: levelColor(m.level),
                    fontSize: 11,
                    fontWeight: 700,
                    minWidth: 28,
                    textAlign: 'center',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {m.level}
                </span>
                <span
                  style={{
                    flex: 1,
                    minWidth: 0,
                    color: 'var(--text-primary)',
                    fontSize: 12,
                    fontWeight: 600,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {localizedName(m, lang)}
                </span>
                {m.weakElement && (
                  <span style={{ fontSize: 11 }} aria-hidden>
                    {ELEMENT_ICON[m.weakElement]}
                  </span>
                )}
                <span style={{ color: 'var(--text-muted)', fontSize: 10, flexShrink: 0 }}>
                  {entry.dungeons.length}×
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function MonsterDetail({
  entry,
  onBack,
  onOpenDungeon,
}: {
  entry: MonsterIndexEntry;
  onBack: () => void;
  onOpenDungeon: (d: Dungeon) => void;
}) {
  const { t, lang } = useI18n();
  const m = entry.monster;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: 'var(--density-pad-header)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <button
            onClick={onBack}
            title={t.dungeon.backTitle}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: 'var(--density-pad-backbtn)',
              fontSize: 14,
              lineHeight: 1,
            }}
          >
            ←
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2
              style={{
                color: 'var(--text-primary)',
                fontSize: 15,
                fontWeight: 700,
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              {localizedName(m, lang)}
            </h2>
            <div
              style={{
                color: 'var(--text-muted)',
                fontSize: 11,
                marginTop: 3,
                display: 'flex',
                gap: 10,
                flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              <span style={{ color: levelColor(m.level) }}>{t.element.levelShort(m.level)}</span>
              {m.family && m.family !== 'Inconnu' && (
                <span>{localizedName({ name: m.family, nameEn: m.familyEn }, lang)}</span>
              )}
              {m.hp && <span>{t.element.hpValue(m.hp)}</span>}
              {m.weakElement && (
                <span>
                  {t.element.weakness} {ELEMENT_ICON[m.weakElement]}
                </span>
              )}
              {m.resistElement && (
                <span>
                  {t.element.resistance} {ELEMENT_ICON[m.resistElement]}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <CombatCardView card={m.combat} />

        <div
          style={{
            margin: '10px 10px 4px',
            padding: 'var(--density-pad-row-sm)',
            color: 'var(--text-muted)',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.08em',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          {t.monsterView.encounteredIn(entry.dungeons.length)}
        </div>
        {entry.dungeons.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => onOpenDungeon(d)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              width: '100%',
              padding: 'var(--density-pad-item)',
              background: 'transparent',
              border: 'none',
              borderBottom: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              fontSize: 12,
              fontFamily: 'var(--font-ui)',
              cursor: 'pointer',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => ((e.currentTarget.style.background = 'var(--bg-hover)'))}
            onMouseLeave={(e) => ((e.currentTarget.style.background = 'transparent'))}
          >
            <span
              style={{
                color: levelColor(d.recommendedLevel),
                fontSize: 11,
                fontWeight: 700,
                minWidth: 28,
                textAlign: 'center',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {d.recommendedLevel}
            </span>
            <span style={{ flex: 1, minWidth: 0, fontWeight: 600 }}>{localizedName(d, lang)}</span>
            <span style={{ color: 'var(--accent)', fontSize: 10 }}>↗</span>
          </button>
        ))}
      </div>
    </div>
  );
}
