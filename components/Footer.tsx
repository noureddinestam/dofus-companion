import Link from "next/link";
import { AnkamaDisclaimer } from "@/components/AnkamaDisclaimer";
import { env } from "@/lib/env";

const FOOTER_LINKS: ReadonlyArray<{
  title: string;
  links: ReadonlyArray<{ href: string; label: string; external?: boolean }>;
}> = [
  {
    title: "Projet",
    links: [
      { href: "/changelog", label: "Changelog" },
      { href: "/roadmap", label: "Roadmap" },
      { href: "/security", label: "Sécurité" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "Code",
    links: [
      {
        href: "https://github.com/noureddinestam/dofus-companion",
        label: "GitHub",
        external: true,
      },
      {
        href: "https://github.com/noureddinestam/dofus-companion/issues",
        label: "Issues",
        external: true,
      },
      {
        href: "https://github.com/noureddinestam/dofus-companion/releases",
        label: "Releases",
        external: true,
      },
      { href: "/contribute", label: "Contribuer" },
    ],
  },
  {
    title: "Légal",
    links: [
      { href: "/legal/privacy", label: "Confidentialité" },
      { href: "/legal/terms", label: "CGU" },
      { href: "/legal/licenses", label: "Licences OSS" },
    ],
  },
];

export function Footer() {
  const buildHash = env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local";
  const buildDate = new Date().toISOString().slice(0, 10);

  return (
    <footer className="border-border/60 mt-24 border-t">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <span
                aria-hidden
                className="bg-gold/10 text-gold ring-gold/30 grid h-7 w-7 place-items-center rounded-md font-mono text-xs ring-1"
              >
                DC
              </span>
              Dofus Companion
            </div>
            <p className="text-muted text-sm leading-relaxed">
              Overlay Windows open source. Licence MIT.
            </p>
          </div>
          {FOOTER_LINKS.map((col) => (
            <div key={col.title}>
              <h2 className="text-muted mb-3 text-xs font-semibold tracking-[0.15em] uppercase">
                {col.title}
              </h2>
              <ul className="space-y-2 text-sm">
                {col.links.map((link) => (
                  <li key={link.href}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground/80 hover:text-gold transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-foreground/80 hover:text-gold transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <AnkamaDisclaimer className="mt-10" />
        <p className="text-muted mt-6 font-mono text-xs">
          build <span className="text-foreground/80">{buildHash}</span> ·{" "}
          {buildDate}
        </p>
      </div>
    </footer>
  );
}
