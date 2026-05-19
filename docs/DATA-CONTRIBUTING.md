# Contribuer aux données de stratégie

Cette app affiche les stratégies de donjons Dofus avec **traçabilité totale** : chaque texte, chaque bullet a une `provenance` qui dit d'où il vient. Les contributions communautaires sont intégrées via le type `provenance.community`.

## Pourquoi contribuer ?

Le scraper automatique extrait la stratégie boss depuis :

1. **DofusDB** (stats factuelles : niveaux, PV, résistances)
2. **Wiki Fandom EN** (sections Strategy / Combat / Mechanics / …)
3. **Wiki Fandom FR** (quasi-vide sur les donjons — couverture ≈ 0 %)
4. **LLM** (traduction EN → FR, synthèse en bullets actionnables, **toujours ancrée** dans un texte source)

Il reste **~30 donjons** sans aucune source exploitable (surtout le contenu récent niveau 200 : Eliocalypse, Kabahal, Expéditions…). Pour ces donjons, la contribution humaine est la seule voie.

## Les 3 types de provenance

Chaque champ `strategies.long` ou `strategies.short` porte une `provenance` parmi :

```ts
type Provenance =
  | { kind: 'native', lang, source, sourceUrl }          // scrapée, zéro LLM
  | { kind: 'llm-grounded', baseSource, anchors[], ... } // LLM à partir d'une source ancrée
  | { kind: 'community', contributor, reviewedBy?, prUrl } // contribution humaine via PR
```

Les bullets `community` sont affichés avec un badge ⓘ « Contribution communautaire · @user » dans l'app, cliquable vers la PR d'origine.

## Workflow de contribution

### 1. Ouvre une issue ou choisis-en une

La liste des donjons sans stratégie est dans [`scraper/output/MISSING.md`](../scraper/output/MISSING.md) et des templates d'issues prêts à l'emploi dans [`scraper/output/ISSUES.md`](../scraper/output/ISSUES.md).

### 2. Fork + branche

```bash
gh repo fork noureddinestam/dofus-companion
git checkout -b data/nom-du-donjon
```

### 3. Écris le fichier de stratégie

Chemin : `data/community/<slug>.json` (où `<slug>` est le `slug` du donjon dans `dungeons.json`).

Schéma minimum (un seul format/langue suffit, tout optionnel) :

```json
{
  "slug": "tempete-de-l-eliocalypse",
  "long": {
    "fr": {
      "text": "Texte de la stratégie long en français (≥ 30 caractères). Décris les mécaniques clés, les priorités, les phases, les conditions d'instakill. Pas d'opinion — factuel uniquement."
    },
    "en": null
  },
  "short": {
    "fr": {
      "bullets": [
        {
          "icon": "priority",
          "severity": "critical",
          "text": "Focus Xelum d'abord : vulnérable dès le départ."
        },
        {
          "icon": "avoid",
          "severity": "danger",
          "text": "Ne pas se soigner après la phase 2 (renvoi 300 %)."
        },
        {
          "icon": "position",
          "severity": "caution",
          "text": "Rester à distance — mêlée = -20 % résistances."
        }
      ]
    },
    "en": null
  }
}
```

**Icônes autorisées** : `priority` · `avoid` · `element` · `position` · `phase` · `instakill` · `cooldown` · `summon` · `tip`
**Severities** : `critical` (perte instantanée) · `danger` (gros dégâts) · `caution` (surveillance) · `info` (utile)
**Bullets** : 3 à 6 par short, text entre 5 et 160 caractères

### 4. PR avec la checklist

```markdown
## Contribution stratégie : <Nom du donjon>

- [ ] Je joue régulièrement ce donjon et j'ai validé la stratégie en combat
- [ ] Les mécaniques décrites sont celles du client Dofus actuel (pas d'ancien patch)
- [ ] Aucun chiffre ou % n'est inventé (ou préciser la source)
- [ ] Pas d'opinion de compo ou de classe préférée — factuel uniquement
- [ ] Texte relu, pas de faute grossière

**Source** : [expérience personnelle / guide X / vidéo Y]
**Testé avec la team** : [classes ou solo]
**Patch Dofus** : [version ou date]
```

### 5. Review + merge

Un mainteneur vérifie la cohérence des mécaniques contre ce qui est connu (DofusDB, Fandom EN si page partielle) et merge. Le scraper intègre automatiquement le fichier community lors du prochain run :

- Lit `data/community/*.json`
- Matche par `slug`
- Construit la provenance : `{ kind: 'community', contributor: '@ton-user', prUrl: <lien PR>, reviewedBy: '@mainteneur' }`
- Intègre au `dungeons.json` final
- Release v0.x.y → auto-update pousse les nouvelles stratégies aux utilisateurs

## Règles non négociables

1. **Zéro invention**. Si tu ne sais pas, laisse `null`.
2. **Pas de copier-coller** d'un site tiers sans permission (Wiki Fandom OK car CC-BY-SA, dofus-pour-les-noobs = demander).
3. **Factuel > élégant**. Une stratégie courte et exacte vaut mieux qu'un pavé fleuri.
4. **Une PR = un donjon**. Plus facile à reviewer.

## Outils utiles

- `pnpm scrape` — regénère `dungeons.json` après un merge de contribution
- `pnpm scrape --no-llm` — sans appel LLM (pour tester en local sans clé)
- `pnpm scrape --gen-issues` — produit `ISSUES.md` avec tous les donjons manquants

## Questions ?

Ouvre une discussion GitHub : [Discussions](https://github.com/noureddinestam/dofus-companion/discussions).
