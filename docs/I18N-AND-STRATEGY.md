# i18n & Stratégies — les 3 niveaux de provenance

Ce document explique comment les stratégies de boss sont stockées, validées et affichées dans Dofus Companion. À lire avant de contribuer du contenu (voir [`DATA-CONTRIBUTING.md`](DATA-CONTRIBUTING.md) pour le workflow PR).

## Philosophie

> **Zéro invention.** Chaque phrase affichée dans l'app est traçable à une source humaine ou à un texte source cité verbatim. Aucune hallucination LLM n'est tolérée.

## Schéma d'une stratégie

Chaque donjon a un champ `boss.strategies` qui est un `StrategyBundle | null` :

```ts
type StrategyBundle = {
  long: {
    fr: StrategyLong | null;   // texte complet en français
    en: StrategyLong | null;   // texte complet en anglais
  };
  short: {
    fr: StrategyShort | null;  // 3-6 bullets actionnables en français
    en: StrategyShort | null;  // 3-6 bullets actionnables en anglais
  };
};

type StrategyLong = { text: string; provenance: Provenance };
type StrategyShort = { bullets: ActionableBullet[]; provenance: Provenance };
```

Chaque `long` ou `short` porte **sa propre `provenance`**. Une même fiche peut donc mélanger :
- `long.en` = natif Fandom EN
- `long.fr` = traduction LLM ancrée
- `short.fr` = synthèse LLM ancrée
- `short.en` = contribution community

## Les 3 niveaux de provenance

### 1. Native (niveau 1 : confiance maximale)

```ts
{
  kind: 'native',
  lang: 'fr' | 'en',
  source: 'fandom-en' | 'fandom-fr' | 'gamosaurus' | 'manual',
  sourceUrl: 'https://...'
}
```

**Quand** : le texte est scrapé directement depuis un wiki humain. Zéro LLM, zéro transformation sémantique (juste nettoyage wikitext).

**Affichage UI** : pas de badge particulier, juste un lien cliquable *"Source vérifiée — Fandom EN ↗"* vers la page wiki d'origine.

### 2. LLM-grounded (niveau 2 : confiance tracée)

```ts
{
  kind: 'llm-grounded',
  baseLang: 'fr' | 'en',                    // langue du texte source
  baseSource: 'fandom-en' | 'fandom-fr' | 'gamosaurus',
  baseSourceUrl: 'https://...',             // pointeur vers la source originelle
  model: 'claude-sonnet-4-5',
  promptVersion: 'translate-v1' | 'summarize-v1',
  anchors: Anchor[],                        // obligatoire, min 1
  generatedAt: '2026-04-18T...'
}

type Anchor = {
  bulletIndex: number;    // position du bullet dans le short (0 pour long)
  quote: string;          // 10-25 mots verbatim du texte source
  similarity: number;     // 0-1, fuzzyContains(source, quote) ≥ 0.75
};
```

**Quand** :
- Traduction EN → FR d'un `long.en` native
- Synthèse d'un `long` en bullets `short` (dans la même langue)

**Garanties** :
- `anchors` est **non-vide** (validé par Zod)
- Chaque `quote` a été retrouvée par fuzzy match (Dice coefficient sur bigrammes, seuil 0.75) dans le texte source
- Si moins de 3 bullets passent l'ancre → **pipeline rejette** le short entier (jamais de short bâclée)
- Pour la traduction, validation structurelle : nombre de phrases ±20 % pour rejeter les compressions/expansions abusives

**Affichage UI** : badge discret orangé *"ⓘ Synthèse IA · ancrée sur Fandom EN · Voir original ↗"*.

### 3. Community (niveau 3 : contribution humaine)

```ts
{
  kind: 'community',
  contributor: 'username',              // @user qui a soumis la PR
  reviewedBy?: 'mainteneur-username',    // optionnel
  prUrl: 'https://github.com/.../pull/42'
}
```

**Quand** : un joueur soumet une stratégie via PR pour un donjon absent des wikis (ex : Expéditions 200 récentes, content saisonnier).

**Garanties** : pass de review humaine par un mainteneur (checklist dans la PR : pas d'invention, factuel, mécanique du patch actuel, cf. [`DATA-CONTRIBUTING.md`](DATA-CONTRIBUTING.md)).

**Affichage UI** : badge bleu *"ⓘ Contribution communautaire · @user · Voir PR ↗"*.

## Résolution à l'affichage

Le composant `resolveStrategy(bundle, lang, view)` (voir [`app/src/features/strategy/resolveStrategy.ts`](../app/src/features/strategy/resolveStrategy.ts)) choisit quoi afficher :

1. Langue demandée, format demandé → affiché tel quel
2. Langue demandée absente, autre langue présente → fallback + bandeau *"Disponible uniquement en EN · traduction à venir"*
3. Aucune des deux langues → message *"Pas de stratégie documentée"* + bouton Voir guide externe

Le bandeau de fallback **n'est pas affiché** quand la traduction LLM a eu lieu : la ressource `long.fr` existe, avec une provenance `llm-grounded` qui l'indique au badge.

## Pourquoi ce niveau d'exigence ?

Une app qui affiche de fausses mécaniques Dofus (sorts inventés, % inventés, mauvaise stratégie) perd immédiatement sa crédibilité auprès de la communauté. Une seule mécanique erronée = plainte Discord = désinstallation. Le coût d'une hallucination est 100× supérieur au coût d'un texte manquant.

C'est pourquoi :
- Les 42 donjons sans source **restent `null`** au lieu d'être remplis par LLM libre
- Les bullets LLM sans ancre valide sont **rejetés silencieusement** (comptés dans le rapport `rejected` du scrape)
- La rotation des prompts (`translate-v1`, `summarize-v1`) invalide automatiquement le cache → re-génération visible dans le CHANGELOG

## Évolutions futures (hors v0.4)

- **Provenance `manual-official`** pour les stratégies sourcées directement sur [dofus.com](https://www.dofus.com/fr/mmorpg/encyclopedie/) (Ankama officiel) quand ils ouvrent une API
- **Review-by-community** : permettre plusieurs `reviewedBy` pour les stratégies contestées
- **Dépréciation auto** : marquer une stratégie comme obsolète quand un patch Dofus casse la mécanique décrite
- **`short` multi-variantes** : solo / team / challenge (plusieurs bundles selon contexte)
