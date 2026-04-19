import { z } from 'zod';

/**
 * v0.5.2 settings file schema. Lives on disk via tauri-plugin-store at
 * `%APPDATA%/com.dofus-companion.app/settings.json`.
 *
 * v0.5.1 had no such file — it stored lang / strategyView / hideLambdas in
 * the webview's localStorage via Zustand-persist. The migration heuristic
 * is owned by `migrate.ts`: a v0.5.1 user who auto-updates gets
 * `hasCompletedFirstRun: true` because their localStorage already holds
 * a persisted language + view, while a fresh install keeps it `false` and
 * triggers the welcome overlay.
 *
 * Only v0.5.2 fields live here. v0.5.3 will bump `version` to 3 and add
 * appearance / contentDisplay / monstersDisplay / notifications blocks on
 * top (brief §3.3).
 */

export const SETTINGS_SCHEMA_VERSION = 2 as const;

export const SettingsSchema = z.object({
  version: z.literal(SETTINGS_SCHEMA_VERSION),
  hasCompletedFirstRun: z.boolean().default(false),
});

export type Settings = z.infer<typeof SettingsSchema>;

export function defaultSettings(): Settings {
  return {
    version: SETTINGS_SCHEMA_VERSION,
    hasCompletedFirstRun: false,
  };
}
