"use client";

import { MoonIcon, ScrollIcon } from "@/components/icons/InlineIcons";
import { useScreenshotTheme } from "./ThemeToggleContext";

interface ThemeToggleButtonProps {
  labels: {
    dark: string;
    light: string;
    ariaLabel: string;
    /** Contextual prefix like "Aperçu :" that hints this only swaps captures. */
    prefix: string;
  };
}

/**
 * Icon-led segmented control (Moon / Scroll) bound to the screenshot theme
 * context. The "prefix" label makes it clear the toggle only affects the
 * captures on this page, not the site's own color scheme.
 */
export function ThemeToggleButton({ labels }: ThemeToggleButtonProps) {
  const { theme, setTheme } = useScreenshotTheme();
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-muted font-mono text-[11px] tracking-[0.2em] uppercase">
        {labels.prefix}
      </span>
      <div
        role="group"
        aria-label={labels.ariaLabel}
        className="border-border/70 bg-card/60 inline-flex items-center gap-1 rounded-full border p-1 text-xs font-medium backdrop-blur"
      >
        <button
          type="button"
          aria-pressed={theme === "dark"}
          onClick={() => setTheme("dark")}
          className={
            "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 transition-colors " +
            (theme === "dark"
              ? "bg-foreground/90 text-background"
              : "text-muted hover:text-foreground")
          }
        >
          <MoonIcon className="h-3.5 w-3.5" />
          {labels.dark}
        </button>
        <button
          type="button"
          aria-pressed={theme === "light"}
          onClick={() => setTheme("light")}
          className={
            "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 transition-colors " +
            (theme === "light"
              ? "bg-gold text-background"
              : "text-muted hover:text-foreground")
          }
        >
          <ScrollIcon className="h-3.5 w-3.5" />
          {labels.light}
        </button>
      </div>
    </div>
  );
}
