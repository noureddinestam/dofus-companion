# Changelog

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
