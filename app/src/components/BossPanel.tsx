import type { Boss } from '../types/dungeon';
import { useI18n } from '../i18n/useI18n';
import { resolveStrategy } from '../features/strategy/resolveStrategy';
import { ProvenanceBadge } from '../features/strategy/ProvenanceBadge';

interface BossPanelProps {
  boss: Boss;
}

/**
 * Rend la stratégie LONG du boss (vue "Détaillée") + les phases.
 * Ne rend PAS le header Boss/MonsterRow — DungeonCard s'en charge pour
 * pouvoir alterner entre StrategyShortView et BossPanel sans dupliquer.
 */
export function BossPanel({ boss }: BossPanelProps) {
  const { t, lang } = useI18n();
  const resolved = resolveStrategy(boss.strategies, lang, 'long');

  return (
    <div>
      {boss.phases.length > 0 && (
        <div style={{ padding: 'var(--density-pad-block-asym)' }}>
          {boss.phases.map((phase, i) => {
            const trigger =
              lang === 'en' && phase.triggerEn ? phase.triggerEn : phase.trigger;
            const behavior =
              lang === 'en' && phase.behaviorEn ? phase.behaviorEn : phase.behavior;
            return (
              <div key={i} style={{ marginBottom: 6 }}>
                <div style={{ color: 'var(--accent)', fontSize: 11, fontWeight: 600 }}>
                  ⚡ {trigger}
                </div>
                <div
                  style={{
                    color: 'var(--text-secondary)',
                    fontSize: 11,
                    paddingLeft: 14,
                    lineHeight: 1.4,
                  }}
                >
                  {behavior}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {resolved ? (
        <div
          style={{
            margin: '6px 10px 0',
            padding: 'var(--density-pad-block)',
            background: 'var(--bg-hover)',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '2px solid var(--accent)',
          }}
        >
          <div
            style={{
              color: 'var(--text-muted)',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.06em',
              marginBottom: 5,
            }}
          >
            {t.dungeon.strategy}
          </div>

          {resolved.fellBack && (
            <div
              style={{
                padding: 'var(--density-pad-chip)',
                marginBottom: 6,
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(250,204,21,0.08)',
                border: '1px solid rgba(250,204,21,0.2)',
                color: 'var(--priority-caution)',
                fontSize: 10,
                lineHeight: 1.3,
              }}
            >
              {t.strategy.fallbackLang(resolved.effectiveLang === 'fr' ? 'FR' : 'EN')}
            </div>
          )}

          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: 11,
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
              marginBottom: 6,
            }}
          >
            {resolved.content.text}
          </p>

          <ProvenanceBadge provenance={resolved.content.provenance} />
        </div>
      ) : (
        <div
          style={{
            margin: '6px 10px 0',
            padding: 'var(--density-pad-row)',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-hover)',
            color: 'var(--text-muted)',
            fontSize: 11,
            fontStyle: 'italic',
          }}
        >
          {t.dungeon.noStrategy}
        </div>
      )}
    </div>
  );
}
