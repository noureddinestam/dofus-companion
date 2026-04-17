import { cachedFetch } from '../cache.ts';

const BASE = 'https://api.dofusdb.fr';
const BATCH_SIZE = 50;

interface ApiName {
  fr?: string;
  en?: string;
  [lang: string]: string | undefined;
}

interface ApiGrade {
  grade: number;
  level: number;
  lifePoints: number;
  earthResistance?: number;
  fireResistance?: number;
  waterResistance?: number;
  airResistance?: number;
  neutralResistance?: number;
}

interface ApiMonster {
  id: number;
  name?: ApiName;
  race?: number;
  isBoss?: boolean;
  isMiniBoss?: boolean;
  grades?: ApiGrade[];
}

interface ApiDungeon {
  id: number;
  name?: ApiName;
  optimalPlayerLevel?: number;
  monsters?: number[]; // juste des IDs maintenant
}

interface ApiRace {
  id: number;
  name?: ApiName;
}

interface ApiPage<T> {
  data: T[];
  total: number;
  limit: number;
  skip: number;
}

export type Element = 'air' | 'eau' | 'feu' | 'terre' | 'neutre' | null;

export interface DbMonster {
  id: string;
  name: string;
  nameEn: string | null;
  level: number;
  family: string;
  hp: number | null;
  weakElement: Element;
  resistElement: Element;
  isBoss: boolean;
  sourceUrl: string;
}

export interface DbDungeon {
  id: string;
  name: string;
  nameEn: string | null;
  recommendedLevel: number;
  monsters: DbMonster[];
  boss: DbMonster | null;
  sourceUrl: string;
}

function nameFr(n: ApiName | undefined | null): string {
  if (!n) return 'Inconnu';
  return n.fr ?? Object.values(n).find((v) => v) ?? 'Inconnu';
}

function nameEn(n: ApiName | undefined | null): string | null {
  if (!n) return null;
  return n.en ?? null;
}

function lastGrade(m: ApiMonster): ApiGrade | null {
  const grades = m.grades ?? [];
  if (grades.length === 0) return null;
  // Le dernier grade (5 le plus souvent) représente le niveau max du monstre dans le donjon
  return grades[grades.length - 1];
}

function topResist(g: ApiGrade | null): Element {
  if (!g) return null;
  const map: Record<Exclude<Element, null>, number> = {
    neutre: g.neutralResistance ?? 0,
    terre: g.earthResistance ?? 0,
    eau: g.waterResistance ?? 0,
    feu: g.fireResistance ?? 0,
    air: g.airResistance ?? 0,
  };
  const sorted = Object.entries(map).sort(([, a], [, b]) => b - a);
  return sorted[0][1] > 20 ? (sorted[0][0] as Element) : null;
}

function topWeak(g: ApiGrade | null): Element {
  if (!g) return null;
  const map: Record<Exclude<Element, null>, number> = {
    neutre: g.neutralResistance ?? 0,
    terre: g.earthResistance ?? 0,
    eau: g.waterResistance ?? 0,
    feu: g.fireResistance ?? 0,
    air: g.airResistance ?? 0,
  };
  const sorted = Object.entries(map).sort(([, a], [, b]) => a - b);
  return sorted[0][1] < -10 ? (sorted[0][0] as Element) : null;
}

function toDbMonster(m: ApiMonster, raceMap: Map<number, string>): DbMonster {
  const grade = lastGrade(m);
  return {
    id: String(m.id),
    name: nameFr(m.name),
    nameEn: nameEn(m.name),
    level: grade?.level ?? 0,
    family: m.race != null ? raceMap.get(m.race) ?? 'Inconnu' : 'Inconnu',
    hp: grade?.lifePoints ?? null,
    weakElement: topWeak(grade),
    resistElement: topResist(grade),
    isBoss: Boolean(m.isBoss || m.isMiniBoss),
    sourceUrl: `https://dofusdb.fr/fr/database/monsters/${m.id}`,
  };
}

async function fetchList<T>(path: string, skip: number, limit = BATCH_SIZE): Promise<ApiPage<T>> {
  const url = `${BASE}${path}${path.includes('?') ? '&' : '?'}$limit=${limit}&$skip=${skip}`;
  const { body, status } = await cachedFetch(url);
  if (status !== 200) throw new Error(`DofusDB ${path} HTTP ${status} at skip=${skip}`);
  return JSON.parse(body) as ApiPage<T>;
}

async function fetchAllPages<T>(path: string): Promise<T[]> {
  const all: T[] = [];
  let skip = 0;
  let total = Infinity;
  while (skip < total) {
    const page = await fetchList<T>(path, skip);
    all.push(...page.data);
    total = page.total;
    skip += page.data.length;
    if (page.data.length === 0) break;
  }
  return all;
}

async function fetchMonstersByIds(ids: number[]): Promise<ApiMonster[]> {
  if (ids.length === 0) return [];
  const chunks: number[][] = [];
  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    chunks.push(ids.slice(i, i + BATCH_SIZE));
  }

  const all: ApiMonster[] = [];
  for (const chunk of chunks) {
    const query = chunk.map((id) => `id[$in][]=${id}`).join('&');
    const url = `${BASE}/monsters?${query}&$limit=${BATCH_SIZE}`;
    const { body, status } = await cachedFetch(url);
    if (status !== 200) continue;
    const page = JSON.parse(body) as ApiPage<ApiMonster>;
    all.push(...page.data);
  }
  return all;
}

export async function fetchAllDungeons(
  onProgress?: (done: number, total: number) => void,
): Promise<DbDungeon[]> {
  // 1. Races (pour résoudre family)
  console.log('  → DofusDB: chargement races monstres…');
  const races = await fetchAllPages<ApiRace>('/monster-races');
  const raceMap = new Map(races.map((r) => [r.id, nameFr(r.name)]));
  console.log(`  → DofusDB: ${races.length} races chargées`);

  // 2. Dungeons
  console.log('  → DofusDB: chargement donjons…');
  const dungeons = await fetchAllPages<ApiDungeon>('/dungeons');
  console.log(`  → DofusDB: ${dungeons.length} donjons trouvés`);

  // 3. Collecter tous les IDs de monstres uniques
  const allMonsterIds = new Set<number>();
  for (const d of dungeons) {
    for (const mid of d.monsters ?? []) allMonsterIds.add(mid);
  }

  console.log(`  → DofusDB: hydratation ${allMonsterIds.size} monstres…`);
  const monsters = await fetchMonstersByIds([...allMonsterIds]);
  const monsterMap = new Map(monsters.map((m) => [m.id, m]));
  console.log(`  → DofusDB: ${monsters.length} monstres récupérés`);

  // 4. Construire les DbDungeon
  const results: DbDungeon[] = [];
  for (let i = 0; i < dungeons.length; i++) {
    const d = dungeons[i];
    onProgress?.(i + 1, dungeons.length);

    const monsterIds = d.monsters ?? [];
    const dbMonsters: DbMonster[] = monsterIds
      .map((mid) => monsterMap.get(mid))
      .filter((m): m is ApiMonster => Boolean(m))
      .map((m) => toDbMonster(m, raceMap));

    // Boss = monstre avec isBoss=true. Sinon on prend le monstre de plus haut niveau.
    let boss: DbMonster | null = dbMonsters.find((m) => m.isBoss) ?? null;
    if (!boss && dbMonsters.length > 0) {
      boss = [...dbMonsters].sort((a, b) => b.level - a.level)[0];
    }

    const otherMonsters = boss
      ? dbMonsters.filter((m) => m.id !== boss!.id)
      : dbMonsters;

    results.push({
      id: String(d.id),
      name: nameFr(d.name),
      nameEn: nameEn(d.name),
      recommendedLevel: d.optimalPlayerLevel ?? 0,
      monsters: otherMonsters,
      boss,
      sourceUrl: `https://dofusdb.fr/fr/database/dungeons/${d.id}`,
    });
  }

  return results;
}
