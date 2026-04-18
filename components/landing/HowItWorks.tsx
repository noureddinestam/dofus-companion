import { messages } from "@/lib/messages";

export function HowItWorks() {
  const t = messages.howItWorks;
  return (
    <section className="border-border/60 border-b py-20">
      <div className="mx-auto max-w-6xl px-6">
        <header className="mb-12 text-center">
          <p className="text-gold mb-3 font-mono text-xs tracking-[0.2em] uppercase">
            {t.eyebrow}
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {t.title}
          </h2>
        </header>
        <ol className="grid gap-4 md:grid-cols-3">
          {t.steps.map((step) => (
            <li
              key={step.n}
              className="border-border/70 bg-card/30 relative rounded-lg border p-6"
            >
              <span
                aria-hidden
                className="text-gold/70 mb-4 inline-block font-mono text-3xl font-semibold"
              >
                {step.n}
              </span>
              <h3 className="mb-1.5 text-base font-semibold">{step.title}</h3>
              <p className="text-muted text-sm leading-relaxed">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
