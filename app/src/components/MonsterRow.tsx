import { useEffect, useRef } from 'react';
import type { Monster } from '../types/dungeon';
import { ELEMENT_ICON } from '../types/dungeon';
import { useI18n } from '../i18n/useI18n';
import { localizedName } from '../i18n/localized';
import { isCombatCardEmpty } from '../types/combat-card';
import { CombatCardView } from './CombatCardView';

interface MonsterRowProps {
  monster: Monster;
  isBoss?: boolean;
  /** When true, scroll this row into view on mount and play a brief highlight pulse. */
  highlighted?: boolean;
}

export function MonsterRow({ monster, isBoss = false, highlighted = false }: MonsterRowProps) {
  const { t, lang } = useI18n();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!highlighted) return;
    const el = rootRef.current;
    if (!el) return;
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [highlighted]);

  // Boss card is rendered by DungeonCard (via CombatCardView full mode) — here we
  // only render the row header to keep a single source of truth for boss combat.
  const showCompactCard = !isBoss && !isCombatCardEmpty(monster.combat);

  return (
    <div
      ref={rootRef}
      className={highlighted ? 'monster-row monster-row--highlighted' : 'monster-row'}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: 'var(--density-pad-row)',
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
          {localizedName(monster, lang)}
        </span>

        {showCompactCard && (
          <span
            aria-hidden
            title={t.combat.dangers}
            style={{ fontSize: 11, color: 'var(--combat-dangers-accent)', flexShrink: 0 }}
          >
            ⚡
          </span>
        )}

        {monster.family && monster.family !== 'Inconnu' && (
          <span style={{ color: 'var(--text-muted)', fontSize: 10, flexShrink: 0 }}>
            {localizedName({ name: monster.family, nameEn: monster.familyEn }, lang)}
          </span>
        )}

        <span
          style={{
            color: 'var(--text-secondary)',
            fontSize: 11,
            flexShrink: 0,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {t.element.levelShort(monster.level)}
        </span>

        {monster.hp && (
          <span
            style={{
              color: 'var(--text-muted)',
              fontSize: 10,
              flexShrink: 0,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {t.element.hpValue(monster.hp)}
          </span>
        )}

        <ElementBadges weak={monster.weakElement} resist={monster.resistElement} />
      </div>

      {showCompactCard && <CombatCardView card={monster.combat} compact />}
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
  const { t } = useI18n();
  if (!weak && !resist) return null;
  return (
    <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
      {weak && (
        <span title={`${t.element.weakness} : ${weak}`} style={{ fontSize: 11 }}>
          {ELEMENT_ICON[weak]}
        </span>
      )}
      {resist && (
        <span title={`${t.element.resistance} : ${resist}`} style={{ fontSize: 11, opacity: 0.5 }}>
          🛡️
        </span>
      )}
    </div>
  );
}
