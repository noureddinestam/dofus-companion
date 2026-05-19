import fallback from "@/data/release-fallback.json";
import { fetchLatestRelease, type Release } from "@/lib/github";

export type ReleaseSource = "github" | "fallback";

export interface ReleaseResult {
  release: Release;
  source: ReleaseSource;
}

export async function getLatestRelease(
  revalidateSeconds = 600,
): Promise<ReleaseResult> {
  try {
    const release = await fetchLatestRelease(revalidateSeconds);
    return { release, source: "github" };
  } catch {
    return { release: fallback as Release, source: "fallback" };
  }
}

export function pickPrimaryAsset(release: Release) {
  return (
    release.assets.find((a) => a.kind === "nsis") ?? release.assets[0] ?? null
  );
}
