import { cachedFetch, sleep } from '../cache.ts';

// Wiki Fandom FR — couverture historique très partielle sur les donjons.
// On capture quand même ce qui existe (valeur : natif FR = zéro LLM).
const API = 'https://dofus.fandom.com/fr/api.php';

// Sections de stratégie en français : essayer les variantes courantes.
const STRATEGY_SECTION_PATTERNS = /^(strat[eé]gie|strat[eé]gies|tactique|tactiques|astuces|conseils|m[eé]canique|m[eé]caniques|combat|guide)s?$/i;

export interface FandomFrStrategy {
  pageTitle: string;
  url: string;
  text: string;
}

interface ParseResponse {
  parse?: {
    title: string;
    wikitext?: { '*': string };
    sections?: Array<{ line: string; index: string; anchor: string }>;
  };
  error?: { code: string; info: string };
}

interface OpensearchResponse {
  0: string;
  1: string[];
  2: string[];
  3: string[];
}

function cleanWikitext(text: string): string {
  return text
    .replace(/\{\{[^{}]*\}\}/g, '')
    .replace(/\{\{[^{}]*\}\}/g, '')
    .replace(/\[\[(?:Fichier|File|Image):[^\]]+\]\]/gi, '')
    .replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, '$2')
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    .replace(/'''([^']+)'''/g, '$1')
    .replace(/''([^']+)''/g, '$1')
    .replace(/<ref[^>]*>[\s\S]*?<\/ref>/g, '')
    .replace(/<ref[^>]*\/>/g, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/^\s*[*#:]+\s*/gm, '• ')
    .replace(/^={3,}\s*(.+?)\s*={3,}$/gm, '$1:')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

function extractSectionWikitext(wikitext: string, sectionName: string): string | null {
  const escaped = sectionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(
    `==\\s*${escaped}\\s*==\\s*\\n([\\s\\S]*?)(?=\\n==[^=]|$)`,
    'i',
  );
  const match = wikitext.match(re);
  return match ? match[1].trim() : null;
}

async function searchPage(query: string): Promise<string | null> {
  const url = `${API}?action=opensearch&search=${encodeURIComponent(query)}&limit=1&format=json`;
  const { body, status } = await cachedFetch(url);
  if (status !== 200) return null;
  try {
    const data = JSON.parse(body) as OpensearchResponse;
    return data[1]?.[0] ?? null;
  } catch {
    return null;
  }
}

async function fetchParse(pageTitle: string): Promise<ParseResponse | null> {
  const url = `${API}?action=parse&page=${encodeURIComponent(pageTitle)}&prop=wikitext%7Csections&format=json&redirects=1`;
  const { body, status } = await cachedFetch(url);
  if (status !== 200) return null;
  try {
    return JSON.parse(body) as ParseResponse;
  } catch {
    return null;
  }
}

/**
 * Tente de récupérer une section stratégie FR pour un boss.
 * Essaye le nom FR d'abord, puis fallback nameEn (certaines pages FR utilisent
 * le titre EN). Retourne null si la page ou la section n'existe pas.
 */
export async function fetchBossStrategyFr(
  bossNameFr: string,
  bossNameEn: string | null,
  onStep?: (msg: string) => void,
): Promise<FandomFrStrategy | null> {
  const candidates = [bossNameFr, bossNameEn].filter((n): n is string => Boolean(n));
  if (candidates.length === 0) return null;

  for (const name of candidates) {
    onStep?.(`FR "${name}"`);

    // 1. Essai direct
    let pageTitle: string | null = name;
    let parse = await fetchParse(pageTitle);

    // 2. Fallback opensearch
    if (!parse?.parse) {
      await sleep(500);
      pageTitle = await searchPage(name);
      if (!pageTitle) continue;
      parse = await fetchParse(pageTitle);
    }

    if (!parse?.parse?.wikitext) continue;

    const wikitext = parse.parse.wikitext['*'];
    const sections = parse.parse.sections ?? [];

    const stratSection = sections.find((s) =>
      STRATEGY_SECTION_PATTERNS.test(s.line.trim()),
    );
    if (!stratSection) continue;

    const raw = extractSectionWikitext(wikitext, stratSection.line);
    if (!raw) continue;

    const text = cleanWikitext(raw).slice(0, 1500);
    if (text.length < 30) continue;

    const encodedPage = encodeURIComponent(parse.parse.title.replace(/\s+/g, '_'));
    return {
      pageTitle: parse.parse.title,
      url: `https://dofus.fandom.com/fr/wiki/${encodedPage}`,
      text,
    };
  }

  return null;
}
