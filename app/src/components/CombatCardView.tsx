import type { ReactNode } from 'react';
import type { Bullet, CombatCard } from '../types/combat-card';
import {
  COMBAT_BLOCK_ORDER,
  isCombatCardEmpty,
  partitionUnlock,
} from '../types/combat-card';
import { useI18n } from '../i18n/useI18n';
import { ProvenanceBadge } from '../features/strategy/ProvenanceBadge';

type RenderedBlockKey = 'unlock' | 'dangers' | 'tips';

interface CombatCardViewProps {
  card: CombatCard | null;
  /** v0.4 bullets / long text, preserved pendant la transition v0.5.x.
   *  Rendu dans un <details> collapsé sous la card si présent. */
  legacyStrategies?: string[];
  /** Optional footer slot (e.g. custom legacy notes). Rendered under provenance. */
  footer?: ReactNode;
  /** Compact variant for inline rendering under a MonsterRow. */
  compact?: boolean;
}

const BLOCK_EMOJI: Record<RenderedBlockKey, string> = {
  unlock: '🔓',
  dangers: '❌',
  tips: '💡',
};

export function CombatCardView({ card, legacyStrategies, footer, compact }: CombatCardViewProps) {
  const { t } = useI18n();

  // Silence rule : un monstre lambda (card === null) ou card entièrement vide → aucun rendu.
  if (isCombatCardEmpty(card)) return null;

  const blockLabels: Record<RenderedBlockKey, string> = {
    unlock: t.combat.unlock,
    dangers: t.combat.dangers,
    tips: t.combat.tips,
  };

  const unlockPartition = partitionUnlock(card!);
  const showUnlockSubLabels =
    unlockPartition.context.length > 0 && unlockPartition.action.length > 0;

  // Provenance globale : on prend le premier bullet trouvé dans l'ordre des blocs.
  const firstBullet = firstBulletOf(card!);

  return (
    <div className={compact ? 'combat-card combat-card--compact' : 'combat-card'}>
      {COMBAT_BLOCK_ORDER.map((key) => {
        if (key === 'unlock') {
          const total = unlockPartition.context.length + unlockPartition.action.length;
          if (total === 0) return null;
          return (
            <div key={key} className="combat-card__block combat-card__block--unlock">
              <div className="combat-card__title combat-card__title--unlock">
                <span aria-hidden>{BLOCK_EMOJI.unlock}</span>
                <span>{blockLabels.unlock}</span>
              </div>
              {unlockPartition.context.length > 0 && (
                <div className="combat-card__subsection">
                  {showUnlockSubLabels && (
                    <p className="combat-card__subsection-label">{t.combat.unlockContext}</p>
                  )}
                  <div className="combat-card__bullets">
                    {unlockPartition.context.map((b, i) => (
                      <BulletLine key={`ctx-${i}`} bullet={b} />
                    ))}
                  </div>
                </div>
              )}
              {unlockPartition.action.length > 0 && (
                <div className="combat-card__subsection">
                  {showUnlockSubLabels && (
                    <p className="combat-card__subsection-label">{t.combat.unlockActions}</p>
                  )}
                  <ol className="combat-card__bullets combat-card__bullets--numbered">
                    {unlockPartition.action.map((b, i) => (
                      <BulletLine key={`act-${i}`} bullet={b} numbered />
                    ))}
                  </ol>
                </div>
              )}
            </div>
          );
        }
        const bullets = card![key];
        if (bullets.length === 0) return null;
        return (
          <div key={key} className={`combat-card__block combat-card__block--${key}`}>
            <div className={`combat-card__title combat-card__title--${key}`}>
              <span aria-hidden>{BLOCK_EMOJI[key]}</span>
              <span>{blockLabels[key]}</span>
            </div>
            <div className="combat-card__bullets">
              {bullets.map((b, i) => (
                <BulletLine key={i} bullet={b} />
              ))}
            </div>
          </div>
        );
      })}

      {firstBullet && (
        <div className="combat-card__provenance">
          <ProvenanceBadge provenance={firstBullet.provenance} />
        </div>
      )}

      {legacyStrategies && legacyStrategies.length > 0 && (
        <details className="combat-card__legacy">
          <summary>{t.combat.legacyNotes}</summary>
          <div className="combat-card__legacy-body">
            {legacyStrategies.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </details>
      )}

      {footer}
    </div>
  );
}

function BulletLine({ bullet, numbered }: { bullet: Bullet; numbered?: boolean }) {
  const { lang } = useI18n();
  const text = bullet.text[lang] ?? bullet.text.fr;
  if (numbered) {
    return (
      <li className="combat-card__bullet combat-card__bullet--numbered">
        <span>{text}</span>
      </li>
    );
  }
  return (
    <div className="combat-card__bullet">
      <span className="combat-card__bullet-dot" aria-hidden />
      <span>{text}</span>
    </div>
  );
}

function firstBulletOf(card: CombatCard): Bullet | null {
  for (const key of COMBAT_BLOCK_ORDER) {
    const bullets = card[key];
    if (bullets.length > 0) return bullets[0];
  }
  return null;
}
