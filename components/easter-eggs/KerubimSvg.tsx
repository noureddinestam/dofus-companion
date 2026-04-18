import type { SVGProps } from "react";

// Stylized cat silhouette — original drawing, no Ankama asset. 1.2 KB inline.
export function KerubimSvg(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden
      focusable="false"
      {...props}
    >
      <path
        d="M15 48 L10 20 L20 28 Q32 14 44 28 L54 20 L49 48 Z"
        fill="#12141a"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="36" r="2.5" fill="currentColor" />
      <circle cx="40" cy="36" r="2.5" fill="currentColor" />
      <path
        d="M30 43 Q32 45 34 43"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M26 48 L32 50 L38 48"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.4"
      />
    </svg>
  );
}
