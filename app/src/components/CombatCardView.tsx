import type { ReactNode } from 'react';
import type { Bullet, CombatBlockKey, CombatCard } from '../types/combat-card';
import { COMBAT_BLOCK_ORDER, isCombatCardEmpty } from '../types/combat-card';
import { useI18n } from '../i18n/useI18n';
import { ProvenanceBadge } from '../features/strategy/ProvenanceBadge';

interface CombatCardViewProps {
  card: CombatCard | null;
  /** v0.4 bullets / long text, preserved pendant la transition v0.5.x.
   *  Rendu dans un <details> collapsé sous la card si présent. */
  legacyStrategies?: string[];
  /** Optional footer slot (e.g. custom legacy notes). Rendered under provenance. */
  footer?: ReactNode;
}

const BLOCK_EMOJI: Record<CombatBlockKey, string> = {
  unlock: '🔓',
  constraints: '⚠️',
  dangers: '❌',
  tips: '💡',
};

export function CombatCardView({ card, legacyStrategies, footer }: CombatCardViewProps) {
  const { t } = useI18n();

  // Silence rule : un monstre lambda (card === null) ou card entièrement vide → aucun rendu.
  if (isCombatCardEmpty(card)) return null;

  const blockLabels: Record<CombatBlockKey, string> = {
    unlock: t.combat.unlock,
    constraints: t.combat.constraints,
    dangers: t.combat.dangers,
    tips: t.combat.tips,
  };

  // Majority provenance : on prend le premier bullet trouvé dans l'ordre des blocs.
  // Simplification v0.5 : on n'affiche qu'une provenance globale sous la card.
  const firstBullet = firstBulletOf(card!);

  return (
    <div className="combat-card">
      {COMBAT_BLOCK_ORDER.map((key) => {
        const bullets = card![key];
        if (bullets.length === 0) return null;
        return (
          <div
            key={key}
            className={`combat-card__block combat-card__block--${key}`}
          >
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

function BulletLine({ bullet }: { bullet: Bullet }) {
  const { lang } = useI18n();
  const text = bullet.text[lang] ?? bullet.text.fr;
  return (
    <div className="combat-card__bullet">
      <span className="combat-card__bullet-dot" aria-hidden />
      <span>{text}</span>
    </div>
  );
}

function firstBulletOf(card: CombatCard): Bullet | null {
  for (const key of COMBAT_BLOCK_ORDER) {
    if (card[key].length > 0) return card[key][0];
  }
  return null;
}
