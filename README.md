# Dofus Companion

> Logiciel propriétaire. © 2026 Noureddine & Elhadi L. Tous droits réservés. Voir [Licence](#licence) ci-dessous.

Overlay Windows pour Dofus, 185 donjons factuels, **Combat Cards 4 blocs** bilingues FR/EN, lisibles en combat.

**Alt+D** pour afficher/masquer. Cherchez un donjon ou un monstre (**Ctrl+M**), lisez la fiche en < 3 secondes, tout en restant en jeu.

Site officiel : [dofuscompanion.com](https://dofuscompanion.com).

## Fonctionnalités

- **185 donjons** couverts (endgame 160+ prioritaire) avec stats factuelles DofusDB
- **Combat Cards** structure fixe 4 blocs sur **141 boss + 129 monstres notables** :
  - DÉLOCK : étapes actionnables pour gagner
  - CONTRAINTES : règles à respecter en permanence
  - DANGERS : punitions concrètes si erreur
  - INFOS UTILES : résistances et astuces secondaires
- **Règle du silence** : un monstre sans mécanique ne montre aucune card (pas de bruit visuel)
- **Vue monstre dédiée** (**Ctrl+M**), liste filtrée + fiche plein écran
- **Recherche par monstre** : taper « dompteuse » ouvre le donjon avec la fiche surlignée
- **Toggle masquer lambdas** : ne voir que les mobs à mécanique dans un donjon
- **Stratégies bilingues FR/EN** ancrées Fandom ou LLM verbatim (zéro hallucination)
- **Traçabilité totale** : chaque bullet porte une provenance (native, LLM ancrée)
- Overlay transparent toujours au premier plan, drag depuis la barre de titre
- Tray icon, raccourci global Alt+D, auto-update via canal de releases public

## Installation

Téléchargez l'installeur officiel depuis [dofuscompanion.com/download](https://dofuscompanion.com/download).

> **SmartScreen Windows** : si le setup est bloqué, cliquez « Informations complémentaires » → « Exécuter quand même ». L'installeur est signé pour l'auto-updater (minisign Ed25519) mais pas avec un certificat EV Windows.

## Raccourcis clavier

| Touche | Action |
|--------|--------|
| **Alt+D** | Afficher / Masquer l'overlay (global) |
| **Ctrl+M** | Basculer vue monstre dédiée (search + fiche) |
| ↑ ↓ | Naviguer dans les résultats |
| Enter | Ouvrir le donjon ou le monstre |
| Backspace / Esc | Retour / Fermer |
| `/` | Focus barre de recherche |
| **Ctrl+L** | Basculer langue FR ⇄ EN |
| **V** ou **Tab** | Basculer vue Actionnable ⇄ Détaillée |

## Données

Sources factuelles fusionnées :

| Source | Contenu | Couverture |
|--------|---------|------------|
| DofusDB | Stats : niveaux, PV, résistances, monstres | 185 donjons (100 %) |
| Wiki Fandom EN + FR | Stratégies boss + pages monstres | 143 boss + 83 monstres |
| LLM | Extraction Combat Cards 4 blocs ancrées | 141 boss + 129 monstres |
| Boss-mention fallback | Paragraphes de boss strategies mentionnant un monstre | 58 monstres supplémentaires |

**Anti-hallucination** : chaque bullet d'une Combat Card est ancrée verbatim dans le texte source Fandom (similarité ≥ 0.75). Les bullets dont l'ancre échoue sont rejetées automatiquement. Aucune bullet ne peut apparaître dans deux blocs. Les monstres sans source exploitable restent `combat: null`.

## Retours et bug reports

Les retours utilisateurs (bugs, suggestions, erreurs de stratégie) passent par la page **[Retours](https://dofuscompanion.com/retours)** sur le site officiel.

## Licence

**Logiciel propriétaire.** Copyright (c) 2026 Noureddine & Elhadi L. Tous droits réservés.

Toute reproduction, modification, redistribution, décompilation ou rétro-ingénierie sans autorisation explicite est interdite. Les données de stratégies (combat cards, fiches monstres), marques, logos et éléments graphiques de Dofus Companion restent la propriété du projet.

Dofus Companion est une application **non-officielle**. Dofus® est une marque déposée d'Ankama Games. Ce projet n'est ni approuvé ni affilié à Ankama.
