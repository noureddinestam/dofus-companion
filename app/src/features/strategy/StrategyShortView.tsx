import type { StrategyBundle } from '../../types/dungeon';
import { useI18n } from '../../i18n/useI18n';
import { useAppStore } from '../../store/appStore';
import { resolveStrategy } from './resolveStrategy';
import { BulletRow } from './BulletRow';
import { ProvenanceBadge } from './ProvenanceBadge';

interface StrategyShortViewProps {
  bundle: StrategyBundle | null;
}

export function StrategyShortView({ bundle }: StrategyShortViewProps) {
  const { t, lang } = useI18n();
  const setStrategyView = useAppStore((s) => s.setStrategyView);

  const resolved = resolveStrategy(bundle, lang, 'short');

  if (!resolved) {
    return (
      <div
        style={{
          margin: '6px 10px',
          padding: '10px 12px',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--bg-hover)',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        <span style={{ color: 'var(--text-muted)', fontSize: 11, lineHeight: 1.4 }}>
          {t.strategy.noShort}
        </span>
        <button
          type="button"
          onClick={() => setStrategyView('long')}
          style={{
            alignSelf: 'flex-start',
            background: 'var(--accent)',
            color: '#0c0e12',
            border: 'none',
            borderRadius: 3,
            padding: '3px 9px',
            fontSize: 10,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {t.strategy.noShortCta} →
        </button>
      </div>
    );
  }

  const otherLangLabel = resolved.effectiveLang === 'fr' ? 'FR' : 'EN';

  return (
    <div style={{ padding: '6px 10px' }}>
      {resolved.fellBack && (
        <div
          style={{
            padding: '4px 8px',
            marginBottom: 6,
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(250,204,21,0.08)',
            border: '1px solid rgba(250,204,21,0.2)',
            color: 'var(--priority-caution)',
            fontSize: 10,
            lineHeight: 1.3,
          }}
        >
          {t.strategy.fallbackLang(otherLangLabel)}
        </div>
      )}

      {resolved.content.bullets.map((b, i) => (
        <BulletRow key={i} bullet={b} />
      ))}

      <div style={{ marginTop: 6, paddingTop: 4, borderTop: '1px solid var(--border-subtle)' }}>
        <ProvenanceBadge provenance={resolved.content.provenance} />
      </div>
    </div>
  );
}
