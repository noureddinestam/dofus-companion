import { cachedFetch, sleep } from '../cache.ts';

/**
 * Source : pages monstres individuelles sur le Wiki Fandom (EN + FR).
 *
 * Pattern identique à fandom.ts / fandom-fr.ts mais le scope est plus large :
 * on ratisse toutes les sections de "stratégie" possibles sur une page monstre,
 * car la structure y est moins standardisée qu'une page boss.
 *
 * Renvoie la première langue trouvée qui a du contenu (FR prioritaire).
 * Cache + rate-limit gérés par cachedFetch / sleep, reprise inchangée v0.4.
 */

const API_FR = 'https://dofus.fandom.com/fr/api.php';
const API_EN = 'https://dofuswiki.fandom.com/api.php';

const STRATEGY_PATTERN_FR =
  /^(strat[eé]gie|strat[eé]gies|tactique|tactiques|astuces|conseils|m[eé]canique|m[eé]caniques|combat|guide|comportement)s?$/i;
const STRATEGY_PATTERN_EN =
  /^(strategy|strategies|tactics|tips|combat|mechanics|mechanic|gameplay|notes|behavior|behaviour)$/i;

export type MonsterSourceLang = 'fr' | 'en';

export interface FandomMonsterStrategy {
  pageTitle: string;
  url: string;
  text: string;
  lang: MonsterSourceLang;
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

async function fetchParse(apiBase: string, pageTitle: string): Promise<ParseResponse | null> {
  const url = `${apiBase}?action=parse&page=${encodeURIComponent(pageTitle)}&prop=wikitext%7Csections&format=json&redirects=1`;
  const { body, status } = await cachedFetch(url);
  if (status !== 200) return null;
  try {
    return JSON.parse(body) as ParseResponse;
  } catch {
    return null;
  }
}

async function searchPage(apiBase: string, query: string): Promise<string | null> {
  const url = `${apiBase}?action=opensearch&search=${encodeURIComponent(query)}&limit=1&format=json`;
  const { body, status } = await cachedFetch(url);
  if (status !== 200) return null;
  try {
    const data = JSON.parse(body) as OpensearchResponse;
    return data[1]?.[0] ?? null;
  } catch {
    return null;
  }
}

async function fetchOneLang(
  apiBase: string,
  wikiBaseUrl: string,
  pattern: RegExp,
  candidates: string[],
  lang: MonsterSourceLang,
): Promise<FandomMonsterStrategy | null> {
  for (const name of candidates) {
    if (!name) continue;
    let pageTitle: string | null = name;
    let parse = await fetchParse(apiBase, pageTitle);

    if (!parse?.parse) {
      await sleep(500);
      pageTitle = await searchPage(apiBase, name);
      if (!pageTitle) continue;
      parse = await fetchParse(apiBase, pageTitle);
    }

    if (!parse?.parse?.wikitext) continue;

    const wikitext = parse.parse.wikitext['*'];
    const sections = parse.parse.sections ?? [];
    const stratSection = sections.find((s) => pattern.test(s.line.trim()));
    if (!stratSection) continue;

    const raw = extractSectionWikitext(wikitext, stratSection.line);
    if (!raw) continue;

    const text = cleanWikitext(raw).slice(0, 1800);
    if (text.length < 30) continue;

    const encodedPage = encodeURIComponent(parse.parse.title.replace(/\s+/g, '_'));
    return {
      pageTitle: parse.parse.title,
      url: `${wikiBaseUrl}${encodedPage}`,
      text,
      lang,
    };
  }
  return null;
}

/**
 * Tente de récupérer la section stratégie d'un monstre.
 * Essaie FR d'abord (meilleure couverture native), puis EN.
 * Retourne la première langue qui a du contenu exploitable.
 */
export async function fetchMonsterStrategy(
  nameFr: string,
  nameEn: string | null,
): Promise<FandomMonsterStrategy | null> {
  // FR d'abord : on privilégie le natif.
  const fr = await fetchOneLang(
    API_FR,
    'https://dofus.fandom.com/fr/wiki/',
    STRATEGY_PATTERN_FR,
    [nameFr, nameEn].filter((n): n is string => Boolean(n)),
    'fr',
  );
  if (fr) return fr;

  // EN en fallback.
  if (!nameEn) return null;
  return fetchOneLang(API_EN, 'https://dofuswiki.fandom.com/wiki/', STRATEGY_PATTERN_EN, [nameEn], 'en');
}
