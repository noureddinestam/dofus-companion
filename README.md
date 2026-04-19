# Dofus Companion

Overlay Windows pour Dofus — 185 donjons factuels, **Combat Cards 4 blocs** bilingues FR/EN, lisibles en combat.

**Alt+D** pour afficher/masquer. Cherchez un donjon ou un monstre (**Ctrl+M**), lisez la fiche en < 3 secondes, tout en restant en jeu.

## Fonctionnalités

- **185 donjons** couverts (endgame 160+ prioritaire) avec stats factuelles DofusDB
- **Combat Cards v0.5** — structure fixe 4 blocs sur **141 boss + 129 monstres notables** :
  - 🔓 **DÉLOCK** : étapes actionnables pour gagner
  - ⚠️ **CONTRAINTES** : règles à respecter en permanence
  - ❌ **DANGERS** : punitions concrètes si erreur
  - 💡 **INFOS UTILES** : résistances et astuces secondaires
- **Règle du silence** : un monstre sans mécanique ne montre **aucune** card (pas de bruit visuel)
- **Vue monstre dédiée** (**Ctrl+M**) : liste filtrée + fiche plein écran + sauts vers tous les donjons du monstre
- **Recherche par monstre** : taper « dompteuse » ouvre le donjon avec la fiche surlignée
- **Toggle masquer lambdas** : ne voir que les mobs à mécanique dans un donjon
- **Stratégies bilingues FR/EN** ancrées Fandom ou LLM verbatim (zéro hallucination)
- **Traçabilité totale** : chaque bullet porte une provenance cliquable (native, LLM ancrée, ou community)
- Overlay transparent toujours au premier plan, drag depuis la barre de titre
- Tray icon, raccourci global Alt+D, auto-update via GitHub Releases

## Installation

1. Téléchargez `Dofus Companion_0.5.0_x64-setup.exe` depuis la [dernière release](../../releases/latest)
2. Lancez le setup (acceptez WebView2 si demandé — composant Microsoft standard inclus dans Windows 11)
3. L'application démarre dans la barre système — appuyez **Alt+D** pour l'ouvrir

> **SmartScreen Windows** : si le setup est bloqué, cliquez "Informations complémentaires" → "Exécuter quand même". L'installeur est signé pour l'auto-updater (minisign) mais pas avec un certificat EV Windows.

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
| **V** ou **Tab** | Basculer vue Actionnable ⇄ Détaillée (boss non migrés v0.4) |

## Données

Sources factuelles fusionnées par le scraper (`pnpm scrape`) :

| Source | Contenu | Couverture v0.5 |
|--------|---------|-----------|
| [DofusDB](https://dofusdb.fr) | Stats : niveaux, PV, résistances, monstres | 185 donjons (100 %) |
| [Wiki Fandom EN + FR](https://dofuswiki.fandom.com) | Stratégies boss + pages monstres | 143 boss + 83 monstres |
| LLM `claude-sonnet-4-5` | Extraction Combat Cards 4 blocs ancrées | **141 boss + 129 monstres** |
| Boss-mention fallback | Paragraphes de boss strategies mentionnant un monstre | 58 monstres supplémentaires |
| Contributions communautaires | Via PR (`docs/COMBAT-CARDS-CONTRIBUTING.md`) | Ouvert à tous |

**Anti-hallucination v0.5** : chaque bullet d'une Combat Card est ancrée verbatim dans le texte source Fandom (similarité ≥ 0.75). Les bullets dont l'ancre échoue sont rejetées automatiquement. Aucune bullet ne peut apparaître dans deux blocs. Les monstres sans source exploitable restent `combat: null` (zéro invention, zéro changement visuel).

Pour les donjons ou monstres sans card : voir [`scraper/output/MISSING.md`](scraper/output/MISSING.md) et contribuer via [`docs/COMBAT-CARDS-CONTRIBUTING.md`](docs/COMBAT-CARDS-CONTRIBUTING.md).

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
pnpm test             # Vitest (app + scraper, 128 tests)
pnpm lint
```

### Régénérer les données

```bash
pnpm scrape                              # run complet v0.4 (DofusDB + Fandom + LLM)
pnpm scrape --no-llm                     # skip LLM (pas besoin d'ANTHROPIC_API_KEY)
pnpm scrape --dry-run                    # utilise uniquement le cache disque
pnpm scrape --gen-issues                 # génère scraper/output/ISSUES.md

# v0.5 Combat Cards :
pnpm --filter scraper scrape --only-boss-refactor --dry-run-cost
pnpm --filter scraper scrape --only-boss-refactor
pnpm --filter scraper scrape --only-monsters --dry-run-cost
pnpm --filter scraper scrape --only-monsters

# v0.5.1 Combat Cards Cleanup :
pnpm --filter scraper scrape --audit                       # diagnostic read-only
pnpm --filter scraper scrape --migrate-schema              # fuse constraints into unlock.context (no LLM)
pnpm --filter scraper scrape --regenerate-flagged --dry-run-cost
pnpm --filter scraper scrape --regenerate-flagged          # LLM regen on audit-flagged entities only
pnpm --filter scraper scrape --dedup-blocks                # drop cross-block Dice-duplicate bullets (no LLM)
```

Pour activer les extractions LLM :

```bash
export ANTHROPIC_API_KEY=sk-ant-...
pnpm --filter scraper scrape --only-boss-refactor   # ~€2 sur 143 boss
pnpm --filter scraper scrape --only-monsters        # ~€2 sur 141 monstres éligibles
# → Cache disque activé : tous les reruns sont gratuits.
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
│   │   ├── i18n/              # Dict FR/EN + hook useI18n
│   │   ├── types/
│   │   │   ├── combat-card.ts # v0.5 schema 4 blocs
│   │   │   ├── provenance.ts  # Shared provenance schema
│   │   │   └── dungeon.ts     # Monster/Boss/Dungeon
│   │   ├── features/
│   │   │   ├── combat/        # derivePriority + playground
│   │   │   ├── dungeons/      # resolveBossView + legacy adapter
│   │   │   ├── monsters/      # monsterIndex + MonsterView (Ctrl+M)
│   │   │   ├── search/        # Fuse + jump-to-monster
│   │   │   └── strategy/      # v0.4 legacy views
│   │   └── components/        # TitleBar, DungeonCard, CombatCardView, …
│   └── src-tauri/             # Backend Rust (Alt+D, tray, updater)
├── scraper/
│   ├── src/
│   │   ├── sources/           # dofusdb, fandom, fandom-fr, fandom-monster
│   │   ├── llm/               # Anthropic SDK, translate, summarize, extract-combat-card
│   │   ├── prompts/           # translate-v1.md, summarize-v1.md, extract-combat-card-v1.md
│   │   ├── migrate/           # v04-to-v05-boss, scrape-monster-cards
│   │   ├── validate/          # anchors, glossary, combat-card
│   │   └── report/            # MISSING.md, ISSUES.md
│   └── output/                # Artefacts après pnpm scrape
└── docs/
    ├── DATA-CONTRIBUTING.md          # v0.4 strategies contribution
    ├── COMBAT-CARDS-CONTRIBUTING.md  # v0.5 combat card contribution
    └── I18N-AND-STRATEGY.md          # Provenance levels
```

## Licence

MIT
