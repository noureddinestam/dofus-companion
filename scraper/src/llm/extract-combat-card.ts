import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { callLlm, type LlmCallOptions } from './client.ts';
import {
  validateCombatCardResponse,
  type CombatCardValidationReport,
  type RawCombatCardCandidate,
} from '../validate/combat-card.ts';
import type { Lang } from '../validate.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROMPTS_DIR = join(__dirname, '..', 'prompts');

export const EXTRACT_COMBAT_CARD_PROMPT_VERSION = 'extract-combat-card-v1';

let cachedPrompt: string | null = null;
function loadPromptTemplate(): string {
  if (cachedPrompt) return cachedPrompt;
  cachedPrompt = readFileSync(
    join(PROMPTS_DIR, `${EXTRACT_COMBAT_CARD_PROMPT_VERSION}.md`),
    'utf-8',
  );
  return cachedPrompt;
}

function renderPrompt(sourceText: string, lang: Lang): string {
  return loadPromptTemplate()
    .replaceAll('{{LANG}}', lang)
    .replaceAll('{{SOURCE}}', sourceText);
}

/**
 * Strip markdown code fences (``` or ```json) autour d'un JSON LLM,
 * qu'il peut ajouter malgré l'instruction de sortie pure.
 */
function stripCodeFence(s: string): string {
  const trimmed = s.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*\n([\s\S]*?)\n```$/i);
  if (fenced) return fenced[1].trim();
  return trimmed;
}

export interface ExtractCombatCardResult {
  report: CombatCardValidationReport;
  model: string;
  promptVersion: string;
  promptHash: string;
  createdAt: string;
}

export interface ExtractCombatCardInput {
  sourceText: string;
  sourceLang: Lang;
  sourceUrl: string;
}

/**
 * Convertit un texte stratégique source en CombatCard 4 blocs via LLM,
 * valide chaque bullet via anchor fuzzyContains ≥ 0.75 et respect des enums.
 *
 * Retourne null si le JSON est illisible ou si tous les bullets ont été
 * rejetés. Sinon un rapport chiffré avec la card + liste des rejets.
 */
export async function extractCombatCard(
  input: ExtractCombatCardInput,
  options: LlmCallOptions = {},
): Promise<ExtractCombatCardResult | null> {
  const prompt = renderPrompt(input.sourceText, input.sourceLang);
  let record;
  try {
    record = await callLlm(prompt, {
      ...options,
      promptVersion: EXTRACT_COMBAT_CARD_PROMPT_VERSION,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (!options.dryRun) {
      console.warn(`    ⚠ extractCombatCard(${input.sourceLang}) error: ${msg}`);
    }
    return null;
  }

  let parsed: RawCombatCardCandidate;
  try {
    parsed = JSON.parse(stripCodeFence(record.response)) as RawCombatCardCandidate;
  } catch {
    return null;
  }

  const report = validateCombatCardResponse(parsed, {
    sourceText: input.sourceText,
    sourceLang: input.sourceLang,
    sourceUrl: input.sourceUrl,
    model: record.model,
    promptVersion: EXTRACT_COMBAT_CARD_PROMPT_VERSION,
    generatedAt: record.createdAt,
  });

  return {
    report,
    model: record.model,
    promptVersion: EXTRACT_COMBAT_CARD_PROMPT_VERSION,
    promptHash: record.promptHash,
    createdAt: record.createdAt,
  };
}

/**
 * Estime grossièrement le coût en tokens d'un prompt rendu — utilisé par le mode
 * dry-run-cost. Anthropic facture input + output ; on approxime le prompt à
 * ~4 chars/token et on prévoit 700 output tokens par card (observé sur
 * summarize-v1, borne haute pour 4 blocs).
 */
export function estimateTokens(sourceText: string): { input: number; output: number; total: number } {
  const rendered = renderPrompt(sourceText, 'fr');
  const input = Math.ceil(rendered.length / 4);
  const output = 700;
  return { input, output, total: input + output };
}
