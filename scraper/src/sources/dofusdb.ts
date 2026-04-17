import { cachedFetch } from '../cache.ts';

const BASE = 'https://api.dofusdb.fr';

// ── Raw API types ────────────────────────────────────────────────────────────

interface ApiName {
  fr?: string;
  [lang: string]: string | undefined;
}

interface ApiMonster {
  id: number;
  name: ApiName | undefined;
  level: number;
  familyName?: ApiName;
  resistances?: {
    airPercent?: number;
    earthPercent?: number;
    firePercent?: number;
    waterPercent?: number;
    neutralPercent?: number;
  };
  characteristics?: { maxVitality?: number };
}

interface ApiDungeon {
  id: number;
  name: ApiName | undefined;
  optimalPlayerLevel?: number;
  monsterCount?: number;
  monsters?: ApiMonster[];
  boss?: ApiMonster;
}

interface ApiPage<T> {
  data: T[];
  total: number;
  limit: number;
  skip: number;
}

// ── Normalized output ────────────────────────────────────────────────────────

export interface DbDungeon {
  id: string;
  name: string;
  recommendedLevel: number;
  monsters: DbMonster[];
  boss: DbMonster | null;
}

export interface DbMonster {
  id: string;
  name: string;
  level: number;
  family: string;
  hp: number | null;
  weakElement: string | null;
  resistElement: string | null;
}

// ── API client ───────────────────────────────────────────────────────────────

function name(n: ApiName | undefined | null): string {
  if (!n) return 'Inconnu';
  return n.fr ?? Object.values(n).find((v) => v) ?? 'Inconnu';
}

function topResist(r: ApiMonster['resistances']): string | null {
  if (!r) return null;
  const map = {
    neutre: r.neutralPercent ?? 0,
    terre: r.earthPercent ?? 0,
    eau: r.waterPercent ?? 0,
    feu: r.firePercent ?? 0,
    air: r.airPercent ?? 0,
  };
  const sorted = Object.entries(map).sort(([, a], [, b]) => b - a);
  return sorted[0][1] > 20 ? sorted[0][0] : null;
}

function topWeak(r: ApiMonster['resistances']): string | null {
  if (!r) return null;
  const map = {
    neutre: r.neutralPercent ?? 0,
    terre: r.earthPercent ?? 0,
    eau: r.waterPercent ?? 0,
    feu: r.firePercent ?? 0,
    air: r.airPercent ?? 0,
  };
  const sorted = Object.entries(map).sort(([, a], [, b]) => a - b);
  return sorted[0][1] < -10 ? sorted[0][0] : null;
}

function toDbMonster(m: ApiMonster): DbMonster {
  return {
    id: String(m.id),
    name: name(m.name),
    level: m.level,
    family: name(m.familyName ?? {}),
    hp: m.characteristics?.maxVitality ?? null,
    weakElement: topWeak(m.resistances),
    resistElement: topResist(m.resistances),
  };
}

async function fetchPage(skip: number): Promise<ApiPage<ApiDungeon>> {
  const url = `${BASE}/dungeons?lang=fr&$limit=50&$skip=${skip}`;
  const { body, status } = await cachedFetch(url);
  if (status !== 200) throw new Error(`DofusDB dungeons ${status} at skip=${skip}`);
  return JSON.parse(body) as ApiPage<ApiDungeon>;
}

async function fetchDungeonDetail(id: number): Promise<ApiDungeon | null> {
  try {
    const { body, status } = await cachedFetch(`${BASE}/dungeons/${id}?lang=fr`);
    if (status !== 200) return null;
    return JSON.parse(body) as ApiDungeon;
  } catch {
    return null;
  }
}

export async function fetchAllDungeons(
  onProgress?: (done: number, total: number) => void,
): Promise<DbDungeon[]> {
  console.log('  → DofusDB: récupération liste donjons…');

  let first: ApiPage<ApiDungeon>;
  try {
    first = await fetchPage(0);
  } catch (e) {
    console.error('  ✗ DofusDB inaccessible:', e);
    return [];
  }

  const total = first.total;
  const allRaw: ApiDungeon[] = [...first.data];

  let skip = first.data.length;
  while (skip < total) {
    try {
      const page = await fetchPage(skip);
      allRaw.push(...page.data);
      skip += page.data.length;
    } catch {
      break;
    }
  }

  console.log(`  → DofusDB: ${allRaw.length} donjons trouvés, récupération détails…`);

  const results: DbDungeon[] = [];
  for (let i = 0; i < allRaw.length; i++) {
    const raw = allRaw[i];
    onProgress?.(i + 1, allRaw.length);

    const detail = (await fetchDungeonDetail(raw.id)) ?? raw;
    const monsters: DbMonster[] = (detail.monsters ?? [])
      .filter((m) => !detail.boss || m.id !== detail.boss?.id)
      .map(toDbMonster);

    results.push({
      id: String(detail.id),
      name: name(detail.name),
      recommendedLevel: detail.optimalPlayerLevel ?? 1,
      monsters,
      boss: detail.boss ? toDbMonster(detail.boss) : null,
    });
  }

  return results;
}
