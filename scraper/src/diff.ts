import { existsSync, readFileSync } from 'fs';
import type { Dungeon } from './validate.ts';

export interface DiffResult {
  added: string[];
  removed: string[];
  modified: string[];
  unchanged: number;
}

export function diffDungeons(prev: Dungeon[], next: Dungeon[]): DiffResult {
  const prevMap = new Map(prev.map((d) => [d.id, d]));
  const nextMap = new Map(next.map((d) => [d.id, d]));

  const added: string[] = [];
  const removed: string[] = [];
  const modified: string[] = [];
  let unchanged = 0;

  for (const [id, nextD] of nextMap) {
    const prevD = prevMap.get(id);
    if (!prevD) {
      added.push(nextD.name);
    } else {
      const prevJson = JSON.stringify(prevD);
      const nextJson = JSON.stringify(nextD);
      if (prevJson !== nextJson) {
        modified.push(nextD.name);
      } else {
        unchanged++;
      }
    }
  }

  for (const [id, prevD] of prevMap) {
    if (!nextMap.has(id)) removed.push(prevD.name);
  }

  return { added, removed, modified, unchanged };
}

export function loadPreviousDungeons(path: string): Dungeon[] {
  if (!existsSync(path)) return [];
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as Dungeon[];
  } catch {
    return [];
  }
}

export function generateChangelog(diff: DiffResult, version: string, date: string): string {
  const lines: string[] = [
    `# Data Changelog`,
    ``,
    `## ${version} — ${date}`,
    ``,
  ];

  if (diff.added.length > 0) {
    lines.push(`### ✅ Ajoutés (${diff.added.length})`);
    diff.added.forEach((n) => lines.push(`- ${n}`));
    lines.push('');
  }

  if (diff.modified.length > 0) {
    lines.push(`### ✏️ Modifiés (${diff.modified.length})`);
    diff.modified.forEach((n) => lines.push(`- ${n}`));
    lines.push('');
  }

  if (diff.removed.length > 0) {
    lines.push(`### 🗑️ Supprimés (${diff.removed.length})`);
    diff.removed.forEach((n) => lines.push(`- ${n}`));
    lines.push('');
  }

  lines.push(`### 📊 Stats`);
  lines.push(`- Inchangés : ${diff.unchanged}`);
  lines.push(`- Total : ${diff.unchanged + diff.modified.length + diff.added.length}`);

  return lines.join('\n');
}
