import { z } from 'zod';

const ElementEnum = z.enum(['air', 'eau', 'feu', 'terre', 'neutre']);

export const MonsterSchema = z.object({
  id: z.string(),
  name: z.string(),
  nameEn: z.string().nullable().default(null),
  level: z.number().int().min(0),
  hp: z.number().int().nullable().default(null),
  family: z.string().default('Inconnu'),
  weakElement: ElementEnum.nullable(),
  resistElement: ElementEnum.nullable(),
  source: z.enum(['dofusdb', 'fandom-en']),
  sourceUrl: z.string().url(),
});

export const BossStrategySchema = z.object({
  text: z.string().min(30),
  source: z.literal('fandom-en'),
  sourceUrl: z.string().url(),
});

export const BossSchema = MonsterSchema.extend({
  strategy: BossStrategySchema.nullable().default(null),
  phases: z
    .array(z.object({ trigger: z.string(), behavior: z.string() }))
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
  lastUpdated: z.string().datetime(),
  dataVersion: z.string(),
});

export type Monster = z.infer<typeof MonsterSchema>;
export type Boss = z.infer<typeof BossSchema>;
export type Dungeon = z.infer<typeof DungeonSchema>;
export type BossStrategy = z.infer<typeof BossStrategySchema>;

export const ELEMENT_LABELS = {
  air: 'Air',
  eau: 'Eau',
  feu: 'Feu',
  terre: 'Terre',
  neutre: 'Neutre',
} as const;

export const ELEMENT_ICON = {
  air: '💨',
  eau: '💧',
  feu: '🔥',
  terre: '🌍',
  neutre: '⚪',
} as const;

export const SOURCE_LABELS = {
  dofusdb: 'DofusDB',
  'fandom-en': 'Wiki Fandom EN',
} as const;
