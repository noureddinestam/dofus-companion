"use client";

import { useState } from "react";

interface CodeBlockProps {
  code: string;
  label?: string;
  copyLabel?: string;
  copiedLabel?: string;
}

export function CodeBlock({
  code,
  label,
  copyLabel = "Copier",
  copiedLabel = "Copié",
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard denied — user can still select manually.
    }
  };
  return (
    <div className="border-border/70 bg-card/60 overflow-hidden rounded-lg border">
      {label && (
        <div className="border-border/60 text-muted border-b px-4 py-2 font-mono text-[11px] tracking-[0.15em] uppercase">
          {label}
        </div>
      )}
      <div className="relative">
        <pre className="text-foreground/90 overflow-x-auto px-4 py-3 font-mono text-[13px] leading-relaxed">
          <code>{code}</code>
        </pre>
        <button
          type="button"
          onClick={onCopy}
          className="border-border/70 bg-background/80 text-muted hover:border-gold/60 hover:text-gold absolute top-2 right-2 rounded-md border px-2.5 py-1 font-mono text-[11px] transition-colors"
          aria-live="polite"
        >
          {copied ? copiedLabel : copyLabel}
        </button>
      </div>
    </div>
  );
}
