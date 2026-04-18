import type { Dungeon } from '../validate.ts';

export interface MissingEntry {
  dungeonName: string;
  dungeonNameEn: string | null;
  level: number;
  dofusdbUrl: string;
  fandomEnUrl: string | null;
  fandomFrUrl: string | null;
  bossName: string;
  bossNameEn: string | null;
  reason: 'no-long' | 'no-short';
}

function fandomEnPage(name: string | null): string | null {
  if (!name) return null;
  return `https://dofuswiki.fandom.com/wiki/${encodeURIComponent(name.replace(/\s+/g, '_'))}`;
}

function fandomFrPage(name: string): string {
  return `https://dofus.fandom.com/fr/wiki/${encodeURIComponent(name.replace(/\s+/g, '_'))}`;
}

export function collectMissing(dungeons: Dungeon[]): MissingEntry[] {
  return dungeons
    .filter((d) => {
      const s = d.boss.strategies;
      if (!s) return true;
      const hasLong = s.long.fr || s.long.en;
      const hasShort = s.short.fr || s.short.en;
      return !hasLong || !hasShort;
    })
    .map((d) => {
      const s = d.boss.strategies;
      const hasLong = s && (s.long.fr || s.long.en);
      return {
        dungeonName: d.name,
        dungeonNameEn: d.nameEn,
        level: d.recommendedLevel,
        dofusdbUrl: `https://dofusdb.fr/fr/database/dungeons/${d.id}`,
        fandomEnUrl: fandomEnPage(d.boss.nameEn),
        fandomFrUrl: fandomFrPage(d.boss.name),
        bossName: d.boss.name,
        bossNameEn: d.boss.nameEn,
        reason: hasLong ? 'no-short' : 'no-long',
      } satisfies MissingEntry;
    });
}

export function renderMissingMarkdown(entries: MissingEntry[], total: number): string {
  const byLevel = [...entries].sort((a, b) => b.level - a.level);
  const noLong = byLevel.filter((e) => e.reason === 'no-long');
  const noShort = byLevel.filter((e) => e.reason === 'no-short');

  const lines: string[] = [];
  lines.push(`# Donjons manquants de stratégie`);
  lines.push('');
  lines.push(`**Résumé** : ${entries.length}/${total} donjons (${((entries.length / total) * 100).toFixed(1)} %) sans stratégie complète.`);
  lines.push('');
  lines.push(`- **Aucune long** : ${noLong.length} (pas de texte stratégique dans les sources scrapées)`);
  lines.push(`- **Pas de short** : ${noShort.length} (long présente mais LLM summarize a rejeté les bullets, ou LLM off)`);
  lines.push('');
  lines.push(`> Chaque entrée ci-dessous peut être complétée via une PR avec \`provenance.community\`. Voir \`docs/DATA-CONTRIBUTING.md\`.`);
  lines.push('');

  if (noLong.length > 0) {
    lines.push(`## Aucune stratégie (${noLong.length} donjons)`);
    lines.push('');
    lines.push('| Niveau | Donjon | Boss | DofusDB | Fandom EN | Fandom FR |');
    lines.push('|-------:|--------|------|---------|-----------|-----------|');
    for (const e of noLong) {
      const fandomEn = e.fandomEnUrl ? `[page](${e.fandomEnUrl})` : '—';
      const fandomFr = `[page](${e.fandomFrUrl})`;
      lines.push(
        `| ${e.level} | ${escapePipes(e.dungeonName)} | ${escapePipes(e.bossName)} | [db](${e.dofusdbUrl}) | ${fandomEn} | ${fandomFr} |`,
      );
    }
    lines.push('');
  }

  if (noShort.length > 0) {
    lines.push(`## Pas de short actionnable (${noShort.length} donjons)`);
    lines.push('');
    lines.push('Ces donjons ont une stratégie long, mais le LLM summarize a rejeté les bullets (< 3 ancres valides) ou n\'a pas tourné. Rerun avec `ANTHROPIC_API_KEY` peut les corriger.');
    lines.push('');
    lines.push('| Niveau | Donjon | Boss |');
    lines.push('|-------:|--------|------|');
    for (const e of noShort) {
      lines.push(`| ${e.level} | ${escapePipes(e.dungeonName)} | ${escapePipes(e.bossName)} |`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

function escapePipes(s: string): string {
  return s.replace(/\|/g, '\\|');
}
