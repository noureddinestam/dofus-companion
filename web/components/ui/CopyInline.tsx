"use client";

import { useState } from "react";

interface CopyInlineProps {
  value: string;
  label: string;
  copyLabel?: string;
  copiedLabel?: string;
}

export function CopyInline({
  value,
  label,
  copyLabel = "Copier",
  copiedLabel = "Copié",
}: CopyInlineProps) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard denied.
    }
  };
  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={`${copyLabel} ${label}`}
      className="border-border/70 bg-card/40 text-muted hover:border-gold/60 hover:text-gold inline-flex max-w-full items-center gap-2 rounded-md border px-2.5 py-1 font-mono text-[11px] transition-colors"
    >
      <span className="truncate">{value}</span>
      <span className="text-gold shrink-0">
        {copied ? copiedLabel : copyLabel}
      </span>
    </button>
  );
}
