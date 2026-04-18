import Link from "next/link";
import { getMessages } from "@/lib/messages";

export async function SmartScreenNotice() {
  const m = await getMessages();
  const t = m.smartScreen;
  const quip = m.download.smartScreenQuip;
  return (
    <section className="border-border/70 bg-card/30 rounded-lg border p-6 sm:p-8">
      <p className="text-gold mb-2 font-mono text-[11px] tracking-[0.15em] uppercase">
        {t.eyebrow}
      </p>
      <h2 className="mb-3 text-xl font-semibold tracking-tight">{t.title}</h2>
      <p className="text-muted mb-5 max-w-2xl text-sm leading-relaxed">
        {t.body}
      </p>
      <ol className="mb-5 space-y-2 text-sm">
        {t.steps.map((step, i) => (
          <li key={i} className="flex items-start gap-3">
            <span
              aria-hidden
              className="border-gold/40 bg-gold/10 text-gold mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border font-mono text-xs"
            >
              {i + 1}
            </span>
            <span className="text-foreground/90">{step}</span>
          </li>
        ))}
      </ol>
      <p className="text-muted mb-4 max-w-2xl text-xs leading-relaxed italic">
        {quip}
      </p>
      <p className="text-muted mb-4 font-mono text-[11px]">{t.microCopy}</p>
      <Link
        href="/security"
        className="text-gold hover:text-gold-soft text-sm font-medium transition-colors"
      >
        {t.moreLink} →
      </Link>
    </section>
  );
}
