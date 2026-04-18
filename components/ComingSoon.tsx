import Link from "next/link";
import { messages } from "@/lib/messages";
import { ArrowRightIcon } from "@/components/icons/InlineIcons";

type PageKey = keyof typeof messages.comingSoon.pages;

interface ComingSoonProps {
  pageKey: PageKey;
}

export function ComingSoon({ pageKey }: ComingSoonProps) {
  const t = messages.comingSoon;
  const page = t.pages[pageKey];
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-start justify-center gap-5 px-6 py-24">
      <p className="text-gold font-mono text-xs tracking-[0.2em] uppercase">
        {t.eyebrow}
      </p>
      <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
        {page.title}
      </h1>
      <p className="text-muted max-w-xl">{page.subtitle}</p>
      <p className="text-muted max-w-xl text-sm leading-relaxed">{t.body}</p>
      <Link
        href="/"
        className="group text-gold hover:text-gold-soft inline-flex items-center gap-2 text-sm font-medium"
      >
        {t.back}
        <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </section>
  );
}
