// Fuzzy match between DofusDB dungeons and dofuspourlesnoobs pages

import type { DbDungeon } from '../sources/dofusdb.ts';
import type { ScrapedDungeon } from '../sources/dofuspourlesnoobs.ts';

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function overlap(a: string, b: string): number {
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return 1;

  const wordsA = new Set(na.split(' ').filter((w) => w.length > 2));
  const wordsB = new Set(nb.split(' ').filter((w) => w.length > 2));
  let shared = 0;
  for (const w of wordsA) {
    if (wordsB.has(w)) shared++;
  }
  const total = Math.max(wordsA.size, wordsB.size);
  return total === 0 ? 0 : shared / total;
}

export function matchDungeons(
  dbDungeons: DbDungeon[],
  scrapedDungeons: ScrapedDungeon[],
): Map<string, ScrapedDungeon> {
  // For each DofusDB dungeon, find the best-matching scraped dungeon
  const result = new Map<string, ScrapedDungeon>();

  for (const db of dbDungeons) {
    let best: ScrapedDungeon | null = null;
    let bestScore = 0.4; // minimum threshold

    for (const scraped of scrapedDungeons) {
      const score = Math.max(
        overlap(db.name, scraped.name),
        overlap(db.name, scraped.slug),
      );
      if (score > bestScore) {
        bestScore = score;
        best = scraped;
      }
    }

    if (best) {
      result.set(db.id, best);
    }
  }

  return result;
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
