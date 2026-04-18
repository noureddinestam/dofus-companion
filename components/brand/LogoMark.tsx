import type { SVGProps } from "react";

// Gold egg silhouette with the "Alt D" keyboard-key band. Mirrors
// public/brand/favicon.svg so the mark in the UI stays in sync with the
// tab favicon. Hardcoded brand colors — same values as the site tokens
// (--gold = #E8B547, --background = #0C0E12). Keep aria-hidden: the
// wordmark next to the logo already labels the link.
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
      <rect x="9" y="15" width="14" height="7" rx="1.6" fill="#0C0E12" />
    </svg>
  );
}
