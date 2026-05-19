"use client";

import { useState } from "react";
import { DownloadIcon } from "@/components/icons/InlineIcons";

interface DownloadCtaClientProps {
  href: string;
  normalLabel: string;
  revealLabel: string;
  version: string;
  sizeLabel: string;
}

// EE-02: on the 4th click in the same session, swap the button label once
// for the "Oui, c'est le même fichier." reveal. 5th click returns to normal.
// The download itself never gets blocked — we only mutate the visible text.
export function DownloadCtaClient({
  href,
  normalLabel,
  revealLabel,
  version,
  sizeLabel,
}: DownloadCtaClientProps) {
  const [clicks, setClicks] = useState(0);
  const showReveal = clicks === 3;
  const label = showReveal ? revealLabel : normalLabel;

  return (
    <a
      href={href}
      onClick={() => setClicks((c) => c + 1)}
      className="group bg-gold text-background hover:bg-gold-soft focus-visible:outline-gold inline-flex items-center gap-3 rounded-md px-5 py-3 text-sm font-semibold shadow-[0_8px_32px_-8px_rgba(232,181,71,0.6)] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <DownloadIcon className="h-4 w-4" />
      <span>{label}</span>
      <span className="text-background/75 font-mono text-xs">
        v{version} · {sizeLabel}
      </span>
    </a>
  );
}
