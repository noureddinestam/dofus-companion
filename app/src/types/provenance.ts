import { z } from 'zod';

export const ProvenanceLangEnum = z.enum(['fr', 'en']);
export type ProvenanceLang = z.infer<typeof ProvenanceLangEnum>;

export const AnchorSchema = z.object({
  bulletIndex: z.number().int().min(0),
  quote: z.string().min(5).max(300),
  similarity: z.number().min(0).max(1),
});

export const ProvenanceNativeSchema = z.object({
  kind: z.literal('native'),
  lang: ProvenanceLangEnum,
  source: z.enum(['fandom-en', 'fandom-fr', 'gamosaurus', 'manual']),
  sourceUrl: z.string().url(),
});

export const ProvenanceLlmSchema = z.object({
  kind: z.literal('llm-grounded'),
  baseLang: ProvenanceLangEnum,
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

export type Anchor = z.infer<typeof AnchorSchema>;
export type ProvenanceNative = z.infer<typeof ProvenanceNativeSchema>;
export type ProvenanceLlm = z.infer<typeof ProvenanceLlmSchema>;
export type ProvenanceCommunity = z.infer<typeof ProvenanceCommunitySchema>;
export type Provenance = z.infer<typeof ProvenanceSchema>;
