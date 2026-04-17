# DOFUS OVERLAY — Brief Claude Code

**Nom de code du projet** : `dofus-companion`
**Type** : Overlay Windows léger pour joueurs Dofus (2.x / Unity)
**Cible** : Communauté Dofus FR
**Licence** : MIT (open-source, sharable)
**Ambition** : Remplacer dofuspourlesnoobs.com en version offline, instantanée, actionnable — directement par-dessus le jeu.

---

## 1. Contexte et problème

### Ce qui existe déjà
- **dofuspourlesnoobs.com** : référence communautaire pour les stratégies de donjons, mais :
  - Navigation lente, pubs, UX datée
  - Pas d'overlay → force l'Alt+Tab
  - Contenu textuel verbeux, pas scannable en pleine session
  - Pas de hiérarchisation visuelle des menaces
- **DofusDB.fr** : base de données exhaustive et API ouverte, mais :
  - Orientée data brute (HP, résistances, sorts) — pas de stratégie
  - Pas de conseil actionnable type "tape celui-là en premier"

### Le gap
Un joueur en plein Songe Infini ou DJ de guilde a besoin, en **< 2 secondes** :
1. Voir quels monstres composent la salle
2. Savoir **lequel taper en premier** (priorité explicite)
3. Savoir **quel élément utiliser** et lequel éviter
4. Connaître la **mécanique du boss** en une phrase

Sans Alt+Tab. Sans pub. Sans scroll.

### La proposition de valeur
> Un overlay Windows, appelable via `Alt+D`, qui flotte par-dessus Dofus, offre une recherche instantanée, et affiche chaque donjon en **une fiche scannable de 10 secondes**.

---

## 2. Product spec

### Utilisateurs
- **Joueur PvM solo/guilde** (primary) : veut une aide en session sans interrompre le gameplay
- **Joueur occasionnel** (secondary) : veut comprendre un nouveau donjon avant d'y rentrer
- **Streamer / content creator** (tertiary) : veut un outil qui rend bien à l'écran

### User stories prioritaires (MVP)

**US-01** — En tant que joueur en donjon, je veux appuyer sur `Alt+D` pour faire apparaître l'overlay par-dessus le jeu sans alt-tab.

**US-02** — En tant que joueur, je veux taper le nom du donjon (ou partiel : "frigo", "bouf", "kolo") et avoir la fiche en < 300ms.

**US-03** — En tant que joueur, je veux voir les monstres d'un donjon triés par priorité de cible, avec pour chacun :
- Nom
- Niveau
- Mécanique clé en une phrase
- Élément de faiblesse
- Drapeau de priorité (🔴 kill first / 🟠 dangereux / 🟡 vigilance / 🟢 ignorable)

**US-04** — En tant que joueur, je veux voir la mécanique du boss en une fiche distincte :
- Phases
- Conditions de perte instant (tueur)
- Stratégie recommandée
- Compos suggérées (solo / groupe)

**US-05** — En tant que joueur, je veux appuyer sur `Esc` pour masquer l'overlay instantanément.

**US-06** — En tant que joueur, je veux que l'overlay retienne ma dernière recherche quand il se rouvre.

### User stories v1.1 (post-MVP)
- Filtre par tranche de niveau
- Favoris / donjons épinglés
- Mode "compact" (juste la liste des monstres prioritaires, sans texte)
- Import/export de stratégies custom par la commu
- Mode sombre / clair
- Hotkey personnalisable

### Non-goals (explicitement exclus)
- ❌ Scraping en temps réel de l'état du jeu (pas de lecture mémoire de Dofus — ToS)
- ❌ Automatisation / bot (zéro input simulé sur Dofus)
- ❌ Contenu PvP / Kolizéum (v2 éventuelle)
- ❌ App mobile (overlay desktop uniquement)
- ❌ Multi-langue (FR only pour le MVP, communauté cible)

---

## 3. Architecture technique

### Stack imposée
| Couche | Choix | Justification |
|---|---|---|
| **Framework desktop** | **Tauri 2.x** | Binaire ~8 Mo (vs 120 Mo Electron), RAM ~50 Mo, démarrage < 200ms, WebView native |
| **Frontend** | React 18 + TypeScript + Vite | Stack standard, HMR rapide, typage strict |
| **Styling** | Tailwind CSS 4 + CSS variables | Pas de framework UI lourd, design custom gaming |
| **State** | Zustand | Léger, pas de boilerplate Redux |
| **Search** | Fuse.js | Fuzzy search < 10ko, offline, < 5ms sur 200 entrées |
| **Hotkey global** | `tauri-plugin-global-shortcut` | Natif, marche même Dofus fullscreen |
| **Data** | JSON embarqué dans le bundle | Offline total, zéro API, 0 dépendance réseau |
| **Scraper** | Node.js + Playwright | Headless browser pour sites JS (dofuspourlesnoobs a du rendu dynamique) |
| **Validation data** | Zod | Schéma strict sur les fiches donjons |
| **Tests** | Vitest + Playwright Test | Unit + E2E |
| **CI/CD** | GitHub Actions | Build multi-plateforme, release auto |
| **Distribution** | Tauri installer (MSI/NSIS) + auto-updater | `.exe` signé, mise à jour silencieuse |

### Pourquoi pas Electron ?
- Binaire 10× plus gros → "pas trop invasif" est un requirement explicite
- Dofus est déjà un gros Unity : ajouter un Electron (Chromium complet) = 300 Mo RAM cumulés
- Tauri utilise la WebView2 de Windows (déjà installée) → zéro duplication

### Pourquoi pas AutoHotkey / native Win32 ?
- AHK : pas d'UI moderne, imbuvable à maintenir
- Native Win32 / WPF : 10× plus de code pour un résultat équivalent, communauté Dofus = devs web

---

## 4. Data layer — le point critique

### Problème fondamental du POC actuel
> *"Je vais construire une grosse base de données statique avec tous les donjons importants, en me basant sur ma connaissance du jeu + ce que j'ai lu."*

**C'est bloquant.** Un LLM qui invente des mécaniques de boss Dofus = app non-fiable = rejet par la commu. On doit **sourcer chaque fait**.

### Architecture data en deux étages

```
┌─────────────────────────────────────────────────────────┐
│  ÉTAGE 1 — DATA BRUTE (DofusDB API, lecture seule)     │
│  • Liste exhaustive des donjons (~150)                  │
│  • Liste des monstres par donjon                        │
│  • Stats : niveau, HP, résistances %, sorts             │
│  • Drops                                                 │
│  → Source de vérité technique                           │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  ÉTAGE 2 — DATA STRATÉGIQUE (scrape dofuspourlesnoobs)  │
│  • Mécanique boss                                        │
│  • Priorité de cible monstres                           │
│  • Conseils concrets (compo, stuff, positionnement)     │
│  → Source communautaire                                 │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  MERGE + NORMALISATION                                   │
│  • Pipeline Node dans /scraper                          │
│  • Sortie : /app/src/data/dungeons.json validée Zod     │
│  • Versioning sémantique : data-v1.4.2                  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  BUNDLE Tauri (embarqué)                                 │
│  • dungeons.json (~800 Ko gzippé)                       │
│  • Index Fuse pré-calculé (~300 Ko)                     │
└─────────────────────────────────────────────────────────┘
```

### Règle d'or
Chaque champ stratégique (`bossMechanic`, `monsterPriority`, `strategy`) doit avoir :
- `source: "dofuspourlesnoobs" | "dofusdb" | "manual"`
- `sourceUrl: string`
- `lastUpdated: ISO date`
- `verified: boolean`

**Aucune donnée générée par LLM sans source**. Si scraping échoue sur un donjon, le champ est `null`, pas "inventé".

### Schéma TypeScript (référence)

```typescript
// app/src/types/dungeon.ts
import { z } from "zod";

export const MonsterSchema = z.object({
  id: z.string(),                    // slug depuis DofusDB
  name: z.string(),
  level: z.number().int().min(1).max(300),
  hp: z.number().int().optional(),
  family: z.string(),                 // "Dragoeufs", "Bouftous"...
  weakElement: z.enum(["air", "eau", "feu", "terre", "neutre"]).nullable(),
  resistElement: z.enum(["air", "eau", "feu", "terre", "neutre"]).nullable(),
  priority: z.enum(["critical", "danger", "caution", "manageable"]),
  priorityReason: z.string().min(5).max(200),  // "AOE croix 2 cases, tue porteur en 2 tours"
  keyMechanic: z.string().nullable(),
  source: z.enum(["dofuspourlesnoobs", "dofusdb", "manual"]),
  sourceUrl: z.string().url(),
  verified: z.boolean(),
});

export const BossSchema = MonsterSchema.extend({
  phases: z.array(z.object({
    trigger: z.string(),               // "HP < 50%"
    behavior: z.string(),
  })).default([]),
  instantKillConditions: z.array(z.string()).default([]),
  recommendedStrategy: z.string(),
  recommendedComp: z.array(z.string()).default([]),  // ["Iop CAC", "Eni soin", ...]
});

export const DungeonSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),                    // pour URL/search
  aliases: z.array(z.string()).default([]),  // ["DJ bouf", "bouftou royal"]
  levelRange: z.tuple([z.number(), z.number()]),
  recommendedLevel: z.number(),
  zone: z.string(),                    // "Astrub", "Frigost", "Enutrosor"...
  continent: z.string(),
  imageUrl: z.string().url().nullable(),
  monsters: z.array(MonsterSchema).min(1),
  boss: BossSchema,
  rooms: z.number().int().default(5),
  keyRequired: z.boolean().default(false),
  achievements: z.array(z.string()).default([]),
  lastUpdated: z.string().datetime(),
  dataVersion: z.string(),             // "1.4.2"
});

export type Dungeon = z.infer<typeof DungeonSchema>;
```

### Pipeline de scraping (impératif)

```
scraper/
├── src/
│   ├── sources/
│   │   ├── dofusdb.ts          # API REST, pagination, cache disk
│   │   └── dofuspourlesnoobs.ts # Playwright + cheerio, respect robots.txt, rate limit 1 req/2s
│   ├── normalize/
│   │   ├── match-dungeons.ts   # fuzzy match entre les 2 sources
│   │   └── extract-priority.ts # heuristiques sur le HTML (mots-clés "en premier", "tuer", "dangereux")
│   ├── validate.ts              # Zod sur chaque donjon, erreurs = exit 1
│   ├── diff.ts                  # compare avec version précédente, génère CHANGELOG
│   └── index.ts                 # orchestrateur
├── cache/                        # HTTP cache, .gitignored
├── output/
│   ├── dungeons.json
│   ├── CHANGELOG-DATA.md
│   └── fuse-index.json
└── package.json
```

**Commande unique** : `pnpm scrape` → génère tout, valide, prêt à commit.

### Politesse scraping
- Rate limit : 1 requête / 2 secondes sur dofuspourlesnoobs (pas un site commercial, on le respecte)
- User-Agent : `dofus-companion-scraper/1.0 (+github.com/<user>/dofus-companion)`
- Respect `robots.txt`
- Cache HTTP 24h pour éviter de refrapper en dev
- Crédits explicites dans l'app : "Données stratégiques : dofuspourlesnoobs.com — Données techniques : dofusdb.fr"

---

## 5. UI/UX specs

### Principes directeurs
1. **Keyboard-first** — la souris est sur Dofus, pas sur l'overlay
2. **10-second glance** — chaque fiche lisible en 10 secondes
3. **Aucune pub, aucune distraction** — c'est un outil, pas un site
4. **Dark gaming aesthetic** — sombre, contrasté, lisible par-dessus Dofus

### Layout

```
┌─────────────────────────────────────────────────┐
│ 🔍  [bouftou royal_____________]    Alt+D  ⚙️  │ ← Titlebar custom
├─────────────────────────────────────────────────┤
│                                                 │
│   Donjon Bouftou Royal            Nv. 30-50    │
│   📍 Astrub · 5 salles · Clé requise            │
│                                                 │
│   MONSTRES (triés par priorité)                │
│   ┌─────────────────────────────────────────┐  │
│   │ 🔴  Chef de Guerre Bouftou      Nv.45   │  │
│   │     AOE croix, kill en premier          │  │
│   │     Faiblesse: 💧 Eau · Résiste: 🔥     │  │
│   ├─────────────────────────────────────────┤  │
│   │ 🟠  Bouftou Noir                 Nv.40   │  │
│   │     Invoc 2 bouftous, à couper vite     │  │
│   ├─────────────────────────────────────────┤  │
│   │ 🟡  Bouftou Royal (x3)          Nv.35   │  │
│   ├─────────────────────────────────────────┤  │
│   │ 🟢  Bouftou (x4)                Nv.30   │  │
│   └─────────────────────────────────────────┘  │
│                                                 │
│   BOSS — Chef de Guerre Bouftou                │
│   ┌─────────────────────────────────────────┐  │
│   │ ⚡ Phase 1 (100→50% HP)                 │  │
│   │   AOE croix 2 cases tous les 2 tours    │  │
│   │ ⚡ Phase 2 (<50% HP)                    │  │
│   │   Invoque 2 bouftous noirs              │  │
│   │                                          │  │
│   │ ☠️  Mort instant : aucune               │  │
│   │ 🎯  Stratégie : tanker au CAC, DPS      │  │
│   │     distance sur invocs                 │  │
│   └─────────────────────────────────────────┘  │
│                                                 │
│   📖 Source: dofuspourlesnoobs.com/bouftou     │
└─────────────────────────────────────────────────┘
        ↑↓ naviguer · Enter détail · Esc fermer
```

### Interactions clavier
| Touche | Action |
|---|---|
| `Alt+D` | Toggle overlay (global, même Dofus fullscreen) |
| `Esc` | Masquer overlay |
| `Ctrl+F` ou `/` | Focus barre de recherche |
| `↑` `↓` | Naviguer résultats de recherche |
| `Enter` | Ouvrir fiche donjon |
| `Backspace` | Retour liste |
| `Tab` | Naviguer entre monstres / boss |
| `Ctrl+,` | Ouvrir settings |

### Fenêtre Tauri
```typescript
// src-tauri/tauri.conf.json
{
  "app": {
    "windows": [{
      "label": "main",
      "title": "Dofus Companion",
      "width": 520,
      "height": 720,
      "minWidth": 400,
      "minHeight": 500,
      "resizable": true,
      "decorations": false,        // Titlebar custom
      "transparent": true,          // Pour border-radius
      "alwaysOnTop": true,
      "skipTaskbar": false,
      "visible": false,             // Démarre caché
      "center": false,
      "x": null, "y": null          // Restaure dernière position
    }]
  }
}
```

### Design tokens
```css
/* app/src/styles/tokens.css */
:root {
  /* Background (gaming dark) */
  --bg-base: rgba(12, 14, 18, 0.92);       /* Base semi-transparent */
  --bg-elevated: rgba(22, 25, 32, 0.96);
  --bg-hover: rgba(35, 39, 48, 0.98);

  /* Borders */
  --border-subtle: rgba(255, 255, 255, 0.06);
  --border-default: rgba(255, 255, 255, 0.12);

  /* Text */
  --text-primary: #F2F3F5;
  --text-secondary: #A8ADB8;
  --text-muted: #6B7280;

  /* Accent (Dofus-flavored, pas violet générique) */
  --accent: #E8B547;                        /* Gold Ankama-like */
  --accent-hover: #F5C65E;

  /* Priorité */
  --priority-critical: #EF4444;             /* 🔴 */
  --priority-danger: #F59E0B;               /* 🟠 */
  --priority-caution: #FACC15;              /* 🟡 */
  --priority-manageable: #22C55E;           /* 🟢 */

  /* Éléments Dofus */
  --element-air: #22C55E;
  --element-eau: #3B82F6;
  --element-feu: #EF4444;
  --element-terre: #A16207;
  --element-neutre: #9CA3AF;

  /* Typography */
  --font-ui: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Motion */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --duration-fast: 120ms;
  --duration-base: 200ms;
}
```

### Anti-patterns UI à bannir
- ❌ Animations de transition de page longues (> 200ms) — l'utilisateur est en combat
- ❌ Modales empilées — un seul niveau, Esc ferme tout
- ❌ Tooltips au survol — keyboard user doesn't hover
- ❌ Emoji excessifs dans le texte — les emoji-flags (🔴🟠🟡🟢) oui, le reste non
- ❌ Pubs, analytics invasifs, tracking — c'est un outil offline

---

## 6. Structure de repo

```
dofus-companion/
├── .github/
│   └── workflows/
│       ├── ci.yml                   # lint + test + build check
│       ├── release.yml              # tag → build multi-plateforme → GitHub Release
│       └── data-refresh.yml         # cron hebdo → run scraper → PR auto
├── app/                             # Tauri + React
│   ├── src/
│   │   ├── components/
│   │   │   ├── SearchBar.tsx
│   │   │   ├── DungeonCard.tsx
│   │   │   ├── MonsterRow.tsx
│   │   │   ├── BossPanel.tsx
│   │   │   └── TitleBar.tsx
│   │   ├── features/
│   │   │   ├── search/
│   │   │   │   ├── useSearch.ts
│   │   │   │   └── fuseConfig.ts
│   │   │   ├── dungeons/
│   │   │   │   ├── useDungeons.ts
│   │   │   │   └── DungeonView.tsx
│   │   │   └── hotkey/
│   │   │       └── useGlobalHotkey.ts
│   │   ├── data/
│   │   │   ├── dungeons.json        # généré par scraper
│   │   │   └── fuse-index.json
│   │   ├── types/
│   │   │   └── dungeon.ts
│   │   ├── store/
│   │   │   └── appStore.ts          # Zustand
│   │   ├── styles/
│   │   │   ├── tokens.css
│   │   │   └── globals.css
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── src-tauri/
│   │   ├── src/
│   │   │   ├── main.rs
│   │   │   ├── hotkey.rs
│   │   │   └── window.rs
│   │   ├── tauri.conf.json
│   │   ├── Cargo.toml
│   │   └── icons/
│   ├── public/
│   ├── tests/
│   │   ├── unit/
│   │   └── e2e/
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
├── scraper/                         # Pipeline data
│   ├── src/
│   │   ├── sources/
│   │   ├── normalize/
│   │   ├── validate.ts
│   │   └── index.ts
│   ├── cache/                       # .gitignored
│   ├── output/
│   ├── tests/
│   ├── tsconfig.json
│   └── package.json
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DATA-CONTRIBUTING.md         # comment ajouter/corriger une fiche
│   └── RELEASE.md
├── .editorconfig
├── .gitignore
├── .prettierrc
├── eslint.config.js
├── pnpm-workspace.yaml              # monorepo app + scraper
├── package.json
├── LICENSE                          # MIT
└── README.md
```

---

## 7. Plan d'exécution — phasage strict

### Phase 0 — Bootstrap (< 2h)
1. Init monorepo pnpm workspaces
2. Scaffold Tauri app (`pnpm create tauri-app --template react-ts`)
3. Setup ESLint + Prettier + EditorConfig
4. Setup Vitest + Playwright
5. CI GitHub Actions minimal (lint + typecheck)
6. README avec screenshot placeholder + commande `pnpm dev`

**Critère de sortie** : `pnpm dev` ouvre une fenêtre Tauri avec "Hello Dofus".

### Phase 1 — Data pipeline (< 1 jour)
1. Scraper DofusDB : récupère liste exhaustive donjons + monstres + stats
2. Scraper dofuspourlesnoobs : parse HTML, extrait mécaniques boss
3. Normalisation + merge
4. Validation Zod stricte
5. Output `dungeons.json` + `fuse-index.json`
6. Tests unitaires sur normalize (snapshot sur 5 donjons échantillons)
7. Documentation `docs/DATA-CONTRIBUTING.md`

**Critère de sortie** : `pnpm scrape` produit un JSON valide de 100+ donjons, chaque champ tracé à sa source.

### Phase 2 — UI core (< 2 jours)
1. Layout base + titlebar custom + drag region
2. Barre de recherche + Fuse.js + debounce
3. Liste de résultats navigable clavier
4. Fiche donjon : monstres triés par priorité + boss panel
5. Design tokens appliqués
6. Store Zustand pour dernière recherche + historique

**Critère de sortie** : naviguer 10 donjons au clavier en < 10s chacun.

### Phase 3 — Overlay behavior (< 1 jour)
1. Plugin `tauri-plugin-global-shortcut` installé
2. `Alt+D` toggle show/hide
3. `Esc` hide
4. `alwaysOnTop: true`
5. Position fenêtre sauvegardée entre sessions
6. Start on boot option (settings)
7. Tray icon avec menu (Show / Quit)

**Critère de sortie** : Dofus lancé en fullscreen → Alt+D → overlay visible par-dessus → recherche → Esc → retour jeu sans alt-tab.

### Phase 4 — Qualité + distribution (< 1 jour)
1. Tests E2E Playwright sur parcours critique
2. Icon app pro (pas l'icône Tauri par défaut)
3. Build Windows installer (MSI + NSIS)
4. Signature binaire (si budget ; sinon accepter SmartScreen warning documenté)
5. Auto-updater Tauri configuré
6. GitHub Release v0.1.0
7. README avec install instructions + GIF demo

**Critère de sortie** : un joueur télécharge le `.exe`, l'installe, lance Dofus, `Alt+D`, ça marche.

### Phase 5+ — Post-MVP
- Mode compact
- Favoris
- Filtres niveau
- Settings (hotkey custom, opacity)
- Import fiches custom de la commu
- i18n EN/ES

---

## 8. Qualité — non négociable

### Tests
- **Coverage cible** : 70% lignes, 80% sur `scraper/normalize` et `app/features/search`
- **Tests unitaires** : Vitest sur toute la logique pure (parsing, fuzzy match, tri priorité)
- **Tests E2E** : Playwright Test sur 3 parcours :
  1. Ouverture → recherche → fiche → fermeture
  2. Hotkey global (simulé)
  3. Restauration dernière recherche après reload

### Linting / formatting
- ESLint `strict` + `@typescript-eslint/strict`
- Prettier enforced (pre-commit via lint-staged + husky)
- `no-any`, `no-console` en prod
- Zod parse sur toute entrée externe (JSON data, settings)

### Performance targets
| Métrique | Target |
|---|---|
| Taille installer | < 15 Mo |
| RAM idle | < 80 Mo |
| CPU idle | < 0.5% |
| Cold start (clic icône → fenêtre visible) | < 400ms |
| Hotkey press → fenêtre visible | < 150ms |
| Search keystroke → résultats | < 30ms |
| Ouverture fiche donjon | < 50ms |

### Accessibilité
- Contraste AAA sur texte principal
- Focus visible sur tous les éléments navigables clavier
- `prefers-reduced-motion` respecté
- Taille minimum de police 13px

### Sécurité
- Tauri CSP stricte : `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'`
- Pas de fetch réseau en prod (data embarquée)
- Auto-updater : signature Ed25519 des releases
- Pas de lecture mémoire Dofus, pas d'injection (respect ToS Ankama)

---

## 9. Conformité et éthique

### Respect du ToS Ankama
- ✅ Overlay externe autonome (comme OBS, Discord)
- ✅ Aucune lecture de la mémoire du process Dofus
- ✅ Aucune simulation d'input clavier/souris dans Dofus
- ✅ Aucune lecture de packets réseau
- ❌ Pas d'automatisation → zéro ambiguïté légale

### Respect des sources scrapées
- Rate limit strict 1 req / 2s sur dofuspourlesnoobs
- User-Agent identifiable + URL du repo
- Crédits visibles dans l'app ET le README
- Si le site demande de stopper : on stoppe, on switch sur contribs communautaires

### Licence
- Code : MIT
- Data scrapée : reste propriété des sources originales, utilisée sous fair use / citation
- Assets Dofus (images monstres, icônes éléments) : **ne pas redistribuer**, lien externe uniquement ou assets originaux

---

## 10. Instructions pour Claude Code

### Ordre d'exécution impératif
1. **Lire ce brief en entier avant toute action.** Ne pas commencer par le code.
2. **Phase 0 → Phase 4 dans l'ordre.** Ne pas sauter. Chaque phase a un critère de sortie vérifiable.
3. **TDD sur toute logique pure** (scraper/normalize, search, tri priorité) : red → green → refactor.
4. **Commits atomiques** : un commit = une fonctionnalité testée. Format `<type>(<scope>): <desc>` (Conventional Commits).
5. **Pas de `any` en TypeScript.** Pas de `@ts-ignore` sans commentaire justificatif.
6. **Pas de donnée inventée.** Si le scraper ne trouve pas, `null` + flag `verified: false`. Jamais de "à mon avis".
7. **Chaque PR a** : description, checklist qualité, screenshots si UI.

### Skills Claude Code à consulter
- `strict-engineering-guard` — workflow obligatoire
- `frontend-design` — design tokens, patterns React
- `spec-tech` — pour toute extension d'architecture

### Communication
- Après chaque phase : résumé de ce qui est fait, ce qui reste, blocages éventuels
- Si ambiguïté sur un requirement : **demander**, ne pas deviner
- Si scraping bloque (Cloudflare, captcha, structure HTML changée) : stopper, documenter, proposer plan B

### Critères de refus
Claude Code doit **refuser** de :
- Implémenter de la lecture mémoire Dofus
- Implémenter de la simulation d'input sur Dofus
- Embarquer des assets propriétaires Ankama
- Générer du contenu stratégique sans source vérifiée
- Livrer une phase sans son critère de sortie rempli

---

## 11. Checklist de lancement (Definition of Done v0.1.0)

Avant de tagger `v0.1.0` et publier sur GitHub Releases :

- [ ] `pnpm scrape` produit ≥ 100 donjons validés Zod
- [ ] Chaque donjon a au moins boss + 3 monstres avec priorité
- [ ] `Alt+D` ouvre l'overlay par-dessus Dofus fullscreen (testé sur Windows 10 et 11)
- [ ] Recherche fuzzy fonctionne sur nom + alias + famille (< 30ms)
- [ ] Fiche donjon lisible en < 10s (test utilisateur sur 3 personnes)
- [ ] Installer `.exe` < 15 Mo, installe sans admin
- [ ] Auto-updater configuré et testé
- [ ] README avec GIF démo + install + raccourcis
- [ ] `LICENSE` MIT + crédits dofuspourlesnoobs + dofusdb
- [ ] CI verte (lint + typecheck + tests + build Windows)
- [ ] Issue templates GitHub (bug, feature, data-fix)
- [ ] CONTRIBUTING.md pour les corrections de data communautaires

---

## 12. Risques identifiés et mitigations

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| Structure HTML dofuspourlesnoobs change | Moyenne | Élevé | Tests snapshot sur HTML, alertes CI hebdo, fallback sur data manuelle |
| DofusDB coupe ou rate-limit | Faible | Moyen | Cache local 7 jours, vendoring d'un snapshot dans le repo |
| SmartScreen Windows bloque le `.exe` non signé | Élevée | Moyen | Documenter workaround dans README, budget signature code (~200€/an) en v1.0 |
| Ankama demande un takedown | Faible | Élevé | Aucune lecture mémoire ni assets propriétaires → risque juridique minimal. Si demande : comply immédiat. |
| Scraping éthiquement contesté par l'auteur du site | Faible | Moyen | Contacter l'auteur en amont, proposer partnership / crédits prominents / lien retour |
| Performance dégradée sur vieux PC | Faible | Faible | Tauri déjà léger ; targets perf explicites en section 8 |
| Feature creep communauté (Kolizéum, PvP, mobile...) | Élevée | Moyen | Roadmap publique, non-goals affichés, dire non proprement |

---

## 13. Premier prompt à donner à Claude Code

> *Lis le fichier `DOFUS_OVERLAY_CLAUDE_CODE_BRIEF.md` en entier. Résume-moi en 10 lignes ta compréhension du projet, puis propose le plan détaillé de la **Phase 0 uniquement** avec les commandes exactes que tu vas lancer. N'écris aucun code avant que je valide ce plan.*

---

**Fin du brief. Version 1.0 — prêt à exécuter.**
