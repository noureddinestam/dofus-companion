import { useI18n } from '../i18n/useI18n';
import type { Lang } from '../i18n/strings';

export function LangToggle() {
  const { lang, setLang, t } = useI18n();

  return (
    <div
      role="group"
      aria-label={t.lang.toggleHint}
      title={t.lang.toggleHint}
      style={{
        display: 'flex',
        alignItems: 'center',
        background: 'var(--bg-base)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-sm)',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      <LangButton value="fr" active={lang === 'fr'} onSelect={setLang}>
        {t.lang.fr}
      </LangButton>
      <LangButton value="en" active={lang === 'en'} onSelect={setLang}>
        {t.lang.en}
      </LangButton>
    </div>
  );
}

function LangButton({
  value,
  active,
  onSelect,
  children,
}: {
  value: Lang;
  active: boolean;
  onSelect: (l: Lang) => void;
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
        padding: '3px 7px',
        fontSize: 10,
        fontWeight: 700,
        fontFamily: 'var(--font-mono)',
        cursor: active ? 'default' : 'pointer',
        letterSpacing: '0.05em',
        lineHeight: 1.4,
        transition: 'color var(--duration-fast), background var(--duration-fast)',
      }}
    >
      {children}
    </button>
  );
}
