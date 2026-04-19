# Changelog

## v0.5.5 — Polish & Theme (2026-04-19)

Visual polish pass: the white rectangle behind the overlay is finally
gone, the density toggle actually does something, a Dofus-flavoured
light theme ships, plus a handful of small UX wins.

### Added

- **Light theme** — parchment/cream palette with deeper gold accent,
  evoking a Dofus tome. Paired with a warmer dark palette (baseline
  browns + gold trim instead of the previous cool grey). Theme switches
  live between System / Light / Dark, and System mode follows
  `prefers-color-scheme` so the overlay tracks the OS.
- **Reposition arrow** in the top bar (right of the gear icon) — one
  click snaps the window back to the top-right corner. Reuses the
  existing tray "Repositionner" action; tooltip explains the behaviour.
- **Full keyboard-shortcut list** in the settings panel. Nine entries
  (Alt+D, Ctrl+M, Ctrl+L, ↑↓, Enter, /, V, Backspace, Esc) with
  translated descriptions replace the single static Alt+D row.

### Fixed

- **White rectangle behind the overlay** — `windows[].transparent: true`
  only makes the native window transparent; the underlying WKWebView /
  WebView2 kept a default opaque paint surface that became visible the
  moment overlay opacity dropped below 1.0. Forced to RGBA(0,0,0,0) at
  setup via `set_background_color`, with `macOSPrivateApi: true` to
  unlock the macOS path. Closes the known issue filed in v0.5.4.
- **Density toggle was a no-op** on the boss card and most of the app.
  35 inline padding literals across 11 files were migrated to
  role-based `--density-pad-*` tokens; the compact variant shrinks the
  whole overlay by ~35–50% so the setting has a visible, coherent
  effect everywhere.

### Removed

- Footer hint for `Ctrl+L`. Language is configured from the settings
  panel now; the shortcut itself still works.

### Behavior

No schema change, no new permissions, no migration. Your v0.5.4
preferences are preserved on auto-update.

### Tests

153 (up from 147). New coverage around `useThemeSync` including the
system-preference listener, explicit light/dark selection, and the
matchMedia-unavailable fallback.

## v0.5.4 — Critical Hotfix (2026-04-19)

Three bugs shipped in v0.5.3 are fixed here, plus a handful of visual
polish items uncovered during verification. Auto-update recommended.

### Fixed

- **Window drag** — clicking the top bar (or any `data-tauri-drag-region`)
  now moves the window. Tauri 2's granular permission model didn't include
  `core:window:allow-start-dragging` in `core:default`, so every drag region
  was silently ignored. Permission added explicitly.
- **Settings live apply** — toggling language, opacity, density, content
  blocks or monster-display flags in the settings panel now propagates
  instantly across the overlay. Each `useSettings()` caller was creating
  its own React `useState`; state is now centralized in a Zustand store
  (`settingsStore.ts`) and `useSettings` is a thin adapter above it. Added
  a multi-consumer integration test that would have caught the bug.
- **Dungeon / boss / monster name localization** — switching to English
  via Ctrl+L or the settings panel now translates the dungeon list titles,
  the open dungeon header, boss names, monster names, and the family
  label (e.g. "Cuirassés" → "Plated"). New pure helper `localizedName`
  falls back to the FR canonical name when `nameEn` / `familyEn` is null,
  undefined, empty or whitespace.

### Polish

- Monster compact combat-card fonts bumped for readability (title
  9px→10px, bullet 11px→12px, line-height 1.35→1.4).
- DungeonCard header subtitle (`Lv.XXX–XXX · N monsters + boss`) and
  monsters section title (`MONSTERS (N) — by level descending`) lifted
  from muted / secondary to primary text colour so they stay legible at
  low overlay opacity.
- Rounded `html` / `body` to the same radius as the app root to mask a
  webview corner artifact visible when opacity is turned down.
- Default overlay opacity lowered from 95% to 90% for fresh installs.
  Existing users keep their persisted value.
- v0.4 legacy strategy notes (untranslated in the data) now display an
  "FR only" badge in EN mode — placeholder until the LLM translation pass.

### Known issue

- On some setups a solid rectangle is still painted behind the rounded
  frame when overlay opacity is reduced. Root cause is the underlying
  WebView2 / WKWebView paint surface, not CSS. Investigation deferred to
  v0.5.5 so this hotfix can ship the four blocking items first.

### Behavior

No schema change, no LLM spend, no migration needed. Your v0.5.3
preferences (language, opacity, density, toggles) are preserved on
auto-update.

### Tests

131 → 147 (all green). New unit + integration coverage around
`localizedName`, the zustand settings store, and cross-consumer
reactivity.

## v0.5.3 — Settings Menu (2026-04-19)

L'icône **engrenage** remplace le toggle FR/EN dans le top bar et ouvre
un panneau **Paramètres** glissant (60 % de largeur). Toutes les options
s'appliquent **immédiatement sans relancer l'app**.

### Sections du panneau

- **Apparence** : langue (FR/EN), opacité (50–100 %), densité
  (confortable / compact), thème (préparé pour v0.6 — `system` par défaut).
- **Contenu** : toggles par bloc des combat cards — Délock (+ sous-sections
  Contexte / Actions), Dangers, Infos utiles. Règle parent-gagnant : couper
  un bloc coupe ses sous-sections en cascade.
- **Monstres** : afficher les monstres lambdas (sans mécanique), afficher
  le badge de provenance.
- **Raccourcis** : rappel clavier non-éditable (Alt+D, Ctrl+M, Ctrl+L, V).
- **Notifications** : opt-out du toast Windows de démarrage.
- **À propos** : version courante, lien changelog, lien site, crédits.

### Persistance

- Nouveau schéma `settings.json` **v3** (Zod) avec migration **v2 → v3**
  idempotente. Les v0.5.2 users gardent leur `hasCompletedFirstRun` ; tout
  le reste est initialisé par `.default()` de Zod.
- La langue, auparavant portée uniquement par le store Zustand, est
  désormais miroitée dans `settings.appearance.lang` (source de vérité).
  Ctrl+L écrit à travers `updateAppearance({ lang })` — panneau, raccourci
  et logique interne restent alignés.
- Le toggle « Masquer lambdas » du header DungeonCard écrit dans
  `monstersDisplay.showLambdaMonsters` (inversé) : un seul fichier pour
  toutes les vues.

### Sous le capot

- `useSettings()` : hook async qui retourne `null` puis `Settings`,
  exposant `update` + `updateAppearance` / `updateContentDisplay` /
  `updateMonstersDisplay` / `updateNotifications`.
- `useOverlayPresentation(settings)` : applique `--overlay-opacity` et la
  classe `density-compact` sur `<html>`.
- `useLangSync(settings)` : miroir mono-directionnel settings → store
  Zustand i18n. Pas de boucle infinie : le panneau écrit dans settings,
  le hook lit settings et pousse dans le store si différent.
- `SettingsPanel` : pure React avec focus trap maison (Tab/Shift+Tab
  wrap), fermeture sur Escape / clic backdrop / croix. ~40 clés i18n
  (FR/EN) pour chaque label, description et aria.
- Suppression de `LangToggle.tsx` (remplacé par l'engrenage).

### Tests

- 35 nouveaux tests (schema v3 + migrate, store, useSettings,
  useOverlayPresentation, useLangSync, SettingsPanel, TitleBar gear,
  CombatCardView respect des toggles). **131/131 verts** au total.

### Budget LLM

- €0 (aucun appel LLM dans cette release — UI + hooks uniquement).

---

## v0.5.2 — First-Run Fix (2026-04-19)

Patch d'urgence onboarding — **pas de feature**. Corrige le bug où l'overlay
ne s'affichait pas au premier lancement sur une fresh install Windows.

### Ce qui est corrigé

L'overlay apparaît désormais **automatiquement centré** au tout premier
lancement, avec un mini-écran de bienvenue : explication d'Alt+D, du
champ de recherche, et de la promesse « tout est local, aucun tracker ».
Un clic sur le CTA dismiss l'écran et pose un flag persistent
(`hasCompletedFirstRun`) — l'utilisateur n'y est plus jamais confronté.

Secondaire : **notification system Windows** envoyée au boot (3 s après
lancement) si l'overlay n'est pas déjà visible. Titre « Dofus Companion »,
body « Ouvert en arrière-plan · Alt+D pour afficher ». Optionnelle
silencieusement si le plugin de notification n'est pas disponible ou si
l'utilisateur refuse la permission — l'app ne crashe jamais dessus.

### Migration v0.5.1 → v0.5.2 transparente

Les utilisateurs v0.5.1 existants qui auto-update ne voient **pas** le
welcome : la présence du store Zustand-persist v0.5.1 dans le localStorage
du webview (présent dès le premier hydrate chez un vrai utilisateur) sert
de signal « déjà onboardé », et pré-pose `hasCompletedFirstRun: true` à
la première lecture du nouveau `settings.json`. Fresh installs gardent
le flag à `false` et voient le welcome.

### Sous le capot

- Nouveaux plugins Tauri : `tauri-plugin-store` (persistance settings via
  `%APPDATA%/com.dofus-companion.app/settings.json`) et
  `tauri-plugin-notification` (toast Windows).
- Nouveau module `features/settings/` avec schéma Zod versionné (v2),
  migration idempotente, wrapper plugin-store + fallback localStorage
  pour le dev preview web.
- Hooks `useFirstRun` (tri-state `null` → `true/false` pour éviter tout
  flash) et `useStartupNotification` (fail-safe sur plugin indisponible).
- Rust : `setup()` lit `hasCompletedFirstRun` depuis le store ; si
  absent/false, `window.show()` + centrage + focus.

### Tests

- 22 nouveaux tests (settings store / migrate, `useFirstRun`,
  `WelcomeOverlay`). 96/96 verts au total.

### Budget LLM

- €0 (aucun appel LLM dans cette release).

---

## v0.5.1 — Combat Cards Cleanup (2026-04-19)

Patch de qualité sur v0.5.0 — **pas de nouvelle feature**. Refonte structurelle
des fiches de combat : **4 blocs → 3 blocs**. Le bloc `CONTRAINTES` fusionne
dans `DÉLOCK` via une nouvelle distinction par `kind` :
**`context`** (règles permanentes, en tête) puis **`action`** (étapes ordonnées).

### Structure v0.5.1

```
🔓 DÉLOCK
   Contexte : règles permanentes (non ordonnées)
   Actions  : étapes numérotées 1, 2, 3…
❌ DANGERS
   Punitions concrètes
💡 INFOS UTILES
   Résistances et optimisations
```

Scan plus rapide : le joueur lit DÉLOCK de haut en bas sans cross-référencer un
bloc CONTRAINTES séparé.

### Ce qui est corrigé

1. **Classification DÉLOCK ⇄ CONTRAINTES floue** → bloc unique avec sous-sections
   Context + Actions clairement séparées.
2. **Ordre d'exécution illogique** → contraintes d'ordre Zod : toute `context`
   précède toute `action` dans `unlock[]` (rejet au parse si violé).
3. **Contamination cross-entity** (bullets de mobs sur la card du boss) → gate
   `scraper/src/validate/cross-entity.ts` bloquant, obligatoire sur toute
   régénération future. Rapport final : **0 % de contamination** sur le
   dataset livré.

### Migration flow

Cinq passes déterministes puis LLM, chacune idempotente :

1. **Audit read-only** (`pnpm scrape --audit`) chiffre l'ampleur des 3 bugs sur
   le dataset v0.5.0. Ambigüité 8.2 % initialement.
2. **Migration schéma** (`pnpm scrape --migrate-schema`) fusionne 415 bullets
   `constraints` en `unlock.context`, plus heuristique de permanence
   (« pendant N tours », « toujours », « every turn ») qui reclasse 59 bullets
   supplémentaires en `context`.
3. **Régénération LLM ciblée** (`pnpm scrape --regenerate-flagged`) sur les
   100 entités flagguées, avec prompt `extract-combat-card-v2` + gate
   cross-entity obligatoire. 83 cards remplacées, 632 bullets acceptés,
   21 rejetés, **0 contaminés**.
4. **Dédoublonnage cross-block** (`pnpm scrape --dedup-blocks`) Dice ≥ 0.80
   retire 36 bullets dupliqués entre blocs (ex. le glyphe du Comte Harebourg
   répété dans `unlock` et `dangers` sur 15 mobs).

### Métriques finales

| | v0.5.0 | v0.5.1 |
|---|---|---|
| Ambigüité DÉLOCK ⇄ CONTRAINTES | 8.2 % (27 entités) | **5.8 %** (19 entités) |
| Contamination cross-entity | 0 % (bien) | **0 %** (verrouillé via gate) |
| Règle du silence | OK | OK |
| Schéma strict sur ordre unlock | non | **oui** (Zod superRefine) |

### UI

- `CombatCardView` rend maintenant `unlock` avec sous-sections **Contexte**
  (bulleted) + **Actions** (numérotées 1, 2, 3…). Les sous-titres
  n'apparaissent que si les deux kinds coexistent.
- i18n : nouvelles clés `t.combat.unlockContext` et `t.combat.unlockActions`
  FR + EN.
- Le bloc `CONTRAINTES` disparaît du rendu. `constraints` reste toléré en Zod
  (`optional`) pendant une release pour la migration ; suppression prévue
  en v0.6.

### Migration automatique

- **Côté app** (`app/src/features/combat/migrate.ts`) : au chargement de
  `dungeons.json`, tout card v0.5.0 passé en auto-update est transformé à la
  volée — les utilisateurs n'ont rien à faire.
- **Côté scraper** : migration déterministe one-shot + heuristique de
  permanence, sauvegarde `dungeons.pre-v051-schema.json` créée.

### Scraper

- Nouveau prompt versionné `extract-combat-card-v2` avec scope d'entité
  strict, phrasing positif obligatoire pour les actions, et output 3 blocs.
- Nouveau validateur `validate/combat-card-v2.ts` : rejette actions avec
  négation, enforce l'ordre context-avant-action, bannit constraints.
- Nouveau module `audit/` (ambiguity detector, cross-entity detector,
  ordering judge) + CLI `pnpm scrape --audit`.
- Nouveaux flags CLI : `--audit`, `--audit --bug <kind>`, `--audit --boss <id>`,
  `--migrate-schema`, `--regenerate-flagged`, `--dedup-blocks`.

### Tests

- **128 tests verts** (74 app + 54 scraper) dont 8 nouveaux sur
  `migrateCardV05ToV051`, 8 sur `detectAmbiguityFlags`, 6 sur
  `detectCrossEntityFlagsForDungeon`.

### Coût LLM

- **€1.22** pour la régénération Phase 4 sur Sonnet 4.5. Reruns à 0 € via
  cache disque.

### Breaking changes côté schéma

- Aucun pour l'utilisateur final (auto-update transparent).
- `Bullet.kind` devient requis (`'context' | 'action'`, défaut `'action'`).
- `CombatCard.constraints` devient `optional` (préparation v0.6 suppression).
- `CombatCard.unlock` enforce l'invariant « context avant action ».

---

## v0.5.0 — Combat Cards (2026-04-19)

Refonte structurelle de toutes les fiches de combat selon un format **4 blocs fixe** : 🔓 DÉLOCK → ⚠️ CONTRAINTES → ❌ DANGERS → 💡 INFOS UTILES. Un joueur scanne, il ne lit plus.

### Dataset

- **141 boss sur 143 éligibles** migrés vers Combat Cards 4 blocs (98.6 % de succès).
- **129 monstres uniques** notables (187 entries) ont une Combat Card populated, répartis sur **13 des 14 archétypes mécaniques** (summoner, reviver, counter-damage, execute, zone-control, ap-mp-stripper, …).
- **Règle du silence** : 621 monstres lambda restent `combat: null` — **aucun changement visuel** vs v0.4 pour eux.
- **Ventilation bullets** : 🔓 556 · ⚠️ 341 · ❌ 608 · 💡 659 (2164 bullets au total, boss + monstres).
- **Qualité** : 19 bullets rejetées sur 2183 générées par le LLM (0.87 % de rejet, tous anchor < 0.75).

### UI

- Nouveau composant `CombatCardView` — **seul composant** qui rend des bullets de combat dans toute l'app, variante compacte pour l'affichage sous un `MonsterRow`.
- Bascule automatique : boss avec `combat` populated → `CombatCardView`, sinon fallback `BossPanel`/`StrategyShortView` v0.4.
- Footer `<details>` collapsé « Notes legacy v0.4 » sous chaque card migrée, pour consultation hors-combat.
- Indicator ⚡ sur chaque `MonsterRow` qui a une card.
- Toggle « Masquer lambdas » dans le header `DungeonCard`, persisté.
- **Ctrl+M** : nouvelle vue monstre dédiée plein écran, avec recherche, fiche détaillée, et liste des donjons où le monstre apparaît (cliquable pour jump-to-monster avec pulse 2s).
- Recherche Fuse étendue : taper un nom de monstre ouvre le bon donjon avec le monstre surligné.

### Scraper

- Nouveau prompt versionné `extract-combat-card-v1` avec grille de classification et règles anti-invention.
- Nouveau validateur `validate/combat-card.ts` : anchors fuzzy ≥ 0.75, enums stricts, longueur 3–160, dédoublonnage, severity cohérente.
- Nouveau source `sources/fandom-monster.ts` : scraping pages monstres FR+EN avec multiples patterns de section.
- Nouvelle heuristique de fallback boss-mention : un monstre mentionné dans une boss strategy est extrait depuis ces paragraphes si Fandom n'a pas de Strategy section dédiée.
- Flags CLI : `--only-boss-refactor`, `--only-monsters`, `--dry-run-cost`.
- Coût total de la première migration production : **~\$4 ≈ €3.8** sur Sonnet 4.5. Reruns gratuits via cache disque.

### Breaking changes

- Aucun pour l'utilisateur final : auto-update v0.4.x → v0.5.0 parse le nouveau dataset sans crash.
- Schéma : `MonsterSchema.combat` et `BossSchema.combat` ajoutés (nullable, default null) ; `BossSchema.legacyStrategies` optionnel.
- Le champ `strategies` v0.4 est conservé. `legacyStrategies` sera retiré en v0.6.

### Raccourcis clavier ajoutés

- **Ctrl+M** : bascule vue monstre dédiée depuis n'importe quel écran.

### Tests

- 105 tests verts (66 app + 39 scraper) dont 9 nouveaux sur `validateCombatCardResponse`, 8 sur `buildMonsterIndex`, 4 sur `resolveBossView`.
- Nouveau test d'invariant : chaque boss avec `combat` populated doit aussi avoir `legacyStrategies`.
- Nouveau test d'archetypal coverage : ≥ 10 des 14 types mécaniques présents dans les cards monstres.
- Règle du silence vérifiée : tous les monstres lambda restent `combat: null` après migration.

### Docs

- Nouveau : [`docs/COMBAT-CARDS-CONTRIBUTING.md`](docs/COMBAT-CARDS-CONTRIBUTING.md) — comment contribuer une card via PR.
- README refondu avec section Combat Cards.

---

## v0.4.2 (2026-04-18)

- chore(release): bump version
- feat(titlebar): replace DC text with inline SVG logo
- chore(brand): new icon pack

## v0.4.1 (2026-04-17)

- Release bump.

## v0.4.0

- Stratégies bilingues FR/EN long/short avec provenance (native / llm-grounded / community).
- LLM translate EN → FR et summarize via Sonnet 4.5.
- Glossaire EN → FR, validation d'ancre fuzzy.
- Contributions communautaires via PR (`docs/DATA-CONTRIBUTING.md`).
