import { useEffect, useRef } from 'react';
import { useI18n } from '../i18n/useI18n';

interface WelcomeOverlayProps {
  /** Called when the user clicks the CTA or closes the panel. Must persist the
   *  flag — the component does not persist anything itself. */
  onDismiss: () => void | Promise<void>;
}

/**
 * First-run welcome screen. Rendered **only** when `useFirstRun` reports
 * `isFirstRun === true`. Both the CTA and the close cross dismiss, so every
 * exit path sets the flag exactly once.
 */
export function WelcomeOverlay({ onDismiss }: WelcomeOverlayProps) {
  const { t } = useI18n();
  const ctaRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Focus the primary action on mount — Enter then immediately dismisses.
    ctaRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        void onDismiss();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onDismiss]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
      className="welcome-overlay"
    >
      <div className="welcome-overlay__card">
        <button
          type="button"
          className="welcome-overlay__close"
          aria-label={t.welcome.closeAria}
          onClick={() => void onDismiss()}
        >
          ×
        </button>

        <h2 id="welcome-title" className="welcome-overlay__title">
          {t.welcome.title}
        </h2>

        <p className="welcome-overlay__subtitle">{t.welcome.subtitle}</p>

        <ul className="welcome-overlay__bullets">
          <li>{t.welcome.bulletHotkey}</li>
          <li>{t.welcome.bulletSearch}</li>
          <li>{t.welcome.bulletLocal}</li>
        </ul>

        <button
          ref={ctaRef}
          type="button"
          className="welcome-overlay__cta"
          onClick={() => void onDismiss()}
        >
          {t.welcome.cta}
        </button>
      </div>
    </div>
  );
}
