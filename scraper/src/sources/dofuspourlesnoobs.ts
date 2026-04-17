import * as cheerio from 'cheerio';
import { cachedFetch, sleep } from '../cache.ts';
import type { ScrapedStrategy } from '../normalize/extract-priority.ts';
import { extractStrategy } from '../normalize/extract-priority.ts';

const BASE = 'https://www.dofuspourlesnoobs.com';
const RATE_LIMIT_MS = 2000; // 1 req / 2s — respect éthique

// ── Discover dungeon pages ───────────────────────────────────────────────────

interface DungeonLink {
  name: string;
  url: string;
  slug: string;
}

async function discoverLinks(): Promise<DungeonLink[]> {
  const links: DungeonLink[] = [];

  // Try sitemap first (most reliable)
  try {
    const { body, status } = await cachedFetch(`${BASE}/sitemap.xml`);
    if (status === 200 && body.includes('donjon')) {
      const urlMatches = body.matchAll(/<loc>(https:\/\/www\.dofuspourlesnoobs\.com\/([^<]+))<\/loc>/g);
      for (const [, url, path] of urlMatches) {
        if (path.includes('donjon') || path.includes('boss') || path.includes('dungeon')) {
          const slug = path.replace(/\.html$/, '').split('/').pop() ?? path;
          links.push({ name: slug.replace(/-/g, ' '), url, slug });
        }
      }
    }
  } catch {
    console.log('  ↳ sitemap inaccessible, essai catégorie donjons…');
  }

  if (links.length > 0) return links;

  // Fallback: scrape category page
  try {
    const { body, status } = await cachedFetch(`${BASE}/category/donjons/`);
    if (status === 200) {
      const $ = cheerio.load(body);
      $('a[href]').each((_, el) => {
        const href = $(el).attr('href') ?? '';
        const text = $(el).text().trim();
        if (href.includes('dofuspourlesnoobs.com') && text.length > 3) {
          const slug = href.split('/').filter(Boolean).pop() ?? '';
          if (slug && !links.some((l) => l.slug === slug)) {
            links.push({ name: text, url: href, slug });
          }
        }
      });
    }
  } catch {
    console.log('  ↳ catégorie donjons inaccessible');
  }

  return links;
}

// ── Scrape a single dungeon page ─────────────────────────────────────────────

async function scrapeDungeonPage(url: string): Promise<string | null> {
  try {
    const { body, status } = await cachedFetch(url);
    if (status !== 200) return null;
    const $ = cheerio.load(body);

    // Remove noise: nav, footer, ads, sidebar
    $('nav, footer, .sidebar, .widget, script, style, .ad, #comments').remove();

    // Extract main content text
    const content =
      $('article').text() || $('.entry-content').text() || $('main').text() || $('body').text();

    return content.trim();
  } catch {
    return null;
  }
}

// ── Main export ──────────────────────────────────────────────────────────────

export interface ScrapedDungeon {
  slug: string;
  name: string;
  url: string;
  strategy: ScrapedStrategy;
}

export async function scrapeAllDungeons(
  onProgress?: (slug: string, done: number, total: number) => void,
): Promise<ScrapedDungeon[]> {
  console.log('  → dofuspourlesnoobs: découverte des pages…');

  let links: DungeonLink[] = [];
  try {
    links = await discoverLinks();
  } catch (e) {
    console.error('  ✗ Découverte DPLN échouée:', e);
    return [];
  }

  if (links.length === 0) {
    console.log('  ↳ Aucune page trouvée sur dofuspourlesnoobs');
    return [];
  }

  console.log(`  → ${links.length} pages donjons trouvées, scraping (1 req/${RATE_LIMIT_MS}ms)…`);

  const results: ScrapedDungeon[] = [];
  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    onProgress?.(link.slug, i + 1, links.length);

    await sleep(RATE_LIMIT_MS);

    const text = await scrapeDungeonPage(link.url);
    if (!text) continue;

    results.push({
      slug: link.slug,
      name: link.name,
      url: link.url,
      strategy: extractStrategy(text, link.url),
    });
  }

  return results;
}
