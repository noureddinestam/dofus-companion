import { createHash } from 'crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import Anthropic from '@anthropic-ai/sdk';

const CACHE_DIR = join(process.cwd(), 'cache', 'llm');
mkdirSync(CACHE_DIR, { recursive: true });

export const DEFAULT_MODEL = 'claude-sonnet-4-5';

export interface LlmCallOptions {
  /** Skip network calls — use cache only. Throws if no cache hit. */
  dryRun?: boolean;
  /** Override default model. */
  model?: string;
  /** Max output tokens (Anthropic defaults to model-dependent). */
  maxTokens?: number;
  /** System prompt (optional). */
  system?: string;
}

export interface LlmCallRecord {
  model: string;
  system?: string;
  prompt: string;
  response: string;
  promptHash: string;
  responseHash: string;
  createdAt: string;
  promptVersion?: string;
}

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY env var is not set');
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

export function hasApiKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

function hashInput(model: string, system: string | undefined, prompt: string): string {
  return createHash('sha256')
    .update(`${model}\x00${system ?? ''}\x00${prompt}`)
    .digest('hex')
    .slice(0, 32);
}

function cachePath(hash: string): string {
  return join(CACHE_DIR, `${hash}.json`);
}

function readCache(hash: string): LlmCallRecord | null {
  const path = cachePath(hash);
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as LlmCallRecord;
  } catch {
    return null;
  }
}

function writeCache(record: LlmCallRecord): void {
  writeFileSync(cachePath(record.promptHash), JSON.stringify(record, null, 2));
}

/**
 * Appelle Anthropic API avec cache disque obligatoire.
 *
 * - Cache key = sha256(model + system + prompt)[0..32]
 * - Hit cache → pas d'appel réseau, réponse retournée direct
 * - Dry-run : lance une erreur si pas de hit cache (forcé à reproduire)
 * - Log structuré sur chaque appel réseau (hash prompt/réponse + timestamp)
 */
export async function callLlm(
  prompt: string,
  options: LlmCallOptions & { promptVersion?: string } = {},
): Promise<LlmCallRecord> {
  const model = options.model ?? DEFAULT_MODEL;
  const hash = hashInput(model, options.system, prompt);

  const cached = readCache(hash);
  if (cached) return cached;

  if (options.dryRun) {
    throw new Error(`[llm] cache miss in dry-run mode (hash=${hash})`);
  }

  const anthropic = getClient();
  const response = await anthropic.messages.create({
    model,
    max_tokens: options.maxTokens ?? 4096,
    system: options.system,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim();

  const record: LlmCallRecord = {
    model,
    system: options.system,
    prompt,
    response: text,
    promptHash: hash,
    responseHash: createHash('sha256').update(text).digest('hex').slice(0, 32),
    createdAt: new Date().toISOString(),
    promptVersion: options.promptVersion,
  };

  writeCache(record);
  console.log(
    `  ↳ llm(${model}) ${options.promptVersion ?? '–'} ${hash.slice(0, 8)} → ${record.responseHash.slice(0, 8)}`,
  );
  return record;
}
