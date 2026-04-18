import { messages } from "@/lib/messages";
import { lookupVirusTotal } from "@/lib/virustotal";
import { env } from "@/lib/env";

type BadgeTone = "clean" | "warn" | "muted";

interface BadgeProps {
  tone: BadgeTone;
  title: string;
  detail?: string;
  href?: string;
}

const TONE_CLASSES: Record<BadgeTone, { shell: string; dot: string }> = {
  clean: {
    shell: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    dot: "bg-emerald-400",
  },
  warn: {
    shell: "border-amber-500/50 bg-amber-500/10 text-amber-300",
    dot: "bg-amber-400",
  },
  muted: {
    shell: "border-border/70 bg-card/30 text-muted",
    dot: "bg-muted",
  },
};

function Badge({ tone, title, detail, href }: BadgeProps) {
  const t = messages.virusTotal;
  const { shell, dot } = TONE_CLASSES[tone];
  const inner = (
    <>
      <span aria-hidden className={`h-2 w-2 rounded-full ${dot}`} />
      <span className="flex-1">
        <span className="font-mono text-[11px] tracking-[0.15em] uppercase">
          {t.label}
        </span>
        <span className="ml-2 font-semibold">{title}</span>
      </span>
      {detail && (
        <span className="font-mono text-[11px] opacity-80">{detail}</span>
      )}
    </>
  );
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs transition-opacity hover:opacity-90 ${shell}`}
      >
        {inner}
      </a>
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs ${shell}`}
    >
      {inner}
    </span>
  );
}

interface VirusTotalBadgeProps {
  sha256?: string;
}

export async function VirusTotalBadge({ sha256 }: VirusTotalBadgeProps) {
  const t = messages.virusTotal;

  if (!sha256) {
    return <Badge tone="muted" title={t.pending} detail={t.notSubmitted} />;
  }

  const result = await lookupVirusTotal(sha256, env.VIRUSTOTAL_API_KEY, 86400);
  if (result.state === "not-submitted") {
    return <Badge tone="muted" title={t.pending} detail={t.notSubmitted} />;
  }
  if (result.state !== "ok") {
    return <Badge tone="muted" title={t.unavailable} />;
  }

  const { malicious, suspicious } = result.data.stats;
  const engines = result.data.totalEngines;
  if (malicious === 0 && suspicious === 0) {
    return (
      <Badge
        tone="clean"
        title={t.clean}
        detail={`${engines} ${t.engines}`}
        href={result.data.reportUrl}
      />
    );
  }
  return (
    <Badge
      tone="warn"
      title={`${malicious + suspicious} ${t.flagged}`}
      detail={`${engines} ${t.engines}`}
      href={result.data.reportUrl}
    />
  );
}
