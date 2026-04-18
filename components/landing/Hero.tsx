import { Suspense } from "react";
import Link from "next/link";
import { getMessages } from "@/lib/messages";
import { ArrowRightIcon } from "@/components/icons/InlineIcons";
import { GithubIcon } from "@/components/icons/GithubIcon";
import { FadeInUp } from "@/components/motion/FadeInUp";
import { DownloadCta } from "./DownloadCta";
import { MockOverlay } from "./MockOverlay";

function DownloadCtaSkeleton({ label }: { label: string }) {
  return (
    <span className="bg-gold text-background inline-flex h-12 items-center gap-3 rounded-md px-5 text-sm font-semibold opacity-70">
      {label}
    </span>
  );
}

export async function Hero() {
  const m = await getMessages();
  const t = m.hero;
  return (
    <section className="border-border/60 relative overflow-hidden border-b">
      <div
        aria-hidden
        className="bg-[radial-gradient(50%_60%_at_50%_0%,theme(colors.gold/10%),transparent_60%)] pointer-events-none absolute inset-0 -z-10"
      />
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-2 md:items-center md:py-28">
        <div className="flex flex-col gap-6">
          <FadeInUp delay={0}>
            <span className="border-border text-muted inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium tracking-[0.15em] uppercase">
              <span className="bg-gold h-1.5 w-1.5 rounded-full" />
              {t.eyebrow}
            </span>
          </FadeInUp>
          <FadeInUp delay={0.05}>
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-[3.5rem] lg:leading-[1.05]">
              {t.titleLead} <span className="text-gold">{t.titleAccent}</span>
              {t.titleTrail}
            </h1>
          </FadeInUp>
          <FadeInUp delay={0.15}>
            <p className="text-muted max-w-xl text-base leading-relaxed text-balance sm:text-lg">
              {t.subtitle}
            </p>
          </FadeInUp>
          <FadeInUp delay={0.25} className="flex flex-wrap items-center gap-3">
            <Suspense
              fallback={<DownloadCtaSkeleton label={t.ctaPrimaryPrefix} />}
            >
              <DownloadCta />
            </Suspense>
            <Link
              href="https://github.com/noureddinestam/dofus-companion"
              className="group border-border text-foreground/90 hover:border-gold/60 hover:text-gold inline-flex items-center gap-2 rounded-md border px-4 py-3 text-sm font-medium transition-colors"
            >
              <GithubIcon className="h-4 w-4" />
              {t.ctaSecondary}
              <ArrowRightIcon className="h-3.5 w-3.5 translate-x-0 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </FadeInUp>
          <FadeInUp delay={0.35}>
            <p className="text-muted max-w-md font-mono text-[11px] leading-relaxed">
              {t.microCopy}
            </p>
          </FadeInUp>
        </div>
        <FadeInUp delay={0.2} className="md:justify-self-end">
          <MockOverlay />
        </FadeInUp>
      </div>
    </section>
  );
}
