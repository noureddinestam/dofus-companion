# Handoff macOS port — Elhadi

> Document destiné à Elhadi (et son agent Claude Code) qui reprend l'overlay pour le porter sur macOS.
> Auteur : Noureddine, session du 2026-05-19. Mémoire complète de la session dans `/Users/noureddine/.claude/projects/-Users-noureddine-Documents-dofusOverlay/memory/`.

## 1. État du projet

**Repos** :
- `noureddinestam/dofus-companion` (public, MIT) — monorepo qui contient `app/` (Tauri overlay), `scraper/` (scraper Dofus + LLM), `web/` (site Next.js).
- `noureddinestam/dofus-companion-releases` (public) — canal binaires séparé. C'est là que les releases sont publiées, c'est sur ce repo que l'auto-updater Tauri tape.
- `noureddinestam/dofus-companion-web` (archived) — ne pas y toucher, vestige avant fusion.

**Site live** : [dofuscompanion.com](https://dofuscompanion.com) déployé sur Vercel, lié à `dofus-companion` avec `rootDirectory=web`.

**Pages du site importantes pour toi** :
- `/download` : page de téléchargement, ne montre que Windows aujourd'hui. La copy mentionne déjà "macOS détecté : pas encore supporté, une version Mac est prévue" (`web/messages/{fr,en}.json` → `download.os.mac`).
- `/contribute` : page contribution restaurée pour l'engagement étudiant M2.
- `/retours` : formulaire feedback Resend → contact@dofuscompanion.com → forward → nstamboulpro@gmail.com.
- Footer : colonne "Code" avec GitHub / Issues / Releases / Contribuer.
- Credits : ta carte côte à côte avec celle de Noureddine + `eduNote` discrète pour le M2.

## 2. Ce que la session précédente a fait

Lecture de contexte (non bloquant, mais utile à savoir) :
1. **Pivot proprio temporaire** : la copy du site a été refondue pour retirer toutes les mentions "open source / MIT / Contribuer / GitHub" du hero et de la landing. Le repo a été passé en privé, etc.
2. **Revert OSS partiel** : juste après, décision de re-passer en open source pour l'engagement étudiant M2 (coef 1). Le repo est redevenu public, LICENSE MIT, `/contribute` restaurée. **Mais la landing reste sobre** : pas de "open source" partout dans la hero / FAQ / etc., positioning OSS uniquement sur `/contribute` et discreet `eduNote` sous Credits.
3. **Monorepo merged** : avant cette session le site vivait dans un repo séparé `dofus-companion-web`. Il a été subtree-importé sous `dofus-companion/web/` avec historique préservé. Lockfile unique `pnpm-lock.yaml` à la racine.
4. **Formulaire `/retours`** ajouté : Resend + Zod + rate-limit IP + honeypot + template React Email branded (logo gold, badge type, etc.) dans `web/emails/feedback-received.tsx`.
5. **Cross-repo release** : workflow `.github/workflows/release.yml` push les binaires vers `dofus-companion-releases` via un fine-grained PAT en secret `RELEASES_PAT`. L'auto-updater Tauri pointe sur ce repo. `tauri.conf.json` updater endpoint = `https://github.com/noureddinestam/dofus-companion-releases/releases/latest/download/latest.json`.
6. **Email & forwarder** : domaine `dofuscompanion.com` vérifié dans Resend, mailbox Hostinger `contact@dofuscompanion.com` avec forwarder vers Gmail.

**Important — ne pas casser cet existant.** Si tu touches `web/messages/*.json`, garde la structure FR ↔ EN (un test `tests/unit/messages-parity.test.ts` enforce l'égalité de structure).

## 3. Ta mission : le port macOS

L'overlay Tauri est actuellement compilé **uniquement pour Windows** (`bundle.targets: ["msi", "nsis"]`). L'objectif : ajouter le support macOS (Apple Silicon + Intel) pour qu'un joueur Dofus sur Mac puisse installer l'app et déclencher l'overlay au-dessus du jeu.

### Périmètre attendu

- L'overlay s'ouvre/se ferme avec un hotkey global (à arbitrer : `Option+D` pour rester proche du `Alt+D` Windows, ou `Cmd+D`).
- Fenêtre transparente, toujours au premier plan (au-dessus de Dofus, même en mode Fenêtré sans bord).
- Tray icon dans la barre de menu macOS (top-right) pour réafficher l'overlay s'il a été fermé.
- Tout le reste du comportement reste identique : recherche, combat cards, vue monstres (Ctrl+M → `Cmd+M` sur macOS ?), thèmes, langue.
- Bundle `.dmg` ou `.app` signé (Apple Developer cert recommandé pour éviter Gatekeeper).
- Auto-update via le canal `dofus-companion-releases`, comme Windows.

## 4. État technique actuel

### `app/src-tauri/tauri.conf.json`

```json
{
  "app": {
    "macOSPrivateApi": true,           // déjà activé, prérequis pour transparence native macOS
    "windows": [{
      "transparent": true,
      "alwaysOnTop": true,
      "decorations": false,
      ...
    }]
  },
  "bundle": {
    "targets": ["msi", "nsis"],        // ← à étendre : ["msi", "nsis", "dmg", "app"]
    "windows": { ... },                // existing Windows config
    // pas de section "macOS" pour l'instant
  }
}
```

À ajouter sous `bundle` :

```json
"macOS": {
  "minimumSystemVersion": "11.0",
  "category": "public.app-category.utilities",
  "entitlements": "macos-entitlements.plist",
  "signingIdentity": null,             // ou "Developer ID Application: ..." quand tu auras le cert
  "providerShortName": null
}
```

### `app/src-tauri/Cargo.toml`

Tauri 2 a un crate `tauri::NSPanel` (via `tauri-plugin-nspanel`) pour rendre la fenêtre "always-on-top above fullscreen", qui est ce qu'on veut quand Dofus est en plein écran fenêtré. À installer si on veut pousser plus loin que `alwaysOnTop: true`.

### Le code Rust

Tout vit dans `app/src-tauri/src/`. Le hotkey global est probablement dans un fichier `hotkey.rs` ou `lib.rs`. Cherche `Alt+D` ou `AltD` dans le repo. Sur macOS, le crate `tauri-plugin-global-shortcut` accepte les notations cross-platform (`CommandOrControl+D`, `Alt+D` se traduit en `Option+D` sur Mac).

### Le code TS (frontend overlay)

`app/src/components/SettingsPanel.tsx` liste actuellement les shortcuts en hardcoded avec les notations Windows. Si tu actives un Cmd-prefix sur Mac, faut adapter l'affichage selon `navigator.platform`. Cherche `Alt+D` dans `app/src/` pour trouver tous les endroits où ça apparaît.

### CI

`.github/workflows/release.yml` build sur `windows-latest`. Pour ajouter macOS, il faut un job `release-macos: runs-on: macos-latest`. Les artefacts (`.dmg`, `.app`, `.dmg.sig`) iront s'agréger à la même release sur `dofus-companion-releases`. Le `latest.json` du Tauri updater doit ensuite contenir une clé `darwin-aarch64` (Apple Silicon) et/ou `darwin-x86_64` (Intel) en plus de `windows-x86_64`. Voir [Tauri updater docs](https://tauri.app/v2/guides/distribution/updater).

`.github/workflows/ci.yml` (CI app) tourne aussi sur `windows-latest` uniquement (job `build-windows`). Tu peux ajouter `build-macos: runs-on: macos-latest` qui fait juste `pnpm --filter app tauri build` pour valider que ça compile.

## 5. Décisions à arbitrer (avant de coder)

1. **Hotkey macOS** : `Option+D` (continuité Windows, mais Option est moins ergonomique sur Mac) ou `Cmd+D` (idiomatique Mac mais collision potentielle avec navigateurs) ? Sondage utilisateurs ou décision arbitraire — recommandation : `Cmd+Shift+D` (rare collision, ergonomique).
2. **Apple Developer cert** : sans cert, Gatekeeper affichera le même genre de warning que SmartScreen sur Windows. Avec cert ($99/an), expérience d'install propre. Décision = budget. À court terme on peut shipper non-signé avec la même copy "Right-click → Open" qu'on a déjà pour Windows SmartScreen.
3. **NSPanel vs NSWindow** : par défaut Tauri crée un NSWindow. Pour une vraie overlay "au-dessus des apps en plein écran", il faut wrapper en NSPanel via `tauri-plugin-nspanel`. À voir si nécessaire pour Dofus en mode fenêtré-sans-bord (suffit en général).
4. **Dock icon** : par défaut, une app Tauri affiche une icône dans le Dock macOS. Pour un overlay tray-only, on peut masquer le dock icon en mettant `LSUIElement: true` dans `Info.plist`. C'est plus propre pour un companion app.
5. **Architecture cibles** : Apple Silicon (`aarch64`) suffit pour les Mac récents (M1+), ou tu veux aussi Intel (`x86_64`) ? Recommandation : universal binary (Tauri sait faire) pour couvrir les deux.

## 6. Suggestion de plan en 5 phases

### Phase A — Setup local (1-2 jours)
- Clone le repo, `pnpm install`, vérifier que `pnpm --filter app tauri dev` lance bien l'overlay sur ton Mac (dev mode).
- Probable galère : hotkey `Alt+D` ne marche pas natif Mac, fenêtre transparente OK mais pas vraiment "above all", tray icon manquant.
- Pas de PR encore, juste observation et notes.

### Phase B — Hotkey + Tray (cœur fonctionnel)
- Choisir hotkey (`Cmd+Shift+D` recommandé), wire le global shortcut Mac.
- Ajouter tray icon dans la menu bar (au lieu/en plus du Dock).
- Tester le toggle show/hide.

### Phase C — Window behavior
- Vraie transparence + ombre native.
- Always-on-top même si Dofus est en plein écran fenêtré.
- Drag par la barre de titre custom (le code existe déjà côté frontend, à valider que ça marche sur Mac).
- Hide dock icon (`LSUIElement: true`).

### Phase D — Bundle & distribution
- Bundle `.dmg` (cleaner UX que `.app`).
- Décision signing (cert ou non).
- Tester l'install + premier launch sur un Mac vierge.

### Phase E — CI + releases
- Job CI macOS dans `ci.yml`.
- Job release macOS dans `release.yml` qui sort sur le même tag `vX.Y.Z` et upload les artefacts sur `dofus-companion-releases`.
- Mettre à jour `latest.json` côté workflow pour inclure `darwin-*` platforms.
- Update `app/src-tauri/tauri.conf.json` updater endpoints pour `darwin-*` si besoin (en pratique le manifeste suffit).
- Update site `/download` pour ajouter une carte Mac avec lien direct vers le `.dmg`. Strings dans `web/messages/{fr,en}.json` sous `download.os.mac` + `download.cards` (en ajoutant un `dmg` à côté de `nsis` et `msi`).

## 7. Infrastructure que tu hérites (utile à savoir)

- **Resend** : domaine vérifié, mailbox contact@ avec forwarder Gmail. Clé `RESEND_API_KEY` dans Vercel env (sensitive). Pas besoin d'y toucher.
- **Vercel** : projet `prj_e2nYsY2Mhp3SJcqUe4RBmmZaC1Qs` sur team `noureddinestams-projects`. Auto-deploy sur push to `main`. Tu peux faire des feature branches qui se déploieront en preview.
- **GitHub Actions** : `RELEASES_PAT` secret déjà configuré sur le repo source. `TAURI_SIGNING_PRIVATE_KEY` aussi (clé minisign Ed25519 pour le manifeste updater). Tu n'as pas à les recréer.
- **Domain DNS** : géré via Hostinger sur le compte de Noureddine. Pour Resend ou tout autre changement DNS, demande à Noureddine de te filer un token API ou de faire les modifs lui-même.

## 8. Bonnes pratiques projet

- Convention Commits (`feat:`, `fix:`, `chore:`, `docs:`, `ci:`). Pas d'em-dashes dans le copy (`—` → `,` ou `:`).
- TypeScript strict partout. `pnpm typecheck` doit passer.
- Tests : `pnpm test` doit rester vert. Le test de messages-parity est sensible si tu touches l'i18n.
- Bilingue FR/EN partout pour le site (overlay aussi). Si tu ajoutes une chaîne FR, ajoute son équivalent EN dans la foulée.
- Pas de mention "open source" ni "MIT" sur la landing hero/valueProps/etc. — uniquement sur `/contribute` et le footer Code column. C'est volontaire, voir [memory/project_oss_student_revert.md].
- L'overlay doit rester "no memory reading, no input simulation, no bot" — c'est la promesse de sécurité du projet, à respecter pour ne pas attirer la foudre d'Ankama.

## 9. Issues ouvertes utiles

6 good first issues ont été créées pour étoffer le portfolio. Aucune ne concerne macOS directement, donc elles ne te bloquent pas. Tu peux les voir : `gh issue list --label "good first issue"`.

## 10. Comment démarrer

```bash
cd /Users/noureddine/Documents/dofusOverlay  # si tu reprends sur la machine de Noureddine, sinon clone ailleurs
git pull origin main
pnpm install
pnpm --filter app tauri dev   # devrait lancer l'overlay en mode dev sur ton Mac
```

Puis dans ton Claude Code, demande-lui de lire ce fichier (`HANDOFF_MACOS_ELHADI.md`) en premier, puis d'explorer `app/src-tauri/`, `app/src/`, et de proposer un plan d'attaque pour la phase B (hotkey + tray).

## 11. Si tu cherches Noureddine

- Page Retours sur le site (vraiment, ça arrive direct dans son Gmail)
- Ou GitHub directement sur le repo

Bon courage. Le projet est en bon état pour accueillir le port Mac, et tu n'as pas besoin de re-comprendre toute l'infra (Resend, Vercel, releases) pour bosser sur la partie native macOS.

---

*Co-rédigé avec Claude Opus 4.7 le 2026-05-19.*
