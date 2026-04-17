import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { callLlm, type LlmCallOptions } from './client.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROMPTS_DIR = join(__dirname, '..', 'prompts');
const GLOSSARY_PATH = join(__dirname, '..', 'i18n', 'glossary.json');

export const TRANSLATE_PROMPT_VERSION = 'translate-v1';

interface TranslateOptions extends LlmCallOptions {
  /** Override pour tests. Par défaut : glossary.json packagé. */
  glossary?: Record<string, string>;
}

interface GlossaryFile {
  terms: Record<string, string>;
}

let cachedGlossary: Record<string, string> | null = null;
function loadGlossary(): Record<string, string> {
  if (cachedGlossary) return cachedGlossary;
  const raw = JSON.parse(readFileSync(GLOSSARY_PATH, 'utf-8')) as GlossaryFile;
  cachedGlossary = raw.terms;
  return cachedGlossary;
}

let cachedPrompt: string | null = null;
function loadPromptTemplate(): string {
  if (cachedPrompt) return cachedPrompt;
  cachedPrompt = readFileSync(join(PROMPTS_DIR, `${TRANSLATE_PROMPT_VERSION}.md`), 'utf-8');
  return cachedPrompt;
}

function renderPrompt(sourceText: string, glossary: Record<string, string>): string {
  const template = loadPromptTemplate();
  const glossaryJson = JSON.stringify(glossary, null, 2);
  return template.replace('{{GLOSSARY}}', glossaryJson).replace('{{SOURCE}}', sourceText);
}

export interface TranslateResult {
  translated: string;
  model: string;
  promptVersion: string;
  promptHash: string;
  createdAt: string;
}

/**
 * Traduit un texte EN → FR avec le glossaire canonique et le prompt figé.
 *
 * La sortie est déterministe pour un même couple (prompt + glossaire + source)
 * grâce au cache disque de callLlm.
 *
 * Ne valide PAS la traduction ici (post-validation dans validate/glossary.ts
 * + vérification structurelle au niveau de l'orchestrateur).
 */
export async function translate(
  sourceText: string,
  options: TranslateOptions = {},
): Promise<TranslateResult> {
  const glossary = options.glossary ?? loadGlossary();
  const prompt = renderPrompt(sourceText, glossary);

  const record = await callLlm(prompt, {
    ...options,
    promptVersion: TRANSLATE_PROMPT_VERSION,
  });

  return {
    translated: record.response,
    model: record.model,
    promptVersion: TRANSLATE_PROMPT_VERSION,
    promptHash: record.promptHash,
    createdAt: record.createdAt,
  };
}
