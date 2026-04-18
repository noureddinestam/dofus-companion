import Link from "next/link";
import { getMessages } from "@/lib/messages";
import { ArrowRightIcon } from "@/components/icons/InlineIcons";

export async function RoadmapTeaser() {
  const m = await getMessages();
  const t = m.roadmap;
  return (
    <section className="border-border/60 border-b py-20">
      <div className="mx-auto max-w-6xl px-6">
        <header className="mb-12 flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <p className="text-gold mb-3 font-mono text-xs tracking-[0.2em] uppercase">
              {t.eyebrow}
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              {t.title}
            </h2>
            <p className="text-muted mt-3 text-sm leading-relaxed">
              {t.subtitle}
            </p>
          </div>
          <Link
            href="/roadmap"
            className="group text-gold hover:text-gold-soft inline-flex items-center gap-1.5 text-sm font-medium"
          >
            {t.cta}
            <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </header>
        <ul className="grid gap-4 md:grid-cols-3">
          {t.columns.map((col) => (
            <li
              key={col.label}
              className="border-border/70 bg-card/30 rounded-lg border p-6"
            >
              <p className="text-muted mb-2 font-mono text-[11px] tracking-[0.15em] uppercase">
                {col.label}
              </p>
              <p className="text-gold mb-3 font-mono text-xl font-semibold">
                {col.version}
              </p>
              <p className="text-muted text-sm leading-relaxed">{col.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
