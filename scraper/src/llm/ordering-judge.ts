import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { callLlm, type LlmCallOptions } from './client.ts';
import type { Lang } from '../validate.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROMPTS_DIR = join(__dirname, '..', 'prompts');

export const ORDERING_JUDGE_PROMPT_VERSION = 'ordering-judge-v1';

export interface OrderingJudgeResult {
  score: number;
  optimalOrder: number[];
  reason: string;
}

export interface JudgeOrderingInput {
  actions: Array<{ index: number; text: string }>;
  lang: Lang;
}

let cachedPrompt: string | null = null;
function loadPromptTemplate(): string {
  if (cachedPrompt) return cachedPrompt;
  cachedPrompt = readFileSync(
    join(PROMPTS_DIR, `${ORDERING_JUDGE_PROMPT_VERSION}.md`),
    'utf-8',
  );
  return cachedPrompt;
}

function renderPrompt(input: JudgeOrderingInput): string {
  const list = input.actions
    .map((a) => `${a.index}. ${a.text}`)
    .join('\n');
  return loadPromptTemplate()
    .replaceAll('{{LANG}}', input.lang)
    .replaceAll('{{ACTIONS}}', list);
}

function stripCodeFence(s: string): string {
  const trimmed = s.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*\n([\s\S]*?)\n```$/i);
  if (fenced) return fenced[1].trim();
  return trimmed;
}

function validateResult(raw: unknown, expectedLength: number): OrderingJudgeResult | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as { score?: unknown; optimalOrder?: unknown; reason?: unknown };
  if (typeof r.score !== 'number' || r.score < 0 || r.score > 1) return null;
  if (!Array.isArray(r.optimalOrder)) return null;
  if (r.optimalOrder.length !== expectedLength) return null;
  const indices = new Set<number>();
  for (const n of r.optimalOrder) {
    if (typeof n !== 'number' || !Number.isInteger(n) || n < 0 || n >= expectedLength) return null;
    if (indices.has(n)) return null;
    indices.add(n);
  }
  if (typeof r.reason !== 'string' || r.reason.length === 0) return null;
  return {
    score: r.score,
    optimalOrder: r.optimalOrder as number[],
    reason: r.reason.slice(0, 400),
  };
}

export async function judgeOrdering(
  input: JudgeOrderingInput,
  options: LlmCallOptions = {},
): Promise<OrderingJudgeResult | null> {
  if (input.actions.length < 2) return null; // trivial
  const prompt = renderPrompt(input);
  let record;
  try {
    record = await callLlm(prompt, {
      ...options,
      promptVersion: ORDERING_JUDGE_PROMPT_VERSION,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (!options.dryRun) {
      console.warn(`    ⚠ judgeOrdering error: ${msg}`);
    }
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(stripCodeFence(record.response));
  } catch {
    return null;
  }
  return validateResult(parsed, input.actions.length);
}

/** Rough token estimate for --dry-run-cost. */
export function estimateJudgeTokens(actions: Array<{ text: string }>): { input: number; output: number; total: number } {
  const rendered = renderPrompt({ actions: actions.map((a, i) => ({ index: i, text: a.text })), lang: 'fr' });
  const input = Math.ceil(rendered.length / 4);
  const output = 200;
  return { input, output, total: input + output };
}
