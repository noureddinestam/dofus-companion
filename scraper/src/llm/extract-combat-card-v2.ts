import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { callLlm, type LlmCallOptions } from './client.ts';
import {
  validateCombatCardV2Response,
  type CombatCardV2ValidationReport,
  type RawCombatCardCandidateV2,
} from '../validate/combat-card-v2.ts';
import type { EntityKind } from '../audit/types.ts';
import type { Lang } from '../validate.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROMPTS_DIR = join(__dirname, '..', 'prompts');

export const EXTRACT_COMBAT_CARD_V2_PROMPT_VERSION = 'extract-combat-card-v2';

let cachedPrompt: string | null = null;
function loadPromptTemplate(): string {
  if (cachedPrompt) return cachedPrompt;
  cachedPrompt = readFileSync(
    join(PROMPTS_DIR, `${EXTRACT_COMBAT_CARD_V2_PROMPT_VERSION}.md`),
    'utf-8',
  );
  return cachedPrompt;
}

export interface ExtractCombatCardV2Input {
  sourceText: string;
  sourceLang: Lang;
  sourceUrl: string;
  entityKind: EntityKind;
  entityName: string;
}

function renderPrompt(input: ExtractCombatCardV2Input): string {
  return loadPromptTemplate()
    .replaceAll('{{LANG}}', input.sourceLang)
    .replaceAll('{{SOURCE}}', input.sourceText)
    .replaceAll('{{ENTITY_KIND}}', input.entityKind)
    .replaceAll('{{ENTITY_NAME}}', input.entityName);
}

function stripCodeFence(s: string): string {
  const trimmed = s.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*\n([\s\S]*?)\n```$/i);
  if (fenced) return fenced[1].trim();
  return trimmed;
}

export interface ExtractCombatCardV2Result {
  report: CombatCardV2ValidationReport;
  model: string;
  promptVersion: string;
  promptHash: string;
  createdAt: string;
}

export async function extractCombatCardV2(
  input: ExtractCombatCardV2Input,
  options: LlmCallOptions = {},
): Promise<ExtractCombatCardV2Result | null> {
  const prompt = renderPrompt(input);
  let record;
  try {
    record = await callLlm(prompt, { ...options, promptVersion: EXTRACT_COMBAT_CARD_V2_PROMPT_VERSION });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (!options.dryRun) {
      console.warn(`    ⚠ extractCombatCardV2(${input.sourceLang}, ${input.entityName}) error: ${msg}`);
    }
    return null;
  }

  let parsed: RawCombatCardCandidateV2;
  try {
    parsed = JSON.parse(stripCodeFence(record.response)) as RawCombatCardCandidateV2;
  } catch {
    return null;
  }

  const report = validateCombatCardV2Response(parsed, {
    sourceText: input.sourceText,
    sourceLang: input.sourceLang,
    sourceUrl: input.sourceUrl,
    model: record.model,
    promptVersion: EXTRACT_COMBAT_CARD_V2_PROMPT_VERSION,
    generatedAt: record.createdAt,
  });

  return {
    report,
    model: record.model,
    promptVersion: EXTRACT_COMBAT_CARD_V2_PROMPT_VERSION,
    promptHash: record.promptHash,
    createdAt: record.createdAt,
  };
}

export function estimateV2Tokens(sourceText: string): { input: number; output: number; total: number } {
  const rendered = renderPrompt({
    sourceText,
    sourceLang: 'fr',
    sourceUrl: '',
    entityKind: 'boss',
    entityName: 'placeholder',
  });
  const input = Math.ceil(rendered.length / 4);
  const output = 700;
  return { input, output, total: input + output };
}
