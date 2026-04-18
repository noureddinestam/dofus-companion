import Link from "next/link";
import { AnkamaDisclaimer } from "@/components/AnkamaDisclaimer";
import { env } from "@/lib/env";
import { getMessages, messages } from "@/lib/messages";

type LinkKey = keyof typeof messages.footer.links;

const FOOTER_COLS: ReadonlyArray<{
  titleKey: keyof typeof messages.footer.columns;
  links: ReadonlyArray<{ href: string; key: LinkKey; external?: boolean }>;
}> = [
  {
    titleKey: "project",
    links: [
      { href: "/changelog", key: "changelog" },
      { href: "/roadmap", key: "roadmap" },
      { href: "/security", key: "security" },
      { href: "/faq", key: "faq" },
      { href: "/#credits", key: "credits" },
    ],
  },
  {
    titleKey: "code",
    links: [
      {
        href: "https://github.com/noureddinestam/dofus-companion",
        key: "github",
        external: true,
      },
      {
        href: "https://github.com/noureddinestam/dofus-companion/issues",
        key: "issues",
        external: true,
      },
      {
        href: "https://github.com/noureddinestam/dofus-companion/releases",
        key: "releases",
        external: true,
      },
      { href: "/contribute", key: "contribute" },
    ],
  },
  {
    titleKey: "legal",
    links: [
      { href: "/legal/privacy", key: "privacy" },
      { href: "/legal/terms", key: "terms" },
      { href: "/legal/licenses", key: "licenses" },
    ],
  },
];

export async function Footer() {
  const m = await getMessages();
  const t = m.footer;
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
            <p className="text-muted text-sm leading-relaxed">{t.tagline}</p>
          </div>
          {FOOTER_COLS.map((col) => (
            <div key={col.titleKey}>
              <h2 className="text-muted mb-3 text-xs font-semibold tracking-[0.15em] uppercase">
                {t.columns[col.titleKey]}
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
                        {t.links[link.key]}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-foreground/80 hover:text-gold transition-colors"
                      >
                        {t.links[link.key]}
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
