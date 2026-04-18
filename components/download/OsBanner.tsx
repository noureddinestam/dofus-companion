import { getMessages } from "@/lib/messages";
import type { DetectedOs } from "@/lib/os";

interface OsBannerProps {
  os: DetectedOs;
}

export async function OsBanner({ os }: OsBannerProps) {
  const m = await getMessages();
  const t = m.download.os[os];
  const isSupported = os === "windows" || os === "unknown";
  return (
    <div
      className={`rounded-lg border px-5 py-4 ${
        isSupported
          ? "border-gold/30 bg-gold/[0.06]"
          : "border-border/70 bg-card/40"
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className={`h-2.5 w-2.5 rounded-full ${
            isSupported ? "bg-gold" : "bg-muted"
          }`}
        />
        <p className="text-sm font-semibold">{t.label}</p>
      </div>
      <p className="text-muted mt-1.5 pl-5 text-sm">{t.body}</p>
    </div>
  );
}
