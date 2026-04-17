import { cachedFetch, sleep } from '../cache.ts';

const API = 'https://dofuswiki.fandom.com/api.php';

export interface FandomStrategy {
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

// Clean wikitext → readable text
function cleanWikitext(text: string): string {
  return text
    // Enlever les templates { { ... } } (non-récursif suffisant ici)
    .replace(/\{\{[^{}]*\}\}/g, '')
    .replace(/\{\{[^{}]*\}\}/g, '') // 2e passe pour templates imbriqués simples
    // [[Fichier:...]] / [[File:...]] → supprimé
    .replace(/\[\[(?:Fichier|File|Image):[^\]]+\]\]/gi, '')
    // [[page|libellé]] → libellé
    .replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, '$2')
    // [[page]] → page
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    // Gras/italique
    .replace(/'''([^']+)'''/g, '$1')
    .replace(/''([^']+)''/g, '$1')
    // Balises HTML
    .replace(/<ref[^>]*>[\s\S]*?<\/ref>/g, '')
    .replace(/<ref[^>]*\/>/g, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    // Listes : *, #, : en début de ligne → "• "
    .replace(/^\s*[*#:]+\s*/gm, '• ')
    // Titres H3+ → supprimer
    .replace(/^={3,}\s*(.+?)\s*={3,}$/gm, '$1:')
    // Compression des sauts de ligne
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

function extractSectionWikitext(wikitext: string, sectionName: string): string | null {
  // Match `== Section Name ==` then capture until next `==` heading or EOF
  const re = new RegExp(
    `==\\s*${sectionName}\\s*==\\s*\\n([\\s\\S]*?)(?=\\n==[^=]|$)`,
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
 * Tente de récupérer la section "Strategy" d'un boss sur le Wiki Fandom EN.
 * Retourne null si la page ou la section n'existe pas.
 */
export async function fetchBossStrategy(
  bossNameEn: string,
  onStep?: (msg: string) => void,
): Promise<FandomStrategy | null> {
  if (!bossNameEn) return null;

  onStep?.(`search "${bossNameEn}"`);
  // 1. Essai direct avec le nom tel quel (underscores pour espaces)
  let pageTitle: string | null = bossNameEn;
  let parse = await fetchParse(pageTitle);

  // 2. Fallback : opensearch pour trouver le vrai titre
  if (!parse?.parse) {
    await sleep(500);
    pageTitle = await searchPage(bossNameEn);
    if (!pageTitle) return null;
    parse = await fetchParse(pageTitle);
  }

  if (!parse?.parse?.wikitext) return null;

  const wikitext = parse.parse.wikitext['*'];
  const sections = parse.parse.sections ?? [];

  // Chercher une section "Strategy" / "Strategies" / "Tactics"
  const stratSection = sections.find((s) =>
    /^(strategy|strategies|tactics|tips)$/i.test(s.line.trim()),
  );
  if (!stratSection) return null;

  const raw = extractSectionWikitext(wikitext, stratSection.line);
  if (!raw) return null;

  const text = cleanWikitext(raw).slice(0, 1500);
  if (text.length < 30) return null;

  const encodedPage = encodeURIComponent(parse.parse.title.replace(/\s+/g, '_'));
  return {
    pageTitle: parse.parse.title,
    url: `https://dofuswiki.fandom.com/wiki/${encodedPage}`,
    text,
  };
}

/**
 * Construit une URL de guide externe par défaut (page Fandom EN du boss).
 * Utilisé même si la section Strategy n'existe pas.
 */
export function fandomPageUrl(bossNameEn: string | null): string | null {
  if (!bossNameEn) return null;
  const encoded = encodeURIComponent(bossNameEn.replace(/\s+/g, '_'));
  return `https://dofuswiki.fandom.com/wiki/${encoded}`;
}
