import { messages } from "@/lib/messages";
import { HeartIcon, StarIcon } from "@/components/icons/InlineIcons";

export function SupportBlock() {
  const t = messages.support;
  return (
    <section className="py-20">
      <div className="mx-auto max-w-4xl px-6">
        <div className="border-border/70 bg-card/40 rounded-xl border p-8 sm:p-12">
          <p className="text-gold mb-3 font-mono text-xs tracking-[0.2em] uppercase">
            {t.eyebrow}
          </p>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            {t.title}
          </h2>
          <p className="text-muted mb-8 max-w-2xl text-sm leading-relaxed sm:text-base">
            {t.body}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://github.com/sponsors/noureddinestam"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gold text-background hover:bg-gold-soft inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition-transform hover:-translate-y-0.5"
            >
              <HeartIcon className="h-4 w-4" />
              {t.ctaSponsor}
            </a>
            <a
              href="https://github.com/noureddinestam/dofus-companion"
              target="_blank"
              rel="noopener noreferrer"
              className="border-border text-foreground/90 hover:border-gold/60 hover:text-gold inline-flex items-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium transition-colors"
            >
              <StarIcon className="h-4 w-4" />
              {t.ctaStar}
            </a>
          </div>
          <p className="text-muted mt-6 font-mono text-[11px]">{t.microCopy}</p>
        </div>
      </div>
    </section>
  );
}
