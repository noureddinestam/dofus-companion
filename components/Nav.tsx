import Link from "next/link";
import { GithubIcon } from "@/components/icons/GithubIcon";

const NAV_LINKS = [
  { href: "/#features", label: "Fonctionnalités" },
  { href: "/changelog", label: "Changelog" },
  { href: "/faq", label: "FAQ" },
  { href: "/support", label: "Soutenir" },
] as const;

export function Nav() {
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
              {link.label}
            </Link>
          ))}
          <a
            href="https://github.com/noureddinestam/dofus-companion"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground inline-flex items-center gap-1.5 transition-colors"
          >
            <GithubIcon className="h-4 w-4" />
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}
