import { openUrl } from '@tauri-apps/plugin-opener';
import type { Dungeon } from '../types/dungeon';
import { MonsterRow } from './MonsterRow';
import { BossPanel } from './BossPanel';

interface DungeonCardProps {
  dungeon: Dungeon;
  onBack: () => void;
}

export function DungeonCard({ dungeon, onBack }: DungeonCardProps) {
  // Monstres triés par niveau décroissant (plus dangereux en premier)
  const sortedMonsters = [...dungeon.monsters].sort((a, b) => b.level - a.level);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '10px 12px 8px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
          <button
            onClick={onBack}
            title="Retour (Backspace)"
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
              <span>Nv. {dungeon.levelRange[0]}–{dungeon.levelRange[1]}</span>
              <span>·</span>
              <span>{dungeon.monsters.length} monstres + boss</span>
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
                  Voir guide ↗
                </span>
              )}
            </div>
          </div>
        </div>
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
          MONSTRES ({sortedMonsters.length}) — niveau décroissant
        </div>

        {sortedMonsters.map((m) => (
          <MonsterRow key={m.id} monster={m} />
        ))}

        <BossPanel boss={dungeon.boss} />

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
          <span>📖 Données vérifiées</span>
          <span style={{ color: 'var(--text-secondary)' }}>DofusDB</span>
          {dungeon.boss.strategy && (
            <>
              <span>·</span>
              <span>Stratégie</span>
              <span style={{ color: 'var(--text-secondary)' }}>Wiki Fandom EN</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
