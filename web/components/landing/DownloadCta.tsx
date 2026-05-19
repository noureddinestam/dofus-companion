import { getLatestRelease, pickPrimaryAsset } from "@/lib/release";
import { formatBytes } from "@/lib/format";
import { getMessages } from "@/lib/messages";
import { DownloadCtaClient } from "@/components/easter-eggs/DownloadCtaClient";

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
    <DownloadCtaClient
      href={asset.downloadUrl}
      normalLabel={t.ctaPrimaryPrefix}
      revealLabel={t.ctaPrimaryReveal}
      version={version}
      sizeLabel={formatBytes(asset.size)}
    />
  );
}
