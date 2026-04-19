import { useCallback, useEffect, useState } from 'react';
import { loadSettings, patchSettings } from '../features/settings/store';

/**
 * Tri-state: `null` while the settings file is being loaded (one tick on
 * first render), then `true` / `false`. Consumers render nothing during
 * the loading phase to avoid a flash of welcome on a user who has already
 * onboarded.
 */
export interface FirstRunState {
  isFirstRun: boolean | null;
  /** Marks the user as onboarded and persists the flag. Idempotent. */
  completeFirstRun: () => Promise<void>;
}

export function useFirstRun(): FirstRunState {
  const [isFirstRun, setIsFirstRun] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadSettings().then((s) => {
      if (cancelled) return;
      setIsFirstRun(!s.hasCompletedFirstRun);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const completeFirstRun = useCallback(async () => {
    await patchSettings({ hasCompletedFirstRun: true });
    setIsFirstRun(false);
  }, []);

  return { isFirstRun, completeFirstRun };
}
