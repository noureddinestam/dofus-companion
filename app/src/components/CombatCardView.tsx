import type { ReactNode } from 'react';
import type { Bullet, CombatCard } from '../types/combat-card';
import {
  COMBAT_BLOCK_ORDER,
  isCombatCardEmpty,
  partitionUnlock,
} from '../types/combat-card';
import { useI18n } from '../i18n/useI18n';
import { useSettings } from '../features/settings/useSettings';
import { ProvenanceBadge } from '../features/strategy/ProvenanceBadge';
import type {
  ContentDisplay,
  MonstersDisplay,
} from '../features/settings/schema';

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

const DEFAULT_CONTENT_DISPLAY: ContentDisplay = {
  showUnlockBlock: true,
  showUnlockContext: true,
  showUnlockActions: true,
  showDangersBlock: true,
  showTipsBlock: true,
};

const DEFAULT_MONSTERS_DISPLAY: MonstersDisplay = {
  showLambdaMonsters: false,
  showProvenanceBadge: true,
};

/**
 * Whether any v0.5.3 content toggle would hide a given block. Called both
 * to decide whether to render a block and, when compact and card is
 * otherwise empty, whether to render a lambda placeholder.
 */
function isBlockVisible(
  key: RenderedBlockKey,
  contentDisplay: ContentDisplay,
): boolean {
  switch (key) {
    case 'unlock':
      return contentDisplay.showUnlockBlock;
    case 'dangers':
      return contentDisplay.showDangersBlock;
    case 'tips':
      return contentDisplay.showTipsBlock;
  }
}

export function CombatCardView({ card, legacyStrategies, footer, compact }: CombatCardViewProps) {
  const { t, lang } = useI18n();
  const { settings } = useSettings();
  const contentDisplay = settings?.contentDisplay ?? DEFAULT_CONTENT_DISPLAY;
  const monstersDisplay = settings?.monstersDisplay ?? DEFAULT_MONSTERS_DISPLAY;

  // Silence rule : un monstre lambda (card === null) ou card entièrement vide → aucun rendu
  // ... sauf si l'utilisateur a explicitement demandé à voir les lambdas ET qu'on est en mode compact,
  // auquel cas on affiche un placeholder discret.
  if (isCombatCardEmpty(card)) {
    if (compact && monstersDisplay.showLambdaMonsters) {
      return (
        <div className="combat-card combat-card--compact combat-card--lambda">
          <span className="combat-card__lambda-label">{t.combat.lambdaPlaceholder}</span>
        </div>
      );
    }
    return null;
  }

  const blockLabels: Record<RenderedBlockKey, string> = {
    unlock: t.combat.unlock,
    dangers: t.combat.dangers,
    tips: t.combat.tips,
  };

  const unlockPartition = partitionUnlock(card!);
  const visibleContext = contentDisplay.showUnlockContext ? unlockPartition.context : [];
  const visibleAction = contentDisplay.showUnlockActions ? unlockPartition.action : [];
  const showUnlockSubLabels =
    visibleContext.length > 0 && visibleAction.length > 0;

  const firstBullet = firstBulletOf(card!);
  const noBlocksVisible = COMBAT_BLOCK_ORDER.every((key) => {
    if (!isBlockVisible(key, contentDisplay)) return true;
    if (key === 'unlock') {
      return visibleContext.length === 0 && visibleAction.length === 0;
    }
    return card![key].length === 0;
  });
  if (noBlocksVisible) return null;

  return (
    <div className={compact ? 'combat-card combat-card--compact' : 'combat-card'}>
      {COMBAT_BLOCK_ORDER.map((key) => {
        if (!isBlockVisible(key, contentDisplay)) return null;
        if (key === 'unlock') {
          if (visibleContext.length === 0 && visibleAction.length === 0) return null;
          return (
            <div key={key} className="combat-card__block combat-card__block--unlock">
              <div className="combat-card__title combat-card__title--unlock">
                <span aria-hidden>{BLOCK_EMOJI.unlock}</span>
                <span>{blockLabels.unlock}</span>
              </div>
              {visibleContext.length > 0 && (
                <div className="combat-card__subsection">
                  {showUnlockSubLabels && (
                    <p className="combat-card__subsection-label">{t.combat.unlockContext}</p>
                  )}
                  <div className="combat-card__bullets">
                    {visibleContext.map((b, i) => (
                      <BulletLine key={`ctx-${i}`} bullet={b} />
                    ))}
                  </div>
                </div>
              )}
              {visibleAction.length > 0 && (
                <div className="combat-card__subsection">
                  {showUnlockSubLabels && (
                    <p className="combat-card__subsection-label">{t.combat.unlockActions}</p>
                  )}
                  <ol className="combat-card__bullets combat-card__bullets--numbered">
                    {visibleAction.map((b, i) => (
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

      {monstersDisplay.showProvenanceBadge && firstBullet && (
        <div className="combat-card__provenance">
          <ProvenanceBadge provenance={firstBullet.provenance} />
        </div>
      )}

      {legacyStrategies && legacyStrategies.length > 0 && (
        <details className="combat-card__legacy">
          <summary>
            {t.combat.legacyNotes}
            {lang === 'en' && (
              <span className="combat-card__legacy-fr-badge">
                {t.combat.legacyNotesFrOnlyBadge}
              </span>
            )}
          </summary>
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
