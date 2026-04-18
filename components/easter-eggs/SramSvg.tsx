import type { SVGProps } from "react";

// Ninja silhouette — original drawing, no Ankama asset. Used on the 404 page.
export function SramSvg(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden
      focusable="false"
      {...props}
    >
      <defs>
        <radialGradient id="sramGlow" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="rgba(232,181,71,0.18)" />
          <stop offset="100%" stopColor="rgba(232,181,71,0)" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="100" height="100" fill="url(#sramGlow)" />
      <circle
        cx="50"
        cy="46"
        r="26"
        fill="#12141a"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M28 42 L45 42 L47 44 L53 44 L55 42 L72 42"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <circle cx="44" cy="44" r="2" fill="#0c0e12" />
      <ellipse cx="58" cy="44" rx="4" ry="2.4" fill="#e8b547" />
      <circle cx="58.5" cy="44" r="1.2" fill="#0c0e12" />
      <path
        d="M36 60 Q50 66 64 60"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.35"
        fill="none"
      />
    </svg>
  );
}
