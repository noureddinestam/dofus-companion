import Link from "next/link";
import { getMessages } from "@/lib/messages";

export default async function NotFound() {
  const m = await getMessages();
  const t = m.notFound;
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <p className="text-gold font-mono text-sm tracking-[0.2em] uppercase">
        {t.code}
      </p>
      <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        {t.title}
      </h1>
      <p className="text-muted">{t.body}</p>
      <Link
        href="/"
        className="border-gold text-gold hover:bg-gold hover:text-background inline-flex h-11 items-center rounded-md border px-5 text-sm font-medium transition-colors"
      >
        {t.back}
      </Link>
    </section>
  );
}
