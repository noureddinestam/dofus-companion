import { useAppStore } from '../store/appStore';
import { UI_STRINGS, type Lang, type UiStrings } from './strings';

export interface I18n {
  lang: Lang;
  t: UiStrings;
  setLang: (l: Lang) => void;
  toggleLang: () => void;
}

export function useI18n(): I18n {
  const lang = useAppStore((s) => s.lang);
  const setLang = useAppStore((s) => s.setLang);
  return {
    lang,
    t: UI_STRINGS[lang],
    setLang,
    toggleLang: () => setLang(lang === 'fr' ? 'en' : 'fr'),
  };
}
