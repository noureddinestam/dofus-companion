import { useEffect, useState } from 'react';

export interface UpdateInfo {
  version: string;
  installing: boolean;
}

export function useUpdater() {
  const [update, setUpdate] = useState<UpdateInfo | null>(null);

  useEffect(() => {
    // Only run inside Tauri runtime
    if (!('__TAURI_INTERNALS__' in window)) return;

    let cancelled = false;

    (async () => {
      try {
        const { check } = await import('@tauri-apps/plugin-updater');
        const result = await check();
        if (!cancelled && result?.available) {
          setUpdate({ version: result.currentVersion, installing: false });
        }
      } catch {
        // Silently ignore — no key configured or network error
      }
    })();

    return () => { cancelled = true; };
  }, []);

  async function install() {
    if (!update) return;
    setUpdate((u) => u && { ...u, installing: true });
    try {
      const { check } = await import('@tauri-apps/plugin-updater');
      const { relaunch } = await import('@tauri-apps/plugin-process');
      const result = await check();
      if (result?.available) {
        await result.downloadAndInstall();
        await relaunch();
      }
    } catch {
      setUpdate((u) => u && { ...u, installing: false });
    }
  }

  function dismiss() {
    setUpdate(null);
  }

  return { update, install, dismiss };
}
