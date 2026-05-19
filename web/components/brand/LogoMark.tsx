import type { SVGProps } from "react";

// Gold egg silhouette with an inset "Alt+D" keyboard-key band. Kept in
// sync with public/brand/favicon.svg for the shape, but with the explicit
// text rendered inside the band so the nav logo reads as a shortcut at
// 36x36 without the user having to guess what the black rectangle means.
// Hardcoded brand colors mirror the site tokens (--gold, --background).
export function LogoMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      focusable="false"
      {...props}
    >
      <path
        d="M 16 3.5 C 22.5 3.5 26 8.5 26 14.5 C 26 21.5 22 28.5 16 28.5 C 10 28.5 6 21.5 6 14.5 C 6 8.5 9.5 3.5 16 3.5 Z"
        fill="#E8B547"
      />
      <rect x="7.5" y="13" width="17" height="10" rx="2" fill="#0C0E12" />
      <text
        x="16"
        y="20.5"
        textAnchor="middle"
        fontFamily="'Inter', 'ui-sans-serif', system-ui, sans-serif"
        fontWeight="700"
        fontSize="6.5"
        letterSpacing="-0.2"
        fill="#E8B547"
      >
        Alt+D
      </text>
    </svg>
  );
}
