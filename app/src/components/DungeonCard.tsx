import { openUrl } from '@tauri-apps/plugin-opener';
import type { Dungeon } from '../types/dungeon';
import { useI18n } from '../i18n/useI18n';
import { useAppStore } from '../store/appStore';
import { StrategyShortView } from '../features/strategy/StrategyShortView';
import { resolveBossView } from '../features/dungeons/resolveBossView';
import { MonsterRow } from './MonsterRow';
import { BossPanel } from './BossPanel';
import { CombatCardView } from './CombatCardView';
import { ViewToggle } from './ViewToggle';

interface DungeonCardProps {
  dungeon: Dungeon;
  onBack: () => void;
}

export function DungeonCard({ dungeon, onBack }: DungeonCardProps) {
  const { t } = useI18n();
  const strategyView = useAppStore((s) => s.strategyView);
  const bossView = resolveBossView(dungeon.boss);
  // Monstres triés par niveau décroissant (plus dangereux en premier)
  const sortedMonsters = [...dungeon.monsters].sort((a, b) => b.level - a.level);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '10px 12px 8px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
          <button
            onClick={onBack}
            title={t.dungeon.backTitle}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '1px 4px',
              fontSize: 14,
              flexShrink: 0,
              lineHeight: 1,
              borderRadius: 'var(--radius-sm)',
            }}
            onMouseEnter={(e) => ((e.target as HTMLElement).style.color = 'var(--accent)')}
            onMouseLeave={(e) => ((e.target as HTMLElement).style.color = 'var(--text-muted)')}
          >
            ←
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2
              style={{
                color: 'var(--text-primary)',
                fontSize: 15,
                fontWeight: 700,
                lineHeight: 1.2,
                margin: 0,
              }}
            >
              {dungeon.name}
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
              <span>{t.dungeon.levelRange(dungeon.levelRange[0], dungeon.levelRange[1])}</span>
              <span>·</span>
              <span>{t.dungeon.monstersCount(dungeon.monsters.length)}</span>
              {dungeon.externalGuideUrl && (
                <span
                  onClick={() => openUrl(dungeon.externalGuideUrl!)}
                  style={{
                    color: 'var(--accent)',
                    cursor: 'pointer',
                    marginLeft: 'auto',
                  }}
                  title={dungeon.externalGuideUrl}
                >
                  {t.dungeon.viewGuide} ↗
                </span>
              )}
            </div>
          </div>
        </div>
        {bossView === 'legacy' && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
            <ViewToggle />
          </div>
        )}
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 8 }}>
        {/* Monsters section */}
        <div
          style={{
            padding: '4px 10px 6px',
            color: 'var(--text-muted)',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.08em',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          {t.dungeon.monsters} ({sortedMonsters.length}) — {t.dungeon.monstersSubtitle}
        </div>

        {sortedMonsters.map((m) => (
          <MonsterRow key={m.id} monster={m} />
        ))}

        {/* Boss header toujours affiché */}
        <div
          style={{
            padding: '6px 10px',
            background: 'rgba(232,181,71,0.08)',
            borderTop: '1px solid rgba(232,181,71,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginTop: 8,
          }}
        >
          <span
            style={{
              color: 'var(--accent)',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.08em',
            }}
          >
            {t.dungeon.boss}
          </span>
        </div>
        <MonsterRow monster={dungeon.boss} isBoss />

        {bossView === 'combat' ? (
          <CombatCardView
            card={dungeon.boss.combat}
            legacyStrategies={dungeon.boss.legacyStrategies}
          />
        ) : strategyView === 'short' ? (
          <StrategyShortView bundle={dungeon.boss.strategies} />
        ) : (
          <BossPanel boss={dungeon.boss} />
        )}

        {/* Source credit */}
        <div
          style={{
            padding: '10px 10px 4px',
            color: 'var(--text-muted)',
            fontSize: 10,
            display: 'flex',
            gap: 6,
            flexWrap: 'wrap',
          }}
        >
          <span>📖 {t.dungeon.verified}</span>
          <span style={{ color: 'var(--text-secondary)' }}>{t.source.dofusdb}</span>
        </div>
      </div>
    </div>
  );
}
