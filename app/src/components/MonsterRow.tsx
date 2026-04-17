import type { Monster } from '../types/dungeon';
import { ELEMENT_ICON } from '../types/dungeon';

interface MonsterRowProps {
  monster: Monster;
  isBoss?: boolean;
}

export function MonsterRow({ monster, isBoss = false }: MonsterRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '7px 10px',
        borderBottom: '1px solid var(--border-subtle)',
        background: isBoss ? 'rgba(232,181,71,0.05)' : 'transparent',
      }}
    >
      <span
        style={{
          fontWeight: isBoss ? 700 : 600,
          color: isBoss ? 'var(--accent)' : 'var(--text-primary)',
          fontSize: 13,
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {monster.name}
      </span>

      {monster.family && monster.family !== 'Inconnu' && (
        <span style={{ color: 'var(--text-muted)', fontSize: 10, flexShrink: 0 }}>
          {monster.family}
        </span>
      )}

      <span style={{ color: 'var(--text-secondary)', fontSize: 11, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
        Nv.{monster.level}
      </span>

      {monster.hp && (
        <span style={{ color: 'var(--text-muted)', fontSize: 10, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
          {monster.hp.toLocaleString('fr-FR')} PV
        </span>
      )}

      <ElementBadges weak={monster.weakElement} resist={monster.resistElement} />
    </div>
  );
}

function ElementBadges({
  weak,
  resist,
}: {
  weak: Monster['weakElement'];
  resist: Monster['resistElement'];
}) {
  if (!weak && !resist) return null;
  return (
    <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
      {weak && (
        <span title={`Faiblesse : ${weak}`} style={{ fontSize: 11 }}>
          {ELEMENT_ICON[weak]}
        </span>
      )}
      {resist && (
        <span title={`Résistance : ${resist}`} style={{ fontSize: 11, opacity: 0.5 }}>
          🛡️
        </span>
      )}
    </div>
  );
}
