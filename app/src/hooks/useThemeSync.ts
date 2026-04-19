import { useEffect } from 'react';
import type { Settings, Theme } from '../features/settings/schema';

/**
 * Applies the active theme class to the `<html>` element. When the user
 * picks `light` or `dark` explicitly, that's what we set. When they pick
 * `system`, we resolve to the OS preference via `matchMedia` and re-resolve
 * when the OS value changes (subscribe/unsubscribe is scoped to this mode
 * only so the explicit branches don't leak listeners).
 *
 * Safe to call during SSR / tests: every DOM access is behind a typeof
 * check, and the cleanup is a no-op when no listener was attached.
 */
export function useThemeSync(settings: Settings | null): void {
  const theme: Theme = settings?.appearance.theme ?? 'system';

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    function apply(effective: 'light' | 'dark'): void {
      root.classList.remove('theme-light', 'theme-dark');
      root.classList.add(effective === 'light' ? 'theme-light' : 'theme-dark');
    }

    if (theme === 'light' || theme === 'dark') {
      apply(theme);
      return;
    }

    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      apply('dark');
      return;
    }

    const mq = window.matchMedia('(prefers-color-scheme: light)');
    apply(mq.matches ? 'light' : 'dark');

    const listener = (event: MediaQueryListEvent): void => {
      apply(event.matches ? 'light' : 'dark');
    };
    mq.addEventListener('change', listener);
    return () => mq.removeEventListener('change', listener);
  }, [theme]);
}
