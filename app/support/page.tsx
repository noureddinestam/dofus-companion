import type { Metadata } from "next";
import { getMessages, messages } from "@/lib/messages";
import { HeartIcon, StarIcon } from "@/components/icons/InlineIcons";

export const metadata: Metadata = {
  title: messages.supportPage.title,
};

export default async function SupportPage() {
  const m = await getMessages();
  const t = m.supportPage;
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 sm:py-20">
      <p className="text-gold mb-3 font-mono text-xs tracking-[0.2em] uppercase">
        {t.eyebrow}
      </p>
      <h1 className="mb-4 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
        {t.title}
      </h1>
      <p className="text-muted mb-8 max-w-xl">{t.body}</p>
      <div className="mb-10 flex flex-wrap items-center gap-3">
        <a
          href={t.sponsorHref}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gold text-background hover:bg-gold-soft inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition-transform hover:-translate-y-0.5"
        >
          <HeartIcon className="h-4 w-4" />
          {t.ctaSponsor}
        </a>
        <a
          href={t.starCtaHref}
          target="_blank"
          rel="noopener noreferrer"
          className="border-border text-foreground/90 hover:border-gold/60 hover:text-gold inline-flex items-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium transition-colors"
        >
          <StarIcon className="h-4 w-4" />
          {t.ctaStar}
        </a>
      </div>
      <p className="text-muted font-mono text-xs">{t.thanks}</p>
    </div>
  );
}
