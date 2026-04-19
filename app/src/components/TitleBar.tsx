import { getCurrentWindow } from '@tauri-apps/api/window';
import { useI18n } from '../i18n/useI18n';

interface TitleBarProps {
  query: string;
  onQueryChange: (q: string) => void;
  searchRef: React.RefObject<HTMLInputElement | null>;
  /** Opens the v0.5.3 settings panel. Rendered next to the close cross. */
  onOpenSettings: () => void;
}

export function TitleBar({ query, onQueryChange, searchRef, onOpenSettings }: TitleBarProps) {
  const { t } = useI18n();
  const hide = () => getCurrentWindow().hide();

  return (
    <div
      data-tauri-drag-region
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: 'var(--density-pad-topbar)',
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

      <svg
        data-tauri-drag-region
        width="18"
        height="22"
        viewBox="0 0 32 32"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Dofus Companion"
        style={{ flexShrink: 0, cursor: 'move' }}
      >
        <title>Dofus Companion</title>
        <path
          d="M 16 3.5 C 22.5 3.5 26 8.5 26 14.5 C 26 21.5 22 28.5 16 28.5 C 10 28.5 6 21.5 6 14.5 C 6 8.5 9.5 3.5 16 3.5 Z"
          fill="var(--accent)"
        />
        <rect x="9" y="15" width="14" height="7" rx="1.6" fill="var(--bg-base)" />
      </svg>

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
            padding: 'var(--density-pad-search)',
            outline: 'none',
            fontFamily: 'var(--font-ui)',
            transition: 'border-color var(--duration-fast)',
          }}
          onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
          onBlur={(e) => (e.target.style.borderColor = 'var(--border-default)')}
        />
      </div>

      <button
        type="button"
        onClick={onOpenSettings}
        title={t.settings.panel.openAria}
        aria-label={t.settings.panel.openAria}
        className="title-bar__icon-btn"
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: 'var(--density-pad-icon-btn)',
          borderRadius: 'var(--radius-sm)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          lineHeight: 0,
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--text-primary)')}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--text-muted)')}
      >
        <GearIcon />
      </button>

      <button
        type="button"
        onClick={hide}
        title={t.titleBar.hide}
        aria-label={t.titleBar.hide}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: 'var(--density-pad-icon-btn)',
          borderRadius: 'var(--radius-sm)',
          fontSize: 12,
          lineHeight: 1,
          flexShrink: 0,
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--text-primary)')}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--text-muted)')}
      >
        ✕
      </button>
    </div>
  );
}

function GearIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0A1.65 1.65 0 0 0 10 3.09V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
