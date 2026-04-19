"use client";

import { useScreenshotTheme } from "./ThemeToggleContext";

interface ThemedScreenshotProps {
  darkSrc: string;
  lightSrc: string;
  alt: string;
  /** Intrinsic width/height in logical pixels. Captures are 520×720 @2x. */
  width?: number;
  height?: number;
}

/**
 * Stacks a dark and a light capture of the same UI state, cross-fading
 * between them based on the ThemeToggleContext. Absolute-positioned
 * children need an explicit outer width so the flex-item parent doesn't
 * collapse to 2px — we use `w-full` on the inner wrapper and delegate
 * sizing to the outer column.
 */
export function ThemedScreenshot({
  darkSrc,
  lightSrc,
  alt,
  width = 520,
  height = 720,
}: ThemedScreenshotProps) {
  const { theme } = useScreenshotTheme();
  const transition = "opacity 280ms ease";
  return (
    <div className="w-full" style={{ maxWidth: width }}>
      <div
        className="border-border/60 bg-card/40 relative w-full overflow-hidden rounded-xl border shadow-[0_20px_60px_-20px_rgba(0,0,0,0.55)]"
        style={{ aspectRatio: `${width} / ${height}` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={darkSrc}
          alt={alt}
          width={width}
          height={height}
          loading="eager"
          decoding="async"
          style={{ opacity: theme === "dark" ? 1 : 0, transition }}
          className="absolute inset-0 h-full w-full object-contain"
          aria-hidden={theme !== "dark"}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={lightSrc}
          alt={alt}
          width={width}
          height={height}
          loading="eager"
          decoding="async"
          style={{ opacity: theme === "light" ? 1 : 0, transition }}
          className="absolute inset-0 h-full w-full object-contain"
          aria-hidden={theme !== "light"}
        />
      </div>
    </div>
  );
}
