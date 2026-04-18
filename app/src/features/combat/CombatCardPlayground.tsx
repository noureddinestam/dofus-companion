import { CombatCardView } from '../../components/CombatCardView';
import {
  FIXTURE_BOSS_SYLARGH,
  FIXTURE_MONSTER_COUNTER,
  FIXTURE_MONSTER_LAMBDA,
} from './devFixtures';

/**
 * Page de dev pour visualiser le rendu CombatCardView sur 3 fixtures.
 * Activée via `?playground=combat` dans l'URL. Non référencée en prod.
 */
export function CombatCardPlayground() {
  return (
    <div
      style={{
        padding: 16,
        overflowY: 'auto',
        height: '100vh',
        background: 'var(--bg-base)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-ui)',
      }}
    >
      <h1 style={{ fontSize: 14, marginBottom: 10 }}>Combat Card — playground (dev only)</h1>

      <Section title="1. Boss full (Sylargh-like) — 4 blocs remplis">
        <CombatCardView card={FIXTURE_BOSS_SYLARGH} />
      </Section>

      <Section title="2. Monstre counter-damage (Dompteuse-like) — 2 blocs">
        <CombatCardView card={FIXTURE_MONSTER_COUNTER} />
      </Section>

      <Section title="3. Monstre lambda — card === null, aucun rendu attendu">
        <CombatCardView card={FIXTURE_MONSTER_LAMBDA} />
        <em style={{ color: 'var(--text-muted)', fontSize: 11 }}>
          (doit rester vide : aucun bloc, aucun texte)
        </em>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 18 }}>
      <h2
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.08em',
          color: 'var(--text-muted)',
          marginBottom: 6,
          textTransform: 'uppercase',
        }}
      >
        {title}
      </h2>
      <div
        style={{
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-elevated)',
        }}
      >
        {children}
      </div>
    </section>
  );
}
