import { z } from 'zod';

export const BugKindEnum = z.enum(['ambiguity', 'cross-entity', 'ordering']);
export type BugKind = z.infer<typeof BugKindEnum>;

export const FlagSeverityEnum = z.enum(['high', 'medium', 'low']);
export type FlagSeverity = z.infer<typeof FlagSeverityEnum>;

export const EntityKindEnum = z.enum(['boss', 'monster']);
export type EntityKind = z.infer<typeof EntityKindEnum>;

/** Where a bullet currently lives in the card (for ambiguity + cross-entity flags). */
export const BulletLocationSchema = z.object({
  block: z.enum(['unlock', 'constraints', 'dangers', 'tips']),
  index: z.number().int().min(0),
});
export type BulletLocation = z.infer<typeof BulletLocationSchema>;

/** One flag = one specific problem on one specific entity. */
export const CardFlagSchema = z.object({
  bug: BugKindEnum,
  severity: FlagSeverityEnum,

  entity: z.object({
    kind: EntityKindEnum,
    id: z.string(),
    name: z.string(),
    dungeonId: z.string(),
    dungeonName: z.string(),
  }),

  /** Bullet this flag targets, when applicable. Ordering flags target a whole block. */
  bullet: z
    .object({
      location: BulletLocationSchema,
      textFr: z.string(),
      textEn: z.string(),
      anchorQuote: z.string().nullable(),
    })
    .nullable(),

  /** Numeric signal that caused the flag (Dice, similarity ratio, order score, …). */
  signal: z.number(),

  /** Human-readable explanation (1 short sentence). */
  explanation: z.string(),

  /** Actionable suggestion for the fix (1 sentence). */
  suggestion: z.string(),

  /** Free-form structured payload (detector-specific, kept for the JSON report). */
  details: z.record(z.string(), z.unknown()).default({}),
});
export type CardFlag = z.infer<typeof CardFlagSchema>;

/** Aggregated numbers for one bug kind. */
export const BugSummarySchema = z.object({
  bug: BugKindEnum,
  cardsFlagged: z.number().int().min(0),
  totalFlags: z.number().int().min(0),
  percentCardsFlagged: z.number().min(0).max(100),
  recommendation: z.enum([
    'no-op',
    'patch-targeted',
    'regenerate-flagged',
    'regenerate-complete',
    'regenerate-and-manual-review',
    'needs-human-review',
  ]),
  recommendationReason: z.string(),
  topExamples: z.array(CardFlagSchema).max(5),
});
export type BugSummary = z.infer<typeof BugSummarySchema>;

/** Top-level audit report. */
export const AuditReportSchema = z.object({
  generatedAt: z.string().datetime(),
  datasetPath: z.string(),
  counts: z.object({
    totalDungeons: z.number().int().min(0),
    totalBossCards: z.number().int().min(0),
    totalMonsterCards: z.number().int().min(0),
  }),
  bugs: z.array(BugSummarySchema),
  /** Union of every entityId flagged by at least one detector, for Phase 4 --regenerate-flagged. */
  flaggedEntityIds: z.array(z.string()),
});
export type AuditReport = z.infer<typeof AuditReportSchema>;
