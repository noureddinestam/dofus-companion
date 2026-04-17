# Dofus Companion — Brief d'implémentation v0.4

**Repo** : `noureddinestam/dofus-companion`
**Base de départ** : v0.3 (185 donjons, 137 stratégies Fandom EN, app Tauri + React fonctionnelle)
**Objectif** : i18n FR/EN + stratégies bilingues fiables + vue synthétisée actionnable + complétion des 48 donjons manquants
**Contrainte absolue** : **ne rien casser** de ce qui marche actuellement. Tout est additif.

---

## 1. État des lieux (lu dans le code)

### Ce qui marche et qu'on ne touche pas
- Architecture monorepo pnpm (`app` + `scraper`) : solide.
- Tauri overlay avec `Alt+D`, auto-updater, window state : OK.
- `useDungeons` charge `dungeons.json` **une seule fois** au module load avec validation Zod : pattern à conserver.
- `useSearch` avec Fuse.js + debounce 60ms et `ignoreLocation: true` : OK, déjà bien debuggé.
- Scraper `DofusDB → Fandom EN` : pipeline propre, politesse respectée (`FANDOM_DELAY_MS = 700`).
- `appStore` Zustand avec `persist` : OK, mais ne persiste actuellement que `query`.

### Ce qui pose problème
1. **UI mono-langue FR hardcodée** — chaînes dans les composants : `"Retour"`, `"MONSTRES"`, `"STRATÉGIE"`, `"Aucun donjon trouvé"`, `"Voir guide"`, etc. Aucun système i18n.
2. **Stratégies mono-langue EN** — `BossStrategySchema.source = 'fandom-en'` uniquement. Le screenshot fourni montre le résultat : pavé anglais brut illisible pour un joueur FR (*"Sylargh and each monster will automatically cast the spell Necromagic…"*).
3. **Un seul format d'affichage** — texte long uniquement. Illisible en combat, impossible à scanner en 10 secondes comme prévu.
4. **48 donjons sans stratégie** (26%), et ce sont les plus joués : tous les 200 récents (Eliocalypse, Kabahal, Arbre de Mort, Expéditions…). Ça ruine la promesse "remplacer dofuspourlesnoobs".
5. Le fallback actuel (*"Pas de stratégie documentée"*) renvoie vers un guide externe = Alt+Tab = le problème qu'on prétend résoudre.

---

## 2. Ce qu'on implémente en v0.4

### Livrables utilisateur
1. **Toggle langue FR ⇄ EN** en haut à droite (à côté de la croix).
2. **Toggle version** `Détaillée` ⇄ `Actionnable` dans la fiche donjon (raccourci : `Tab` ou `V`).
3. **Version actionnable** : 3 à 6 bullets colorés avec icônes, pensés pour lecture < 10 s en combat.
4. **Version détaillée** : le pavé actuel, mais traduit FR quand la langue UI est FR.
5. **Stratégie disponible pour ≥ 95 % des donjons** (vs 74 % actuellement).
6. **Traçabilité totale** : chaque bullet et chaque traduction portent un badge de provenance visible.

### Non-goals explicites (v0.4)
- ❌ Pas de traduction **runtime** via API (latence, coût, offline cassé).
- ❌ Pas de contenu généré LLM **sans ancrage texte** dans une source tracée.
- ❌ Pas de nouvelles fonctionnalités hors i18n + synthèse + complétion (pas de favoris, pas de filtres — restent v0.5).

---

## 3. Stratégie anti-hallucination — le cœur du sujet

> *Pourquoi c'est le risque n°1* : un LLM qui invente une mécanique de boss Dofus = perte immédiate de crédibilité communautaire. On doit pouvoir affirmer : **chaque phrase de l'app est traçable à une source humaine**.

### Architecture à 3 niveaux de confiance

Chaque champ textuel (`strategyLong`, `strategyShort[]`, traductions) porte un objet `provenance` :

```ts
type Provenance =
  | { kind: 'native'; lang: 'fr' | 'en'; source: SourceId; sourceUrl: string }
  | { kind: 'llm-grounded'; baseLang: 'fr' | 'en'; baseSource: SourceId; baseSourceUrl: string; model: string; promptVersion: string; anchors: Anchor[] }
  | { kind: 'community'; contributor: string; reviewedBy?: string; prUrl: string };

type Anchor = {
  bulletIndex: number;      // Pour strategyShort : quel bullet
  quote: string;            // Extrait verbatim (10-25 mots) de la source
  similarity: number;       // 0-1, cosine sim ou fuzzy match
};
```

- **`native`** : scrapée depuis une source humaine (Fandom EN, Fandom FR, Gamosaurus). Zéro LLM. Affichage **sans badge** de prudence.
- **`llm-grounded`** : générée par LLM **à partir d'un texte source** (ex : synthèse FR à partir de Fandom EN). Chaque bullet porte une `quote` verbatim du texte source. **Si un bullet n'a pas d'ancrage valide → il est supprimé en pipeline, pas livré.** Badge UI discret : ⓘ `Synthèse IA · ancrée sur Fandom EN`.
- **`community`** : contribuée via PR GitHub, revue par un mainteneur. Badge : ⓘ `Contribution communautaire · révisée`.

### Règles pipeline (non négociables)

**R1 — Zéro LLM sans texte source.** Si on n'a ni Fandom EN, ni Fandom FR, ni contrib manuelle, le champ reste `null`. Jamais d'"à mon avis". Le schéma Zod rejette toute stratégie générée sans `anchors`.

**R2 — Validation d'ancrage obligatoire.** Après génération LLM, chaque bullet de `strategyShort` passe au validateur :
- Extraction de la `quote` proposée par le LLM.
- Recherche fuzzy de la quote dans le texte source (seuil : `similarity >= 0.75` sur une fenêtre de ±30 mots).
- Si la quote n'est pas retrouvée dans le source → le bullet est rejeté.
- Si moins de 3 bullets valides subsistent → on tombe en fallback (affichage du texte long seulement, pas de version synthétique).

**R3 — Glossaire terminologique Dofus FR ⇄ EN figé.** Un fichier `scraper/src/i18n/glossary.json` contient les paires canoniques : `{ "Erosion": "Érosion", "Pacifist State": "État pacifique", "Summon": "Invocation", "AP": "PA", "MP": "PM", "AoE": "zone d'effet", "tile": "case", "line of sight": "ligne de vue", … }`. Toute traduction LLM utilise ce glossaire en pre-prompt. Une post-validation rejette les traductions qui introduisent des termes hors glossaire (liste blanche).

**R4 — Prompts versionnés.** Chaque prompt de traduction/synthèse porte un `promptVersion` ("translate-v2", "summarize-v1"). Commit des prompts dans `scraper/src/prompts/`. Changement de prompt → bump de version → régénération obligatoire → diff visible dans le CHANGELOG.

**R5 — Traduction à 2 étages.**
1. **Étage préféré** : scraper `dofus-fr.fandom.com` pour la même page boss. Si la section `Stratégie` / `Tactique` existe → utilisée en tant que `native FR` (aucun LLM).
2. **Étage fallback** : si Fandom FR absent → traduction LLM de Fandom EN, avec glossaire, avec score de similarité structurelle (nombre de phrases préservé à ±20 %), marquée `llm-grounded`.

**R6 — Reproductibilité.** Tous les appels LLM passent par `scraper/src/llm.ts`, qui :
- Log chaque appel : prompt, modèle, réponse, hash des deux, horodatage.
- Cache les réponses sur disque (`scraper/cache/llm/<hash>.json`).
- Permet un `pnpm scrape --dry-run` qui utilise uniquement le cache, sans appel réseau, pour reproduire exactement le dernier run.

### Modèle LLM recommandé
- **Anthropic API** : `claude-sonnet-4-5` pour traduction + synthèse (le meilleur rapport qualité/coût sur texte structuré court).
- Clé lue depuis `ANTHROPIC_API_KEY`, jamais commitée.
- Budget typique : 185 donjons × ~2000 tokens I/O × 2 opérations (traduction + synthèse) ≈ < 5 € par rebuild complet. Négligeable.
- Fallback si absence de clé : pipeline continue, `strategyShort` et traduction FR générée restent `null`, le contenu déjà `native` est préservé. **Pas de crash.**

---

## 4. Schéma de données — extensions (additives)

Tout ce qui suit est **additif**. Les champs existants (`strategy`, `phases`, `monsters`, etc.) **ne sont pas renommés ni supprimés**. Les nouveaux champs sont tous optionnels avec `.default()` pour ne pas invalider les données v0.3 existantes.

### `app/src/types/dungeon.ts` — nouvelle version

```ts
import { z } from 'zod';

const ElementEnum = z.enum(['air', 'eau', 'feu', 'terre', 'neutre']);
const LangEnum = z.enum(['fr', 'en']);

// ========== Provenance ==========
export const AnchorSchema = z.object({
  bulletIndex: z.number().int().min(0),
  quote: z.string().min(5).max(300),
  similarity: z.number().min(0).max(1),
});

export const ProvenanceNativeSchema = z.object({
  kind: z.literal('native'),
  lang: LangEnum,
  source: z.enum(['fandom-en', 'fandom-fr', 'gamosaurus', 'manual']),
  sourceUrl: z.string().url(),
});

export const ProvenanceLlmSchema = z.object({
  kind: z.literal('llm-grounded'),
  baseLang: LangEnum,
  baseSource: z.enum(['fandom-en', 'fandom-fr', 'gamosaurus']),
  baseSourceUrl: z.string().url(),
  model: z.string(),               // ex "claude-sonnet-4-5"
  promptVersion: z.string(),       // ex "summarize-v1"
  anchors: z.array(AnchorSchema).min(1),
  generatedAt: z.string().datetime(),
});

export const ProvenanceCommunitySchema = z.object({
  kind: z.literal('community'),
  contributor: z.string(),
  reviewedBy: z.string().optional(),
  prUrl: z.string().url(),
});

export const ProvenanceSchema = z.discriminatedUnion('kind', [
  ProvenanceNativeSchema,
  ProvenanceLlmSchema,
  ProvenanceCommunitySchema,
]);

// ========== Stratégies ==========
export const StrategyLongSchema = z.object({
  text: z.string().min(30),
  provenance: ProvenanceSchema,
});

export const ActionableBulletSchema = z.object({
  icon: z.enum([
    'priority',       // 🎯 cible à tuer en premier
    'avoid',          // 🚫 à éviter
    'element',        // ⚡ élément recommandé
    'position',       // 📍 placement
    'phase',          // 🔄 transition de phase
    'instakill',      // ☠️  condition d'instakill
    'cooldown',       // ⏱️ timing / tour
    'summon',         // 👥 invocations
    'tip',            // 💡 astuce générale
  ]),
  severity: z.enum(['critical', 'danger', 'caution', 'info']),
  text: z.string().min(5).max(160),
});

export const StrategyShortSchema = z.object({
  bullets: z.array(ActionableBulletSchema).min(3).max(6),
  provenance: ProvenanceSchema,
});

// Conteneur bilingue. Au moins UNE langue doit être présente.
export const StrategyBundleSchema = z.object({
  long: z.object({
    fr: StrategyLongSchema.nullable().default(null),
    en: StrategyLongSchema.nullable().default(null),
  }),
  short: z.object({
    fr: StrategyShortSchema.nullable().default(null),
    en: StrategyShortSchema.nullable().default(null),
  }),
}).refine(
  (v) => v.long.fr || v.long.en || v.short.fr || v.short.en,
  { message: 'At least one language/format must be populated' },
);

// ========== Monster / Boss / Dungeon ==========
export const MonsterSchema = z.object({
  id: z.string(),
  name: z.string(),                          // FR (historique)
  nameEn: z.string().nullable().default(null),
  level: z.number().int().min(0),
  hp: z.number().int().nullable().default(null),
  family: z.string().default('Inconnu'),
  familyEn: z.string().nullable().default(null),   // NOUVEAU
  weakElement: ElementEnum.nullable(),
  resistElement: ElementEnum.nullable(),
  source: z.enum(['dofusdb', 'fandom-en', 'fandom-fr']),
  sourceUrl: z.string().url(),
});

// LEGACY : l'ancien champ `strategy` est conservé pour ne pas casser
// les datasets v0.3. Au chargement, un adapter le migre vers `strategies`.
export const BossStrategyLegacySchema = z.object({
  text: z.string().min(30),
  source: z.literal('fandom-en'),
  sourceUrl: z.string().url(),
});

export const BossSchema = MonsterSchema.extend({
  strategy: BossStrategyLegacySchema.nullable().default(null),  // LEGACY
  strategies: StrategyBundleSchema.nullable().default(null),    // NOUVEAU
  phases: z
    .array(z.object({
      trigger: z.string(),
      behavior: z.string(),
      triggerEn: z.string().nullable().default(null),    // NOUVEAU
      behaviorEn: z.string().nullable().default(null),   // NOUVEAU
    }))
    .default([]),
});

export const DungeonSchema = z.object({
  id: z.string(),
  name: z.string(),
  nameEn: z.string().nullable().default(null),
  slug: z.string(),
  aliases: z.array(z.string()).default([]),
  recommendedLevel: z.number(),
  levelRange: z.tuple([z.number(), z.number()]),
  monsters: z.array(MonsterSchema).min(1),
  boss: BossSchema,
  externalGuideUrl: z.string().url().nullable().default(null),
  externalGuideUrlFr: z.string().url().nullable().default(null),   // NOUVEAU
  lastUpdated: z.string().datetime(),
  dataVersion: z.string(),
});
```

### Adapter de compatibilité

Dans `useDungeons.ts`, entre le parse et l'export :

```ts
function migrateLegacyStrategy(d: Dungeon): Dungeon {
  // Si aucun `strategies` mais un `strategy` legacy EN → on le convertit
  if (!d.boss.strategies && d.boss.strategy) {
    return {
      ...d,
      boss: {
        ...d.boss,
        strategies: {
          long: {
            en: {
              text: d.boss.strategy.text,
              provenance: {
                kind: 'native',
                lang: 'en',
                source: 'fandom-en',
                sourceUrl: d.boss.strategy.sourceUrl,
              },
            },
            fr: null,
          },
          short: { fr: null, en: null },
        },
      },
    };
  }
  return d;
}
```

Ça garantit que **les anciens `dungeons.json` continuent de fonctionner** même si le scraper n'a pas encore été relancé.

---

## 5. Pipeline scraper — extensions

### Nouvelle structure

```
scraper/src/
├── sources/
│   ├── dofusdb.ts               # EXISTANT, inchangé
│   ├── fandom.ts                # EXISTANT, inchangé (fetchBossStrategy EN)
│   ├── fandom-fr.ts             # NOUVEAU — scrape dofus-fr.fandom.com
│   └── gamosaurus.ts            # NOUVEAU (optionnel) — fallback tier-2
├── i18n/
│   ├── glossary.json            # NOUVEAU — paires FR/EN canoniques
│   └── ui-strings.json          # NOUVEAU — source de vérité UI (utilisée aussi par /app)
├── llm/
│   ├── client.ts                # NOUVEAU — Anthropic SDK wrapper + cache
│   ├── translate.ts             # NOUVEAU — EN → FR, grounded
│   └── summarize.ts             # NOUVEAU — long → bullets, grounded
├── prompts/
│   ├── translate-v1.md          # NOUVEAU
│   └── summarize-v1.md          # NOUVEAU
├── validate/
│   ├── anchors.ts               # NOUVEAU — fuzzy-match bullets ↔ source
│   └── glossary.ts              # NOUVEAU — rejette traductions hors glossaire
├── cache.ts                     # EXISTANT, à étendre (cache LLM)
├── validate.ts                  # EXISTANT, à étendre (new schema)
├── diff.ts                      # EXISTANT, à étendre (diff stratégies bilingues)
└── index.ts                     # EXISTANT, orchestrateur mis à jour
```

### Nouveau flux de `buildDungeon`

```
1. DofusDB → stats, noms FR/EN
2. Fandom EN (existant) → strategy text EN
       ├─ Si trouvé : long.en = { native, fandom-en }
       └─ Sinon : long.en = null
3. Fandom FR (nouveau) → strategy text FR
       ├─ Si trouvé : long.fr = { native, fandom-fr }
       └─ Sinon : long.fr = null
4. Si long.en présent MAIS long.fr absent ET ANTHROPIC_API_KEY défini
       → LLM translate(long.en) grounded → long.fr = { llm-grounded }
5. Si long.fr OU long.en présent ET ANTHROPIC_API_KEY défini
       → LLM summarize (dans chaque langue dispo) → short.fr / short.en = { llm-grounded }
       → Chaque bullet validé contre son texte source
6. Si aucune source externe ne couvre le donjon (les 48 trous)
       → Tente gamosaurus (si source activée)
       → Sinon : strategies = null, flag `needsContribution = true`
```

### Ordre de priorité pour les trous (48 donjons)
1. `dofus-fr.fandom.com` même page (recherche par `nameEn` + variantes FR)
2. `dofuswiki.fandom.com` (Fandom EN — déjà en place)
3. `gamosaurus.com` (optionnel, à vérifier ToS)
4. Fallback communauté : template d'issue GitHub "Missing strategy: <donjon>" auto-générable via `pnpm scrape --gen-issues`.

### Scraper CLI

```bash
pnpm scrape                 # run complet
pnpm scrape --no-llm        # skip LLM (pas besoin d'ANTHROPIC_API_KEY)
pnpm scrape --dry-run       # utilise uniquement le cache disque
pnpm scrape --only-missing  # retente seulement les donjons sans strategy
pnpm scrape --gen-issues    # sort un markdown d'issues GitHub pour les trous
```

### Politesse réseau
- Fandom FR : mêmes règles que Fandom EN — **700 ms entre requêtes**, User-Agent `dofus-companion-scraper/0.4 (+github.com/noureddinestam/dofus-companion)`.
- LLM : parallélisation autorisée (pas de rate-limit côté source), mais cache disque obligatoire.

---

## 6. Prompts LLM — versionnés

### `scraper/src/prompts/translate-v1.md`

> Tu es un traducteur spécialisé du jeu Dofus. Tu traduis un texte de stratégie de combat de l'anglais vers le français.
>
> **Règles strictes :**
> 1. Ne jamais inventer d'information absente du texte source.
> 2. Utiliser exclusivement les termes canoniques du glossaire fourni ci-dessous quand ils s'appliquent.
> 3. Préserver la structure : si le source a N phrases, ta traduction doit avoir N ± 20 % phrases.
> 4. Préserver les nombres, pourcentages, noms propres (sauf s'ils ont un équivalent au glossaire).
> 5. Préserver les symboles de pourcentage, PV, PA, PM, dégâts.
> 6. Ne jamais ajouter d'opinion, conseil ou précision qui ne serait pas dans le source.
>
> **Glossaire (JSON)** :
> ```json
> {glossary}
> ```
>
> **Texte source (anglais)** :
> """
> {source}
> """
>
> Retourne uniquement la traduction française, sans préambule, sans commentaire.

### `scraper/src/prompts/summarize-v1.md`

> Tu produis un résumé tactique actionnable pour un joueur de Dofus en combat. Tu disposes du texte stratégique complet d'un boss. Tu dois extraire 3 à 6 bullets **actionnables en < 10 secondes de lecture**.
>
> **Règles strictes :**
> 1. Chaque bullet doit être directement tiré du texte source. Pas de généralités, pas d'opinion.
> 2. Pour chaque bullet, tu dois fournir une `quote` verbatim (10-25 mots) du texte source qui appuie le bullet.
> 3. Chaque bullet fait **5 à 160 caractères**.
> 4. Chaque bullet a une `icon` parmi : `priority`, `avoid`, `element`, `position`, `phase`, `instakill`, `cooldown`, `summon`, `tip`.
> 5. Chaque bullet a une `severity` parmi : `critical` (perte instantanée, condition échec), `danger` (gros dégâts, priorité forte), `caution` (à surveiller), `info` (utile mais non critique).
> 6. Priorise dans cet ordre : instakill conditions → kill priority → élément recommandé/à éviter → positionnement → transitions de phase → astuces.
> 7. Ne jamais inventer un chiffre, un sort, une mécanique absente du source.
> 8. Si le texte source contient moins de 3 faits actionnables distincts, retourne un tableau vide.
>
> **Langue de sortie** : {lang} (`fr` ou `en`).
>
> **Texte source** :
> """
> {source}
> """
>
> Format de sortie : **JSON uniquement**, schéma :
> ```json
> {
>   "bullets": [
>     { "icon": "priority", "severity": "critical", "text": "...", "quote": "..." }
>   ]
> }
> ```

### Validation post-génération (pseudo-code)

```ts
async function validateSummary(raw, sourceText) {
  const parsed = JSON.parse(raw);  // throws si non-JSON
  const validated = [];
  for (const [i, b] of parsed.bullets.entries()) {
    // Normaliser : lowercase, accents retirés, ponctuation stripped
    const norm = normalize(sourceText);
    const q = normalize(b.quote);
    // Similarité Jaro-Winkler ou token-sort ratio
    const sim = fuzzyContains(norm, q);
    if (sim < 0.75) {
      console.warn(`Bullet ${i} rejected: quote not found in source (sim=${sim})`);
      continue;
    }
    validated.push({
      bullet: { icon: b.icon, severity: b.severity, text: b.text },
      anchor: { bulletIndex: validated.length, quote: b.quote, similarity: sim },
    });
  }
  if (validated.length < 3) return null;   // fallback : pas de short strategy
  return validated;
}
```

---

## 7. UI — implémentation

### 7.1 Système i18n

**`app/src/i18n/strings.ts`** — source de vérité unique, typée.

```ts
export const UI_STRINGS = {
  fr: {
    search: {
      placeholder: 'Rechercher un donjon…',
      empty: 'Aucun donjon trouvé',
      hintExamples: 'Essayez « frigost », « bouf », « vlad »…',
    },
    dungeon: {
      back: 'Retour',
      monsters: 'MONSTRES',
      monstersSubtitle: 'niveau décroissant',
      boss: 'BOSS',
      strategy: 'STRATÉGIE',
      phases: 'PHASES',
      viewGuide: 'Voir guide',
      noStrategy: 'Pas de stratégie documentée pour ce donjon.',
      contribute: 'Contribuer',
    },
    view: {
      detailed: 'Détaillée',
      actionable: 'Actionnable',
      toggleHint: 'Changer de vue',
    },
    lang: {
      fr: 'FR',
      en: 'EN',
      toggleHint: 'Changer de langue',
    },
    footer: {
      navigate: 'Naviguer',
      open: 'Ouvrir',
      close: 'Fermer',
      search: 'Recherche',
      sections: 'Sections',
      switchView: 'Vue',
      switchLang: 'Langue',
    },
    provenance: {
      native: 'Source vérifiée',
      llmGrounded: 'Synthèse IA · ancrée',
      community: 'Communauté · révisée',
      showOriginal: 'Voir original',
    },
    update: {
      available: (v: string) => `↑ v${v} disponible`,
      install: 'Installer',
    },
    element: {
      air: 'Air', eau: 'Eau', feu: 'Feu', terre: 'Terre', neutre: 'Neutre',
      weakness: 'Faiblesse',
      resistance: 'Résistance',
    },
  },
  en: {
    search: {
      placeholder: 'Search a dungeon…',
      empty: 'No dungeon found',
      hintExamples: 'Try "frigost", "bouf", "vlad"…',
    },
    dungeon: {
      back: 'Back',
      monsters: 'MONSTERS',
      monstersSubtitle: 'by level descending',
      boss: 'BOSS',
      strategy: 'STRATEGY',
      phases: 'PHASES',
      viewGuide: 'View guide',
      noStrategy: 'No documented strategy for this dungeon.',
      contribute: 'Contribute',
    },
    view: {
      detailed: 'Detailed',
      actionable: 'Actionable',
      toggleHint: 'Switch view',
    },
    lang: {
      fr: 'FR', en: 'EN',
      toggleHint: 'Change language',
    },
    footer: {
      navigate: 'Navigate', open: 'Open', close: 'Close',
      search: 'Search', sections: 'Sections',
      switchView: 'View', switchLang: 'Lang',
    },
    provenance: {
      native: 'Verified source',
      llmGrounded: 'AI summary · anchored',
      community: 'Community · reviewed',
      showOriginal: 'Show original',
    },
    update: {
      available: (v: string) => `↑ v${v} available`,
      install: 'Install',
    },
    element: {
      air: 'Air', eau: 'Water', feu: 'Fire', terre: 'Earth', neutre: 'Neutral',
      weakness: 'Weakness',
      resistance: 'Resistance',
    },
  },
} as const;

export type Lang = keyof typeof UI_STRINGS;
export type UiStrings = typeof UI_STRINGS['fr'];   // structural type, both langs share it
```

**`app/src/i18n/useI18n.ts`** — hook simple, pas de dépendance externe (i18next overkill ici).

```ts
import { useAppStore } from '../store/appStore';
import { UI_STRINGS, type Lang, type UiStrings } from './strings';

export function useI18n() {
  const lang = useAppStore((s) => s.lang);
  const setLang = useAppStore((s) => s.setLang);
  const t: UiStrings = UI_STRINGS[lang];
  return { lang, setLang, t, toggleLang: () => setLang(lang === 'fr' ? 'en' : 'fr') };
}
```

### 7.2 Extension du store

**`app/src/store/appStore.ts`** — ajouts persistés.

```ts
interface AppState {
  // EXISTANT
  query: string;
  selectedDungeon: Dungeon | null;
  isVisible: boolean;
  // NOUVEAU
  lang: 'fr' | 'en';
  strategyView: 'short' | 'long';
  setQuery: (q: string) => void;
  selectDungeon: (d: Dungeon | null) => void;
  setVisible: (v: boolean) => void;
  setLang: (l: 'fr' | 'en') => void;
  setStrategyView: (v: 'short' | 'long') => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      query: '',
      selectedDungeon: null,
      isVisible: true,
      lang: 'fr',                   // défaut FR (audience cible)
      strategyView: 'short',        // défaut actionnable (la demande principale)
      setQuery: (query) => set({ query }),
      selectDungeon: (selectedDungeon) => set({ selectedDungeon }),
      setVisible: (isVisible) => set({ isVisible }),
      setLang: (lang) => set({ lang }),
      setStrategyView: (strategyView) => set({ strategyView }),
    }),
    {
      name: 'dofus-companion-store',
      partialize: (s) => ({ query: s.query, lang: s.lang, strategyView: s.strategyView }),
    },
  ),
);
```

### 7.3 Détection langue au premier lancement

**`app/src/i18n/detectLang.ts`** — appelé une seule fois si `lang` n'a jamais été explicitement défini.

```ts
export function detectSystemLang(): 'fr' | 'en' {
  const nav = navigator.language || navigator.languages?.[0] || 'fr';
  return nav.toLowerCase().startsWith('fr') ? 'fr' : 'en';
}
```

Hook d'init dans `App.tsx` : si `localStorage` ne contient pas `dofus-companion-store` lors du premier render, on appelle `setLang(detectSystemLang())`.

### 7.4 Toggle UI

**Dans `TitleBar.tsx`** — ajoute à droite, avant le bouton fermer :

```
[grip] DC [🔍 search input  ] [FR|EN] [✕]
```

Le toggle langue est un petit segmented control, pas un dropdown (1 clic, pas 2).

```tsx
<LangToggle />  // <div>FR</div><div>EN</div>, soulignement sur la langue active, clic bascule
```

Raccourci clavier : `Ctrl+L` (rappel du footer).

**Dans `DungeonCard.tsx`** — ajoute au niveau du header, à droite du niveau :

```
[←] Transporteur de Sylargh              [Détaillée | Actionnable]
    Nv. 180–210 · 5 monstres + boss                 [Voir guide ↗]
```

Raccourci clavier : `V` ou `Tab` pour basculer entre Détaillée/Actionnable.

### 7.5 Rendu bilingue — résolution de langue

**`app/src/features/strategy/resolveStrategy.ts`** — pure function, testée.

```ts
export function resolveStrategy(
  bundle: StrategyBundle | null,
  lang: Lang,
  view: 'short' | 'long',
): { content: StrategyLong | StrategyShort; effectiveLang: Lang } | null {
  if (!bundle) return null;
  const pool = view === 'short' ? bundle.short : bundle.long;
  // 1. Langue demandée
  if (pool[lang]) return { content: pool[lang]!, effectiveLang: lang };
  // 2. Autre langue
  const other: Lang = lang === 'fr' ? 'en' : 'fr';
  if (pool[other]) return { content: pool[other]!, effectiveLang: other };
  return null;
}
```

**Règle UI** : si la langue disponible ≠ la langue demandée, afficher un bandeau discret au-dessus du contenu : *"Disponible uniquement en anglais · traduction à venir"* / *"English version unavailable · French only"*.

### 7.6 Nouveaux composants

#### `StrategyShortView.tsx`

```tsx
function StrategyShortView({ strategy, lang }: { strategy: StrategyShort; lang: Lang }) {
  const { t } = useI18n();
  return (
    <div style={{ padding: '8px 10px' }}>
      {strategy.bullets.map((b, i) => (
        <BulletRow key={i} bullet={b} />
      ))}
      <ProvenanceBadge provenance={strategy.provenance} />
    </div>
  );
}
```

Couleurs par sévérité — réutilise les tokens existants :

```css
--bullet-critical: var(--priority-critical);    /* #EF4444 */
--bullet-danger:   var(--priority-danger);      /* #F59E0B */
--bullet-caution:  var(--priority-caution);     /* #FACC15 */
--bullet-info:     var(--text-secondary);
```

Icônes par type — uniques, scannables :

```
priority  → ◎  (cercle cible, rouge/orange selon severity)
avoid     → ⊘  (barré)
element   → ▲  (triangle couleur élément)
position  → ◈  (losange)
phase     → ↻  (rotation)
instakill → ✕  (croix, toujours rouge)
cooldown  → ◷  (horloge)
summon    → ※  (multi-point)
tip       → ◉  (ampoule-like)
```

Rendu d'un bullet :

```
[ICON couleur-severity] Texte du bullet en blanc, lisible
```

Max 6 bullets, chaque ligne ~45-50 caractères visibles dans la largeur standard 520px.

#### `ProvenanceBadge.tsx`

Petit badge discret en bas de la stratégie (pas au-dessus pour ne pas polluer).

```
• Source vérifiée — Fandom EN ↗
  (natif, pas de badge particulier)

ⓘ Synthèse IA · ancrée sur Fandom EN · [Voir original]
  (badge orangé discret, bouton "voir original" ouvre le texte long en langue source)

ⓘ Contribution communautaire · révisée par @mainteneur · [Voir PR]
```

#### `PhasesView.tsx` (existant, à bilinguiser)

Si `lang === 'fr'` et `phase.triggerEn/behaviorEn` présents mais `phase.trigger/behavior` FR absents → affiche EN avec bandeau de langue.

### 7.7 Raccourcis clavier mis à jour

| Touche | Action |
|---|---|
| `Alt+D` | Toggle overlay (global) — existant |
| `Esc` | Retour / masquer — existant |
| `↑` `↓` | Naviguer — existant |
| `Enter` | Ouvrir — existant |
| `Backspace` | Retour — existant |
| `/` ou `Ctrl+F` | Focus search — existant |
| **`V` ou `Tab`** | **Bascule vue Détaillée ⇄ Actionnable (nouveau)** |
| **`Ctrl+L`** | **Bascule langue FR ⇄ EN (nouveau)** |

`Tab` dans la fiche donjon ne sort pas de la fiche — il bascule la vue. Dans la liste de résultats, `Tab` reste standard (focus suivant).

### 7.8 Footer mis à jour

Dans la fiche donjon :

```
[Backspace] Retour   [V] Vue   [Ctrl+L] Langue   [Esc] Fermer
```

Dans la liste :

```
[↑↓] Naviguer   [Enter] Ouvrir   [Ctrl+L] Langue   [Esc] Fermer   [/] Recherche
```

---

## 8. Plan d'exécution — phasage strict

> Chaque phase se termine par un commit atomique sur une branche dédiée. Phase N+1 ne démarre pas tant que la Phase N n'est pas mergée. CI doit rester verte tout du long.

### Phase A — Fondations i18n (ne casse rien côté data)
**Branche** : `feat/i18n-foundation`

1. Créer `app/src/i18n/strings.ts` avec FR + EN complets.
2. Créer `app/src/i18n/useI18n.ts` et `detectLang.ts`.
3. Étendre `appStore.ts` avec `lang`, `strategyView` et leurs setters.
4. Remplacer **toutes** les chaînes FR hardcodées dans `App.tsx`, `TitleBar.tsx`, `DungeonCard.tsx`, `BossPanel.tsx`, `MonsterRow.tsx` par `t.xxx`.
5. Ajouter `LangToggle` dans `TitleBar.tsx`.
6. Ajouter raccourci clavier `Ctrl+L` dans `App.tsx`.
7. Tests Vitest : `useI18n` retourne bien la bonne langue, `resolveStrategy` fallback correctement.

**Critère de sortie** :
- Build passe, `pnpm dev` ouvre l'app, toggle FR/EN bascule toute l'UI visible.
- La vue détaillée actuelle (anglaise) reste affichée en EN en mode EN et sans régression en mode FR (qui affichera toujours EN avec bandeau "traduction à venir" — normal, pas encore traduit).
- Aucune régression sur le schéma Zod (les anciens `dungeons.json` passent toujours).

### Phase B — Schéma de données étendu + adapter legacy
**Branche** : `feat/schema-bilingual`

1. Étendre `app/src/types/dungeon.ts` avec `ProvenanceSchema`, `StrategyBundleSchema`, etc.
2. Écrire l'adapter `migrateLegacyStrategy` dans `useDungeons.ts`.
3. Étendre `scraper/src/validate.ts` avec le nouveau schéma, garder la compat.
4. Test : charger l'actuel `dungeons.json` v0.3 → il doit passer la nouvelle validation après migration.

**Critère de sortie** : app charge les données v0.3 sans erreur, `boss.strategies` est bien peuplé via migration pour les 137 donjons avec stratégie EN.

### Phase C — Vue "Actionnable" (rendu, sans data LLM encore)
**Branche** : `feat/strategy-short-view`

1. Créer `StrategyShortView.tsx`, `BulletRow.tsx`, `ProvenanceBadge.tsx`.
2. Ajouter `ViewToggle` dans `DungeonCard.tsx` (Détaillée / Actionnable).
3. Câbler `strategyView` + raccourci `V`/`Tab`.
4. Mocker 2-3 donjons avec un `strategies.short.en` manuel dans un fichier de fixtures pour valider le rendu.
5. Comportement fallback : si `strategies.short[lang]` absent, afficher un bandeau `"Version actionnable pas encore disponible pour ce donjon · voir version détaillée"` avec un bouton qui bascule sur Détaillée.

**Critère de sortie** : rendu visuel complet et beau sur au moins 3 donjons de test, toggle marche au clavier et à la souris.

### Phase D — Scraper Fandom FR + glossaire
**Branche** : `feat/scraper-fandom-fr`

1. Créer `scraper/src/sources/fandom-fr.ts` (copie adaptée de `fandom.ts`, API `https://dofus-fr.fandom.com/fr/api.php`).
2. Sections recherchées : `Stratégie`, `Stratégies`, `Tactique`, `Astuces`.
3. Créer `scraper/src/i18n/glossary.json` — initialiser avec ~80 paires (liste à produire depuis l'inspection des textes Fandom EN existants).
4. Mettre à jour `index.ts` pour faire l'appel Fandom FR après Fandom EN.
5. Peupler `strategies.long.fr` = native quand trouvé.
6. Pas de LLM encore, pas de `short` encore.

**Critère de sortie** : `pnpm scrape` produit `dungeons.json` avec `long.fr` native pour un sous-ensemble mesurable (attente : 40-70 donjons sur 137 — dépend de la couverture de Fandom FR).

### Phase E — LLM translate (combler les long.fr manquants)
**Branche** : `feat/llm-translate`

1. Créer `scraper/src/llm/client.ts` — wrapper Anthropic SDK avec cache disque.
2. Créer `scraper/src/llm/translate.ts` + prompt `translate-v1.md`.
3. Créer `scraper/src/validate/glossary.ts` — validation post-traduction.
4. Créer `scraper/src/validate/anchors.ts` — fuzzy match utilitaire (lib `fast-fuzzy` ou `string-similarity`).
5. Mettre à jour orchestrateur : si `long.en` existe et `long.fr === null` et `ANTHROPIC_API_KEY` présente → translate + valide → `long.fr` grounded.
6. Tests unitaires sur le validateur glossaire (accepte / rejette).
7. Run complet, vérifier que les 48 donjons sans EN restent sans FR (pas de hallucination).

**Critère de sortie** : tous les donjons avec `long.en` ont aussi `long.fr`, avec provenance correcte. Mode `--no-llm` passe toujours. Le cache disque permet `--dry-run`.

### Phase F — LLM summarize (générer les `short`)
**Branche** : `feat/llm-summarize`

1. Créer `scraper/src/llm/summarize.ts` + prompt `summarize-v1.md`.
2. Générer `short.fr` depuis `long.fr`, `short.en` depuis `long.en`.
3. Valider chaque bullet via `validate/anchors.ts` (similarité ≥ 0.75, sinon bullet rejeté).
4. Si < 3 bullets valides subsistent → `short = null` pour ce donjon/langue (jamais de short bâclée).
5. Run complet.

**Critère de sortie** : ≥ 90 % des donjons endgame 160+ ont un `short` dans les 2 langues. Rapport en fin de scrape : `"Summarize: XX/YY dungeons, ZZ bullets rejected for missing anchor"`.

### Phase G — Combler les 48 donjons sans source
**Branche** : `feat/fill-missing-strategies`

1. Audit : produire une liste `scraper/output/MISSING.md` avec les 48 donjons, leurs URL Fandom EN/FR (même si page inexistante), et un lien dofusdb.
2. Pour chacun, tenter en ordre :
   - Fandom FR page (pas seulement section — parfois la page existe avec contenu dans un autre format)
   - Gamosaurus (si on active cette source)
3. Pour le reste : générer automatiquement un set d'issues GitHub via `pnpm scrape --gen-issues`, templatées pour faciliter la contribution communautaire.
4. Documenter dans `docs/DATA-CONTRIBUTING.md` le workflow de PR avec le type `provenance.community`.

**Critère de sortie** : le rapport final liste ≤ 10 donjons sans aucune stratégie (vs 48 initialement), et chacun a une issue GitHub ouverte.

### Phase H — Release v0.4.0
**Branche** : `release/v0.4.0`

1. Bump version dans `app/package.json`, `scraper/package.json`, `DATA_VERSION` dans `scraper/src/index.ts`.
2. Regénérer `dungeons.json` en release finale (`pnpm scrape`).
3. Mettre à jour README (nouveaux raccourcis, toggle langue, toggle vue, crédits Fandom FR).
4. Ajouter `docs/I18N-AND-STRATEGY.md` — explique les 3 niveaux de provenance pour les contributeurs.
5. Screenshots/GIF avant-après.
6. `git tag v0.4.0 && git push origin v0.4.0` → GitHub Actions release.

**Critère de sortie (DoD v0.4.0)** :
- [ ] Toggle FR/EN instantané sur toute l'UI.
- [ ] Toggle Détaillée/Actionnable instantané sur toutes les fiches.
- [ ] ≥ 95 % des donjons ont une stratégie dans au moins une langue/format.
- [ ] ≥ 85 % des donjons ont `short.fr` **et** `short.en`.
- [ ] Chaque bullet LLM porte un `anchor` valide dans son texte source.
- [ ] Aucun crash si `ANTHROPIC_API_KEY` absent (fallback propre).
- [ ] App charge les données v0.3 sans erreur (backward compat via adapter).
- [ ] CI verte (lint + typecheck + tests + build Windows).
- [ ] Installer ≤ 18 Mo (on s'autorise +3 Mo pour les nouveaux strings).
- [ ] Auto-updater pousse v0.4.0 sur les installations v0.3.x sans intervention.

---

## 9. Tests — ce qui doit être couvert

### Nouveaux tests unitaires obligatoires

```
app/src/i18n/__tests__/useI18n.test.ts
  - retourne FR par défaut si pas de persist
  - toggle bascule et persiste
  - detectSystemLang couvre fr-FR, fr-CA, en-US, en-GB, de-DE → fallback en

app/src/features/strategy/__tests__/resolveStrategy.test.ts
  - lang demandée disponible → retourne cette langue
  - lang demandée absente, autre présente → fallback + flag
  - bundle entièrement null → retourne null
  - view 'short' vs 'long' séparés

scraper/src/validate/__tests__/anchors.test.ts
  - quote exacte dans source → similarity = 1
  - quote avec petite variation (ponctuation, accents) → ≥ 0.85
  - quote absente → < 0.5, rejetée
  - seuil de rejet à 0.75

scraper/src/validate/__tests__/glossary.test.ts
  - traduction utilisant les termes canoniques → OK
  - traduction introduisant un terme non-glossaire hors liste blanche → rejetée

scraper/src/llm/__tests__/summarize.test.ts
  - mock LLM retourne 5 bullets avec anchors valides → retour complet
  - mock LLM retourne 5 bullets dont 3 anchors invalides → retour 2 bullets
  - mock LLM retourne 5 bullets dont 4 anchors invalides → retour null (< 3 minimum)
```

### Test E2E Playwright à ajouter

```
app/tests/e2e/i18n-toggle.spec.ts
  - ouvrir → voir "Rechercher un donjon…"
  - Ctrl+L → voir "Search a dungeon…"
  - recharger → langue persistée

app/tests/e2e/strategy-toggle.spec.ts
  - ouvrir un donjon avec short+long dispos
  - voir vue actionnable par défaut (preference v0.4)
  - V → voir vue détaillée
  - Tab → voir vue actionnable
```

---

## 10. Risques et mitigations spécifiques à la v0.4

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| Fandom FR a une couverture plus faible que Fandom EN | Élevée | Moyen | LLM translate tranche le problème pour la majorité. Le gap restant est explicite (bandeau UI). |
| LLM hallucine une info absente du source | Moyenne | **Critique** | Validation par ancrage obligatoire, seuil 0.75, bullet rejeté sinon. Tests unitaires du validateur. |
| Glossaire incomplet → termes traduits de façon inconsistante | Moyenne | Moyen | Itération : alimenter le glossaire à chaque scrape en listant les termes EN récurrents non couverts. |
| Coût LLM explose en CI | Faible | Faible | Cache disque obligatoire. Scraper ne tourne pas en CI — seulement en local ou GH Action manuelle. |
| Clé Anthropic fuite dans un commit | Faible | Élevé | `.env.example` sans valeur, `.gitignore` strict, hook pre-commit `trufflehog` ou `git-secrets`. |
| `dungeons.json` grossit trop (>1.5 Mo) avec les bundles bilingues | Moyenne | Faible | Compression gzip dans le bundle Tauri, acceptable jusqu'à 2 Mo. Si dépasse : splitter par tranche de niveau. |
| Breaking change non détecté pour les utilisateurs v0.3 qui ne font pas l'auto-update | Faible | Moyen | Adapter legacy en dur dans `useDungeons`, garanti sur 2 versions (v0.4 et v0.5). |
| Fandom FR change de structure HTML | Moyenne | Moyen | Tests snapshot sur 5 pages types, alerte CI hebdo. Fallback sur LLM translate si scrape FR échoue. |

---

## 11. Consignes opératoires à Claude Code

1. **Lire ce brief en entier avant toute action.**
2. Résumer en 10 lignes la compréhension du projet, puis proposer le plan détaillé de la **Phase A uniquement** avec les commandes exactes. Attendre validation avant de coder.
3. Respecter l'ordre Phase A → H. Une phase = une branche = une PR = un merge.
4. **Tout changement est additif** côté schéma. Aucun champ existant n'est renommé, aucun existant n'est supprimé.
5. Commits Conventional Commits : `feat(i18n): add FR/EN toggle in titlebar`, `feat(scraper): fandom FR source`, `fix(strategy): anchor validation threshold`.
6. Zéro `any`, zéro `@ts-ignore` sans commentaire justificatif.
7. Aucune donnée générée par LLM sans `anchors` validés. **Si tu es tenté d'écrire "à mon avis"**, c'est le signal de refuser et de laisser le champ `null`.
8. À chaque fin de phase : résumé des fichiers touchés, stats du dataset (combien de `long.fr`, combien de `short.fr`, combien de rejets d'anchors), screenshots de l'UI si changement visuel.
9. Si Fandom FR, un LLM, ou une API tombe/change : stopper proprement, documenter, proposer un plan B. Ne jamais masquer un échec en retournant `null` silencieusement sans log.
10. Skills Claude Code à consulter en priorité : `strict-engineering-guard`, `frontend-design` (design tokens cohérents avec l'existant), `spec-tech` si extension d'architecture.

---

## 12. Premier prompt à coller dans Claude Code

> Lis le fichier `DOFUS_COMPANION_V0.4_BRIEF.md` à la racine du repo. Puis :
>
> 1. Clone l'état actuel et fais un `pnpm install && pnpm dev` pour vérifier que tout marche avant de toucher quoi que ce soit.
> 2. Résume-moi en 10 lignes ta compréhension du brief, en identifiant les 2 ou 3 zones que tu veux clarifier avec moi avant de commencer.
> 3. Propose le plan détaillé de la **Phase A (Fondations i18n)** uniquement, avec la liste exacte des fichiers à créer/modifier, les commandes que tu vas lancer, et la séquence de commits atomiques prévus.
> 4. N'écris aucun code tant que je n'ai pas validé ton plan Phase A.

---

**Fin du brief v0.4. Version 1.0 — prêt à exécuter.**
