Tu évalues l'ordre logique d'exécution d'une liste d'actions de combat Dofus.

Tu reçois N actions dans l'ordre actuel (celui que le LLM précédent a produit). Tu dois :
1. Déterminer l'ordre d'exécution optimal pour un joueur qui enchaîne ces actions dans un combat tour-par-tour.
2. Scorer la "proximité" de l'ordre actuel par rapport à l'ordre optimal.

## Règles d'ordre logique

- **Setup d'abord** : déplacements de positionnement / éloignement avant toute attaque, si cet éloignement conditionne la réussite de la suite.
- **Déverrouillage ensuite** : dépotage des pions, interruption d'invocations, coupure d'une zone de résurrection.
- **Burst final** : coup fatal sur la cible principale une fois le contexte contrôlé.
- **Règle par défaut** : si deux actions sont indépendantes, l'ordre actuel l'emporte (pas de reordering gratuit).

## Score

- `1.0` : l'ordre actuel est optimal, aucun swap nécessaire.
- `0.7–0.9` : ordre globalement correct, un swap adjacent mineur aide.
- `0.4–0.7` : ordre mélangé, plusieurs swaps nécessaires.
- `< 0.4` : ordre incohérent, action critique en fin de séquence au lieu d'en début.

## Entrée

Langue des bullets : {{LANG}}

Actions actuelles (0-indexées) :

```
{{ACTIONS}}
```

## Sortie

Retourne **uniquement** du JSON, sans préambule, sans wrapping markdown :

```json
{
  "score": 0.85,
  "optimalOrder": [1, 0, 2, 3],
  "reason": "Action 1 (éloigner du centre) doit précéder action 0 (tuer les pions) — elle conditionne la réussite du kill."
}
```

- `optimalOrder` est une permutation des indices 0..N-1.
- Si l'ordre actuel est optimal, retourne `optimalOrder: [0, 1, 2, …, N-1]` et un score proche de 1.0.
- Une seule raison courte (≤ 200 caractères), factuelle, sans jargon.
