import type {
  Lang,
  StrategyBundle,
  StrategyLong,
  StrategyShort,
} from '../../types/dungeon';

export type StrategyView = 'short' | 'long';

export interface ResolvedStrategy<T extends StrategyLong | StrategyShort> {
  content: T;
  requestedLang: Lang;
  effectiveLang: Lang;
  /** true quand la langue utilisée n'est pas celle demandée (fallback) */
  fellBack: boolean;
}

/**
 * Résout quelle langue afficher pour un couple (bundle, view, lang demandée).
 *
 * Règle : langue demandée d'abord, puis fallback sur l'autre langue disponible,
 * puis null. L'UI peut afficher un bandeau "traduction à venir" si `fellBack`.
 *
 * Pure, testable, sans dépendance React.
 */
export function resolveStrategy(
  bundle: StrategyBundle | null,
  lang: Lang,
  view: 'long',
): ResolvedStrategy<StrategyLong> | null;
export function resolveStrategy(
  bundle: StrategyBundle | null,
  lang: Lang,
  view: 'short',
): ResolvedStrategy<StrategyShort> | null;
export function resolveStrategy(
  bundle: StrategyBundle | null,
  lang: Lang,
  view: StrategyView,
): ResolvedStrategy<StrategyLong> | ResolvedStrategy<StrategyShort> | null {
  if (!bundle) return null;
  const pool = view === 'short' ? bundle.short : bundle.long;

  if (pool[lang]) {
    return {
      content: pool[lang] as StrategyLong & StrategyShort,
      requestedLang: lang,
      effectiveLang: lang,
      fellBack: false,
    };
  }

  const other: Lang = lang === 'fr' ? 'en' : 'fr';
  if (pool[other]) {
    return {
      content: pool[other] as StrategyLong & StrategyShort,
      requestedLang: lang,
      effectiveLang: other,
      fellBack: true,
    };
  }

  return null;
}
