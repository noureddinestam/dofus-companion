import type { MissingEntry } from './missing.ts';

/**
 * Produit un template Markdown d'issues GitHub pour chaque donjon sans
 * stratégie complète. Format : un ## heading par donjon suivi d'un bloc
 * que le contributeur peut remplir.
 *
 * Utilisation : `pnpm scrape --gen-issues` → écrit scraper/output/ISSUES.md.
 * Le maintainer peut ensuite copier/coller chaque bloc dans `gh issue create`
 * ou utiliser `gh issue create -F issue-<slug>.md` après découpe.
 */
export function renderIssuesMarkdown(entries: MissingEntry[]): string {
  const byLevel = [...entries].sort((a, b) => b.level - a.level);

  const lines: string[] = [];
  lines.push('# GitHub Issues — Missing dungeon strategies');
  lines.push('');
  lines.push(`${byLevel.length} issues à créer. Chaque bloc ci-dessous est un template prêt à coller sur https://github.com/noureddinestam/dofus-companion/issues/new`);
  lines.push('');
  lines.push('```sh');
  lines.push('# One-shot : crée toutes les issues depuis ce fichier');
  lines.push('gh issue create --title "..." --body "..." --label "missing-strategy"');
  lines.push('```');
  lines.push('');
  lines.push('---');
  lines.push('');

  for (const e of byLevel) {
    const title = `Missing strategy: ${e.dungeonName} (lv.${e.level})`;
    lines.push(`## \`${title}\``);
    lines.push('');
    lines.push('### Contexte');
    lines.push('');
    lines.push(`- **Donjon** : ${e.dungeonName}${e.dungeonNameEn ? ` (EN: ${e.dungeonNameEn})` : ''}`);
    lines.push(`- **Boss** : ${e.bossName}${e.bossNameEn ? ` (EN: ${e.bossNameEn})` : ''}`);
    lines.push(`- **Niveau recommandé** : ${e.level}`);
    lines.push(`- **Raison** : ${e.reason === 'no-long' ? 'aucune stratégie trouvée dans les sources automatiques (Fandom EN/FR)' : 'long présent mais LLM n\'a pas produit de short validé'}`);
    lines.push('');
    lines.push('### Sources consultées');
    lines.push('');
    lines.push(`- [DofusDB](${e.dofusdbUrl})`);
    if (e.fandomEnUrl) lines.push(`- [Fandom EN](${e.fandomEnUrl}) (page peut-être absente)`);
    lines.push(`- [Fandom FR](${e.fandomFrUrl}) (page peut-être absente)`);
    lines.push('');
    lines.push('### Contribution');
    lines.push('');
    lines.push('Voir `docs/DATA-CONTRIBUTING.md` pour le format de PR attendu. En résumé :');
    lines.push('');
    lines.push('1. Fork + branche `data/<slug>`');
    lines.push('2. Écrire un fichier `data/community/<slug>.json` avec :');
    lines.push('   ```json');
    lines.push('   {');
    lines.push('     "long": {');
    lines.push('       "fr": { "text": "... stratégie détaillée ...", "sourceNote": "d\'après tel guide" },');
    lines.push('       "en": null');
    lines.push('     },');
    lines.push('     "short": {');
    lines.push('       "fr": [ { "icon": "...", "severity": "...", "text": "...", "quote": "..." } ]');
    lines.push('     }');
    lines.push('   }');
    lines.push('   ```');
    lines.push('3. Provenance sera `community` avec votre @username en `contributor`');
    lines.push('4. PR reviewed par un mainteneur → merge → regen scraper');
    lines.push('');
    lines.push('### Labels suggérés');
    lines.push('');
    lines.push('`missing-strategy` · `help-wanted` · `good-first-issue`');
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  return lines.join('\n');
}
