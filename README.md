# Dofus Companion

Overlay Windows pour Dofus — 185 donjons factuels, stratégies bilingues FR/EN, vue Actionnable pour combat.

**Alt+D** pour afficher/masquer. Cherchez un donjon, consultez la stratégie en 10 secondes ou le pavé détaillé, tout en restant en jeu.

## Fonctionnalités

- **185 donjons** couverts (endgame 160+ prioritaire) avec stats factuelles DofusDB
- **Stratégies bilingues FR/EN** : natif Fandom quand dispo, LLM ancré sinon (zéro hallucination)
- **2 vues** par fiche : **Actionnable** (3-6 bullets colorés, lisibles en combat) et **Détaillée** (pavé complet)
- **Traçabilité totale** : chaque texte porte une provenance cliquable (source native, synthèse IA ancrée, ou contribution communautaire)
- Overlay transparent toujours au premier plan, drag depuis la barre de titre, position haut-droite par défaut
- Tray icon, raccourci global Alt+D (toggle propre sur Windows)
- Mise à jour automatique via GitHub Releases

## Installation

1. Téléchargez `Dofus Companion_0.4.0_x64-setup.exe` depuis la [dernière release](../../releases/latest)
2. Lancez le setup (acceptez WebView2 si demandé — composant Microsoft standard inclus dans Windows 11)
3. L'application démarre dans la barre système — appuyez **Alt+D** pour l'ouvrir

> **SmartScreen Windows** : si le setup est bloqué, cliquez "Informations complémentaires" → "Exécuter quand même". L'installeur est signé pour l'auto-updater (minisign) mais pas avec un certificat EV Windows.

## Raccourcis clavier

| Touche | Action |
|--------|--------|
| **Alt+D** | Afficher / Masquer l'overlay (global) |
| ↑ ↓ | Naviguer dans les résultats |
| Enter | Ouvrir le donjon |
| Backspace / Esc | Retour / Fermer |
| `/` | Focus barre de recherche |
| **Ctrl+L** | Basculer langue FR ⇄ EN |
| **V** ou **Tab** | Basculer vue Actionnable ⇄ Détaillée (dans une fiche) |

## Données

Sources factuelles fusionnées par le scraper (`pnpm scrape`) :

| Source | Contenu | Couverture |
|--------|---------|-----------|
| [DofusDB](https://dofusdb.fr) | Stats : niveaux, PV, résistances, monstres | 185 donjons (100 %) |
| [Wiki Fandom EN](https://dofuswiki.fandom.com) | Stratégies boss en anglais | 143 donjons (77 %) |
| [Wiki Fandom FR](https://dofus.fandom.com/fr) | Stratégies boss en français | 0 (wiki quasi-vide sur les donjons) |
| LLM `claude-sonnet-4-5` | Traduction EN → FR + synthèse bullets actionnables | 132 long.fr, 128 short.en, 124 short.fr |
| Contributions communautaires | Via PR (`docs/DATA-CONTRIBUTING.md`) | Nouveau en v0.4 |

**Anti-hallucination** : chaque texte LLM est ancré verbatim dans un texte source. Les bullets dont l'ancre ne passe pas la similarité ≥ 0.75 sont rejetés automatiquement — pas de short bâclée. Les donjons sans source exploitable restent `null` (jamais d'invention).

Pour les 42 donjons sans stratégie automatique (Expéditions 200, content récent) : voir [`scraper/output/MISSING.md`](scraper/output/MISSING.md) et contribuer via [`docs/DATA-CONTRIBUTING.md`](docs/DATA-CONTRIBUTING.md).

## Développement

### Prérequis

- [Rust](https://rustup.rs/) stable (pour le build Tauri)
- [Node.js](https://nodejs.org/) 22+
- [pnpm](https://pnpm.io/) 9+

```bash
git clone https://github.com/noureddinestam/dofus-companion
cd dofus-companion
pnpm install
pnpm dev              # lance l'overlay en mode dev (hot-reload)
pnpm typecheck        # vérif TS sur app + scraper
pnpm test             # Vitest (app + scraper, 67 tests)
pnpm lint
```

### Régénérer les données

```bash
pnpm scrape                   # run complet (DofusDB + Fandom + LLM si clé dispo)
pnpm scrape --no-llm          # skip LLM (pas besoin d'ANTHROPIC_API_KEY)
pnpm scrape --dry-run         # utilise uniquement le cache disque
pnpm scrape --gen-issues      # génère scraper/output/ISSUES.md (templates GitHub Issues)
```

Pour activer les traductions et synthèses LLM :

```bash
export ANTHROPIC_API_KEY=sk-ant-...
pnpm scrape
# → ~5-10 min + coût ~2-3 € pour un rebuild complet
```

### Build Windows

```bash
pnpm build            # produit le MSI + NSIS dans app/src-tauri/target/release/bundle/
```

## Release

### 1. Configurer la signature (une seule fois)

```bash
pnpm --filter app tauri signer generate -w ~/.tauri/dofus-companion.key

# Copier la clé publique dans tauri.conf.json → plugins.updater.pubkey
# Ajouter le contenu du fichier .key dans GitHub Secrets :
# - TAURI_SIGNING_PRIVATE_KEY
```

### 2. Publier une release

```bash
git tag v0.x.y
git push origin v0.x.y
# → GitHub Actions build MSI + NSIS, crée la release, publie latest.json
```

## Architecture

```
dofus-companion/
├── app/                  # Tauri 2 + React 19 + TypeScript
│   ├── src/
│   │   ├── i18n/         # Dict FR/EN + hook useI18n (Phase A)
│   │   ├── types/dungeon.ts   # Zod schemas (bilingue bundle, provenance)
│   │   ├── features/
│   │   │   ├── dungeons/      # useDungeons + adapter legacy
│   │   │   └── strategy/      # resolveStrategy + Short/Long views
│   │   └── components/   # TitleBar, DungeonCard, BossPanel, BulletRow, …
│   └── src-tauri/        # Backend Rust (Alt+D, tray, updater, window-state)
├── scraper/
│   ├── src/
│   │   ├── sources/      # dofusdb, fandom (EN), fandom-fr
│   │   ├── llm/          # Anthropic SDK wrapper, translate, summarize
│   │   ├── prompts/      # translate-v1.md, summarize-v1.md (versionnés)
│   │   ├── validate/     # fuzzy anchors + glossary coverage
│   │   ├── i18n/glossary.json   # 149 paires EN→FR canoniques
│   │   └── report/       # MISSING.md, ISSUES.md generators
│   └── output/           # Artefacts après pnpm scrape
└── docs/
    ├── DATA-CONTRIBUTING.md    # Workflow de contribution community
    └── I18N-AND-STRATEGY.md    # Les 3 niveaux de provenance
```

## Licence

MIT
