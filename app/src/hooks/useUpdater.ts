import { useEffect, useState } from 'react';

export interface UpdateInfo {
  version: string;
  installing: boolean;
}

export function useUpdater() {
  const [update, setUpdate] = useState<UpdateInfo | null>(null);

  useEffect(() => {
    if (!('__TAURI_INTERNALS__' in window)) return;

    let cancelled = false;

    (async () => {
      try {
        const { check } = await import('@tauri-apps/plugin-updater');
        const result = await check();
        if (!cancelled && result) {
          setUpdate({ version: result.version, installing: false });
        }
      } catch {
        // Pas de clé configurée, erreur réseau, ou runtime sans updater : silence.
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
      if (result) {
        await result.downloadAndInstall();
        await relaunch();
      } else {
        setUpdate(null);
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
