import { cookies } from "next/headers";
import fr from "@/messages/fr.json";
import en from "@/messages/en.json";

export const LOCALES = ["fr", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "fr";
export const LOCALE_COOKIE = "locale";

export type Messages = typeof fr;

const DICT: Record<Locale, Messages> = { fr, en };

function isLocale(value: string | undefined): value is Locale {
  return value === "fr" || value === "en";
}

export async function getLocale(): Promise<Locale> {
  const cookie = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(cookie) ? cookie : DEFAULT_LOCALE;
}

export async function getMessages(): Promise<Messages> {
  const locale = await getLocale();
  return DICT[locale];
}

// Static FR export for module-scoped contexts (static Metadata exports)
// where awaiting cookies() is awkward. All user-visible runtime rendering
// should go through getMessages() for locale awareness.
export const messages = fr;
