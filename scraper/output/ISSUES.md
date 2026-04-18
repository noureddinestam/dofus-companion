# GitHub Issues — Missing dungeon strategies

57 issues à créer. Chaque bloc ci-dessous est un template prêt à coller sur https://github.com/noureddinestam/dofus-companion/issues/new

```sh
# One-shot : crée toutes les issues depuis ce fichier
gh issue create --title "..." --body "..." --label "missing-strategy"
```

---

## `Missing strategy: Sanctuaire de Torkélonia (lv.200)`

### Contexte

- **Donjon** : Sanctuaire de Torkélonia (EN: Turtelonia's Sanctuary)
- **Boss** : Torkélonia (EN: Turtelonia)
- **Niveau recommandé** : 200
- **Raison** : long présent mais LLM n'a pas produit de short validé

### Sources consultées

- [DofusDB](https://dofusdb.fr/fr/database/dungeons/sanctuaire-de-torkelonia)
- [Fandom EN](https://dofuswiki.fandom.com/wiki/Turtelonia) (page peut-être absente)
- [Fandom FR](https://dofus.fandom.com/fr/wiki/Tork%C3%A9lonia) (page peut-être absente)

### Contribution

Voir `docs/DATA-CONTRIBUTING.md` pour le format de PR attendu. En résumé :

1. Fork + branche `data/<slug>`
2. Écrire un fichier `data/community/<slug>.json` avec :
   ```json
   {
     "long": {
       "fr": { "text": "... stratégie détaillée ...", "sourceNote": "d'après tel guide" },
       "en": null
     },
     "short": {
       "fr": [ { "icon": "...", "severity": "...", "text": "...", "quote": "..." } ]
     }
   }
   ```
3. Provenance sera `community` avec votre @username en `contributor`
4. PR reviewed par un mainteneur → merge → regen scraper

### Labels suggérés

`missing-strategy` · `help-wanted` · `good-first-issue`

---

## `Missing strategy: Arbre de Mort (lv.200)`

### Contexte

- **Donjon** : Arbre de Mort (EN: Tree of Death)
- **Boss** : Corruption (EN: Corruption)
- **Niveau recommandé** : 200
- **Raison** : aucune stratégie trouvée dans les sources automatiques (Fandom EN/FR)

### Sources consultées

- [DofusDB](https://dofusdb.fr/fr/database/dungeons/arbre-de-mort)
- [Fandom EN](https://dofuswiki.fandom.com/wiki/Corruption) (page peut-être absente)
- [Fandom FR](https://dofus.fandom.com/fr/wiki/Corruption) (page peut-être absente)

### Contribution

Voir `docs/DATA-CONTRIBUTING.md` pour le format de PR attendu. En résumé :

1. Fork + branche `data/<slug>`
2. Écrire un fichier `data/community/<slug>.json` avec :
   ```json
   {
     "long": {
       "fr": { "text": "... stratégie détaillée ...", "sourceNote": "d'après tel guide" },
       "en": null
     },
     "short": {
       "fr": [ { "icon": "...", "severity": "...", "text": "...", "quote": "..." } ]
     }
   }
   ```
3. Provenance sera `community` avec votre @username en `contributor`
4. PR reviewed par un mainteneur → merge → regen scraper

### Labels suggérés

`missing-strategy` · `help-wanted` · `good-first-issue`

---

## `Missing strategy: Fers de la Tyrannie (lv.200)`

### Contexte

- **Donjon** : Fers de la Tyrannie (EN: Shackles of Tyranny)
- **Boss** : Servitude (EN: Servitude)
- **Niveau recommandé** : 200
- **Raison** : aucune stratégie trouvée dans les sources automatiques (Fandom EN/FR)

### Sources consultées

- [DofusDB](https://dofusdb.fr/fr/database/dungeons/fers-de-la-tyrannie)
- [Fandom EN](https://dofuswiki.fandom.com/wiki/Servitude) (page peut-être absente)
- [Fandom FR](https://dofus.fandom.com/fr/wiki/Servitude) (page peut-être absente)

### Contribution

Voir `docs/DATA-CONTRIBUTING.md` pour le format de PR attendu. En résumé :

1. Fork + branche `data/<slug>`
2. Écrire un fichier `data/community/<slug>.json` avec :
   ```json
   {
     "long": {
       "fr": { "text": "... stratégie détaillée ...", "sourceNote": "d'après tel guide" },
       "en": null
     },
     "short": {
       "fr": [ { "icon": "...", "severity": "...", "text": "...", "quote": "..." } ]
     }
   }
   ```
3. Provenance sera `community` avec votre @username en `contributor`
4. PR reviewed par un mainteneur → merge → regen scraper

### Labels suggérés

`missing-strategy` · `help-wanted` · `good-first-issue`

---

## `Missing strategy: Sentence de la Balance (lv.200)`

### Contexte

- **Donjon** : Sentence de la Balance (EN: Judgement of the Scales)
- **Boss** : Misère (EN: Misery)
- **Niveau recommandé** : 200
- **Raison** : aucune stratégie trouvée dans les sources automatiques (Fandom EN/FR)

### Sources consultées

- [DofusDB](https://dofusdb.fr/fr/database/dungeons/sentence-de-la-balance)
- [Fandom EN](https://dofuswiki.fandom.com/wiki/Misery) (page peut-être absente)
- [Fandom FR](https://dofus.fandom.com/fr/wiki/Mis%C3%A8re) (page peut-être absente)

### Contribution

Voir `docs/DATA-CONTRIBUTING.md` pour le format de PR attendu. En résumé :

1. Fork + branche `data/<slug>`
2. Écrire un fichier `data/community/<slug>.json` avec :
   ```json
   {
     "long": {
       "fr": { "text": "... stratégie détaillée ...", "sourceNote": "d'après tel guide" },
       "en": null
     },
     "short": {
       "fr": [ { "icon": "...", "severity": "...", "text": "...", "quote": "..." } ]
     }
   }
   ```
3. Provenance sera `community` avec votre @username en `contributor`
4. PR reviewed par un mainteneur → merge → regen scraper

### Labels suggérés

`missing-strategy` · `help-wanted` · `good-first-issue`

---

## `Missing strategy: Tempête de l'Eliocalypse (lv.200)`

### Contexte

- **Donjon** : Tempête de l'Eliocalypse (EN: Eliocalypse Storm)
- **Boss** : Servitude (EN: Servitude)
- **Niveau recommandé** : 200
- **Raison** : aucune stratégie trouvée dans les sources automatiques (Fandom EN/FR)

### Sources consultées

- [DofusDB](https://dofusdb.fr/fr/database/dungeons/tempete-de-l-eliocalypse)
- [Fandom EN](https://dofuswiki.fandom.com/wiki/Servitude) (page peut-être absente)
- [Fandom FR](https://dofus.fandom.com/fr/wiki/Servitude) (page peut-être absente)

### Contribution

Voir `docs/DATA-CONTRIBUTING.md` pour le format de PR attendu. En résumé :

1. Fork + branche `data/<slug>`
2. Écrire un fichier `data/community/<slug>.json` avec :
   ```json
   {
     "long": {
       "fr": { "text": "... stratégie détaillée ...", "sourceNote": "d'après tel guide" },
       "en": null
     },
     "short": {
       "fr": [ { "icon": "...", "severity": "...", "text": "...", "quote": "..." } ]
     }
   }
   ```
3. Provenance sera `community` avec votre @username en `contributor`
4. PR reviewed par un mainteneur → merge → regen scraper

### Labels suggérés

`missing-strategy` · `help-wanted` · `good-first-issue`

---

## `Missing strategy: Souvenir d'Imagiro (lv.200)`

### Contexte

- **Donjon** : Souvenir d'Imagiro (EN: Imagiro's Memory)
- **Boss** : Reine Amirukam (EN: Queen Amirukam)
- **Niveau recommandé** : 200
- **Raison** : aucune stratégie trouvée dans les sources automatiques (Fandom EN/FR)

### Sources consultées

- [DofusDB](https://dofusdb.fr/fr/database/dungeons/souvenir-d-imagiro)
- [Fandom EN](https://dofuswiki.fandom.com/wiki/Queen_Amirukam) (page peut-être absente)
- [Fandom FR](https://dofus.fandom.com/fr/wiki/Reine_Amirukam) (page peut-être absente)

### Contribution

Voir `docs/DATA-CONTRIBUTING.md` pour le format de PR attendu. En résumé :

1. Fork + branche `data/<slug>`
2. Écrire un fichier `data/community/<slug>.json` avec :
   ```json
   {
     "long": {
       "fr": { "text": "... stratégie détaillée ...", "sourceNote": "d'après tel guide" },
       "en": null
     },
     "short": {
       "fr": [ { "icon": "...", "severity": "...", "text": "...", "quote": "..." } ]
     }
   }
   ```
3. Provenance sera `community` avec votre @username en `contributor`
4. PR reviewed par un mainteneur → merge → regen scraper

### Labels suggérés

`missing-strategy` · `help-wanted` · `good-first-issue`

---

## `Missing strategy: Rituel de Kabahal (lv.200)`

### Contexte

- **Donjon** : Rituel de Kabahal (EN: Kabaal Ritual)
- **Boss** : Kabahal (EN: Kabaal)
- **Niveau recommandé** : 200
- **Raison** : aucune stratégie trouvée dans les sources automatiques (Fandom EN/FR)

### Sources consultées

- [DofusDB](https://dofusdb.fr/fr/database/dungeons/rituel-de-kabahal)
- [Fandom EN](https://dofuswiki.fandom.com/wiki/Kabaal) (page peut-être absente)
- [Fandom FR](https://dofus.fandom.com/fr/wiki/Kabahal) (page peut-être absente)

### Contribution

Voir `docs/DATA-CONTRIBUTING.md` pour le format de PR attendu. En résumé :

1. Fork + branche `data/<slug>`
2. Écrire un fichier `data/community/<slug>.json` avec :
   ```json
   {
     "long": {
       "fr": { "text": "... stratégie détaillée ...", "sourceNote": "d'après tel guide" },
       "en": null
     },
     "short": {
       "fr": [ { "icon": "...", "severity": "...", "text": "...", "quote": "..." } ]
     }
   }
   ```
3. Provenance sera `community` avec votre @username en `contributor`
4. PR reviewed par un mainteneur → merge → regen scraper

### Labels suggérés

`missing-strategy` · `help-wanted` · `good-first-issue`

---

## `Missing strategy: Bataille de l'Aurore Pourpre (lv.200)`

### Contexte

- **Donjon** : Bataille de l'Aurore Pourpre (EN: Battle of the Crimson Dawn)
- **Boss** : L'Éternel Conflit (EN: The Eternal Conflict)
- **Niveau recommandé** : 200
- **Raison** : aucune stratégie trouvée dans les sources automatiques (Fandom EN/FR)

### Sources consultées

- [DofusDB](https://dofusdb.fr/fr/database/dungeons/bataille-de-l-aurore-pourpre)
- [Fandom EN](https://dofuswiki.fandom.com/wiki/The_Eternal_Conflict) (page peut-être absente)
- [Fandom FR](https://dofus.fandom.com/fr/wiki/L'%C3%89ternel_Conflit) (page peut-être absente)

### Contribution

Voir `docs/DATA-CONTRIBUTING.md` pour le format de PR attendu. En résumé :

1. Fork + branche `data/<slug>`
2. Écrire un fichier `data/community/<slug>.json` avec :
   ```json
   {
     "long": {
       "fr": { "text": "... stratégie détaillée ...", "sourceNote": "d'après tel guide" },
       "en": null
     },
     "short": {
       "fr": [ { "icon": "...", "severity": "...", "text": "...", "quote": "..." } ]
     }
   }
   ```
3. Provenance sera `community` avec votre @username en `contributor`
4. PR reviewed par un mainteneur → merge → regen scraper

### Labels suggérés

`missing-strategy` · `help-wanted` · `good-first-issue`

---

## `Missing strategy: Chambre des maléfices (lv.200)`

### Contexte

- **Donjon** : Chambre des maléfices (EN: Chamber of Evils)
- **Boss** : Belladone (EN: Belladonna)
- **Niveau recommandé** : 200
- **Raison** : long présent mais LLM n'a pas produit de short validé

### Sources consultées

- [DofusDB](https://dofusdb.fr/fr/database/dungeons/chambre-des-malefices)
- [Fandom EN](https://dofuswiki.fandom.com/wiki/Belladonna) (page peut-être absente)
- [Fandom FR](https://dofus.fandom.com/fr/wiki/Belladone) (page peut-être absente)

### Contribution

Voir `docs/DATA-CONTRIBUTING.md` pour le format de PR attendu. En résumé :

1. Fork + branche `data/<slug>`
2. Écrire un fichier `data/community/<slug>.json` avec :
   ```json
   {
     "long": {
       "fr": { "text": "... stratégie détaillée ...", "sourceNote": "d'après tel guide" },
       "en": null
     },
     "short": {
       "fr": [ { "icon": "...", "severity": "...", "text": "...", "quote": "..." } ]
     }
   }
   ```
3. Provenance sera `community` avec votre @username en `contributor`
4. PR reviewed par un mainteneur → merge → regen scraper

### Labels suggérés

`missing-strategy` · `help-wanted` · `good-first-issue`

---

## `Missing strategy: Expédition - Clairière du Chêne Mou (lv.200)`

### Contexte

- **Donjon** : Expédition - Clairière du Chêne Mou (EN: Expedition – Soft Oak Clearing)
- **Boss** : Chêne Mou (EN: Soft Oak)
- **Niveau recommandé** : 200
- **Raison** : long présent mais LLM n'a pas produit de short validé

### Sources consultées

- [DofusDB](https://dofusdb.fr/fr/database/dungeons/expedition-clairiere-du-chene-mou)
- [Fandom EN](https://dofuswiki.fandom.com/wiki/Soft_Oak) (page peut-être absente)
- [Fandom FR](https://dofus.fandom.com/fr/wiki/Ch%C3%AAne_Mou) (page peut-être absente)

### Contribution

Voir `docs/DATA-CONTRIBUTING.md` pour le format de PR attendu. En résumé :

1. Fork + branche `data/<slug>`
2. Écrire un fichier `data/community/<slug>.json` avec :
   ```json
   {
     "long": {
       "fr": { "text": "... stratégie détaillée ...", "sourceNote": "d'après tel guide" },
       "en": null
     },
     "short": {
       "fr": [ { "icon": "...", "severity": "...", "text": "...", "quote": "..." } ]
     }
   }
   ```
3. Provenance sera `community` avec votre @username en `contributor`
4. PR reviewed par un mainteneur → merge → regen scraper

### Labels suggérés

`missing-strategy` · `help-wanted` · `good-first-issue`

---

## `Missing strategy: Expédition - Antre du Blop Multicolore Royal (lv.200)`

### Contexte

- **Donjon** : Expédition - Antre du Blop Multicolore Royal (EN: Expedition – Royal Rainbow Blop Lair)
- **Boss** : Blop Coco Royal (EN: Royal Coco Blop)
- **Niveau recommandé** : 200
- **Raison** : aucune stratégie trouvée dans les sources automatiques (Fandom EN/FR)

### Sources consultées

- [DofusDB](https://dofusdb.fr/fr/database/dungeons/expedition-antre-du-blop-multicolore-royal)
- [Fandom EN](https://dofuswiki.fandom.com/wiki/Royal_Coco_Blop) (page peut-être absente)
- [Fandom FR](https://dofus.fandom.com/fr/wiki/Blop_Coco_Royal) (page peut-être absente)

### Contribution

Voir `docs/DATA-CONTRIBUTING.md` pour le format de PR attendu. En résumé :

1. Fork + branche `data/<slug>`
2. Écrire un fichier `data/community/<slug>.json` avec :
   ```json
   {
     "long": {
       "fr": { "text": "... stratégie détaillée ...", "sourceNote": "d'après tel guide" },
       "en": null
     },
     "short": {
       "fr": [ { "icon": "...", "severity": "...", "text": "...", "quote": "..." } ]
     }
   }
   ```
3. Provenance sera `community` avec votre @username en `contributor`
4. PR reviewed par un mainteneur → merge → regen scraper

### Labels suggérés

`missing-strategy` · `help-wanted` · `good-first-issue`

---

## `Missing strategy: Expédition - Antre du Dragon Cochon (lv.200)`

### Contexte

- **Donjon** : Expédition - Antre du Dragon Cochon (EN: Expedition – Dragon Pig's Den)
- **Boss** : Gorgouille Gloutonne (EN: Gluttonous Gorgoyle)
- **Niveau recommandé** : 200
- **Raison** : aucune stratégie trouvée dans les sources automatiques (Fandom EN/FR)

### Sources consultées

- [DofusDB](https://dofusdb.fr/fr/database/dungeons/expedition-antre-du-dragon-cochon)
- [Fandom EN](https://dofuswiki.fandom.com/wiki/Gluttonous_Gorgoyle) (page peut-être absente)
- [Fandom FR](https://dofus.fandom.com/fr/wiki/Gorgouille_Gloutonne) (page peut-être absente)

### Contribution

Voir `docs/DATA-CONTRIBUTING.md` pour le format de PR attendu. En résumé :

1. Fork + branche `data/<slug>`
2. Écrire un fichier `data/community/<slug>.json` avec :
   ```json
   {
     "long": {
       "fr": { "text": "... stratégie détaillée ...", "sourceNote": "d'après tel guide" },
       "en": null
     },
     "short": {
       "fr": [ { "icon": "...", "severity": "...", "text": "...", "quote": "..." } ]
     }
   }
   ```
3. Provenance sera `community` avec votre @username en `contributor`
4. PR reviewed par un mainteneur → merge → regen scraper

### Labels suggérés

`missing-strategy` · `help-wanted` · `good-first-issue`

---

## `Missing strategy: Breuil du Vénérable (lv.200)`

### Contexte

- **Donjon** : Breuil du Vénérable (EN: The Venerable One's Thicket)
- **Boss** : Vénérable Endormi (EN: Sleeping Venerable One)
- **Niveau recommandé** : 200
- **Raison** : aucune stratégie trouvée dans les sources automatiques (Fandom EN/FR)

### Sources consultées

- [DofusDB](https://dofusdb.fr/fr/database/dungeons/breuil-du-venerable)
- [Fandom EN](https://dofuswiki.fandom.com/wiki/Sleeping_Venerable_One) (page peut-être absente)
- [Fandom FR](https://dofus.fandom.com/fr/wiki/V%C3%A9n%C3%A9rable_Endormi) (page peut-être absente)

### Contribution

Voir `docs/DATA-CONTRIBUTING.md` pour le format de PR attendu. En résumé :

1. Fork + branche `data/<slug>`
2. Écrire un fichier `data/community/<slug>.json` avec :
   ```json
   {
     "long": {
       "fr": { "text": "... stratégie détaillée ...", "sourceNote": "d'après tel guide" },
       "en": null
     },
     "short": {
       "fr": [ { "icon": "...", "severity": "...", "text": "...", "quote": "..." } ]
     }
   }
   ```
3. Provenance sera `community` avec votre @username en `contributor`
4. PR reviewed par un mainteneur → merge → regen scraper

### Labels suggérés

`missing-strategy` · `help-wanted` · `good-first-issue`

---

## `Missing strategy: Autel de la Déchireuse (lv.200)`

### Contexte

- **Donjon** : Autel de la Déchireuse (EN: The Ripper's Altar)
- **Boss** : Déchireuse (EN: Ripper)
- **Niveau recommandé** : 200
- **Raison** : aucune stratégie trouvée dans les sources automatiques (Fandom EN/FR)

### Sources consultées

- [DofusDB](https://dofusdb.fr/fr/database/dungeons/autel-de-la-dechireuse)
- [Fandom EN](https://dofuswiki.fandom.com/wiki/Ripper) (page peut-être absente)
- [Fandom FR](https://dofus.fandom.com/fr/wiki/D%C3%A9chireuse) (page peut-être absente)

### Contribution

Voir `docs/DATA-CONTRIBUTING.md` pour le format de PR attendu. En résumé :

1. Fork + branche `data/<slug>`
2. Écrire un fichier `data/community/<slug>.json` avec :
   ```json
   {
     "long": {
       "fr": { "text": "... stratégie détaillée ...", "sourceNote": "d'après tel guide" },
       "en": null
     },
     "short": {
       "fr": [ { "icon": "...", "severity": "...", "text": "...", "quote": "..." } ]
     }
   }
   ```
3. Provenance sera `community` avec votre @username en `contributor`
4. PR reviewed par un mainteneur → merge → regen scraper

### Labels suggérés

`missing-strategy` · `help-wanted` · `good-first-issue`

---

## `Missing strategy: Bastion des Marteaux-Aigris (lv.190)`

### Contexte

- **Donjon** : Bastion des Marteaux-Aigris (EN: Bitter-Hammers' Stronghold)
- **Boss** : Barbéryl Clochecuivre (EN: Berylbell Copperbeard)
- **Niveau recommandé** : 190
- **Raison** : long présent mais LLM n'a pas produit de short validé

### Sources consultées

- [DofusDB](https://dofusdb.fr/fr/database/dungeons/bastion-des-marteaux-aigris)
- [Fandom EN](https://dofuswiki.fandom.com/wiki/Berylbell_Copperbeard) (page peut-être absente)
- [Fandom FR](https://dofus.fandom.com/fr/wiki/Barb%C3%A9ryl_Clochecuivre) (page peut-être absente)

### Contribution

Voir `docs/DATA-CONTRIBUTING.md` pour le format de PR attendu. En résumé :

1. Fork + branche `data/<slug>`
2. Écrire un fichier `data/community/<slug>.json` avec :
   ```json
   {
     "long": {
       "fr": { "text": "... stratégie détaillée ...", "sourceNote": "d'après tel guide" },
       "en": null
     },
     "short": {
       "fr": [ { "icon": "...", "severity": "...", "text": "...", "quote": "..." } ]
     }
   }
   ```
3. Provenance sera `community` avec votre @username en `contributor`
4. PR reviewed par un mainteneur → merge → regen scraper

### Labels suggérés

`missing-strategy` · `help-wanted` · `good-first-issue`

---

## `Missing strategy: Temple du Grand Ougah (lv.180)`

### Contexte

- **Donjon** : Temple du Grand Ougah (EN: Temple of the Great Ougaa)
- **Boss** : Ougah (EN: Ougaa)
- **Niveau recommandé** : 180
- **Raison** : aucune stratégie trouvée dans les sources automatiques (Fandom EN/FR)

### Sources consultées

- [DofusDB](https://dofusdb.fr/fr/database/dungeons/temple-du-grand-ougah)
- [Fandom EN](https://dofuswiki.fandom.com/wiki/Ougaa) (page peut-être absente)
- [Fandom FR](https://dofus.fandom.com/fr/wiki/Ougah) (page peut-être absente)

### Contribution

Voir `docs/DATA-CONTRIBUTING.md` pour le format de PR attendu. En résumé :

1. Fork + branche `data/<slug>`
2. Écrire un fichier `data/community/<slug>.json` avec :
   ```json
   {
     "long": {
       "fr": { "text": "... stratégie détaillée ...", "sourceNote": "d'après tel guide" },
       "en": null
     },
     "short": {
       "fr": [ { "icon": "...", "severity": "...", "text": "...", "quote": "..." } ]
     }
   }
   ```
3. Provenance sera `community` avec votre @username en `contributor`
4. PR reviewed par un mainteneur → merge → regen scraper

### Labels suggérés

`missing-strategy` · `help-wanted` · `good-first-issue`

---

## `Missing strategy: Maison du Papa Nowel (lv.180)`

### Contexte

- **Donjon** : Maison du Papa Nowel (EN: Father Kwismas's House)
- **Boss** : Père Fwetar (EN: Father Whupper)
- **Niveau recommandé** : 180
- **Raison** : aucune stratégie trouvée dans les sources automatiques (Fandom EN/FR)

### Sources consultées

- [DofusDB](https://dofusdb.fr/fr/database/dungeons/maison-du-papa-nowel)
- [Fandom EN](https://dofuswiki.fandom.com/wiki/Father_Whupper) (page peut-être absente)
- [Fandom FR](https://dofus.fandom.com/fr/wiki/P%C3%A8re_Fwetar) (page peut-être absente)

### Contribution

Voir `docs/DATA-CONTRIBUTING.md` pour le format de PR attendu. En résumé :

1. Fork + branche `data/<slug>`
2. Écrire un fichier `data/community/<slug>.json` avec :
   ```json
   {
     "long": {
       "fr": { "text": "... stratégie détaillée ...", "sourceNote": "d'après tel guide" },
       "en": null
     },
     "short": {
       "fr": [ { "icon": "...", "severity": "...", "text": "...", "quote": "..." } ]
     }
   }
   ```
3. Provenance sera `community` avec votre @username en `contributor`
4. PR reviewed par un mainteneur → merge → regen scraper

### Labels suggérés

`missing-strategy` · `help-wanted` · `good-first-issue`

---

## `Missing strategy: Antre du Korriandre (lv.180)`

### Contexte

- **Donjon** : Antre du Korriandre (EN: Korriander's Lair)
- **Boss** : Korriandre (EN: Korriander)
- **Niveau recommandé** : 180
- **Raison** : aucune stratégie trouvée dans les sources automatiques (Fandom EN/FR)

### Sources consultées

- [DofusDB](https://dofusdb.fr/fr/database/dungeons/antre-du-korriandre)
- [Fandom EN](https://dofuswiki.fandom.com/wiki/Korriander) (page peut-être absente)
- [Fandom FR](https://dofus.fandom.com/fr/wiki/Korriandre) (page peut-être absente)

### Contribution

Voir `docs/DATA-CONTRIBUTING.md` pour le format de PR attendu. En résumé :

1. Fork + branche `data/<slug>`
2. Écrire un fichier `data/community/<slug>.json` avec :
   ```json
   {
     "long": {
       "fr": { "text": "... stratégie détaillée ...", "sourceNote": "d'après tel guide" },
       "en": null
     },
     "short": {
       "fr": [ { "icon": "...", "severity": "...", "text": "...", "quote": "..." } ]
     }
   }
   ```
3. Provenance sera `community` avec votre @username en `contributor`
4. PR reviewed par un mainteneur → merge → regen scraper

### Labels suggérés

`missing-strategy` · `help-wanted` · `good-first-issue`

---

## `Missing strategy: Canopée du Kimbo (lv.160)`

### Contexte

- **Donjon** : Canopée du Kimbo (EN: Kimbo's Canopy)
- **Boss** : Kimbo (EN: Kimbo)
- **Niveau recommandé** : 160
- **Raison** : long présent mais LLM n'a pas produit de short validé

### Sources consultées

- [DofusDB](https://dofusdb.fr/fr/database/dungeons/canopee-du-kimbo)
- [Fandom EN](https://dofuswiki.fandom.com/wiki/Kimbo) (page peut-être absente)
- [Fandom FR](https://dofus.fandom.com/fr/wiki/Kimbo) (page peut-être absente)

### Contribution

Voir `docs/DATA-CONTRIBUTING.md` pour le format de PR attendu. En résumé :

1. Fork + branche `data/<slug>`
2. Écrire un fichier `data/community/<slug>.json` avec :
   ```json
   {
     "long": {
       "fr": { "text": "... stratégie détaillée ...", "sourceNote": "d'après tel guide" },
       "en": null
     },
     "short": {
       "fr": [ { "icon": "...", "severity": "...", "text": "...", "quote": "..." } ]
     }
   }
   ```
3. Provenance sera `community` avec votre @username en `contributor`
4. PR reviewed par un mainteneur → merge → regen scraper

### Labels suggérés

`missing-strategy` · `help-wanted` · `good-first-issue`

---

## `Missing strategy: Tertre du long sommeil (lv.150)`

### Contexte

- **Donjon** : Tertre du long sommeil (EN: Long Slumber's Barrow)
- **Boss** : Hell Mina (EN: Hell Mina)
- **Niveau recommandé** : 150
- **Raison** : long présent mais LLM n'a pas produit de short validé

### Sources consultées

- [DofusDB](https://dofusdb.fr/fr/database/dungeons/tertre-du-long-sommeil)
- [Fandom EN](https://dofuswiki.fandom.com/wiki/Hell_Mina) (page peut-être absente)
- [Fandom FR](https://dofus.fandom.com/fr/wiki/Hell_Mina) (page peut-être absente)

### Contribution

Voir `docs/DATA-CONTRIBUTING.md` pour le format de PR attendu. En résumé :

1. Fork + branche `data/<slug>`
2. Écrire un fichier `data/community/<slug>.json` avec :
   ```json
   {
     "long": {
       "fr": { "text": "... stratégie détaillée ...", "sourceNote": "d'après tel guide" },
       "en": null
     },
     "short": {
       "fr": [ { "icon": "...", "severity": "...", "text": "...", "quote": "..." } ]
     }
   }
   ```
3. Provenance sera `community` avec votre @username en `contributor`
4. PR reviewed par un mainteneur → merge → regen scraper

### Labels suggérés

`missing-strategy` · `help-wanted` · `good-first-issue`

---

## `Missing strategy: Clairière du Chêne Mou (lv.140)`

### Contexte

- **Donjon** : Clairière du Chêne Mou (EN: Soft Oak Clearing)
- **Boss** : Chêne Mou (EN: Soft Oak)
- **Niveau recommandé** : 140
- **Raison** : long présent mais LLM n'a pas produit de short validé

### Sources consultées

- [DofusDB](https://dofusdb.fr/fr/database/dungeons/clairiere-du-chene-mou)
- [Fandom EN](https://dofuswiki.fandom.com/wiki/Soft_Oak) (page peut-être absente)
- [Fandom FR](https://dofus.fandom.com/fr/wiki/Ch%C3%AAne_Mou) (page peut-être absente)

### Contribution

Voir `docs/DATA-CONTRIBUTING.md` pour le format de PR attendu. En résumé :

1. Fork + branche `data/<slug>`
2. Écrire un fichier `data/community/<slug>.json` avec :
   ```json
   {
     "long": {
       "fr": { "text": "... stratégie détaillée ...", "sourceNote": "d'après tel guide" },
       "en": null
     },
     "short": {
       "fr": [ { "icon": "...", "severity": "...", "text": "...", "quote": "..." } ]
     }
   }
   ```
3. Provenance sera `community` avec votre @username en `contributor`
4. PR reviewed par un mainteneur → merge → regen scraper

### Labels suggérés

`missing-strategy` · `help-wanted` · `good-first-issue`

---

## `Missing strategy: Laboratoire du Tynril (lv.140)`

### Contexte

- **Donjon** : Laboratoire du Tynril (EN: Tynril Lab)
- **Boss** : Tynril Consterné (EN: Dismayed Tynril)
- **Niveau recommandé** : 140
- **Raison** : aucune stratégie trouvée dans les sources automatiques (Fandom EN/FR)

### Sources consultées

- [DofusDB](https://dofusdb.fr/fr/database/dungeons/laboratoire-du-tynril)
- [Fandom EN](https://dofuswiki.fandom.com/wiki/Dismayed_Tynril) (page peut-être absente)
- [Fandom FR](https://dofus.fandom.com/fr/wiki/Tynril_Constern%C3%A9) (page peut-être absente)

### Contribution

Voir `docs/DATA-CONTRIBUTING.md` pour le format de PR attendu. En résumé :

1. Fork + branche `data/<slug>`
2. Écrire un fichier `data/community/<slug>.json` avec :
   ```json
   {
     "long": {
       "fr": { "text": "... stratégie détaillée ...", "sourceNote": "d'après tel guide" },
       "en": null
     },
     "short": {
       "fr": [ { "icon": "...", "severity": "...", "text": "...", "quote": "..." } ]
     }
   }
   ```
3. Provenance sera `community` avec votre @username en `contributor`
4. PR reviewed par un mainteneur → merge → regen scraper

### Labels suggérés

`missing-strategy` · `help-wanted` · `good-first-issue`

---

## `Missing strategy: Volière de la Haute Truche (lv.130)`

### Contexte

- **Donjon** : Volière de la Haute Truche (EN: Cross Strich's Aviary)
- **Boss** : Haute Truche (EN: Cross Strich)
- **Niveau recommandé** : 130
- **Raison** : long présent mais LLM n'a pas produit de short validé

### Sources consultées

- [DofusDB](https://dofusdb.fr/fr/database/dungeons/voliere-de-la-haute-truche)
- [Fandom EN](https://dofuswiki.fandom.com/wiki/Cross_Strich) (page peut-être absente)
- [Fandom FR](https://dofus.fandom.com/fr/wiki/Haute_Truche) (page peut-être absente)

### Contribution

Voir `docs/DATA-CONTRIBUTING.md` pour le format de PR attendu. En résumé :

1. Fork + branche `data/<slug>`
2. Écrire un fichier `data/community/<slug>.json` avec :
   ```json
   {
     "long": {
       "fr": { "text": "... stratégie détaillée ...", "sourceNote": "d'après tel guide" },
       "en": null
     },
     "short": {
       "fr": [ { "icon": "...", "severity": "...", "text": "...", "quote": "..." } ]
     }
   }
   ```
3. Provenance sera `community` avec votre @username en `contributor`
4. PR reviewed par un mainteneur → merge → regen scraper

### Labels suggérés

`missing-strategy` · `help-wanted` · `good-first-issue`

---

## `Missing strategy: Repaire de Skeunk (lv.120)`

### Contexte

- **Donjon** : Repaire de Skeunk (EN: Skeunk's Hideout)
- **Boss** : Skeunk (EN: Skeunk)
- **Niveau recommandé** : 120
- **Raison** : aucune stratégie trouvée dans les sources automatiques (Fandom EN/FR)

### Sources consultées

- [DofusDB](https://dofusdb.fr/fr/database/dungeons/repaire-de-skeunk)
- [Fandom EN](https://dofuswiki.fandom.com/wiki/Skeunk) (page peut-être absente)
- [Fandom FR](https://dofus.fandom.com/fr/wiki/Skeunk) (page peut-être absente)

### Contribution

Voir `docs/DATA-CONTRIBUTING.md` pour le format de PR attendu. En résumé :

1. Fork + branche `data/<slug>`
2. Écrire un fichier `data/community/<slug>.json` avec :
   ```json
   {
     "long": {
       "fr": { "text": "... stratégie détaillée ...", "sourceNote": "d'après tel guide" },
       "en": null
     },
     "short": {
       "fr": [ { "icon": "...", "severity": "...", "text": "...", "quote": "..." } ]
     }
   }
   ```
3. Provenance sera `community` avec votre @username en `contributor`
4. PR reviewed par un mainteneur → merge → regen scraper

### Labels suggérés

`missing-strategy` · `help-wanted` · `good-first-issue`

---

## `Missing strategy: Antre du Blop Multicolore Royal (lv.120)`

### Contexte

- **Donjon** : Antre du Blop Multicolore Royal (EN: Royal Rainbow Blop Lair)
- **Boss** : Blop Coco Royal (EN: Royal Coco Blop)
- **Niveau recommandé** : 120
- **Raison** : aucune stratégie trouvée dans les sources automatiques (Fandom EN/FR)

### Sources consultées

- [DofusDB](https://dofusdb.fr/fr/database/dungeons/antre-du-blop-multicolore-royal)
- [Fandom EN](https://dofuswiki.fandom.com/wiki/Royal_Coco_Blop) (page peut-être absente)
- [Fandom FR](https://dofus.fandom.com/fr/wiki/Blop_Coco_Royal) (page peut-être absente)

### Contribution

Voir `docs/DATA-CONTRIBUTING.md` pour le format de PR attendu. En résumé :

1. Fork + branche `data/<slug>`
2. Écrire un fichier `data/community/<slug>.json` avec :
   ```json
   {
     "long": {
       "fr": { "text": "... stratégie détaillée ...", "sourceNote": "d'après tel guide" },
       "en": null
     },
     "short": {
       "fr": [ { "icon": "...", "severity": "...", "text": "...", "quote": "..." } ]
     }
   }
   ```
3. Provenance sera `community` avec votre @username en `contributor`
4. PR reviewed par un mainteneur → merge → regen scraper

### Labels suggérés

`missing-strategy` · `help-wanted` · `good-first-issue`

---

## `Missing strategy: Caverne de Nowel (lv.110)`

### Contexte

- **Donjon** : Caverne de Nowel (EN: Kwismas Cavern)
- **Boss** : Papa Nowel (EN: Father Kwismas)
- **Niveau recommandé** : 110
- **Raison** : aucune stratégie trouvée dans les sources automatiques (Fandom EN/FR)

### Sources consultées

- [DofusDB](https://dofusdb.fr/fr/database/dungeons/caverne-de-nowel)
- [Fandom EN](https://dofuswiki.fandom.com/wiki/Father_Kwismas) (page peut-être absente)
- [Fandom FR](https://dofus.fandom.com/fr/wiki/Papa_Nowel) (page peut-être absente)

### Contribution

Voir `docs/DATA-CONTRIBUTING.md` pour le format de PR attendu. En résumé :

1. Fork + branche `data/<slug>`
2. Écrire un fichier `data/community/<slug>.json` avec :
   ```json
   {
     "long": {
       "fr": { "text": "... stratégie détaillée ...", "sourceNote": "d'après tel guide" },
       "en": null
     },
     "short": {
       "fr": [ { "icon": "...", "severity": "...", "text": "...", "quote": "..." } ]
     }
   }
   ```
3. Provenance sera `community` avec votre @username en `contributor`
4. PR reviewed par un mainteneur → merge → regen scraper

### Labels suggérés

`missing-strategy` · `help-wanted` · `good-first-issue`

---

## `Missing strategy: Bambusaie de Damadrya (lv.110)`

### Contexte

- **Donjon** : Bambusaie de Damadrya (EN: Damadrya's Bamboo Grove)
- **Boss** : Damadrya (EN: Damadrya)
- **Niveau recommandé** : 110
- **Raison** : aucune stratégie trouvée dans les sources automatiques (Fandom EN/FR)

### Sources consultées

- [DofusDB](https://dofusdb.fr/fr/database/dungeons/bambusaie-de-damadrya)
- [Fandom EN](https://dofuswiki.fandom.com/wiki/Damadrya) (page peut-être absente)
- [Fandom FR](https://dofus.fandom.com/fr/wiki/Damadrya) (page peut-être absente)

### Contribution

Voir `docs/DATA-CONTRIBUTING.md` pour le format de PR attendu. En résumé :

1. Fork + branche `data/<slug>`
2. Écrire un fichier `data/community/<slug>.json` avec :
   ```json
   {
     "long": {
       "fr": { "text": "... stratégie détaillée ...", "sourceNote": "d'après tel guide" },
       "en": null
     },
     "short": {
       "fr": [ { "icon": "...", "severity": "...", "text": "...", "quote": "..." } ]
     }
   }
   ```
3. Provenance sera `community` avec votre @username en `contributor`
4. PR reviewed par un mainteneur → merge → regen scraper

### Labels suggérés

`missing-strategy` · `help-wanted` · `good-first-issue`

---

## `Missing strategy: Potager d'Halouine (lv.100)`

### Contexte

- **Donjon** : Potager d'Halouine (EN: Al Howin's Vegetable Patch)
- **Boss** : Halouine (EN: Al Howin)
- **Niveau recommandé** : 100
- **Raison** : aucune stratégie trouvée dans les sources automatiques (Fandom EN/FR)

### Sources consultées

- [DofusDB](https://dofusdb.fr/fr/database/dungeons/potager-d-halouine)
- [Fandom EN](https://dofuswiki.fandom.com/wiki/Al_Howin) (page peut-être absente)
- [Fandom FR](https://dofus.fandom.com/fr/wiki/Halouine) (page peut-être absente)

### Contribution

Voir `docs/DATA-CONTRIBUTING.md` pour le format de PR attendu. En résumé :

1. Fork + branche `data/<slug>`
2. Écrire un fichier `data/community/<slug>.json` avec :
   ```json
   {
     "long": {
       "fr": { "text": "... stratégie détaillée ...", "sourceNote": "d'après tel guide" },
       "en": null
     },
     "short": {
       "fr": [ { "icon": "...", "severity": "...", "text": "...", "quote": "..." } ]
     }
   }
   ```
3. Provenance sera `community` avec votre @username en `contributor`
4. PR reviewed par un mainteneur → merge → regen scraper

### Labels suggérés

`missing-strategy` · `help-wanted` · `good-first-issue`

---

## `Missing strategy: Théâtre de Dramak (lv.100)`

### Contexte

- **Donjon** : Théâtre de Dramak (EN: Dramak's Theatre)
- **Boss** : Maître des Pantins (EN: Puppet Master)
- **Niveau recommandé** : 100
- **Raison** : long présent mais LLM n'a pas produit de short validé

### Sources consultées

- [DofusDB](https://dofusdb.fr/fr/database/dungeons/theatre-de-dramak)
- [Fandom EN](https://dofuswiki.fandom.com/wiki/Puppet_Master) (page peut-être absente)
- [Fandom FR](https://dofus.fandom.com/fr/wiki/Ma%C3%AEtre_des_Pantins) (page peut-être absente)

### Contribution

Voir `docs/DATA-CONTRIBUTING.md` pour le format de PR attendu. En résumé :

1. Fork + branche `data/<slug>`
2. Écrire un fichier `data/community/<slug>.json` avec :
   ```json
   {
     "long": {
       "fr": { "text": "... stratégie détaillée ...", "sourceNote": "d'après tel guide" },
       "en": null
     },
     "short": {
       "fr": [ { "icon": "...", "severity": "...", "text": "...", "quote": "..." } ]
     }
   }
   ```
3. Provenance sera `community` avec votre @username en `contributor`
4. PR reviewed par un mainteneur → merge → regen scraper

### Labels suggérés

`missing-strategy` · `help-wanted` · `good-first-issue`

---

## `Missing strategy: Domaine Ancestral (lv.90)`

### Contexte

- **Donjon** : Domaine Ancestral (EN: Ancestral Domain)
- **Boss** : Abraknyde Ancestral (EN: Ancestral Treechnid)
- **Niveau recommandé** : 90
- **Raison** : long présent mais LLM n'a pas produit de short validé

### Sources consultées

- [DofusDB](https://dofusdb.fr/fr/database/dungeons/domaine-ancestral)
- [Fandom EN](https://dofuswiki.fandom.com/wiki/Ancestral_Treechnid) (page peut-être absente)
- [Fandom FR](https://dofus.fandom.com/fr/wiki/Abraknyde_Ancestral) (page peut-être absente)

### Contribution

Voir `docs/DATA-CONTRIBUTING.md` pour le format de PR attendu. En résumé :

1. Fork + branche `data/<slug>`
2. Écrire un fichier `data/community/<slug>.json` avec :
   ```json
   {
     "long": {
       "fr": { "text": "... stratégie détaillée ...", "sourceNote": "d'après tel guide" },
       "en": null
     },
     "short": {
       "fr": [ { "icon": "...", "severity": "...", "text": "...", "quote": "..." } ]
     }
   }
   ```
3. Provenance sera `community` avec votre @username en `contributor`
4. PR reviewed par un mainteneur → merge → regen scraper

### Labels suggérés

`missing-strategy` · `help-wanted` · `good-first-issue`

---

## `Missing strategy: Antre de la Reine Nyée (lv.90)`

### Contexte

- **Donjon** : Antre de la Reine Nyée (EN: Lair of the Rac Queen)
- **Boss** : Reine Nyée (EN: Rac Queen)
- **Niveau recommandé** : 90
- **Raison** : aucune stratégie trouvée dans les sources automatiques (Fandom EN/FR)

### Sources consultées

- [DofusDB](https://dofusdb.fr/fr/database/dungeons/antre-de-la-reine-nyee)
- [Fandom EN](https://dofuswiki.fandom.com/wiki/Rac_Queen) (page peut-être absente)
- [Fandom FR](https://dofus.fandom.com/fr/wiki/Reine_Ny%C3%A9e) (page peut-être absente)

### Contribution

Voir `docs/DATA-CONTRIBUTING.md` pour le format de PR attendu. En résumé :

1. Fork + branche `data/<slug>`
2. Écrire un fichier `data/community/<slug>.json` avec :
   ```json
   {
     "long": {
       "fr": { "text": "... stratégie détaillée ...", "sourceNote": "d'après tel guide" },
       "en": null
     },
     "short": {
       "fr": [ { "icon": "...", "severity": "...", "text": "...", "quote": "..." } ]
     }
   }
   ```
3. Provenance sera `community` avec votre @username en `contributor`
4. PR reviewed par un mainteneur → merge → regen scraper

### Labels suggérés

`missing-strategy` · `help-wanted` · `good-first-issue`

---

## `Missing strategy: Bateau du Chouque (lv.90)`

### Contexte

- **Donjon** : Bateau du Chouque (EN: LeChouque's Boat)
- **Boss** : Le Chouque (EN: LeChouque)
- **Niveau recommandé** : 90
- **Raison** : aucune stratégie trouvée dans les sources automatiques (Fandom EN/FR)

### Sources consultées

- [DofusDB](https://dofusdb.fr/fr/database/dungeons/bateau-du-chouque)
- [Fandom EN](https://dofuswiki.fandom.com/wiki/LeChouque) (page peut-être absente)
- [Fandom FR](https://dofus.fandom.com/fr/wiki/Le_Chouque) (page peut-être absente)

### Contribution

Voir `docs/DATA-CONTRIBUTING.md` pour le format de PR attendu. En résumé :

1. Fork + branche `data/<slug>`
2. Écrire un fichier `data/community/<slug>.json` avec :
   ```json
   {
     "long": {
       "fr": { "text": "... stratégie détaillée ...", "sourceNote": "d'après tel guide" },
       "en": null
     },
     "short": {
       "fr": [ { "icon": "...", "severity": "...", "text": "...", "quote": "..." } ]
     }
   }
   ```
3. Provenance sera `community` avec votre @username en `contributor`
4. PR reviewed par un mainteneur → merge → regen scraper

### Labels suggérés

`missing-strategy` · `help-wanted` · `good-first-issue`

---

## `Missing strategy: Chapiteau des Magik Riktus (lv.90)`

### Contexte

- **Donjon** : Chapiteau des Magik Riktus (EN: Magik Riktus Big Top)
- **Boss** : Choudini (EN: Cauldini)
- **Niveau recommandé** : 90
- **Raison** : aucune stratégie trouvée dans les sources automatiques (Fandom EN/FR)

### Sources consultées

- [DofusDB](https://dofusdb.fr/fr/database/dungeons/chapiteau-des-magik-riktus)
- [Fandom EN](https://dofuswiki.fandom.com/wiki/Cauldini) (page peut-être absente)
- [Fandom FR](https://dofus.fandom.com/fr/wiki/Choudini) (page peut-être absente)

### Contribution

Voir `docs/DATA-CONTRIBUTING.md` pour le format de PR attendu. En résumé :

1. Fork + branche `data/<slug>`
2. Écrire un fichier `data/community/<slug>.json` avec :
   ```json
   {
     "long": {
       "fr": { "text": "... stratégie détaillée ...", "sourceNote": "d'après tel guide" },
       "en": null
     },
     "short": {
       "fr": [ { "icon": "...", "severity": "...", "text": "...", "quote": "..." } ]
     }
   }
   ```
3. Provenance sera `community` avec votre @username en `contributor`
4. PR reviewed par un mainteneur → merge → regen scraper

### Labels suggérés

`missing-strategy` · `help-wanted` · `good-first-issue`

---

## `Missing strategy: Terrier du Wa Wabbit (lv.80)`

### Contexte

- **Donjon** : Terrier du Wa Wabbit (EN: Wa Wabbit's Warren)
- **Boss** : Wa Wobot (EN: Wa Wobot)
- **Niveau recommandé** : 80
- **Raison** : aucune stratégie trouvée dans les sources automatiques (Fandom EN/FR)

### Sources consultées

- [DofusDB](https://dofusdb.fr/fr/database/dungeons/terrier-du-wa-wabbit)
- [Fandom EN](https://dofuswiki.fandom.com/wiki/Wa_Wobot) (page peut-être absente)
- [Fandom FR](https://dofus.fandom.com/fr/wiki/Wa_Wobot) (page peut-être absente)

### Contribution

Voir `docs/DATA-CONTRIBUTING.md` pour le format de PR attendu. En résumé :

1. Fork + branche `data/<slug>`
2. Écrire un fichier `data/community/<slug>.json` avec :
   ```json
   {
     "long": {
       "fr": { "text": "... stratégie détaillée ...", "sourceNote": "d'après tel guide" },
       "en": null
     },
     "short": {
       "fr": [ { "icon": "...", "severity": "...", "text": "...", "quote": "..." } ]
     }
   }
   ```
3. Provenance sera `community` avec votre @username en `contributor`
4. PR reviewed par un mainteneur → merge → regen scraper

### Labels suggérés

`missing-strategy` · `help-wanted` · `good-first-issue`

---

## `Missing strategy: Cimetière des Mastodontes (lv.80)`

### Contexte

- **Donjon** : Cimetière des Mastodontes (EN: Mastodon Cemetery)
- **Boss** : Mantiscore (EN: Mantiscore)
- **Niveau recommandé** : 80
- **Raison** : aucune stratégie trouvée dans les sources automatiques (Fandom EN/FR)

### Sources consultées

- [DofusDB](https://dofusdb.fr/fr/database/dungeons/cimetiere-des-mastodontes)
- [Fandom EN](https://dofuswiki.fandom.com/wiki/Mantiscore) (page peut-être absente)
- [Fandom FR](https://dofus.fandom.com/fr/wiki/Mantiscore) (page peut-être absente)

### Contribution

Voir `docs/DATA-CONTRIBUTING.md` pour le format de PR attendu. En résumé :

1. Fork + branche `data/<slug>`
2. Écrire un fichier `data/community/<slug>.json` avec :
   ```json
   {
     "long": {
       "fr": { "text": "... stratégie détaillée ...", "sourceNote": "d'après tel guide" },
       "en": null
     },
     "short": {
       "fr": [ { "icon": "...", "severity": "...", "text": "...", "quote": "..." } ]
     }
   }
   ```
3. Provenance sera `community` avec votre @username en `contributor`
4. PR reviewed par un mainteneur → merge → regen scraper

### Labels suggérés

`missing-strategy` · `help-wanted` · `good-first-issue`

---

## `Missing strategy: Laboratoire de Brumen Tinctorias (lv.70)`

### Contexte

- **Donjon** : Laboratoire de Brumen Tinctorias (EN: Brumen Tinctorias's LaboRATory)
- **Boss** : Nelween (EN: Nelween)
- **Niveau recommandé** : 70
- **Raison** : aucune stratégie trouvée dans les sources automatiques (Fandom EN/FR)

### Sources consultées

- [DofusDB](https://dofusdb.fr/fr/database/dungeons/laboratoire-de-brumen-tinctorias)
- [Fandom EN](https://dofuswiki.fandom.com/wiki/Nelween) (page peut-être absente)
- [Fandom FR](https://dofus.fandom.com/fr/wiki/Nelween) (page peut-être absente)

### Contribution

Voir `docs/DATA-CONTRIBUTING.md` pour le format de PR attendu. En résumé :

1. Fork + branche `data/<slug>`
2. Écrire un fichier `data/community/<slug>.json` avec :
   ```json
   {
     "long": {
       "fr": { "text": "... stratégie détaillée ...", "sourceNote": "d'après tel guide" },
       "en": null
     },
     "short": {
       "fr": [ { "icon": "...", "severity": "...", "text": "...", "quote": "..." } ]
     }
   }
   ```
3. Provenance sera `community` avec votre @username en `contributor`
4. PR reviewed par un mainteneur → merge → regen scraper

### Labels suggérés

`missing-strategy` · `help-wanted` · `good-first-issue`

---

## `Missing strategy: Épreuve de Draegnerys (lv.70)`

### Contexte

- **Donjon** : Épreuve de Draegnerys (EN: Draegnerys's Trial)
- **Boss** : Draegnerys (EN: Draegnerys)
- **Niveau recommandé** : 70
- **Raison** : long présent mais LLM n'a pas produit de short validé

### Sources consultées

- [DofusDB](https://dofusdb.fr/fr/database/dungeons/epreuve-de-draegnerys)
- [Fandom EN](https://dofuswiki.fandom.com/wiki/Draegnerys) (page peut-être absente)
- [Fandom FR](https://dofus.fandom.com/fr/wiki/Draegnerys) (page peut-être absente)

### Contribution

Voir `docs/DATA-CONTRIBUTING.md` pour le format de PR attendu. En résumé :

1. Fork + branche `data/<slug>`
2. Écrire un fichier `data/community/<slug>.json` avec :
   ```json
   {
     "long": {
       "fr": { "text": "... stratégie détaillée ...", "sourceNote": "d'après tel guide" },
       "en": null
     },
     "short": {
       "fr": [ { "icon": "...", "severity": "...", "text": "...", "quote": "..." } ]
     }
   }
   ```
3. Provenance sera `community` avec votre @username en `contributor`
4. PR reviewed par un mainteneur → merge → regen scraper

### Labels suggérés

`missing-strategy` · `help-wanted` · `good-first-issue`

---

## `Missing strategy: Clos des Blops (lv.60)`

### Contexte

- **Donjon** : Clos des Blops (EN: Blop Fields)
- **Boss** : Blop Coco Royal (EN: Royal Coco Blop)
- **Niveau recommandé** : 60
- **Raison** : aucune stratégie trouvée dans les sources automatiques (Fandom EN/FR)

### Sources consultées

- [DofusDB](https://dofusdb.fr/fr/database/dungeons/clos-des-blops)
- [Fandom EN](https://dofuswiki.fandom.com/wiki/Royal_Coco_Blop) (page peut-être absente)
- [Fandom FR](https://dofus.fandom.com/fr/wiki/Blop_Coco_Royal) (page peut-être absente)

### Contribution

Voir `docs/DATA-CONTRIBUTING.md` pour le format de PR attendu. En résumé :

1. Fork + branche `data/<slug>`
2. Écrire un fichier `data/community/<slug>.json` avec :
   ```json
   {
     "long": {
       "fr": { "text": "... stratégie détaillée ...", "sourceNote": "d'après tel guide" },
       "en": null
     },
     "short": {
       "fr": [ { "icon": "...", "severity": "...", "text": "...", "quote": "..." } ]
     }
   }
   ```
3. Provenance sera `community` avec votre @username en `contributor`
4. PR reviewed par un mainteneur → merge → regen scraper

### Labels suggérés

`missing-strategy` · `help-wanted` · `good-first-issue`

---

## `Missing strategy: Gelaxième Dimension (lv.60)`

### Contexte

- **Donjon** : Gelaxième Dimension (EN: Jellith Dimension)
- **Boss** : Gelée Royale Bleuet (EN: Royal Blueberry Jelly)
- **Niveau recommandé** : 60
- **Raison** : aucune stratégie trouvée dans les sources automatiques (Fandom EN/FR)

### Sources consultées

- [DofusDB](https://dofusdb.fr/fr/database/dungeons/gelaxieme-dimension)
- [Fandom EN](https://dofuswiki.fandom.com/wiki/Royal_Blueberry_Jelly) (page peut-être absente)
- [Fandom FR](https://dofus.fandom.com/fr/wiki/Gel%C3%A9e_Royale_Bleuet) (page peut-être absente)

### Contribution

Voir `docs/DATA-CONTRIBUTING.md` pour le format de PR attendu. En résumé :

1. Fork + branche `data/<slug>`
2. Écrire un fichier `data/community/<slug>.json` avec :
   ```json
   {
     "long": {
       "fr": { "text": "... stratégie détaillée ...", "sourceNote": "d'après tel guide" },
       "en": null
     },
     "short": {
       "fr": [ { "icon": "...", "severity": "...", "text": "...", "quote": "..." } ]
     }
   }
   ```
3. Provenance sera `community` avec votre @username en `contributor`
4. PR reviewed par un mainteneur → merge → regen scraper

### Labels suggérés

`missing-strategy` · `help-wanted` · `good-first-issue`

---

## `Missing strategy: Village Kanniboul (lv.60)`

### Contexte

- **Donjon** : Village Kanniboul (EN: Kanniball Village)
- **Boss** : Kanniboul Ebil (EN: Kanniball Andchain)
- **Niveau recommandé** : 60
- **Raison** : aucune stratégie trouvée dans les sources automatiques (Fandom EN/FR)

### Sources consultées

- [DofusDB](https://dofusdb.fr/fr/database/dungeons/village-kanniboul)
- [Fandom EN](https://dofuswiki.fandom.com/wiki/Kanniball_Andchain) (page peut-être absente)
- [Fandom FR](https://dofus.fandom.com/fr/wiki/Kanniboul_Ebil) (page peut-être absente)

### Contribution

Voir `docs/DATA-CONTRIBUTING.md` pour le format de PR attendu. En résumé :

1. Fork + branche `data/<slug>`
2. Écrire un fichier `data/community/<slug>.json` avec :
   ```json
   {
     "long": {
       "fr": { "text": "... stratégie détaillée ...", "sourceNote": "d'après tel guide" },
       "en": null
     },
     "short": {
       "fr": [ { "icon": "...", "severity": "...", "text": "...", "quote": "..." } ]
     }
   }
   ```
3. Provenance sera `community` avec votre @username en `contributor`
4. PR reviewed par un mainteneur → merge → regen scraper

### Labels suggérés

`missing-strategy` · `help-wanted` · `good-first-issue`

---

## `Missing strategy: Château du Wa Wabbit (lv.60)`

### Contexte

- **Donjon** : Château du Wa Wabbit (EN: Wa Wabbit's Castle)
- **Boss** : Wa Wabbit (EN: Wa Wabbit)
- **Niveau recommandé** : 60
- **Raison** : aucune stratégie trouvée dans les sources automatiques (Fandom EN/FR)

### Sources consultées

- [DofusDB](https://dofusdb.fr/fr/database/dungeons/chateau-du-wa-wabbit)
- [Fandom EN](https://dofuswiki.fandom.com/wiki/Wa_Wabbit) (page peut-être absente)
- [Fandom FR](https://dofus.fandom.com/fr/wiki/Wa_Wabbit) (page peut-être absente)

### Contribution

Voir `docs/DATA-CONTRIBUTING.md` pour le format de PR attendu. En résumé :

1. Fork + branche `data/<slug>`
2. Écrire un fichier `data/community/<slug>.json` avec :
   ```json
   {
     "long": {
       "fr": { "text": "... stratégie détaillée ...", "sourceNote": "d'après tel guide" },
       "en": null
     },
     "short": {
       "fr": [ { "icon": "...", "severity": "...", "text": "...", "quote": "..." } ]
     }
   }
   ```
3. Provenance sera `community` avec votre @username en `contributor`
4. PR reviewed par un mainteneur → merge → regen scraper

### Labels suggérés

`missing-strategy` · `help-wanted` · `good-first-issue`

---

## `Missing strategy: Fonderie des Waddicts (lv.60)`

### Contexte

- **Donjon** : Fonderie des Waddicts (EN: Waddict Foundry)
- **Boss** : Mawabouaino (EN: Mawabouwaino)
- **Niveau recommandé** : 60
- **Raison** : long présent mais LLM n'a pas produit de short validé

### Sources consultées

- [DofusDB](https://dofusdb.fr/fr/database/dungeons/fonderie-des-waddicts)
- [Fandom EN](https://dofuswiki.fandom.com/wiki/Mawabouwaino) (page peut-être absente)
- [Fandom FR](https://dofus.fandom.com/fr/wiki/Mawabouaino) (page peut-être absente)

### Contribution

Voir `docs/DATA-CONTRIBUTING.md` pour le format de PR attendu. En résumé :

1. Fork + branche `data/<slug>`
2. Écrire un fichier `data/community/<slug>.json` avec :
   ```json
   {
     "long": {
       "fr": { "text": "... stratégie détaillée ...", "sourceNote": "d'après tel guide" },
       "en": null
     },
     "short": {
       "fr": [ { "icon": "...", "severity": "...", "text": "...", "quote": "..." } ]
     }
   }
   ```
3. Provenance sera `community` avec votre @username en `contributor`
4. PR reviewed par un mainteneur → merge → regen scraper

### Labels suggérés

`missing-strategy` · `help-wanted` · `good-first-issue`

---

## `Missing strategy: Grotte Hesque (lv.50)`

### Contexte

- **Donjon** : Grotte Hesque (EN: Grotto Hesque)
- **Boss** : Corailleur Magistral (EN: Great Coralator)
- **Niveau recommandé** : 50
- **Raison** : long présent mais LLM n'a pas produit de short validé

### Sources consultées

- [DofusDB](https://dofusdb.fr/fr/database/dungeons/grotte-hesque)
- [Fandom EN](https://dofuswiki.fandom.com/wiki/Great_Coralator) (page peut-être absente)
- [Fandom FR](https://dofus.fandom.com/fr/wiki/Corailleur_Magistral) (page peut-être absente)

### Contribution

Voir `docs/DATA-CONTRIBUTING.md` pour le format de PR attendu. En résumé :

1. Fork + branche `data/<slug>`
2. Écrire un fichier `data/community/<slug>.json` avec :
   ```json
   {
     "long": {
       "fr": { "text": "... stratégie détaillée ...", "sourceNote": "d'après tel guide" },
       "en": null
     },
     "short": {
       "fr": [ { "icon": "...", "severity": "...", "text": "...", "quote": "..." } ]
     }
   }
   ```
3. Provenance sera `community` avec votre @username en `contributor`
4. PR reviewed par un mainteneur → merge → regen scraper

### Labels suggérés

`missing-strategy` · `help-wanted` · `good-first-issue`

---

## `Missing strategy: Nid du Kwakwa (lv.50)`

### Contexte

- **Donjon** : Nid du Kwakwa (EN: The Kwakwa's Nest)
- **Boss** : Kwakwa (EN: Kwakwa)
- **Niveau recommandé** : 50
- **Raison** : aucune stratégie trouvée dans les sources automatiques (Fandom EN/FR)

### Sources consultées

- [DofusDB](https://dofusdb.fr/fr/database/dungeons/nid-du-kwakwa)
- [Fandom EN](https://dofuswiki.fandom.com/wiki/Kwakwa) (page peut-être absente)
- [Fandom FR](https://dofus.fandom.com/fr/wiki/Kwakwa) (page peut-être absente)

### Contribution

Voir `docs/DATA-CONTRIBUTING.md` pour le format de PR attendu. En résumé :

1. Fork + branche `data/<slug>`
2. Écrire un fichier `data/community/<slug>.json` avec :
   ```json
   {
     "long": {
       "fr": { "text": "... stratégie détaillée ...", "sourceNote": "d'après tel guide" },
       "en": null
     },
     "short": {
       "fr": [ { "icon": "...", "severity": "...", "text": "...", "quote": "..." } ]
     }
   }
   ```
3. Provenance sera `community` avec votre @username en `contributor`
4. PR reviewed par un mainteneur → merge → regen scraper

### Labels suggérés

`missing-strategy` · `help-wanted` · `good-first-issue`

---

## `Missing strategy: Donjon des Larves (lv.50)`

### Contexte

- **Donjon** : Donjon des Larves (EN: Larva Dungeon)
- **Boss** : Shin Larve (EN: Shin Larva)
- **Niveau recommandé** : 50
- **Raison** : aucune stratégie trouvée dans les sources automatiques (Fandom EN/FR)

### Sources consultées

- [DofusDB](https://dofusdb.fr/fr/database/dungeons/donjon-des-larves)
- [Fandom EN](https://dofuswiki.fandom.com/wiki/Shin_Larva) (page peut-être absente)
- [Fandom FR](https://dofus.fandom.com/fr/wiki/Shin_Larve) (page peut-être absente)

### Contribution

Voir `docs/DATA-CONTRIBUTING.md` pour le format de PR attendu. En résumé :

1. Fork + branche `data/<slug>`
2. Écrire un fichier `data/community/<slug>.json` avec :
   ```json
   {
     "long": {
       "fr": { "text": "... stratégie détaillée ...", "sourceNote": "d'après tel guide" },
       "en": null
     },
     "short": {
       "fr": [ { "icon": "...", "severity": "...", "text": "...", "quote": "..." } ]
     }
   }
   ```
3. Provenance sera `community` avec votre @username en `contributor`
4. PR reviewed par un mainteneur → merge → regen scraper

### Labels suggérés

`missing-strategy` · `help-wanted` · `good-first-issue`

---

## `Missing strategy: Donjon de Nowel (lv.50)`

### Contexte

- **Donjon** : Donjon de Nowel (EN: Kwismas Dungeon)
- **Boss** : Sapik (EN: Itzting)
- **Niveau recommandé** : 50
- **Raison** : long présent mais LLM n'a pas produit de short validé

### Sources consultées

- [DofusDB](https://dofusdb.fr/fr/database/dungeons/donjon-de-nowel)
- [Fandom EN](https://dofuswiki.fandom.com/wiki/Itzting) (page peut-être absente)
- [Fandom FR](https://dofus.fandom.com/fr/wiki/Sapik) (page peut-être absente)

### Contribution

Voir `docs/DATA-CONTRIBUTING.md` pour le format de PR attendu. En résumé :

1. Fork + branche `data/<slug>`
2. Écrire un fichier `data/community/<slug>.json` avec :
   ```json
   {
     "long": {
       "fr": { "text": "... stratégie détaillée ...", "sourceNote": "d'après tel guide" },
       "en": null
     },
     "short": {
       "fr": [ { "icon": "...", "severity": "...", "text": "...", "quote": "..." } ]
     }
   }
   ```
3. Provenance sera `community` avec votre @username en `contributor`
4. PR reviewed par un mainteneur → merge → regen scraper

### Labels suggérés

`missing-strategy` · `help-wanted` · `good-first-issue`

---

## `Missing strategy: Refuge sylvestre (lv.50)`

### Contexte

- **Donjon** : Refuge sylvestre (EN: Sylvan Refuge)
- **Boss** : Rakoopeur (EN: Raccooper)
- **Niveau recommandé** : 50
- **Raison** : long présent mais LLM n'a pas produit de short validé

### Sources consultées

- [DofusDB](https://dofusdb.fr/fr/database/dungeons/refuge-sylvestre)
- [Fandom EN](https://dofuswiki.fandom.com/wiki/Raccooper) (page peut-être absente)
- [Fandom FR](https://dofus.fandom.com/fr/wiki/Rakoopeur) (page peut-être absente)

### Contribution

Voir `docs/DATA-CONTRIBUTING.md` pour le format de PR attendu. En résumé :

1. Fork + branche `data/<slug>`
2. Écrire un fichier `data/community/<slug>.json` avec :
   ```json
   {
     "long": {
       "fr": { "text": "... stratégie détaillée ...", "sourceNote": "d'après tel guide" },
       "en": null
     },
     "short": {
       "fr": [ { "icon": "...", "severity": "...", "text": "...", "quote": "..." } ]
     }
   }
   ```
3. Provenance sera `community` avec votre @username en `contributor`
4. PR reviewed par un mainteneur → merge → regen scraper

### Labels suggérés

`missing-strategy` · `help-wanted` · `good-first-issue`

---

## `Missing strategy: Maison Fantôme (lv.40)`

### Contexte

- **Donjon** : Maison Fantôme (EN: Haunted House)
- **Boss** : Boostache (EN: Boostache)
- **Niveau recommandé** : 40
- **Raison** : aucune stratégie trouvée dans les sources automatiques (Fandom EN/FR)

### Sources consultées

- [DofusDB](https://dofusdb.fr/fr/database/dungeons/maison-fantome)
- [Fandom EN](https://dofuswiki.fandom.com/wiki/Boostache) (page peut-être absente)
- [Fandom FR](https://dofus.fandom.com/fr/wiki/Boostache) (page peut-être absente)

### Contribution

Voir `docs/DATA-CONTRIBUTING.md` pour le format de PR attendu. En résumé :

1. Fork + branche `data/<slug>`
2. Écrire un fichier `data/community/<slug>.json` avec :
   ```json
   {
     "long": {
       "fr": { "text": "... stratégie détaillée ...", "sourceNote": "d'après tel guide" },
       "en": null
     },
     "short": {
       "fr": [ { "icon": "...", "severity": "...", "text": "...", "quote": "..." } ]
     }
   }
   ```
3. Provenance sera `community` avec votre @username en `contributor`
4. PR reviewed par un mainteneur → merge → regen scraper

### Labels suggérés

`missing-strategy` · `help-wanted` · `good-first-issue`

---

## `Missing strategy: Donjon des Scarafeuilles (lv.40)`

### Contexte

- **Donjon** : Donjon des Scarafeuilles (EN: Scaraleaf Dungeon)
- **Boss** : Scarabosse Doré (EN: Golden Scarabugly)
- **Niveau recommandé** : 40
- **Raison** : aucune stratégie trouvée dans les sources automatiques (Fandom EN/FR)

### Sources consultées

- [DofusDB](https://dofusdb.fr/fr/database/dungeons/donjon-des-scarafeuilles)
- [Fandom EN](https://dofuswiki.fandom.com/wiki/Golden_Scarabugly) (page peut-être absente)
- [Fandom FR](https://dofus.fandom.com/fr/wiki/Scarabosse_Dor%C3%A9) (page peut-être absente)

### Contribution

Voir `docs/DATA-CONTRIBUTING.md` pour le format de PR attendu. En résumé :

1. Fork + branche `data/<slug>`
2. Écrire un fichier `data/community/<slug>.json` avec :
   ```json
   {
     "long": {
       "fr": { "text": "... stratégie détaillée ...", "sourceNote": "d'après tel guide" },
       "en": null
     },
     "short": {
       "fr": [ { "icon": "...", "severity": "...", "text": "...", "quote": "..." } ]
     }
   }
   ```
3. Provenance sera `community` avec votre @username en `contributor`
4. PR reviewed par un mainteneur → merge → regen scraper

### Labels suggérés

`missing-strategy` · `help-wanted` · `good-first-issue`

---

## `Missing strategy: Donjon des Squelettes (lv.40)`

### Contexte

- **Donjon** : Donjon des Squelettes (EN: Skeleton Dungeon)
- **Boss** : Chafer Rōnin (EN: Ronin Chafer)
- **Niveau recommandé** : 40
- **Raison** : aucune stratégie trouvée dans les sources automatiques (Fandom EN/FR)

### Sources consultées

- [DofusDB](https://dofusdb.fr/fr/database/dungeons/donjon-des-squelettes)
- [Fandom EN](https://dofuswiki.fandom.com/wiki/Ronin_Chafer) (page peut-être absente)
- [Fandom FR](https://dofus.fandom.com/fr/wiki/Chafer_R%C5%8Dnin) (page peut-être absente)

### Contribution

Voir `docs/DATA-CONTRIBUTING.md` pour le format de PR attendu. En résumé :

1. Fork + branche `data/<slug>`
2. Écrire un fichier `data/community/<slug>.json` avec :
   ```json
   {
     "long": {
       "fr": { "text": "... stratégie détaillée ...", "sourceNote": "d'après tel guide" },
       "en": null
     },
     "short": {
       "fr": [ { "icon": "...", "severity": "...", "text": "...", "quote": "..." } ]
     }
   }
   ```
3. Provenance sera `community` avec votre @username en `contributor`
4. PR reviewed par un mainteneur → merge → regen scraper

### Labels suggérés

`missing-strategy` · `help-wanted` · `good-first-issue`

---

## `Missing strategy: Donjon des Tofus (lv.40)`

### Contexte

- **Donjon** : Donjon des Tofus (EN: Tofu House)
- **Boss** : Batofu (EN: Batofu)
- **Niveau recommandé** : 40
- **Raison** : aucune stratégie trouvée dans les sources automatiques (Fandom EN/FR)

### Sources consultées

- [DofusDB](https://dofusdb.fr/fr/database/dungeons/donjon-des-tofus)
- [Fandom EN](https://dofuswiki.fandom.com/wiki/Batofu) (page peut-être absente)
- [Fandom FR](https://dofus.fandom.com/fr/wiki/Batofu) (page peut-être absente)

### Contribution

Voir `docs/DATA-CONTRIBUTING.md` pour le format de PR attendu. En résumé :

1. Fork + branche `data/<slug>`
2. Écrire un fichier `data/community/<slug>.json` avec :
   ```json
   {
     "long": {
       "fr": { "text": "... stratégie détaillée ...", "sourceNote": "d'après tel guide" },
       "en": null
     },
     "short": {
       "fr": [ { "icon": "...", "severity": "...", "text": "...", "quote": "..." } ]
     }
   }
   ```
3. Provenance sera `community` avec votre @username en `contributor`
4. PR reviewed par un mainteneur → merge → regen scraper

### Labels suggérés

`missing-strategy` · `help-wanted` · `good-first-issue`

---

## `Missing strategy: Cache de Kankreblath (lv.40)`

### Contexte

- **Donjon** : Cache de Kankreblath (EN: Kickroach's Lair)
- **Boss** : Kankreblath (EN: Kickroach)
- **Niveau recommandé** : 40
- **Raison** : aucune stratégie trouvée dans les sources automatiques (Fandom EN/FR)

### Sources consultées

- [DofusDB](https://dofusdb.fr/fr/database/dungeons/cache-de-kankreblath)
- [Fandom EN](https://dofuswiki.fandom.com/wiki/Kickroach) (page peut-être absente)
- [Fandom FR](https://dofus.fandom.com/fr/wiki/Kankreblath) (page peut-être absente)

### Contribution

Voir `docs/DATA-CONTRIBUTING.md` pour le format de PR attendu. En résumé :

1. Fork + branche `data/<slug>`
2. Écrire un fichier `data/community/<slug>.json` avec :
   ```json
   {
     "long": {
       "fr": { "text": "... stratégie détaillée ...", "sourceNote": "d'après tel guide" },
       "en": null
     },
     "short": {
       "fr": [ { "icon": "...", "severity": "...", "text": "...", "quote": "..." } ]
     }
   }
   ```
3. Provenance sera `community` avec votre @username en `contributor`
4. PR reviewed par un mainteneur → merge → regen scraper

### Labels suggérés

`missing-strategy` · `help-wanted` · `good-first-issue`

---

## `Missing strategy: Akadémie des Gobs (lv.40)`

### Contexte

- **Donjon** : Akadémie des Gobs (EN: Gob Akademy)
- **Boss** : Directeur Grunob (EN: Director Grunob)
- **Niveau recommandé** : 40
- **Raison** : aucune stratégie trouvée dans les sources automatiques (Fandom EN/FR)

### Sources consultées

- [DofusDB](https://dofusdb.fr/fr/database/dungeons/akademie-des-gobs)
- [Fandom EN](https://dofuswiki.fandom.com/wiki/Director_Grunob) (page peut-être absente)
- [Fandom FR](https://dofus.fandom.com/fr/wiki/Directeur_Grunob) (page peut-être absente)

### Contribution

Voir `docs/DATA-CONTRIBUTING.md` pour le format de PR attendu. En résumé :

1. Fork + branche `data/<slug>`
2. Écrire un fichier `data/community/<slug>.json` avec :
   ```json
   {
     "long": {
       "fr": { "text": "... stratégie détaillée ...", "sourceNote": "d'après tel guide" },
       "en": null
     },
     "short": {
       "fr": [ { "icon": "...", "severity": "...", "text": "...", "quote": "..." } ]
     }
   }
   ```
3. Provenance sera `community` avec votre @username en `contributor`
4. PR reviewed par un mainteneur → merge → regen scraper

### Labels suggérés

`missing-strategy` · `help-wanted` · `good-first-issue`

---

## `Missing strategy: Cour du Bouftou Royal (lv.30)`

### Contexte

- **Donjon** : Cour du Bouftou Royal (EN: Royal Gobball's Court)
- **Boss** : Bouftou Royal (EN: Royal Gobball)
- **Niveau recommandé** : 30
- **Raison** : aucune stratégie trouvée dans les sources automatiques (Fandom EN/FR)

### Sources consultées

- [DofusDB](https://dofusdb.fr/fr/database/dungeons/cour-du-bouftou-royal)
- [Fandom EN](https://dofuswiki.fandom.com/wiki/Royal_Gobball) (page peut-être absente)
- [Fandom FR](https://dofus.fandom.com/fr/wiki/Bouftou_Royal) (page peut-être absente)

### Contribution

Voir `docs/DATA-CONTRIBUTING.md` pour le format de PR attendu. En résumé :

1. Fork + branche `data/<slug>`
2. Écrire un fichier `data/community/<slug>.json` avec :
   ```json
   {
     "long": {
       "fr": { "text": "... stratégie détaillée ...", "sourceNote": "d'après tel guide" },
       "en": null
     },
     "short": {
       "fr": [ { "icon": "...", "severity": "...", "text": "...", "quote": "..." } ]
     }
   }
   ```
3. Provenance sera `community` avec votre @username en `contributor`
4. PR reviewed par un mainteneur → merge → regen scraper

### Labels suggérés

`missing-strategy` · `help-wanted` · `good-first-issue`

---

## `Missing strategy: Grange du Tournesol Affamé (lv.20)`

### Contexte

- **Donjon** : Grange du Tournesol Affamé (EN: Famished Sunflower's Barn)
- **Boss** : Tournesol Affamé (EN: Famished Sunflower)
- **Niveau recommandé** : 20
- **Raison** : aucune stratégie trouvée dans les sources automatiques (Fandom EN/FR)

### Sources consultées

- [DofusDB](https://dofusdb.fr/fr/database/dungeons/grange-du-tournesol-affame)
- [Fandom EN](https://dofuswiki.fandom.com/wiki/Famished_Sunflower) (page peut-être absente)
- [Fandom FR](https://dofus.fandom.com/fr/wiki/Tournesol_Affam%C3%A9) (page peut-être absente)

### Contribution

Voir `docs/DATA-CONTRIBUTING.md` pour le format de PR attendu. En résumé :

1. Fork + branche `data/<slug>`
2. Écrire un fichier `data/community/<slug>.json` avec :
   ```json
   {
     "long": {
       "fr": { "text": "... stratégie détaillée ...", "sourceNote": "d'après tel guide" },
       "en": null
     },
     "short": {
       "fr": [ { "icon": "...", "severity": "...", "text": "...", "quote": "..." } ]
     }
   }
   ```
3. Provenance sera `community` avec votre @username en `contributor`
4. PR reviewed par un mainteneur → merge → regen scraper

### Labels suggérés

`missing-strategy` · `help-wanted` · `good-first-issue`

---

## `Missing strategy: Château Ensablé (lv.20)`

### Contexte

- **Donjon** : Château Ensablé (EN: Sandy Castle)
- **Boss** : Mob l'Éponge (EN: Sponge Mob)
- **Niveau recommandé** : 20
- **Raison** : aucune stratégie trouvée dans les sources automatiques (Fandom EN/FR)

### Sources consultées

- [DofusDB](https://dofusdb.fr/fr/database/dungeons/chateau-ensable)
- [Fandom EN](https://dofuswiki.fandom.com/wiki/Sponge_Mob) (page peut-être absente)
- [Fandom FR](https://dofus.fandom.com/fr/wiki/Mob_l'%C3%89ponge) (page peut-être absente)

### Contribution

Voir `docs/DATA-CONTRIBUTING.md` pour le format de PR attendu. En résumé :

1. Fork + branche `data/<slug>`
2. Écrire un fichier `data/community/<slug>.json` avec :
   ```json
   {
     "long": {
       "fr": { "text": "... stratégie détaillée ...", "sourceNote": "d'après tel guide" },
       "en": null
     },
     "short": {
       "fr": [ { "icon": "...", "severity": "...", "text": "...", "quote": "..." } ]
     }
   }
   ```
3. Provenance sera `community` avec votre @username en `contributor`
4. PR reviewed par un mainteneur → merge → regen scraper

### Labels suggérés

`missing-strategy` · `help-wanted` · `good-first-issue`

---

## `Missing strategy: Crypte de Kardorim (lv.10)`

### Contexte

- **Donjon** : Crypte de Kardorim (EN: Kardorim's Crypt)
- **Boss** : Kardorim (EN: Kardorim)
- **Niveau recommandé** : 10
- **Raison** : aucune stratégie trouvée dans les sources automatiques (Fandom EN/FR)

### Sources consultées

- [DofusDB](https://dofusdb.fr/fr/database/dungeons/crypte-de-kardorim)
- [Fandom EN](https://dofuswiki.fandom.com/wiki/Kardorim) (page peut-être absente)
- [Fandom FR](https://dofus.fandom.com/fr/wiki/Kardorim) (page peut-être absente)

### Contribution

Voir `docs/DATA-CONTRIBUTING.md` pour le format de PR attendu. En résumé :

1. Fork + branche `data/<slug>`
2. Écrire un fichier `data/community/<slug>.json` avec :
   ```json
   {
     "long": {
       "fr": { "text": "... stratégie détaillée ...", "sourceNote": "d'après tel guide" },
       "en": null
     },
     "short": {
       "fr": [ { "icon": "...", "severity": "...", "text": "...", "quote": "..." } ]
     }
   }
   ```
3. Provenance sera `community` avec votre @username en `contributor`
4. PR reviewed par un mainteneur → merge → regen scraper

### Labels suggérés

`missing-strategy` · `help-wanted` · `good-first-issue`

---
