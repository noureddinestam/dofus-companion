# Dofus Companion

Overlay Windows pour Dofus — guides de donjons sans alt-tab.

**Alt+D** pour afficher/masquer. Cherchez un donjon, consultez l'ordre de kill, les mécaniques de boss et les conditions d'instakill, tout en restant en jeu.

## Fonctionnalités

- Recherche fuzzy parmi tous les donjons (endgame 160+ en priorité)
- Ordre de priorité par monstre (critique / danger / prudence / gérable)
- Mécaniques de boss : phases, instakill, stratégie recommandée
- Overlay transparent toujours au premier plan, résizable
- Icône de tray, raccourci global Alt+D (personnalisable à venir)
- Navigation clavier complète (↑↓ Enter Esc Backspace)
- Mise à jour automatique

## Installation

1. Téléchargez `Dofus.Companion_x64-setup.exe` depuis la [dernière release](../../releases/latest)
2. Lancez le setup (acceptez WebView2 si demandé, composant Microsoft standard)
3. L'application démarre dans la barre système — appuyez **Alt+D** pour l'ouvrir

> **Sécurité Windows SmartScreen** : si Windows bloque l'exécution, cliquez "Informations complémentaires" → "Exécuter quand même". L'application n'est pas encore signée avec un certificat EV.

## Raccourcis

| Touche | Action |
|--------|--------|
| Alt+D | Afficher / Masquer l'overlay |
| ↑ ↓ | Naviguer dans les résultats |
| Enter | Ouvrir le donjon |
| Backspace / Esc | Retour / Fermer |
| / | Focus barre de recherche |

## Développement

### Prérequis

- [Rust](https://rustup.rs/) stable
- [Node.js](https://nodejs.org/) 22+
- [pnpm](https://pnpm.io/) 9+
- [WebView2](https://developer.microsoft.com/fr-fr/microsoft-edge/webview2/) (Windows, inclus dans Windows 11)

```bash
git clone https://github.com/YOUR_USERNAME/dofus-companion
cd dofus-companion
pnpm install
pnpm dev          # lance l'overlay en mode dev (hot-reload)
```

### Mise à jour des données de donjons

```bash
pnpm scrape       # fetch DofusDB + scrape dofuspourlesnoobs → app/src/data/
```

### Build Windows

```bash
pnpm build        # produit le MSI et l'installeur NSIS dans app/src-tauri/target/release/bundle/
```

## Release

### 1. Configurer la signature (une seule fois)

```bash
# Générer une paire de clés ed25519
pnpm --filter app tauri signer generate -w ~/.tauri/dofus-companion.key

# La commande affiche la clé publique — copiez-la dans tauri.conf.json :
# "plugins" > "updater" > "pubkey"

# Ajoutez le contenu de ~/.tauri/dofus-companion.key dans les secrets GitHub :
# TAURI_SIGNING_PRIVATE_KEY  (contenu du fichier .key)
# TAURI_SIGNING_PRIVATE_KEY_PASSWORD  (le mot de passe choisi, ou vide)
```

Remplacez également `YOUR_USERNAME` dans `tauri.conf.json` → `plugins.updater.endpoints`.

### 2. Publier une release

```bash
git tag v0.2.0
git push origin v0.2.0
# → GitHub Actions build le MSI + NSIS, crée la release, publie latest.json pour l'auto-updater
```

## Données

Les données de donjons proviennent de trois sources fusionnées par le scraper :

| Source | Contenu |
|--------|---------|
| Données manuelles | Stratégies, priorités, mécaniques (curatées) |
| [DofusDB](https://dofusdb.fr) | Stats techniques : niveaux, PV, résistances |
| [Dofus Pour Les Noobs](https://www.dofuspourlesnoobs.com) | Stratégies boss, phases, instakill |

## Licence

MIT
