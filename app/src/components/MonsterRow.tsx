import type { Monster } from '../types/dungeon';

const PRIORITY_ICON: Record<Monster['priority'], string> = {
  critical: '🔴',
  danger: '🟠',
  caution: '🟡',
  manageable: '🟢',
};

const PRIORITY_COLOR: Record<Monster['priority'], string> = {
  critical: 'var(--priority-critical)',
  danger: 'var(--priority-danger)',
  caution: 'var(--priority-caution)',
  manageable: 'var(--priority-manageable)',
};

const ELEMENT_ICON: Record<string, string> = {
  air: '💨',
  eau: '💧',
  feu: '🔥',
  terre: '🌍',
  neutre: '⚪',
};

interface MonsterRowProps {
  monster: Monster;
  isBoss?: boolean;
}

export function MonsterRow({ monster, isBoss = false }: MonsterRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        padding: '8px 10px',
        borderBottom: '1px solid var(--border-subtle)',
        background: isBoss ? 'rgba(232,181,71,0.05)' : 'transparent',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 13, flexShrink: 0 }}>{PRIORITY_ICON[monster.priority]}</span>
        <span style={{
          fontWeight: isBoss ? 700 : 600,
          color: isBoss ? 'var(--accent)' : 'var(--text-primary)',
          fontSize: 13,
          flex: 1,
        }}>
          {monster.name}
        </span>
        <span style={{ color: 'var(--text-muted)', fontSize: 11, flexShrink: 0 }}>
          Nv.{monster.level}
        </span>
        <ElementBadges weak={monster.weakElement} resist={monster.resistElement} />
      </div>

      <p style={{
        color: PRIORITY_COLOR[monster.priority],
        fontSize: 11,
        paddingLeft: 21,
        opacity: 0.9,
        lineHeight: 1.4,
      }}>
        {monster.priorityReason}
      </p>

      {monster.keyMechanic && (
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: 11,
          paddingLeft: 21,
          lineHeight: 1.4,
          fontStyle: 'italic',
        }}>
          ⚡ {monster.keyMechanic}
        </p>
      )}
    </div>
  );
}

function ElementBadges({ weak, resist }: { weak: Monster['weakElement']; resist: Monster['resistElement'] }) {
  if (!weak && !resist) return null;
  return (
    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
      {weak && (
        <span title={`Faiblesse: ${weak}`} style={{ fontSize: 11 }}>
          {ELEMENT_ICON[weak]}
        </span>
      )}
      {resist && (
        <span title={`Résistance: ${resist}`} style={{ fontSize: 11, opacity: 0.5 }}>
          🛡️
        </span>
      )}
    </div>
  );
}
