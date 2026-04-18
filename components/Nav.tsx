import Link from "next/link";
import { getLocale, getMessages } from "@/lib/messages";
import { GithubIcon } from "@/components/icons/GithubIcon";
import { LangSwitcher } from "@/components/LangSwitcher";
import { LogoMark } from "@/components/brand/LogoMark";

const NAV_LINKS = [
  { href: "/#features", key: "features" },
  { href: "/changelog", key: "changelog" },
  { href: "/faq", key: "faq" },
  { href: "/support", key: "support" },
] as const;

export async function Nav() {
  const [m, locale] = await Promise.all([getMessages(), getLocale()]);
  const t = m.nav;
  return (
    <header className="border-border/60 bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight"
        >
          <LogoMark className="h-7 w-7 shrink-0" />
          <span>Dofus Companion</span>
        </Link>
        <div className="flex items-center gap-4">
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
          <LangSwitcher currentLocale={locale} />
        </div>
      </div>
    </header>
  );
}
