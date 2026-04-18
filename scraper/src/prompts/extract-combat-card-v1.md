Tu convertis un texte stratégique Fandom pour un boss de Dofus en **fiche de combat structurée 4 blocs**, lisible en un coup d'œil par un joueur en combat.

**La structure, l'ordre et la discipline de tri sont sacrés.** Tu ne les négocies pas.

---

## Les 4 blocs

1. **🔓 unlock** — Les étapes actionnables pour *déverrouiller* la victoire. Format : action → conséquence. Ordonné : étape 1, étape 2, étape 3…
2. **⚠️ constraints** — Les règles à *respecter* pendant tout le combat. Impératifs (« Ne pas … », « Toujours … »).
3. **❌ dangers** — Les *punitions* concrètes si erreur. Nomme la conséquence précise (« Tue en 1 tour si … », « Retire 3 PA au joueur adjacent »).
4. **💡 tips** — Résistances, optimisations, astuces secondaires, non critiques.

## Grille de décision (obligatoire)

Pour chaque information candidate :

| L'info répond à | → Bloc |
|---|---|
| « Qu'est-ce que je FAIS pour gagner ? » | unlock |
| « Quelle RÈGLE dois-je respecter ? » | constraints |
| « Quelle PUNITION vais-je subir si j'échoue ? » | dangers |
| « Quel BONUS / résistance / astuce ? » | tips |

Si tu hésites entre **unlock** et **constraints** : « est-ce une étape pour GAGNER (unlock) ou une règle à RESPECTER en permanence (constraints) ? »

Si tu hésites entre **dangers** et **constraints** : « c'est la punition (dangers) ou l'action à ne pas faire (constraints) ? »

## Règles impératives

- **1 information = 1 bullet.** Jamais deux idées jointes par « et ».
- **Longueur 3–160 caractères** par bullet, en FR ET en EN.
- **Ne jamais placer une même idée dans deux blocs.**
- **Chaque bullet doit être ancré** par une `quote` verbatim de 10–25 mots, recopiée exactement du texte source. Si tu ne peux pas citer verbatim, n'émets pas le bullet.
- **Si un bloc n'a pas de matière ancrable : array vide.** Le silence est préférable à l'invention.
- **Si le texte source ne contient aucune mécanique actionnable : tous les blocs vides** (`{ "unlock": [], "constraints": [], "dangers": [], "tips": [] }`).
- **Optionnel** : tagge chaque bullet avec un `mechanicType` parmi les 14 valeurs exactes fournies.
- **Optionnel** : tagge chaque bullet avec une `severity` parmi `critical`, `danger`, `caution`. Règle soft : un bullet dans `tips` ne doit pas être `critical`.

## Types canoniques (mechanicType)

`summoner`, `reviver`, `self-heal`, `buffer`, `debuffer`, `healer`, `tackler`, `puller`, `pusher`, `counter-damage`, `zone-control`, `ap-mp-stripper`, `execute`, `chain-summon`.

## Bilinguisme

- **Langue source du texte fourni** : {{LANG}}.
- Chaque bullet a `text.fr` ET `text.en`. Tu traduis l'information en s'appuyant sur ta compréhension du texte source, tout en restant **factuellement ancré** au contenu ({{LANG}} est autorité ; l'autre langue est une traduction fidèle de la même idée).
- La `quote` est toujours en langue source ({{LANG}}), verbatim dans `{{SOURCE}}`.

## Texte source

```
{{SOURCE}}
```

---

**Retourne uniquement du JSON valide**, sans préambule, sans markdown de wrapping, strictement conforme au schéma suivant :

```json
{
  "unlock": [
    {
      "text": { "fr": "…", "en": "…" },
      "mechanicType": "summoner",
      "severity": "critical",
      "quote": "verbatim passage from source, 10–25 words"
    }
  ],
  "constraints": [],
  "dangers": [],
  "tips": []
}
```

`mechanicType` et `severity` peuvent être `null` si tu ne veux pas les taguer — mais `text.fr`, `text.en` et `quote` sont toujours requis.
