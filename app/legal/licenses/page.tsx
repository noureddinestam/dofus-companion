import type { Metadata } from "next";
import { messages } from "@/lib/messages";
import { ArrowRightIcon } from "@/components/icons/InlineIcons";

const t = messages.legal.licenses;

export const metadata: Metadata = {
  title: t.title,
};

export default function LicensesPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 sm:py-20">
      <header className="mb-10">
        <p className="text-gold mb-3 font-mono text-xs tracking-[0.2em] uppercase">
          {t.eyebrow}
        </p>
        <h1 className="mb-3 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          {t.title}
        </h1>
        <p className="text-muted">{t.body}</p>
      </header>
      <ul className="divide-border/60 border-border/70 bg-card/30 divide-y rounded-lg border">
        {t.items.map((item) => (
          <li key={item.name}>
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group hover:bg-card/60 flex items-center justify-between gap-4 px-5 py-3 transition-colors"
            >
              <span className="text-foreground/90 font-medium">
                {item.name}
              </span>
              <span className="flex items-center gap-2">
                <span className="text-muted font-mono text-[11px] tracking-[0.15em] uppercase">
                  {item.license}
                </span>
                <ArrowRightIcon className="text-muted group-hover:text-gold h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </a>
          </li>
        ))}
      </ul>
      <p className="text-muted mt-6 font-mono text-xs">{t.footer}</p>
    </div>
  );
}
