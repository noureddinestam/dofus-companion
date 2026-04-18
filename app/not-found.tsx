import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <p className="text-gold font-mono text-sm tracking-[0.2em] uppercase">
        Erreur 404
      </p>
      <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        Cette salle est vide. Aucun boss à l&apos;horizon.
      </h1>
      <p className="text-muted">
        La page que vous cherchez n&apos;existe pas, ou le lien a été déplacé.
      </p>
      <Link
        href="/"
        className="border-gold text-gold hover:bg-gold hover:text-background inline-flex h-11 items-center rounded-md border px-5 text-sm font-medium transition-colors"
      >
        Retour à l&apos;accueil
      </Link>
    </section>
  );
}
