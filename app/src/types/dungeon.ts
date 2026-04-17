import { z } from 'zod';

const ElementEnum = z.enum(['air', 'eau', 'feu', 'terre', 'neutre']);
const LangEnum = z.enum(['fr', 'en']);

// ========== Provenance ==========

export const AnchorSchema = z.object({
  bulletIndex: z.number().int().min(0),
  quote: z.string().min(5).max(300),
  similarity: z.number().min(0).max(1),
});

export const ProvenanceNativeSchema = z.object({
  kind: z.literal('native'),
  lang: LangEnum,
  source: z.enum(['fandom-en', 'fandom-fr', 'gamosaurus', 'manual']),
  sourceUrl: z.string().url(),
});

export const ProvenanceLlmSchema = z.object({
  kind: z.literal('llm-grounded'),
  baseLang: LangEnum,
  baseSource: z.enum(['fandom-en', 'fandom-fr', 'gamosaurus']),
  baseSourceUrl: z.string().url(),
  model: z.string(),
  promptVersion: z.string(),
  anchors: z.array(AnchorSchema).min(1),
  generatedAt: z.string().datetime(),
});

export const ProvenanceCommunitySchema = z.object({
  kind: z.literal('community'),
  contributor: z.string(),
  reviewedBy: z.string().optional(),
  prUrl: z.string().url(),
});

export const ProvenanceSchema = z.discriminatedUnion('kind', [
  ProvenanceNativeSchema,
  ProvenanceLlmSchema,
  ProvenanceCommunitySchema,
]);

// ========== Stratégies ==========

export const StrategyLongSchema = z.object({
  text: z.string().min(30),
  provenance: ProvenanceSchema,
});

export const ActionableBulletSchema = z.object({
  icon: z.enum([
    'priority',
    'avoid',
    'element',
    'position',
    'phase',
    'instakill',
    'cooldown',
    'summon',
    'tip',
  ]),
  severity: z.enum(['critical', 'danger', 'caution', 'info']),
  text: z.string().min(5).max(160),
});

export const StrategyShortSchema = z.object({
  bullets: z.array(ActionableBulletSchema).min(3).max(6),
  provenance: ProvenanceSchema,
});

// Conteneur bilingue. Au moins UNE langue/format doit être populated.
export const StrategyBundleSchema = z
  .object({
    long: z.object({
      fr: StrategyLongSchema.nullable().default(null),
      en: StrategyLongSchema.nullable().default(null),
    }),
    short: z.object({
      fr: StrategyShortSchema.nullable().default(null),
      en: StrategyShortSchema.nullable().default(null),
    }),
  })
  .refine((v) => v.long.fr || v.long.en || v.short.fr || v.short.en, {
    message: 'At least one language/format must be populated',
  });

// ========== Monster / Boss / Dungeon ==========

export const MonsterSchema = z.object({
  id: z.string(),
  name: z.string(),
  nameEn: z.string().nullable().default(null),
  level: z.number().int().min(0),
  hp: z.number().int().nullable().default(null),
  family: z.string().default('Inconnu'),
  familyEn: z.string().nullable().default(null),
  weakElement: ElementEnum.nullable(),
  resistElement: ElementEnum.nullable(),
  source: z.enum(['dofusdb', 'fandom-en', 'fandom-fr']),
  sourceUrl: z.string().url(),
});

// LEGACY v0.3 — conservé pour backward-compat.
// À la lecture, un adapter migre vers `strategies`.
export const BossStrategyLegacySchema = z.object({
  text: z.string().min(30),
  source: z.literal('fandom-en'),
  sourceUrl: z.string().url(),
});

export const BossSchema = MonsterSchema.extend({
  strategy: BossStrategyLegacySchema.nullable().default(null), // LEGACY v0.3
  strategies: StrategyBundleSchema.nullable().default(null),
  phases: z
    .array(
      z.object({
        trigger: z.string(),
        behavior: z.string(),
        triggerEn: z.string().nullable().default(null),
        behaviorEn: z.string().nullable().default(null),
      }),
    )
    .default([]),
});

export const DungeonSchema = z.object({
  id: z.string(),
  name: z.string(),
  nameEn: z.string().nullable().default(null),
  slug: z.string(),
  aliases: z.array(z.string()).default([]),
  recommendedLevel: z.number(),
  levelRange: z.tuple([z.number(), z.number()]),
  monsters: z.array(MonsterSchema).min(1),
  boss: BossSchema,
  externalGuideUrl: z.string().url().nullable().default(null),
  externalGuideUrlFr: z.string().url().nullable().default(null),
  lastUpdated: z.string().datetime(),
  dataVersion: z.string(),
});

// ========== Types inférés ==========

export type Lang = z.infer<typeof LangEnum>;
export type Anchor = z.infer<typeof AnchorSchema>;
export type ProvenanceNative = z.infer<typeof ProvenanceNativeSchema>;
export type ProvenanceLlm = z.infer<typeof ProvenanceLlmSchema>;
export type ProvenanceCommunity = z.infer<typeof ProvenanceCommunitySchema>;
export type Provenance = z.infer<typeof ProvenanceSchema>;
export type StrategyLong = z.infer<typeof StrategyLongSchema>;
export type ActionableBullet = z.infer<typeof ActionableBulletSchema>;
export type StrategyShort = z.infer<typeof StrategyShortSchema>;
export type StrategyBundle = z.infer<typeof StrategyBundleSchema>;
export type Monster = z.infer<typeof MonsterSchema>;
export type Boss = z.infer<typeof BossSchema>;
export type Dungeon = z.infer<typeof DungeonSchema>;
export type BossStrategyLegacy = z.infer<typeof BossStrategyLegacySchema>;

export const ELEMENT_ICON = {
  air: '💨',
  eau: '💧',
  feu: '🔥',
  terre: '🌍',
  neutre: '⚪',
} as const;
