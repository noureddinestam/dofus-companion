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

/**
 * v0.5.1 bullet kind. Only meaningful inside `unlock[]` — context bullets are
 * permanent rules / setup info, action bullets are ordered execution steps.
 * `dangers` and `tips` tolerate the field but default to 'action'; the UI
 * ignores the field outside of unlock.
 */
export const BulletKindEnum = z.enum(['context', 'action']);

export const LocalizedBulletTextSchema = z.object({
  fr: z.string().min(3).max(160),
  en: z.string().min(3).max(160),
});

export const BulletSchema = z.object({
  text: LocalizedBulletTextSchema,
  kind: BulletKindEnum.default('action'),
  mechanicType: MechanicTypeEnum.nullable().default(null),
  severity: CombatSeverityEnum.nullable().default(null),
  provenance: ProvenanceSchema,
});

/**
 * Enforces the v0.5.1 ordering invariant inside `unlock[]`: every `context`
 * bullet must come before every `action` bullet. Interleaved
 * `[context, action, context, action]` is rejected at parse time with a
 * precise path so future scraper runs fail loudly instead of silently
 * shipping bad data.
 */
export const CombatCardSchema = z
  .object({
    unlock: z.array(BulletSchema).default([]),
    dangers: z.array(BulletSchema).default([]),
    tips: z.array(BulletSchema).default([]),
    // v0.5 legacy field kept optional so old datasets parse. v0.5.1 migration
    // folds these into `unlock.context[]` and stops emitting them. Removed in v0.6.
    constraints: z.array(BulletSchema).optional(),
  })
  .superRefine((card, ctx) => {
    let seenAction = false;
    for (let i = 0; i < card.unlock.length; i++) {
      const bullet = card.unlock[i];
      if (bullet.kind === 'action') {
        seenAction = true;
        continue;
      }
      if (bullet.kind === 'context' && seenAction) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `unlock bullet ${i} is kind='context' but follows an action bullet — all context bullets must precede all action bullets`,
          path: ['unlock', i, 'kind'],
        });
      }
    }
  });

export type MechanicType = z.infer<typeof MechanicTypeEnum>;
export type CombatSeverity = z.infer<typeof CombatSeverityEnum>;
export type BulletKind = z.infer<typeof BulletKindEnum>;
export type LocalizedBulletText = z.infer<typeof LocalizedBulletTextSchema>;
export type Bullet = z.infer<typeof BulletSchema>;
export type CombatCard = z.infer<typeof CombatCardSchema>;

/**
 * v0.5.1 drops `constraints` from the visible order. `constraints` is still
 * emitted in the enum for the legacy migration code path and the audit tools.
 */
export type CombatBlockKey = 'unlock' | 'constraints' | 'dangers' | 'tips';

/** The order in which blocks are rendered in the UI (constraints dropped in v0.5.1). */
export const COMBAT_BLOCK_ORDER: readonly Exclude<CombatBlockKey, 'constraints'>[] = [
  'unlock',
  'dangers',
  'tips',
] as const;

/** Legacy order including constraints — used by migration + ambiguity auditor. */
export const COMBAT_BLOCK_ORDER_LEGACY: readonly CombatBlockKey[] = [
  'unlock',
  'constraints',
  'dangers',
  'tips',
] as const;

export function isCombatCardEmpty(card: CombatCard | null): boolean {
  if (!card) return true;
  const constraintsCount = card.constraints?.length ?? 0;
  return (
    card.unlock.length === 0 &&
    constraintsCount === 0 &&
    card.dangers.length === 0 &&
    card.tips.length === 0
  );
}

/** Partition unlock[] for rendering — context first, then actions. */
export function partitionUnlock(card: CombatCard): { context: Bullet[]; action: Bullet[] } {
  const context: Bullet[] = [];
  const action: Bullet[] = [];
  for (const b of card.unlock) {
    if (b.kind === 'context') context.push(b);
    else action.push(b);
  }
  return { context, action };
}
