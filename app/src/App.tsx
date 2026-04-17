import './styles/globals.css';

export default function App() {
  return (
    <div
      style={{
        height: '100vh',
        background: 'var(--bg-base)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-default)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <span style={{ color: 'var(--accent)', fontSize: '24px', fontWeight: 700 }}>
        Dofus Companion
      </span>
      <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
        Phase 0 — Bootstrap OK · Alt+D pour toggle
      </span>
    </div>
  );
}
