"use client";

import Link from "next/link";
import { useRef, useState } from "react";

interface DungeonCountHoverProps {
  count: string;
  hoverHint: string;
  ctaLabel: string;
  href?: string;
}

// EE-03: after an 800 ms sustained hover on the dungeon count in the hero
// subtitle, swap the number for a PR call-to-action. No motion, just a
// content swap, so there is nothing to guard behind prefers-reduced-motion.
export function DungeonCountHover({
  count,
  hoverHint,
  ctaLabel,
  href = "/contribute",
}: DungeonCountHoverProps) {
  const [revealed, setRevealed] = useState(false);
  const timerRef = useRef<number | null>(null);

  const start = () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setRevealed(true), 800);
  };
  const stop = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setRevealed(false);
  };

  if (revealed) {
    return (
      <Link
        href={href}
        onMouseLeave={stop}
        onFocus={start}
        onBlur={stop}
        className="text-gold underline-offset-2 hover:underline focus-visible:underline"
        aria-label={`${count} — ${hoverHint} · ${ctaLabel}`}
      >
        {count} · {hoverHint} →
      </Link>
    );
  }

  return (
    <span
      onMouseEnter={start}
      onMouseLeave={stop}
      onFocus={start}
      onBlur={stop}
      tabIndex={0}
      role="button"
      aria-label={count}
      className="text-foreground cursor-help font-semibold"
    >
      {count}
    </span>
  );
}
