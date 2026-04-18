import { getMessages } from "@/lib/messages";

export async function Credits() {
  const m = await getMessages();
  const t = m.credits;
  return (
    <section className="border-border/60 border-b py-20" id="credits">
      <div className="mx-auto max-w-4xl px-6">
        <header className="mb-12 text-center">
          <p className="text-gold mb-3 font-mono text-xs tracking-[0.2em] uppercase">
            {t.eyebrow}
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {t.title}
          </h2>
        </header>
        <ul className="grid gap-4 sm:grid-cols-2">
          {t.items.map((item, i) => (
            <li
              key={item.name}
              className={`flex flex-col gap-3 rounded-xl border p-8 transition-colors ${
                i === 0
                  ? "border-gold/40 bg-gold/[0.04]"
                  : "border-border/70 bg-card/30"
              }`}
            >
              <p className="text-muted font-mono text-[11px] tracking-[0.15em] uppercase">
                {item.role}
              </p>
              <h3
                className={`text-2xl font-semibold tracking-tight ${
                  i === 0 ? "text-gold" : "text-foreground"
                }`}
              >
                {item.name}
              </h3>
              <p className="text-muted text-sm leading-relaxed">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
