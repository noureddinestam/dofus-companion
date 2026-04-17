import { openUrl } from '@tauri-apps/plugin-opener';
import type { Boss } from '../types/dungeon';
import { useI18n } from '../i18n/useI18n';
import { MonsterRow } from './MonsterRow';

interface BossPanelProps {
  boss: Boss;
}

const SOURCE_LABEL_KEY: Record<
  NonNullable<Boss['strategy']>['source'],
  'fandomEn'
> = {
  'fandom-en': 'fandomEn',
};

export function BossPanel({ boss }: BossPanelProps) {
  const { t } = useI18n();
  const hasStrategy = !!boss.strategy;

  return (
    <div style={{ marginTop: 8 }}>
      <div
        style={{
          padding: '6px 10px',
          background: 'rgba(232,181,71,0.08)',
          borderTop: '1px solid rgba(232,181,71,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span
          style={{
            color: 'var(--accent)',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.08em',
          }}
        >
          {t.dungeon.boss}
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
              <div
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: 11,
                  paddingLeft: 14,
                  lineHeight: 1.4,
                }}
              >
                {phase.behavior}
              </div>
            </div>
          ))}
        </div>
      )}

      {hasStrategy ? (
        <div
          style={{
            margin: '6px 10px 0',
            padding: '8px 10px',
            background: 'var(--bg-hover)',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '2px solid var(--accent)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 5,
            }}
          >
            <span
              style={{
                color: 'var(--text-muted)',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.06em',
              }}
            >
              {t.dungeon.strategy}
            </span>
            <span
              onClick={() => boss.strategy && openUrl(boss.strategy.sourceUrl)}
              style={{
                color: 'var(--accent)',
                fontSize: 9,
                padding: '1px 5px',
                border: '1px solid rgba(232,181,71,0.3)',
                borderRadius: 3,
                cursor: 'pointer',
              }}
              title={boss.strategy!.sourceUrl}
            >
              {t.source[SOURCE_LABEL_KEY[boss.strategy!.source]]} ↗
            </span>
          </div>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: 11,
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
            }}
          >
            {boss.strategy!.text}
          </p>
        </div>
      ) : (
        <div
          style={{
            margin: '6px 10px 0',
            padding: '7px 10px',
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
