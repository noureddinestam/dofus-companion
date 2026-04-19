import type { ActionableBullet } from '../../types/dungeon';

// Icône par type — scannable en un coup d'œil
const ICON: Record<ActionableBullet['icon'], string> = {
  priority: '◎',
  avoid: '⊘',
  element: '▲',
  position: '◈',
  phase: '↻',
  instakill: '✕',
  cooldown: '◷',
  summon: '※',
  tip: '◉',
};

const SEVERITY_COLOR: Record<ActionableBullet['severity'], string> = {
  critical: 'var(--priority-critical)',
  danger: 'var(--priority-danger)',
  caution: 'var(--priority-caution)',
  info: 'var(--text-secondary)',
};

export function BulletRow({ bullet }: { bullet: ActionableBullet }) {
  const isCritical = bullet.severity === 'critical';
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: 'var(--density-pad-row-sm)',
        borderLeft: `2px solid ${SEVERITY_COLOR[bullet.severity]}`,
        background: isCritical ? 'rgba(239,68,68,0.07)' : 'transparent',
        borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
        marginBottom: 4,
      }}
    >
      <span
        aria-hidden
        style={{
          color: SEVERITY_COLOR[bullet.severity],
          fontSize: 14,
          fontWeight: 700,
          lineHeight: 1.2,
          flexShrink: 0,
          minWidth: 14,
          textAlign: 'center',
        }}
      >
        {ICON[bullet.icon]}
      </span>
      <span
        style={{
          color: 'var(--text-primary)',
          fontSize: 12,
          lineHeight: 1.4,
          flex: 1,
        }}
      >
        {bullet.text}
      </span>
    </div>
  );
}
