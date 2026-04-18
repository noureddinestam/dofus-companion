import { messages } from "@/lib/messages";

export function FeaturesSection() {
  const t = messages.features;
  return (
    <section id="features" className="border-border/60 border-b py-20">
      <div className="mx-auto max-w-6xl px-6">
        <header className="mb-14 max-w-2xl">
          <p className="text-gold mb-3 font-mono text-xs tracking-[0.2em] uppercase">
            {t.sectionEyebrow}
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {t.sectionTitle}
          </h2>
        </header>
        <ul className="grid gap-4 md:grid-cols-2">
          {t.items.map((item, i) => (
            <li
              key={item.title}
              className="group border-border/70 bg-card/30 hover:border-gold/40 relative overflow-hidden rounded-lg border p-7 transition-colors"
            >
              <span
                aria-hidden
                className="text-muted absolute top-5 right-5 font-mono text-[11px]"
              >
                0{i + 1}
              </span>
              <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
              <p className="text-muted max-w-md text-sm leading-relaxed">
                {item.body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
