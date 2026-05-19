import type { Metadata } from "next";
import Link from "next/link";
import { getMessages, messages } from "@/lib/messages";
import { VirusTotalBadge } from "@/components/download/VirusTotalBadge";

export const metadata: Metadata = {
  title: messages.security.title,
  description: messages.security.subtitle,
};

export default async function SecurityPage() {
  const m = await getMessages();
  const t = m.security;
  const s = t.sections;
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

      <section className="mb-12">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight">
          {s.behavior.title}
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/[0.04] p-6">
            <h3 className="mb-3 text-sm font-semibold text-emerald-300">
              {s.behavior.positive.heading}
            </h3>
            <ul className="text-foreground/90 space-y-2 text-sm leading-relaxed">
              {s.behavior.positive.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span
                    aria-hidden
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/[0.04] p-6">
            <h3 className="mb-3 text-sm font-semibold text-rose-300">
              {s.behavior.negative.heading}
            </h3>
            <ul className="text-foreground/90 space-y-2 text-sm leading-relaxed">
              {s.behavior.negative.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span
                    aria-hidden
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-3 text-2xl font-semibold tracking-tight">
          {s.fingerprints.title}
        </h2>
        <p className="text-muted text-sm leading-relaxed">
          {s.fingerprints.body}
        </p>
      </section>

      <section className="mb-12">
        <h2 className="mb-3 text-2xl font-semibold tracking-tight">
          {s.virusTotal.title}
        </h2>
        <p className="text-muted mb-4 text-sm leading-relaxed">
          {s.virusTotal.body}
        </p>
        <VirusTotalBadge />
      </section>

      <section className="mb-12">
        <h2 className="mb-3 text-2xl font-semibold tracking-tight">
          {s.smartScreen.title}
        </h2>
        <p className="text-muted text-sm leading-relaxed">
          {s.smartScreen.body}
        </p>
      </section>

      <section className="mb-12">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight">
          {s.guarantees.title}
        </h2>
        <ul className="grid gap-4 md:grid-cols-3">
          {s.guarantees.items.map((item) => (
            <li
              key={item.label}
              className="border-border/70 bg-card/30 rounded-lg border p-6"
            >
              <p className="text-gold mb-2 font-mono text-[11px] tracking-[0.15em] uppercase">
                {item.label}
              </p>
              <p className="text-foreground/90 text-sm leading-relaxed">
                {item.body}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-2xl font-semibold tracking-tight">
          {s.report.title}
        </h2>
        <p className="text-muted mb-4 text-sm leading-relaxed">
          {s.report.body}
        </p>
        <Link
          href={s.report.href}
          className="bg-gold text-background hover:bg-gold-soft inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition-transform hover:-translate-y-0.5"
        >
          {s.report.cta}
        </Link>
      </section>
    </div>
  );
}
