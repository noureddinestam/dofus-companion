export default function HomePage() {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <span className="border-border text-muted inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium tracking-[0.15em] uppercase">
        <span className="bg-gold h-1.5 w-1.5 rounded-full" />
        Overlay Windows · Open source · MIT
      </span>
      <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
        L&apos;overlay Dofus qui tient dans{" "}
        <span className="text-gold">Alt+D</span>.
      </h1>
      <p className="text-muted max-w-xl text-base leading-relaxed text-balance sm:text-lg">
        185 donjons, stratégies bilingues FR/EN, version actionnable lisible en
        10&nbsp;secondes. Site en construction — la landing complète arrive.
      </p>
      <p className="text-muted font-mono text-xs">
        Phase 1 · Bootstrap · {new Date().getFullYear()}
      </p>
    </section>
  );
}
