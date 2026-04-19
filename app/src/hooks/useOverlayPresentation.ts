import { useEffect } from 'react';
import type { Settings } from '../features/settings/schema';

/**
 * Applies live settings to the HTML root: the `--overlay-opacity` CSS
 * variable (read by the `--bg-*` chain in tokens.css) and the
 * `density-compact` class that swaps the density tokens.
 *
 * Mount once near the top of the tree. Updates take effect on the next
 * commit — no reload, no flash.
 */
export function useOverlayPresentation(settings: Settings | null): void {
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const opacity = settings?.appearance.opacity ?? 1;
    const density = settings?.appearance.density ?? 'comfortable';
    root.style.setProperty('--overlay-opacity', String(opacity));
    root.classList.toggle('density-compact', density === 'compact');
  }, [settings?.appearance.opacity, settings?.appearance.density]);
}
