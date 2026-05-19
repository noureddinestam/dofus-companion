import Link from "next/link";
import { getMessages } from "@/lib/messages";
import { SramSvg } from "@/components/easter-eggs/SramSvg";

export default async function NotFound() {
  const m = await getMessages();
  const t = m.notFound;
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <SramSvg className="text-gold/80 h-32 w-32" />
      <p className="text-gold font-mono text-sm tracking-[0.2em] uppercase">
        {t.code}
      </p>
      <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        {t.title}
      </h1>
      <p className="text-muted">{t.body}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="border-gold text-gold hover:bg-gold hover:text-background inline-flex h-11 items-center rounded-md border px-5 text-sm font-medium transition-colors"
        >
          → {t.back}
        </Link>
        <Link
          href="/changelog"
          className="border-border text-foreground/90 hover:border-gold/60 hover:text-gold inline-flex h-11 items-center rounded-md border px-5 text-sm font-medium transition-colors"
        >
          ↗ {t.changelog}
        </Link>
        <Link
          href="/faq"
          className="border-border text-foreground/90 hover:border-gold/60 hover:text-gold inline-flex h-11 items-center rounded-md border px-5 text-sm font-medium transition-colors"
        >
          → {t.faq}
        </Link>
      </div>
      <p className="text-muted mt-6 font-mono text-[11px] italic">{t.meta}</p>
    </section>
  );
}
