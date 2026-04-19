import { useEffect } from 'react';

/**
 * Sends a single system toast a few seconds after mount, telling the user the
 * app is running in the tray and reminding them of Alt+D. Safe to call from
 * a browser preview — bails silently if Tauri isn't available.
 *
 * Permission flow follows `@tauri-apps/plugin-notification`:
 *   isPermissionGranted → requestPermission → sendNotification.
 *
 * We only send the toast when the caller reports the window is **not
 * visible** at t+delay, which avoids nagging users whose WelcomeOverlay
 * is already on screen (first-run flow).
 */

export interface StartupNotificationOptions {
  title: string;
  body: string;
  /** ms to wait before deciding whether to send. */
  delayMs?: number;
  /** Callback to check if the overlay is currently visible. If true, we skip. */
  isOverlayVisible: () => boolean;
  /** Opt-in toggle — future settings pane flips this. In v0.5.2 always true. */
  enabled?: boolean;
}

async function trySendNotification(title: string, body: string): Promise<void> {
  if (typeof window === 'undefined') return;
  const tauriInternals = (window as unknown as { __TAURI_INTERNALS__?: unknown })
    .__TAURI_INTERNALS__;
  if (!tauriInternals) return;
  try {
    const mod = await import('@tauri-apps/plugin-notification');
    let granted = await mod.isPermissionGranted();
    if (!granted) {
      granted = (await mod.requestPermission()) === 'granted';
    }
    if (!granted) return;
    mod.sendNotification({ title, body });
  } catch (err) {
    // Plugin disabled, permission blocked, platform quirk — stay silent.
    console.warn('[startup-toast] skipped', err);
  }
}

export function useStartupNotification(options: StartupNotificationOptions): void {
  const { title, body, delayMs = 3000, isOverlayVisible, enabled = true } = options;

  useEffect(() => {
    if (!enabled) return;
    const timer = setTimeout(() => {
      if (isOverlayVisible()) return;
      void trySendNotification(title, body);
    }, delayMs);
    return () => clearTimeout(timer);
  }, [enabled, delayMs, title, body, isOverlayVisible]);
}
