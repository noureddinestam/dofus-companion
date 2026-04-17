import { createHash } from 'crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const CACHE_DIR = join(process.cwd(), 'cache');
const TTL_MS = 24 * 60 * 60 * 1000;

mkdirSync(CACHE_DIR, { recursive: true });

const UA = 'dofus-companion-scraper/1.0 (+https://github.com/user/dofus-companion)';

interface CacheEntry {
  timestamp: number;
  url: string;
  body: string;
  status: number;
}

export async function cachedFetch(
  url: string,
  options: RequestInit = {},
  ttlMs = TTL_MS,
): Promise<{ body: string; status: number; fromCache: boolean }> {
  const key = createHash('md5').update(url).digest('hex');
  const path = join(CACHE_DIR, `${key}.json`);

  if (existsSync(path)) {
    const entry: CacheEntry = JSON.parse(readFileSync(path, 'utf-8'));
    if (Date.now() - entry.timestamp < ttlMs) {
      return { body: entry.body, status: entry.status, fromCache: true };
    }
  }

  const res = await fetch(url, {
    ...options,
    headers: { 'User-Agent': UA, Accept: 'application/json,text/html', ...options.headers },
  });

  const body = await res.text();
  const entry: CacheEntry = { timestamp: Date.now(), url, body, status: res.status };
  writeFileSync(path, JSON.stringify(entry));

  return { body, status: res.status, fromCache: false };
}

export function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}
