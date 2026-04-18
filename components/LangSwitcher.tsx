"use client";

import { useTransition } from "react";
import { setLocale } from "@/app/actions";
import type { Locale } from "@/lib/messages";

interface LangSwitcherProps {
  currentLocale: Locale;
}

export function LangSwitcher({ currentLocale }: LangSwitcherProps) {
  const [isPending, startTransition] = useTransition();
  const next: Locale = currentLocale === "fr" ? "en" : "fr";

  return (
    <button
      type="button"
      onClick={() => startTransition(() => setLocale(next))}
      disabled={isPending}
      aria-label={`Switch to ${next.toUpperCase()}`}
      className="border-border/70 text-muted hover:border-gold/60 hover:text-gold inline-flex h-7 items-center gap-1 rounded-md border px-2 font-mono text-[11px] tracking-[0.15em] uppercase transition-colors disabled:opacity-50"
    >
      <span className="text-gold">{currentLocale.toUpperCase()}</span>
      <span aria-hidden>/</span>
      <span>{next.toUpperCase()}</span>
    </button>
  );
}
