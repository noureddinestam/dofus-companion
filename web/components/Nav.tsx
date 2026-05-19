import Link from "next/link";
import { getLocale, getMessages } from "@/lib/messages";
import { LangSwitcher } from "@/components/LangSwitcher";
import { LogoMark } from "@/components/brand/LogoMark";
import { MobileNav } from "@/components/MobileNav";

const NAV_LINKS = [
  { href: "/decouvre", key: "companion" },
  { href: "/#features", key: "features" },
  { href: "/changelog", key: "changelog" },
  { href: "/faq", key: "faq" },
  { href: "/support", key: "support" },
] as const;

export async function Nav() {
  const [m, locale] = await Promise.all([getMessages(), getLocale()]);
  const t = m.nav;
  const mobileLinks = NAV_LINKS.map((link) => ({
    href: link.href,
    label: t[link.key],
  }));
  return (
    <header className="border-border/60 bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight"
        >
          <LogoMark className="h-9 w-9 shrink-0 sm:h-7 sm:w-7" />
          <span>Dofus Companion</span>
        </Link>
        <div className="flex items-center gap-3 sm:gap-4">
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
          </nav>
          <LangSwitcher currentLocale={locale} />
          <MobileNav
            openLabel={t.openMenu}
            closeLabel={t.closeMenu}
            links={mobileLinks}
            langSwitcher={<LangSwitcher currentLocale={locale} />}
          />
        </div>
      </div>
    </header>
  );
}
