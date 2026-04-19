"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type ScreenshotTheme = "dark" | "light";

interface ThemeToggleValue {
  theme: ScreenshotTheme;
  setTheme: (t: ScreenshotTheme) => void;
  toggle: () => void;
}

const ThemeToggleContext = createContext<ThemeToggleValue | null>(null);

/**
 * Scoped to /decouvre only — decoupled from the site's own theme so the
 * companion captures can be compared without forcing a site-wide flip.
 */
export function ThemeToggleProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ScreenshotTheme>("dark");
  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  return (
    <ThemeToggleContext.Provider value={{ theme, setTheme, toggle }}>
      {children}
    </ThemeToggleContext.Provider>
  );
}

export function useScreenshotTheme(): ThemeToggleValue {
  const ctx = useContext(ThemeToggleContext);
  if (!ctx) {
    throw new Error("useScreenshotTheme must be used inside ThemeToggleProvider");
  }
  return ctx;
}
