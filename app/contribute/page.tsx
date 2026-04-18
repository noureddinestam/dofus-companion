import type { Metadata } from "next";
import { getMessages, messages } from "@/lib/messages";
import { ArrowRightIcon } from "@/components/icons/InlineIcons";

export const metadata: Metadata = {
  title: messages.contribute.title,
  description: messages.contribute.subtitle,
};

export default async function ContributePage() {
  const m = await getMessages();
  const t = m.contribute;
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

      <ul className="grid gap-4 sm:grid-cols-2">
        {t.paths.map((path) => (
          <li
            key={path.title}
            className="border-border/70 bg-card/30 hover:border-gold/40 flex flex-col gap-3 rounded-lg border p-6 transition-colors"
          >
            <h2 className="text-lg font-semibold">{path.title}</h2>
            <p className="text-muted flex-1 text-sm leading-relaxed">
              {path.body}
            </p>
            <a
              href={path.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group text-gold hover:text-gold-soft inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
            >
              {path.cta}
              <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
