import type { Lang } from './strings';

/**
 * Détecte la langue système via navigator.language.
 * FR pour toute variante de français, EN sinon.
 * Fallback 'fr' si navigator n'est pas disponible (SSR, tests).
 */
export function detectSystemLang(): Lang {
  if (typeof navigator === 'undefined') return 'fr';
  const raw = navigator.language || navigator.languages?.[0] || 'fr';
  return raw.toLowerCase().startsWith('fr') ? 'fr' : 'en';
}
