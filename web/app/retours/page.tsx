import type { Metadata } from "next";
import { getMessages, messages } from "@/lib/messages";
import { FeedbackForm } from "@/components/retours/FeedbackForm";

export const metadata: Metadata = {
  title: messages.feedback.title,
  description: messages.feedback.subtitle,
  alternates: { canonical: "/retours" },
  robots: { index: true, follow: true },
};

export default async function FeedbackPage() {
  const m = await getMessages();
  const t = m.feedback;
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 sm:py-20">
      <header className="mb-10">
        <p className="text-gold mb-3 font-mono text-xs tracking-[0.2em] uppercase">
          {t.eyebrow}
        </p>
        <h1 className="mb-3 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          {t.title}
        </h1>
        <p className="text-muted text-base leading-relaxed">{t.subtitle}</p>
      </header>

      <section className="relative mb-12">
        <FeedbackForm labels={t.form} />
      </section>

      <section className="border-border/70 bg-card/30 rounded-lg border p-6">
        <h2 className="mb-2 text-lg font-semibold">{t.alternative.title}</h2>
        <p className="text-muted text-sm leading-relaxed">
          {t.alternative.body}
        </p>
      </section>
    </div>
  );
}
