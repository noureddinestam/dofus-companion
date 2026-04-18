import type { Metadata } from "next";
import { getMessages, messages } from "@/lib/messages";
import { HeartIcon, StarIcon } from "@/components/icons/InlineIcons";

export const metadata: Metadata = {
  title: messages.supportPage.title,
  description: messages.supportPage.subtitle,
};

export default async function SupportPage() {
  const m = await getMessages();
  const t = m.supportPage;

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
      <header className="mb-12 max-w-2xl">
        <p className="text-gold mb-3 font-mono text-xs tracking-[0.2em] uppercase">
          {t.eyebrow}
        </p>
        <h1 className="mb-3 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          {t.title}
        </h1>
        <p className="text-muted">{t.subtitle}</p>
      </header>

      <section className="mb-14 grid gap-4 md:grid-cols-2">
        {t.tiers.map((tier) => {
          const isPrimary = tier.ctaVariant === "primary";
          const href = isPrimary ? t.sponsorHref : t.starCtaHref;
          const Icon = isPrimary ? HeartIcon : StarIcon;
          return (
            <article
              key={tier.tag}
              className={`flex flex-col gap-4 rounded-xl border p-6 sm:p-8 ${
                isPrimary
                  ? "border-gold/40 bg-gold/[0.04]"
                  : "border-border/70 bg-card/30"
              }`}
            >
              <p className="text-gold font-mono text-[11px] tracking-[0.15em] uppercase">
                {tier.tag}
              </p>
              <h2 className="text-xl font-semibold tracking-tight">
                {tier.title}
              </h2>
              <p className="text-muted flex-1 text-sm leading-relaxed">
                {tier.body}
              </p>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-auto inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition-transform hover:-translate-y-0.5 ${
                  isPrimary
                    ? "bg-gold text-background hover:bg-gold-soft"
                    : "border-border text-foreground/90 hover:border-gold/60 hover:text-gold border"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tier.ctaLabel}
              </a>
            </article>
          );
        })}
      </section>

      <section className="border-border/70 bg-card/30 mb-12 rounded-lg border p-6 sm:p-8">
        <h2 className="mb-3 text-xl font-semibold tracking-tight">
          {t.transparency.title}
        </h2>
        <p className="text-muted mb-4 text-sm leading-relaxed">
          {t.transparency.body}
        </p>
        <p className="text-muted font-mono text-[11px]">
          {t.transparency.microCopy}
        </p>
      </section>

      <section className="mb-12">
        <h2 className="mb-3 text-xl font-semibold tracking-tight">
          {t.noPerks.title}
        </h2>
        <p className="text-muted max-w-2xl text-sm leading-relaxed">
          {t.noPerks.body}
        </p>
      </section>

      <section>
        <h2 className="mb-5 text-xl font-semibold tracking-tight">
          {t.alternatives.title}
        </h2>
        <ul className="space-y-2 text-sm leading-relaxed">
          {t.alternatives.items.map((item, i) => (
            <li key={i} className="text-foreground/90 flex items-start gap-3">
              <span
                aria-hidden
                className="bg-gold mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
              />
              {item}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
