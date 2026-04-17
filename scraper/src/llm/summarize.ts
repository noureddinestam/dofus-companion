import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { callLlm, type LlmCallOptions } from './client.ts';
import { fuzzyContains, ANCHOR_MIN_SIMILARITY } from '../validate/anchors.ts';
import type { ActionableBullet, Anchor } from '../validate.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROMPTS_DIR = join(__dirname, '..', 'prompts');

export const SUMMARIZE_PROMPT_VERSION = 'summarize-v1';

const VALID_ICONS: ReadonlySet<ActionableBullet['icon']> = new Set([
  'priority',
  'avoid',
  'element',
  'position',
  'phase',
  'instakill',
  'cooldown',
  'summon',
  'tip',
]);

const VALID_SEVERITIES: ReadonlySet<ActionableBullet['severity']> = new Set([
  'critical',
  'danger',
  'caution',
  'info',
]);

export interface SummaryBulletRaw {
  icon?: string;
  severity?: string;
  text?: string;
  quote?: string;
}

export interface ValidatedSummary {
  bullets: ActionableBullet[];
  anchors: Anchor[];
  rejected: number;
}

export interface SummarizeResult {
  summary: ValidatedSummary;
  model: string;
  promptVersion: string;
  promptHash: string;
  createdAt: string;
}

let cachedPrompt: string | null = null;
function loadPromptTemplate(): string {
  if (cachedPrompt) return cachedPrompt;
  cachedPrompt = readFileSync(join(PROMPTS_DIR, `${SUMMARIZE_PROMPT_VERSION}.md`), 'utf-8');
  return cachedPrompt;
}

function renderPrompt(sourceText: string, lang: 'fr' | 'en'): string {
  return loadPromptTemplate()
    .replace('{{LANG}}', lang)
    .replace('{{SOURCE}}', sourceText);
}

/**
 * Strip markdown code fences (``` or ```json) qu'un LLM peut ajouter malgré
 * l'instruction "JSON uniquement, sans wrapping".
 */
function stripCodeFence(s: string): string {
  const trimmed = s.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*\n([\s\S]*?)\n```$/i);
  if (fenced) return fenced[1].trim();
  return trimmed;
}

/**
 * Parse un JSON LLM et valide chaque bullet contre le texte source via ancre
 * fuzzy (similarité ≥ 0.75).
 *
 * - Rejette les bullets dont la quote n'est pas ancrée (warn, count)
 * - Rejette les bullets dont icon/severity sont hors énumération
 * - Rejette les bullets dont text est hors [5, 160] chars
 * - Si < 3 bullets valides → retourne null (jamais de short bâclée, per R2)
 *
 * Retourne { bullets, anchors, rejected } ou null.
 */
export function validateSummaryResponse(
  rawResponse: string,
  sourceText: string,
): ValidatedSummary | null {
  let parsed: { bullets?: unknown };
  try {
    parsed = JSON.parse(stripCodeFence(rawResponse));
  } catch {
    return null;
  }

  if (!parsed || !Array.isArray(parsed.bullets)) return null;

  const validated: ActionableBullet[] = [];
  const anchors: Anchor[] = [];
  let rejected = 0;

  for (const raw of parsed.bullets as SummaryBulletRaw[]) {
    if (!raw.icon || !raw.severity || !raw.text || !raw.quote) {
      rejected++;
      continue;
    }
    if (!VALID_ICONS.has(raw.icon as ActionableBullet['icon'])) {
      rejected++;
      continue;
    }
    if (!VALID_SEVERITIES.has(raw.severity as ActionableBullet['severity'])) {
      rejected++;
      continue;
    }
    if (raw.text.length < 5 || raw.text.length > 160) {
      rejected++;
      continue;
    }
    if (raw.quote.length < 5 || raw.quote.length > 300) {
      rejected++;
      continue;
    }

    const similarity = fuzzyContains(sourceText, raw.quote);
    if (similarity < ANCHOR_MIN_SIMILARITY) {
      rejected++;
      continue;
    }

    const bulletIndex = validated.length;
    validated.push({
      icon: raw.icon as ActionableBullet['icon'],
      severity: raw.severity as ActionableBullet['severity'],
      text: raw.text,
    });
    anchors.push({
      bulletIndex,
      quote: raw.quote.slice(0, 300),
      similarity,
    });
  }

  if (validated.length < 3 || validated.length > 6) {
    return null;
  }

  return { bullets: validated, anchors, rejected };
}

/**
 * Produit un résumé actionnable (3-6 bullets) depuis un long text dans une lang.
 * Retourne null si validation échoue (bullets rejetés, < 3 valides, JSON cassé).
 *
 * L'appelant passe le long text qui a déjà été validé (traduit ou natif).
 */
export async function summarize(
  sourceText: string,
  lang: 'fr' | 'en',
  options: LlmCallOptions = {},
): Promise<SummarizeResult | null> {
  const prompt = renderPrompt(sourceText, lang);
  let record;
  try {
    record = await callLlm(prompt, {
      ...options,
      promptVersion: SUMMARIZE_PROMPT_VERSION,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (!options.dryRun) {
      console.warn(`    ⚠ summarize(${lang}) error: ${msg}`);
    }
    return null;
  }

  const summary = validateSummaryResponse(record.response, sourceText);
  if (!summary) return null;

  return {
    summary,
    model: record.model,
    promptVersion: SUMMARIZE_PROMPT_VERSION,
    promptHash: record.promptHash,
    createdAt: record.createdAt,
  };
}
