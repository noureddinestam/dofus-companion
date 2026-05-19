"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { CloseIcon, MenuIcon } from "@/components/icons/InlineIcons";
import { LogoMark } from "@/components/brand/LogoMark";

interface NavLink {
  href: string;
  label: string;
}

interface MobileNavProps {
  openLabel: string;
  closeLabel: string;
  links: readonly NavLink[];
  langSwitcher: ReactNode;
}

export function MobileNav({
  openLabel,
  closeLabel,
  links,
  langSwitcher,
}: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          aria-label={openLabel}
          className="text-foreground/90 hover:text-gold inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors sm:hidden"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-background/95 fixed inset-0 z-50 backdrop-blur-sm" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-50 flex flex-col gap-8 overflow-y-auto p-6 pb-10"
        >
          <div className="flex items-center justify-between">
            <Link
              href="/"
              onClick={close}
              className="flex items-center gap-2 text-sm font-semibold tracking-tight"
            >
              <LogoMark className="h-9 w-9 shrink-0" />
              <Dialog.Title asChild>
                <span>Dofus Companion</span>
              </Dialog.Title>
            </Link>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label={closeLabel}
                className="text-foreground/90 hover:text-gold inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>
          <nav className="flex flex-1 flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={close}
                className="text-foreground hover:text-gold block rounded-md px-3 py-3 text-2xl font-semibold tracking-tight transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="border-border/60 border-t pt-6">{langSwitcher}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
