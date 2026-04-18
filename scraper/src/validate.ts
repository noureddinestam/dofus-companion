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

// ========== Combat Cards (v0.5) ==========

export const MechanicTypeEnum = z.enum([
  'summoner',
  'reviver',
  'self-heal',
  'buffer',
  'debuffer',
  'healer',
  'tackler',
  'puller',
  'pusher',
  'counter-damage',
  'zone-control',
  'ap-mp-stripper',
  'execute',
  'chain-summon',
]);

export const CombatSeverityEnum = z.enum(['critical', 'danger', 'caution']);

export const LocalizedBulletTextSchema = z.object({
  fr: z.string().min(3).max(160),
  en: z.string().min(3).max(160),
});

export const BulletSchema = z.object({
  text: LocalizedBulletTextSchema,
  mechanicType: MechanicTypeEnum.nullable().default(null),
  severity: CombatSeverityEnum.nullable().default(null),
  provenance: ProvenanceSchema,
});

export const CombatCardSchema = z.object({
  unlock: z.array(BulletSchema).default([]),
  constraints: z.array(BulletSchema).default([]),
  dangers: z.array(BulletSchema).default([]),
  tips: z.array(BulletSchema).default([]),
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
  // v0.5 Combat Cards — null = monstre lambda.
  combat: CombatCardSchema.nullable().default(null),
});

// LEGACY v0.3
export const BossStrategyLegacySchema = z.object({
  text: z.string().min(30),
  source: z.literal('fandom-en'),
  sourceUrl: z.string().url(),
});

export const BossSchema = MonsterSchema.extend({
  strategy: BossStrategyLegacySchema.nullable().default(null),
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
  // v0.5 transition — snapshot textuel des strategies v0.4 par boss.
  legacyStrategies: z.array(z.string()).optional(),
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

export const DungeonsArraySchema = z.array(DungeonSchema);

export type Lang = z.infer<typeof LangEnum>;
export type Anchor = z.infer<typeof AnchorSchema>;
export type Provenance = z.infer<typeof ProvenanceSchema>;
export type StrategyLong = z.infer<typeof StrategyLongSchema>;
export type StrategyShort = z.infer<typeof StrategyShortSchema>;
export type StrategyBundle = z.infer<typeof StrategyBundleSchema>;
export type ActionableBullet = z.infer<typeof ActionableBulletSchema>;
export type Monster = z.infer<typeof MonsterSchema>;
export type Boss = z.infer<typeof BossSchema>;
export type Dungeon = z.infer<typeof DungeonSchema>;
export type BossStrategyLegacy = z.infer<typeof BossStrategyLegacySchema>;
export type MechanicType = z.infer<typeof MechanicTypeEnum>;
export type CombatSeverity = z.infer<typeof CombatSeverityEnum>;
export type Bullet = z.infer<typeof BulletSchema>;
export type CombatCard = z.infer<typeof CombatCardSchema>;
export type CombatBlockKey = 'unlock' | 'constraints' | 'dangers' | 'tips';

export const COMBAT_BLOCK_ORDER: readonly CombatBlockKey[] = [
  'unlock',
  'constraints',
  'dangers',
  'tips',
] as const;

export function isCombatCardEmpty(card: CombatCard | null): boolean {
  if (!card) return true;
  return (
    card.unlock.length === 0 &&
    card.constraints.length === 0 &&
    card.dangers.length === 0 &&
    card.tips.length === 0
  );
}

export interface ValidationReport {
  valid: Dungeon[];
  errors: Array<{ index: number; name: string; issues: z.ZodIssue[] }>;
}

export function validateDungeons(raw: unknown[]): ValidationReport {
  const valid: Dungeon[] = [];
  const errors: ValidationReport['errors'] = [];

  raw.forEach((item, index) => {
    const result = DungeonSchema.safeParse(item);
    if (result.success) {
      valid.push(result.data);
    } else {
      const name = (item as { name?: string }).name ?? `[index ${index}]`;
      errors.push({ index, name, issues: result.error.issues });
    }
  });

  return { valid, errors };
}
