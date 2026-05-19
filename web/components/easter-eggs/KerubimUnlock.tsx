"use client";

import { useEffect, useState } from "react";
import { KerubimSvg } from "./KerubimSvg";

interface KerubimUnlockProps {
  alt: string;
  firstUnlock: string;
  reUnlock: string;
}

const KONAMI_SEQUENCE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
] as const;
const UNLOCK_COOKIE = "dc-kerubim-unlocked";
const VISIBLE_MS = 4000;
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function readUnlockFlag(): boolean {
  return document.cookie
    .split("; ")
    .some((c) => c.startsWith(`${UNLOCK_COOKIE}=1`));
}

function markUnlocked() {
  document.cookie = `${UNLOCK_COOKIE}=1; max-age=${COOKIE_MAX_AGE}; path=/; SameSite=Lax`;
}

// EE-01: global Konami listener. Cheap (one keydown subscription, one state
// bit) and gated on an opt-in sequence, so it never fires by accident.
export function KerubimUnlock({
  alt,
  firstUnlock,
  reUnlock,
}: KerubimUnlockProps) {
  const [visible, setVisible] = useState(false);
  const [isReturning, setIsReturning] = useState(false);

  useEffect(() => {
    let pos = 0;
    let hideTimer: number | undefined;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && visible) {
        setVisible(false);
        if (hideTimer !== undefined) window.clearTimeout(hideTimer);
        return;
      }
      const expected = KONAMI_SEQUENCE[pos];
      if (
        expected !== undefined &&
        event.key.toLowerCase() === expected.toLowerCase()
      ) {
        pos += 1;
        if (pos === KONAMI_SEQUENCE.length) {
          setIsReturning(readUnlockFlag());
          markUnlocked();
          setVisible(true);
          if (hideTimer !== undefined) window.clearTimeout(hideTimer);
          hideTimer = window.setTimeout(() => setVisible(false), VISIBLE_MS);
          pos = 0;
        }
      } else {
        pos = 0;
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (hideTimer !== undefined) window.clearTimeout(hideTimer);
    };
  }, [visible]);

  if (!visible) return null;
  const quote = isReturning ? reUnlock : firstUnlock;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed right-6 bottom-6 z-50 flex max-w-xs items-end gap-3"
    >
      <KerubimSvg aria-label={alt} className="text-gold h-16 w-16 shrink-0" />
      <div className="border-gold/40 bg-card/95 text-foreground rounded-lg border px-4 py-3 font-mono text-[12px] leading-relaxed shadow-[0_12px_40px_-12px_rgba(232,181,71,0.4)] backdrop-blur">
        {quote}
      </div>
    </div>
  );
}
