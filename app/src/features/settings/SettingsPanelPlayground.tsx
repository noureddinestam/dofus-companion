import { useState } from 'react';
import { SettingsPanel } from '../../components/SettingsPanel';

/**
 * Dev-only playground mounted when the URL carries ?playground=settings.
 * Exercises the SettingsPanel in isolation — open/close state management,
 * keyboard shortcuts, CSS animation. Phase 4 will replace this harness
 * with the gear-icon trigger in the top bar of DungeonCard.
 */
export function SettingsPanelPlayground() {
  const [open, setOpen] = useState(true);
  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        background: 'var(--bg-base)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-ui)',
        padding: 24,
      }}
    >
      <h1 style={{ fontSize: 13, margin: 0, marginBottom: 12 }}>
        Settings panel — playground (dev only)
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: 0, marginBottom: 12 }}>
        Close via croix, Escape, or clic on the backdrop. Re-open with the button below.
      </p>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={open}
        style={{
          background: 'var(--accent)',
          color: '#0c0e12',
          border: 'none',
          borderRadius: 4,
          padding: 'var(--density-pad-cell)',
          fontSize: 12,
          fontWeight: 700,
          cursor: open ? 'default' : 'pointer',
          opacity: open ? 0.5 : 1,
        }}
      >
        Open settings
      </button>
      <SettingsPanel
        open={open}
        onClose={() => setOpen(false)}
        appVersion="0.5.3-dev"
      />
    </div>
  );
}
