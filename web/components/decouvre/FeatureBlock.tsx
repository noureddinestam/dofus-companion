import type { ReactNode } from "react";
import { ThemedScreenshot } from "./ThemedScreenshot";

interface FeatureBlockProps {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  bullets?: string[];
  /** Paired screenshot bound to the theme toggle. */
  paired?: { darkSrc: string; lightSrc: string; alt: string };
  /** Single screenshot (not theme-bound). */
  single?: { src: string; alt: string };
  /** Swap text ↔ image sides on desktop. */
  reverse?: boolean;
  /** Optional footer node (links, hints). */
  footer?: ReactNode;
}

/**
 * Alternating text / visual layout. Stacks on mobile, side-by-side at md+.
 * Anchor id lets us link from the landing teaser (e.g. /decouvre#combat-cards).
 */
export function FeatureBlock({
  id,
  eyebrow,
  title,
  body,
  bullets,
  paired,
  single,
  reverse = false,
  footer,
}: FeatureBlockProps) {
  const textCol = (
    <div className="flex flex-col gap-4">
      <p className="text-gold font-mono text-[11px] tracking-[0.22em] uppercase">
        {eyebrow}
      </p>
      <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        {title}
      </h2>
      <p className="text-muted max-w-xl leading-relaxed text-balance">{body}</p>
      {bullets && bullets.length > 0 && (
        <ul className="mt-2 flex flex-col gap-2">
          {bullets.map((b, i) => (
            <li
              key={i}
              className="text-foreground/90 flex items-start gap-3 text-sm leading-relaxed"
            >
              <span
                aria-hidden
                className="bg-gold/70 mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
              />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
      {footer && <div className="pt-2">{footer}</div>}
    </div>
  );

  const visualCol = (
    <div className="flex w-full justify-center md:justify-self-end">
      {paired && (
        <ThemedScreenshot
          darkSrc={paired.darkSrc}
          lightSrc={paired.lightSrc}
          alt={paired.alt}
        />
      )}
      {single && !paired && (
        <div
          className="border-border/60 bg-card/40 relative overflow-hidden rounded-xl border shadow-[0_20px_60px_-20px_rgba(0,0,0,0.55)]"
          style={{ aspectRatio: "520 / 720", width: "100%", maxWidth: 520 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={single.src}
            alt={single.alt}
            width={520}
            height={720}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-contain"
          />
        </div>
      )}
    </div>
  );

  return (
    <section id={id} className="scroll-mt-24 py-10 md:py-16">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 md:grid-cols-2 md:items-center md:gap-12">
        {reverse ? (
          <>
            {visualCol}
            {textCol}
          </>
        ) : (
          <>
            {textCol}
            {visualCol}
          </>
        )}
      </div>
    </section>
  );
}
