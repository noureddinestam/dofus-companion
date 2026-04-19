import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getMessages, messages } from "@/lib/messages";
import { env } from "@/lib/env";
import { FeatureBlock } from "@/components/decouvre/FeatureBlock";
import { ThemeToggleButton } from "@/components/decouvre/ThemeToggleButton";
import { ThemeToggleProvider } from "@/components/decouvre/ThemeToggleContext";
import { GithubIcon } from "@/components/icons/GithubIcon";
import { ArrowRightIcon } from "@/components/icons/InlineIcons";
import { DownloadCta } from "@/components/landing/DownloadCta";

export const metadata: Metadata = {
  title: messages.decouvre.meta.title,
  description: messages.decouvre.meta.description,
  alternates: { canonical: "/decouvre" },
  openGraph: {
    title: messages.decouvre.meta.title,
    description: messages.decouvre.meta.description,
    url: `${env.NEXT_PUBLIC_SITE_URL}/decouvre`,
    type: "article",
  },
};

export default async function DecouvrePage() {
  const [m, locale] = await Promise.all([getMessages(), getLocale()]);
  const t = m.decouvre;
  const f = t.features;
  const siteUrl = env.NEXT_PUBLIC_SITE_URL;
  /** Captures are bound to the UI language — the overlay screenshot itself
   *  shows FR or EN strings. Keep the path consistent everywhere. */
  const img = (slug: string, theme: "dark" | "light") =>
    `/screenshots/${slug}-${theme}-${locale}.png`;
  const pair = (slug: string) => ({
    darkSrc: img(slug, "dark"),
    lightSrc: img(slug, "light"),
  });

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: t.hero.eyebrow,
        item: `${siteUrl}/decouvre`,
      },
    ],
  };

  return (
    <ThemeToggleProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <header className="border-border/50 relative overflow-hidden border-b">
        <div
          aria-hidden
          className="bg-[radial-gradient(60%_80%_at_50%_50%,theme(colors.gold/14%),transparent_70%)] pointer-events-none absolute -top-24 right-0 bottom-0 left-0 -z-10"
        />
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 pt-8 pb-14 md:pt-12 md:pb-20">
          <Link
            href="/"
            className="text-muted hover:text-foreground text-xs font-medium tracking-wide transition-colors"
          >
            {t.hero.backToHome}
          </Link>
          <span className="border-border text-muted inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium tracking-[0.15em] uppercase">
            <span className="bg-gold h-1.5 w-1.5 rounded-full" />
            {t.hero.eyebrow}
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-[3.5rem] lg:leading-[1.05]">
            {t.hero.title}
          </h1>
          <p className="text-muted max-w-2xl leading-relaxed text-balance sm:text-lg">
            {t.hero.subtitle}
          </p>
          <ThemeToggleButton
            labels={{
              dark: t.toggle.dark,
              light: t.toggle.light,
              ariaLabel: t.toggle.ariaLabel,
              prefix: t.toggle.prefix,
            }}
          />
        </div>
      </header>

      <nav
        aria-label={t.nav.label}
        className="border-border/40 bg-background/85 sticky top-0 z-10 border-b backdrop-blur supports-[backdrop-filter]:bg-background/70"
      >
        <div className="mx-auto flex max-w-6xl gap-1.5 overflow-x-auto px-6 py-2.5 text-xs font-medium">
          {[
            ["#search", t.nav.search],
            ["#combat-cards", t.nav.combatCards],
            ["#monsters", t.nav.monsters],
            ["#settings", t.nav.settings],
            ["#density", t.nav.density],
            ["#shortcuts", t.nav.shortcuts],
            ["#security", t.nav.security],
          ].map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="border-border/60 text-muted hover:border-gold/70 hover:text-gold rounded-full border px-3 py-1.5 whitespace-nowrap transition-colors"
            >
              {label}
            </a>
          ))}
        </div>
      </nav>

      <main className="divide-border/30 divide-y">
        <FeatureBlock
          id="search"
          eyebrow={f.search.eyebrow}
          title={f.search.title}
          body={f.search.body}
          bullets={f.search.bullets}
          paired={{ ...pair("search"), alt: f.search.alt }}
        />

        <FeatureBlock
          id="combat-cards"
          reverse
          eyebrow={f.combatCards.eyebrow}
          title={f.combatCards.title}
          body={f.combatCards.body}
          bullets={f.combatCards.bullets}
          paired={{ ...pair("combat-card"), alt: f.combatCards.alt }}
        />

        <FeatureBlock
          id="monsters"
          eyebrow={f.monsters.eyebrow}
          title={f.monsters.title}
          body={f.monsters.body}
          bullets={f.monsters.bullets}
          paired={{ ...pair("monster-view"), alt: f.monsters.alt }}
        />

        <FeatureBlock
          id="settings"
          reverse
          eyebrow={f.settings.eyebrow}
          title={f.settings.title}
          body={f.settings.body}
          bullets={f.settings.bullets}
          paired={{ ...pair("settings-panel"), alt: f.settings.alt }}
        />

        <FeatureBlock
          id="density"
          eyebrow={f.density.eyebrow}
          title={f.density.title}
          body={f.density.body}
          paired={{ ...pair("density-compact"), alt: f.density.alt }}
        />

        <FeatureBlock
          id="shortcuts"
          reverse
          eyebrow={f.shortcuts.eyebrow}
          title={f.shortcuts.title}
          body={f.shortcuts.body}
          paired={{ ...pair("shortcuts"), alt: f.shortcuts.alt }}
        />

        <section
          id="security"
          className="scroll-mt-24 py-10 md:py-16"
        >
          <div className="mx-auto flex max-w-3xl flex-col items-start gap-4 px-6">
            <p className="text-gold font-mono text-[11px] tracking-[0.22em] uppercase">
              {f.security.eyebrow}
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              {f.security.title}
            </h2>
            <p className="text-muted max-w-xl leading-relaxed text-balance">
              {f.security.body}
            </p>
            <ul className="mt-2 flex flex-col gap-2">
              {f.security.bullets.map((b, i) => (
                <li
                  key={i}
                  className="text-foreground/90 flex items-start gap-3 text-sm leading-relaxed"
                >
                  <span
                    aria-hidden
                    className="bg-gold/70 mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                  />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
              <Link
                href="https://github.com/noureddinestam/dofus-companion"
                className="group border-border text-foreground/90 hover:border-gold/60 hover:text-gold inline-flex items-center gap-2 rounded-md border px-4 py-2 font-medium transition-colors"
              >
                <GithubIcon className="h-4 w-4" />
                {f.security.githubLink}
              </Link>
              <Link
                href="/faq"
                className="text-muted hover:text-foreground group inline-flex items-center gap-1"
              >
                {f.security.faqLink}
                <ArrowRightIcon className="h-3.5 w-3.5 translate-x-0 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <section className="border-border/50 border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-5 px-6 py-16 md:py-20">
          <span className="text-gold font-mono text-[11px] tracking-[0.22em] uppercase">
            {t.cta.eyebrow}
          </span>
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {t.cta.title}
          </h2>
          <p className="text-muted max-w-xl leading-relaxed text-balance">
            {t.cta.body}
          </p>
          <DownloadCta />
        </div>
      </section>
    </ThemeToggleProvider>
  );
}
