import { formatBytes } from "@/lib/format";
import { getMessages } from "@/lib/messages";
import type { ReleaseAsset } from "@/lib/github";
import { DownloadIcon } from "@/components/icons/InlineIcons";
import { CopyInline } from "@/components/ui/CopyInline";

interface AssetCardProps {
  asset: ReleaseAsset;
  sha256?: string;
  highlighted?: boolean;
}

export async function AssetCard({
  asset,
  sha256,
  highlighted,
}: AssetCardProps) {
  const m = await getMessages();
  const t = m.download.cards;
  const tSha = m.download.sha256;
  const variant = asset.kind === "nsis" ? t.nsis : t.msi;
  return (
    <article
      className={`flex flex-col gap-4 rounded-lg border p-6 transition-colors ${
        highlighted
          ? "border-gold/40 bg-gold/[0.04]"
          : "border-border/70 bg-card/30"
      }`}
    >
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-gold mb-1.5 font-mono text-[11px] tracking-[0.15em] uppercase">
            {variant.tag}
          </p>
          <h3 className="text-lg font-semibold">{variant.title}</h3>
        </div>
        <p className="text-muted font-mono text-xs">
          {formatBytes(asset.size)}
        </p>
      </header>
      <p className="text-muted text-sm leading-relaxed">{variant.body}</p>
      <div className="border-border/60 space-y-2 border-t pt-4">
        <p className="text-muted font-mono text-[11px] tracking-[0.15em] uppercase">
          {tSha.label}
        </p>
        {sha256 ? (
          <CopyInline
            value={sha256}
            label={tSha.label}
            copyLabel={tSha.copy}
            copiedLabel={tSha.copied}
          />
        ) : (
          <p className="text-muted font-mono text-xs">{tSha.pending}</p>
        )}
      </div>
      <a
        href={asset.downloadUrl}
        className={`mt-auto inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition-transform hover:-translate-y-0.5 ${
          highlighted
            ? "bg-gold text-background hover:bg-gold-soft"
            : "border-border text-foreground/90 hover:border-gold/60 hover:text-gold border"
        }`}
      >
        <DownloadIcon className="h-4 w-4" />
        {t.download} {asset.name}
      </a>
      <p className="text-muted font-mono text-[11px] italic">
        {variant.microWeight}
      </p>
    </article>
  );
}
