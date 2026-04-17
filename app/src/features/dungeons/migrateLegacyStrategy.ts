import type { Dungeon, StrategyBundle } from '../../types/dungeon';

/**
 * Migre les données v0.3 vers le format bilingue v0.4.
 *
 * v0.3 : Boss.strategy = { text, source: 'fandom-en', sourceUrl } | null
 * v0.4 : Boss.strategies = StrategyBundle | null (fr/en × long/short)
 *
 * Si un Boss a déjà `strategies` populated (data v0.4 native), on ne touche pas.
 * Si un Boss a seulement le legacy `strategy`, on l'hydrate en `strategies.long.en`
 * avec provenance native pointant vers Fandom EN.
 *
 * Le champ legacy `strategy` est conservé — l'UI migrera progressivement.
 */
export function migrateLegacyStrategy(d: Dungeon): Dungeon {
  if (d.boss.strategies) return d;
  if (!d.boss.strategy) return d;

  const legacy = d.boss.strategy;
  const bundle: StrategyBundle = {
    long: {
      fr: null,
      en: {
        text: legacy.text,
        provenance: {
          kind: 'native',
          lang: 'en',
          source: 'fandom-en',
          sourceUrl: legacy.sourceUrl,
        },
      },
    },
    short: { fr: null, en: null },
  };

  return {
    ...d,
    boss: {
      ...d.boss,
      strategies: bundle,
    },
  };
}
