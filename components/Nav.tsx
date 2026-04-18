import Link from "next/link";
import { messages } from "@/lib/messages";
import { GithubIcon } from "@/components/icons/GithubIcon";

const NAV_LINKS = [
  { href: "/#features", key: "features" },
  { href: "/changelog", key: "changelog" },
  { href: "/faq", key: "faq" },
  { href: "/support", key: "support" },
] as const;

export function Nav() {
  const t = messages.nav;
  return (
    <header className="border-border/60 bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight"
        >
          <span
            aria-hidden
            className="bg-gold/10 text-gold ring-gold/30 grid h-7 w-7 place-items-center rounded-md font-mono text-xs ring-1"
          >
            DC
          </span>
          <span>Dofus Companion</span>
        </Link>
        <nav className="text-muted hidden items-center gap-6 text-sm sm:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-foreground transition-colors"
            >
              {t[link.key]}
            </Link>
          ))}
          <a
            href="https://github.com/noureddinestam/dofus-companion"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground inline-flex items-center gap-1.5 transition-colors"
          >
            <GithubIcon className="h-4 w-4" />
            {t.github}
          </a>
        </nav>
      </div>
    </header>
  );
}
