import { getLatestRelease, pickPrimaryAsset } from "@/lib/release";
import { formatBytes } from "@/lib/format";
import { getMessages } from "@/lib/messages";
import { DownloadIcon } from "@/components/icons/InlineIcons";

export async function DownloadCta() {
  const [{ release }, m] = await Promise.all([
    getLatestRelease(),
    getMessages(),
  ]);
  const asset = pickPrimaryAsset(release);
  if (!asset) return null;

  const t = m.hero;
  const version = release.version.replace(/^v/, "");
  return (
    <a
      href={asset.downloadUrl}
      className="group bg-gold text-background hover:bg-gold-soft focus-visible:outline-gold inline-flex items-center gap-3 rounded-md px-5 py-3 text-sm font-semibold shadow-[0_8px_32px_-8px_rgba(232,181,71,0.6)] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <DownloadIcon className="h-4 w-4" />
      <span>{t.ctaPrimaryPrefix}</span>
      <span className="text-background/75 font-mono text-xs">
        v{version} · {formatBytes(asset.size)}
      </span>
    </a>
  );
}
