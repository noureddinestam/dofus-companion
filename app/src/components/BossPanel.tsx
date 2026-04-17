import type { Boss } from '../types/dungeon';
import { MonsterRow } from './MonsterRow';

interface BossPanelProps {
  boss: Boss;
}

export function BossPanel({ boss }: BossPanelProps) {
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{
        padding: '6px 10px',
        background: 'rgba(232,181,71,0.08)',
        borderTop: '1px solid rgba(232,181,71,0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}>
        <span style={{ color: 'var(--accent)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em' }}>
          BOSS
        </span>
      </div>

      <MonsterRow monster={boss} isBoss />

      {boss.phases.length > 0 && (
        <div style={{ padding: '6px 10px 2px' }}>
          {boss.phases.map((phase, i) => (
            <div key={i} style={{ marginBottom: 6 }}>
              <div style={{ color: 'var(--accent)', fontSize: 11, fontWeight: 600 }}>
                ⚡ {phase.trigger}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 11, paddingLeft: 14, lineHeight: 1.4 }}>
                {phase.behavior}
              </div>
            </div>
          ))}
        </div>
      )}

      {boss.instantKillConditions.length > 0 && (
        <div style={{ padding: '4px 10px' }}>
          {boss.instantKillConditions.map((cond, i) => (
            <div key={i} style={{
              color: 'var(--priority-critical)',
              fontSize: 11,
              display: 'flex',
              gap: 5,
              alignItems: 'flex-start',
              lineHeight: 1.4,
              marginBottom: 3,
            }}>
              <span style={{ flexShrink: 0 }}>☠️</span>
              <span>{cond}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{
        margin: '6px 10px 0',
        padding: '7px 9px',
        background: 'var(--bg-hover)',
        borderRadius: 'var(--radius-sm)',
        borderLeft: '2px solid var(--accent)',
      }}>
        <div style={{ color: 'var(--text-muted)', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', marginBottom: 3 }}>
          STRATÉGIE
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 11, lineHeight: 1.5 }}>
          {boss.recommendedStrategy}
        </p>
      </div>

      {boss.recommendedComp.length > 0 && (
        <div style={{ padding: '6px 10px 4px' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', marginBottom: 4 }}>
            COMPO SUGGÉRÉE
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {boss.recommendedComp.map((c, i) => (
              <span key={i} style={{
                background: 'var(--bg-hover)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-secondary)',
                fontSize: 10,
                padding: '2px 6px',
              }}>
                {c}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
