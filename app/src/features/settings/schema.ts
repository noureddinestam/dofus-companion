import { z } from 'zod';

/**
 * v0.5.3 settings file schema. Lives on disk via tauri-plugin-store at
 * `%APPDATA%/com.dofus-companion.app/settings.json`.
 *
 * Schema version history:
 *   v2 (v0.5.2) — hasCompletedFirstRun only.
 *   v3 (v0.5.3) — add appearance / contentDisplay / monstersDisplay /
 *                  notifications. `lang` migrates out of the legacy
 *                  Zustand-persist key into appearance.lang.
 *
 * The settings file is the source of truth for every preference that
 * persists across sessions. Session-only state (current query, focused
 * search index, …) stays in Zustand. The store wrapper in `store.ts`
 * reads this schema, applies migrations to older files, and rejects a
 * corrupted file back to defaults after backing it up (docs §6).
 */

export const SETTINGS_SCHEMA_VERSION = 3 as const;

export const LangEnum = z.enum(['fr', 'en']);
export type Lang = z.infer<typeof LangEnum>;

export const DensityEnum = z.enum(['comfortable', 'compact']);
export type Density = z.infer<typeof DensityEnum>;

export const ThemeEnum = z.enum(['system', 'light', 'dark']);
export type Theme = z.infer<typeof ThemeEnum>;

export const AppearanceSchema = z.object({
  lang: LangEnum.default('fr'),
  opacity: z.number().min(0.5).max(1).default(0.9),
  density: DensityEnum.default('comfortable'),
  theme: ThemeEnum.default('system'),
});
export type Appearance = z.infer<typeof AppearanceSchema>;

export const ContentDisplaySchema = z.object({
  showUnlockBlock: z.boolean().default(true),
  showUnlockContext: z.boolean().default(true),
  showUnlockActions: z.boolean().default(true),
  showDangersBlock: z.boolean().default(true),
  showTipsBlock: z.boolean().default(true),
});
export type ContentDisplay = z.infer<typeof ContentDisplaySchema>;

export const MonstersDisplaySchema = z.object({
  /** Opt-in: lambdas stay hidden by default — the v0.5.0 silence rule. */
  showLambdaMonsters: z.boolean().default(false),
  showProvenanceBadge: z.boolean().default(true),
});
export type MonstersDisplay = z.infer<typeof MonstersDisplaySchema>;

export const NotificationsSchema = z.object({
  /** Controls the tray toast introduced in v0.5.2. Opt-out via the panel. */
  showStartupToast: z.boolean().default(true),
});
export type Notifications = z.infer<typeof NotificationsSchema>;

export const SettingsSchema = z.object({
  version: z.literal(SETTINGS_SCHEMA_VERSION),
  hasCompletedFirstRun: z.boolean().default(false),
  appearance: AppearanceSchema.default(() => AppearanceSchema.parse({})),
  contentDisplay: ContentDisplaySchema.default(() => ContentDisplaySchema.parse({})),
  monstersDisplay: MonstersDisplaySchema.default(() => MonstersDisplaySchema.parse({})),
  notifications: NotificationsSchema.default(() => NotificationsSchema.parse({})),
});
export type Settings = z.infer<typeof SettingsSchema>;

export function defaultSettings(): Settings {
  return SettingsSchema.parse({ version: SETTINGS_SCHEMA_VERSION });
}
