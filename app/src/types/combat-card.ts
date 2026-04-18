import { z } from 'zod';
import { ProvenanceSchema } from './provenance';

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

export type MechanicType = z.infer<typeof MechanicTypeEnum>;
export type CombatSeverity = z.infer<typeof CombatSeverityEnum>;
export type LocalizedBulletText = z.infer<typeof LocalizedBulletTextSchema>;
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
