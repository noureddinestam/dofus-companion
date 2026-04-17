import { getCurrentWindow } from '@tauri-apps/api/window';
import { LangToggle } from './LangToggle';
import { useI18n } from '../i18n/useI18n';

interface TitleBarProps {
  query: string;
  onQueryChange: (q: string) => void;
  searchRef: React.RefObject<HTMLInputElement | null>;
}

export function TitleBar({ query, onQueryChange, searchRef }: TitleBarProps) {
  const { t } = useI18n();
  const hide = () => getCurrentWindow().hide();

  return (
    <div
      data-tauri-drag-region
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 12px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
        userSelect: 'none',
        cursor: 'move',
      }}
    >
      {/* Drag handle visuel — 6 points style "grip" */}
      <div
        data-tauri-drag-region
        title={t.titleBar.dragHandle}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 3px)',
          gridTemplateRows: 'repeat(3, 3px)',
          gap: 2,
          flexShrink: 0,
          opacity: 0.35,
          cursor: 'move',
        }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <span
            key={i}
            data-tauri-drag-region
            style={{
              width: 3,
              height: 3,
              borderRadius: '50%',
              background: 'var(--text-muted)',
            }}
          />
        ))}
      </div>

      <span
        data-tauri-drag-region
        style={{
          color: 'var(--accent)',
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: '0.04em',
          flexShrink: 0,
          cursor: 'move',
        }}
      >
        DC
      </span>

      <div style={{ flex: 1, position: 'relative', cursor: 'text' }} data-tauri-drag-region="false">
        <span
          style={{
            position: 'absolute',
            left: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
            fontSize: 13,
            pointerEvents: 'none',
          }}
        >
          🔍
        </span>
        <input
          ref={searchRef}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={t.search.placeholder}
          spellCheck={false}
          style={{
            width: '100%',
            background: 'var(--bg-base)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
            fontSize: 13,
            padding: '6px 8px 6px 28px',
            outline: 'none',
            fontFamily: 'var(--font-ui)',
            transition: 'border-color var(--duration-fast)',
          }}
          onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
          onBlur={(e) => (e.target.style.borderColor = 'var(--border-default)')}
        />
      </div>

      <LangToggle />

      <button
        onClick={hide}
        title={t.titleBar.hide}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: '4px 6px',
          borderRadius: 'var(--radius-sm)',
          fontSize: 12,
          lineHeight: 1,
          flexShrink: 0,
        }}
        onMouseEnter={(e) => ((e.target as HTMLElement).style.color = 'var(--text-primary)')}
        onMouseLeave={(e) => ((e.target as HTMLElement).style.color = 'var(--text-muted)')}
      >
        ✕
      </button>
    </div>
  );
}
