import { z } from 'zod';

// Mirror of app/src/types/dungeon.ts — source of truth stays in the app
export const MonsterSchema = z.object({
  id: z.string(),
  name: z.string(),
  level: z.number().int().min(1).max(300),
  hp: z.number().int().optional(),
  family: z.string(),
  weakElement: z.enum(['air', 'eau', 'feu', 'terre', 'neutre']).nullable(),
  resistElement: z.enum(['air', 'eau', 'feu', 'terre', 'neutre']).nullable(),
  priority: z.enum(['critical', 'danger', 'caution', 'manageable']),
  priorityReason: z.string().min(5).max(200),
  keyMechanic: z.string().nullable(),
  source: z.enum(['dofuspourlesnoobs', 'dofusdb', 'manual']),
  sourceUrl: z.string().url(),
  verified: z.boolean(),
});

export const BossSchema = MonsterSchema.extend({
  phases: z.array(z.object({ trigger: z.string(), behavior: z.string() })).default([]),
  instantKillConditions: z.array(z.string()).default([]),
  recommendedStrategy: z.string(),
  recommendedComp: z.array(z.string()).default([]),
});

export const DungeonSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  aliases: z.array(z.string()).default([]),
  levelRange: z.tuple([z.number(), z.number()]),
  recommendedLevel: z.number(),
  zone: z.string(),
  continent: z.string(),
  imageUrl: z.string().url().nullable(),
  monsters: z.array(MonsterSchema).min(1),
  boss: BossSchema,
  rooms: z.number().int().default(5),
  keyRequired: z.boolean().default(false),
  achievements: z.array(z.string()).default([]),
  lastUpdated: z.string().datetime(),
  dataVersion: z.string(),
});

export const DungeonsArraySchema = z.array(DungeonSchema);

export type Monster = z.infer<typeof MonsterSchema>;
export type Boss = z.infer<typeof BossSchema>;
export type Dungeon = z.infer<typeof DungeonSchema>;

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
