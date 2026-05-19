"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { LOCALE_COOKIE, LOCALES, type Locale } from "@/lib/messages";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export async function setLocale(next: Locale): Promise<void> {
  if (!LOCALES.includes(next)) return;
  const jar = await cookies();
  jar.set(LOCALE_COOKIE, next, {
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
    sameSite: "lax",
    httpOnly: false,
  });
  revalidatePath("/", "layout");
}
