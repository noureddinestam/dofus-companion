import { useAppStore } from '../store/appStore';
import { useI18n } from '../i18n/useI18n';
import type { StrategyView } from '../store/appStore';

export function ViewToggle() {
  const { t } = useI18n();
  const view = useAppStore((s) => s.strategyView);
  const setView = useAppStore((s) => s.setStrategyView);

  return (
    <div
      role="group"
      aria-label={t.view.toggleHint}
      title={t.view.toggleHint}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: 'var(--bg-base)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-sm)',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      <ViewButton value="short" active={view === 'short'} onSelect={setView}>
        {t.view.actionable}
      </ViewButton>
      <ViewButton value="long" active={view === 'long'} onSelect={setView}>
        {t.view.detailed}
      </ViewButton>
    </div>
  );
}

function ViewButton({
  value,
  active,
  onSelect,
  children,
}: {
  value: StrategyView;
  active: boolean;
  onSelect: (v: StrategyView) => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={() => onSelect(value)}
      style={{
        background: active ? 'var(--bg-hover)' : 'transparent',
        color: active ? 'var(--accent)' : 'var(--text-muted)',
        border: 'none',
        padding: '3px 8px',
        fontSize: 10,
        fontWeight: 700,
        cursor: active ? 'default' : 'pointer',
        letterSpacing: '0.04em',
        lineHeight: 1.4,
        transition: 'color var(--duration-fast), background var(--duration-fast)',
      }}
    >
      {children}
    </button>
  );
}
