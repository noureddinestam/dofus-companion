import type { Metadata } from "next";
import { getMessages, messages } from "@/lib/messages";

export const metadata: Metadata = {
  title: messages.faq.title,
  description: messages.faq.subtitle,
};

export default async function FaqPage() {
  const m = await getMessages();
  const t = m.faq;
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
      <header className="mb-12 max-w-2xl">
        <p className="text-gold mb-3 font-mono text-xs tracking-[0.2em] uppercase">
          {t.eyebrow}
        </p>
        <h1 className="mb-3 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          {t.title}
        </h1>
        <p className="text-muted">{t.subtitle}</p>
      </header>

      <div className="space-y-12">
        {t.categories.map((cat) => (
          <section key={cat.title}>
            <h2 className="text-muted mb-4 text-xs font-semibold tracking-[0.15em] uppercase">
              {cat.title}
            </h2>
            <ul className="divide-border/60 border-border/70 bg-card/30 divide-y rounded-lg border">
              {cat.items.map((item) => (
                <li key={item.q}>
                  <details className="group">
                    <summary className="text-foreground/90 hover:text-foreground flex cursor-pointer list-none items-start justify-between gap-4 px-5 py-4 text-sm font-medium">
                      <span>{item.q}</span>
                      <span
                        aria-hidden
                        className="text-gold mt-1 shrink-0 font-mono transition-transform group-open:rotate-45"
                      >
                        +
                      </span>
                    </summary>
                    <div className="text-muted px-5 pb-5 text-sm leading-relaxed whitespace-pre-wrap">
                      {item.a}
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
