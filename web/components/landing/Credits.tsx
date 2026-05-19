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
          {t.items.map((item) => (
            <li
              key={item.name}
              className="border-gold/30 bg-gold/[0.03] flex flex-col gap-3 rounded-xl border p-8 transition-colors"
            >
              <p className="text-muted font-mono text-[11px] tracking-[0.15em] uppercase">
                {item.role}
              </p>
              <h3 className="text-gold text-2xl font-semibold tracking-tight">
                {item.name}
              </h3>
              <p className="text-muted text-sm leading-relaxed">{item.body}</p>
            </li>
          ))}
        </ul>
        <p className="text-muted mt-10 text-center font-mono text-[11px] tracking-[0.12em] uppercase">
          {t.eduNote}
        </p>
      </div>
    </section>
  );
}
