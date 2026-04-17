import type { Dungeon } from '../types/dungeon';
import { MonsterRow } from './MonsterRow';
import { BossPanel } from './BossPanel';

const PRIORITY_ORDER = { critical: 0, danger: 1, caution: 2, manageable: 3 };

interface DungeonCardProps {
  dungeon: Dungeon;
  onBack: () => void;
}

export function DungeonCard({ dungeon, onBack }: DungeonCardProps) {
  const sortedMonsters = [...dungeon.monsters].sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority],
  );

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
          <div style={{ flex: 1 }}>
            <h2 style={{
              color: 'var(--text-primary)',
              fontSize: 15,
              fontWeight: 700,
              lineHeight: 1.2,
              margin: 0,
            }}>
              {dungeon.name}
            </h2>
            <div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 3, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span>📍 {dungeon.zone}</span>
              <span>Nv. {dungeon.levelRange[0]}–{dungeon.levelRange[1]}</span>
              <span>{dungeon.rooms} salles</span>
              {dungeon.keyRequired && <span style={{ color: 'var(--accent)' }}>🔑 Clé requise</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 8 }}>
        {/* Monsters section */}
        <div style={{
          padding: '4px 10px 6px',
          color: 'var(--text-muted)',
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.08em',
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          MONSTRES — triés par priorité
        </div>

        {sortedMonsters.map((m) => (
          <MonsterRow key={m.id} monster={m} />
        ))}

        {/* Boss section */}
        <BossPanel boss={dungeon.boss} />

        {/* Source credit */}
        <div style={{
          padding: '8px 10px 4px',
          color: 'var(--text-muted)',
          fontSize: 10,
        }}>
          📖 Source : {dungeon.boss.source === 'manual' ? 'saisie manuelle · non vérifiée' : dungeon.boss.source}
          {!dungeon.boss.verified && ' ⚠'}
        </div>
      </div>
    </div>
  );
}
