# Contribuer aux Combat Cards v0.5

Les **Combat Cards** sont le format v0.5 pour les fiches de combat : 4 blocs fixes, lisibles en combat, bilingues FR/EN. Ce doc explique comment contribuer une card manquante ou corriger une card existante via PR.

Pour les anciennes `strategies` v0.4 long/short, voir [DATA-CONTRIBUTING.md](DATA-CONTRIBUTING.md) (toujours supporté le temps de la transition).

## La doctrine 4 blocs

Chaque card tient dans exactement 4 blocs, dans cet ordre strict :

| Bloc | Icône | Quand ? |
|---|---|---|
| `unlock` | 🔓 | Étapes actionnables pour déverrouiller la victoire (action → conséquence). |
| `constraints` | ⚠️ | Règles à respecter pendant tout le combat (« Ne pas … », « Toujours … »). |
| `dangers` | ❌ | Punitions concrètes si erreur (« Tue en 1 tour si … », « Retire 3 PA au joueur adjacent »). |
| `tips` | 💡 | Résistances, optimisations, astuces non critiques. |

**Un bloc peut être vide.** Le silence est préférable à l'invention. Un monstre qui n'a aucune mécanique actionnable a `combat: null` (lambda) — ne pas contribuer de card vide.

## Grille de classification

| L'info répond à | → Bloc |
|---|---|
| « Qu'est-ce que je FAIS pour gagner ? » | `unlock` |
| « Quelle RÈGLE dois-je respecter ? » | `constraints` |
| « Quelle PUNITION vais-je subir si j'échoue ? » | `dangers` |
| « Quel BONUS / résistance / astuce ? » | `tips` |

**Une même idée ne doit jamais apparaître dans deux blocs.** Le scraper rejette les doublons à la validation.

## Schéma JSON

Chemin : `data/community/combat-cards/<slug>.json` (où `<slug>` est le `slug` du donjon, ou `monster-<id>` pour un monstre).

```json
{
  "target": { "kind": "boss", "slug": "laboratoire-de-sylargh" },
  "combat": {
    "unlock": [
      {
        "text": {
          "fr": "Tuer les 3 pions avant Sylargh",
          "en": "Kill the 3 pawns before Sylargh"
        },
        "mechanicType": "chain-summon",
        "severity": "critical"
      }
    ],
    "constraints": [],
    "dangers": [
      {
        "text": {
          "fr": "Ressuscite les pions tués à côté de lui",
          "en": "Resurrects pawns killed adjacent to him"
        },
        "mechanicType": "reviver",
        "severity": "danger"
      }
    ],
    "tips": [
      {
        "text": {
          "fr": "Faible à l'air, résiste au feu",
          "en": "Weak to air, resists fire"
        },
        "mechanicType": null,
        "severity": null
      }
    ]
  }
}
```

Pour un monstre, remplace `target` par `{ "kind": "monster", "id": "6386" }` (l'`id` du monstre dans `dungeons.json`).

## Règles de validation

Le scraper rejette toute bullet qui ne respecte pas :

1. **`text.fr` ET `text.en` présents**, chacun **3–160 caractères**.
2. **`mechanicType`** (optionnel) parmi les 14 valeurs canoniques : `summoner`, `reviver`, `self-heal`, `buffer`, `debuffer`, `healer`, `tackler`, `puller`, `pusher`, `counter-damage`, `zone-control`, `ap-mp-stripper`, `execute`, `chain-summon`.
3. **`severity`** (optionnel) parmi `critical`, `danger`, `caution`.
4. **`severity: "critical"` interdit dans le bloc `tips`** (warning mais rejet soft).
5. **Pas de doublon** : un même `text.fr` ou `text.en` ne peut pas apparaître deux fois dans la card.
6. **Une info = une bullet.** Jamais deux idées jointes par « et ».

## Workflow

### 1. Choisis une cible

- Liste des monstres sans card : filtrer `dungeons.json` où `m.combat === null`.
- Liste des boss sans card : 44 boss ont encore `combat: null` dans v0.5.0.

### 2. Fork + branche

```bash
gh repo fork noureddinestam/dofus-companion
git checkout -b card/<slug-ou-monster-id>
```

### 3. Écris le fichier

```bash
mkdir -p data/community/combat-cards
# Crée data/community/combat-cards/<slug>.json selon le schéma ci-dessus.
```

### 4. PR avec la checklist

```markdown
## Combat Card community : <Nom boss ou monstre>

- [ ] Je joue régulièrement ce combat et j'ai validé la card en situation réelle
- [ ] Chaque bullet est factuel (pas d'opinion de classe, pas de compo préférée)
- [ ] Aucune info n'est inventée — chaque punition / règle vient du comportement observé
- [ ] La grille de classification est respectée (pas de mélange entre blocs)
- [ ] FR et EN ont chacun entre 3 et 160 caractères
- [ ] Pas de doublon entre blocs
- [ ] Texte relu, pas de faute grossière

**Patch Dofus** : [version ou date]
**Testé avec** : [classes ou solo]
**Source** : [expérience perso / guide X / vidéo Y]
```

### 5. Review + merge

Un mainteneur vérifie :
- Respect de la grille de classification
- Cohérence des mécaniques contre Fandom / DofusDB si possible
- Absence d'invention
- Qualité rédactionnelle bilingue

Après merge, le scraper intègre la card au prochain `pnpm scrape`. La provenance est automatiquement `{ kind: 'community', contributor: '@ton-user', prUrl: <lien PR>, reviewedBy: '@mainteneur' }`.

## Règles non négociables

1. **Zéro invention.** Si tu ne sais pas, laisse le bloc vide.
2. **Structure fixe, ordre fixe.** Ne jamais ajouter un 5ᵉ bloc.
3. **Bilingue obligatoire.** Les contributions monolingues sont rejetées.
4. **Le silence est OK.** Un monstre sans mécanique reste `combat: null` — ne force pas une card.
5. **Une PR = un combat.** Pas de batch multi-donjons.

## Outils

```bash
pnpm --filter scraper test                           # Tests de validation structurelle
pnpm --filter app test                               # Tests invariants dataset
pnpm --filter scraper scrape --only-monsters         # Régénère le dataset
```

## Questions ?

Ouvre une discussion : [Discussions](https://github.com/noureddinestam/dofus-companion/discussions).
