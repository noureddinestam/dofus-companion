const GH_OWNER = "noureddinestam";
const GH_REPO = "dofus-companion-releases";
export const RELEASES_REPO_URL = `https://github.com/${GH_OWNER}/${GH_REPO}`;
export const RELEASES_PAGE_URL = `${RELEASES_REPO_URL}/releases`;
const LATEST_RELEASE_URL = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/releases/latest`;
const RELEASES_URL = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/releases`;
const SHA256SUMS_ASSET_NAME = "SHA256SUMS.txt";

export type AssetKind = "nsis" | "msi";

export interface ReleaseAsset {
  name: string;
  size: number;
  downloadUrl: string;
  kind: AssetKind;
  sha256?: string;
}

export interface Release {
  version: string;
  name: string;
  publishedAt: string;
  notesUrl: string;
  assets: ReleaseAsset[];
}

export interface ReleaseSummary {
  version: string;
  name: string;
  publishedAt: string;
  notesUrl: string;
  bodyMarkdown: string;
  isPrerelease: boolean;
  assetsCount: number;
}

interface RawAsset {
  name: string;
  size: number;
  browser_download_url: string;
}

interface RawRelease {
  tag_name: string;
  name: string;
  published_at: string;
  html_url: string;
  body?: string | null;
  prerelease?: boolean;
  draft?: boolean;
  assets: RawAsset[];
}

export class GitHubApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
  ) {
    super(`GitHub API error ${status}: ${statusText}`);
    this.name = "GitHubApiError";
  }
}

// sha256sum(1) format: "<64-hex-hash>  <filename>" (two spaces, but any whitespace tolerated).
export function parseSha256Sums(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^([a-f0-9]{64})\s+\*?(.+)$/i);
    if (match && match[1] && match[2]) {
      out[match[2]] = match[1].toLowerCase();
    }
  }
  return out;
}

export function shapeRelease(
  raw: RawRelease,
  sha256Map: Record<string, string> = {},
): Release {
  return {
    version: raw.tag_name,
    name: raw.name,
    publishedAt: raw.published_at,
    notesUrl: raw.html_url,
    assets: raw.assets
      .filter(
        (a) =>
          !a.name.endsWith(".sig") &&
          a.name !== "latest.json" &&
          a.name !== SHA256SUMS_ASSET_NAME,
      )
      .map((a) => {
        const asset: ReleaseAsset = {
          name: a.name,
          size: a.size,
          downloadUrl: a.browser_download_url,
          kind: a.name.endsWith(".msi") ? "msi" : "nsis",
        };
        const hash = sha256Map[a.name];
        if (hash) asset.sha256 = hash;
        return asset;
      }),
  };
}

export async function fetchLatestRelease(
  revalidateSeconds: number,
): Promise<Release> {
  const token = process.env["GITHUB_TOKEN"];
  const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const res = await fetch(LATEST_RELEASE_URL, {
    headers,
    next: { revalidate: revalidateSeconds },
  });

  if (!res.ok) {
    throw new GitHubApiError(res.status, res.statusText);
  }

  const raw = (await res.json()) as RawRelease;

  // Best-effort fetch of SHA256SUMS.txt if the release publishes it. A failure
  // here is non-fatal — we still return the release with empty hashes.
  const sumsAsset = raw.assets.find((a) => a.name === SHA256SUMS_ASSET_NAME);
  let sha256Map: Record<string, string> = {};
  if (sumsAsset) {
    try {
      const sumsRes = await fetch(sumsAsset.browser_download_url, {
        next: { revalidate: revalidateSeconds },
      });
      if (sumsRes.ok) {
        sha256Map = parseSha256Sums(await sumsRes.text());
      }
    } catch {
      // Swallow — callers render "à venir" when sha256 is missing.
    }
  }

  return shapeRelease(raw, sha256Map);
}

export function summarizeRelease(raw: RawRelease): ReleaseSummary {
  return {
    version: raw.tag_name,
    name: raw.name,
    publishedAt: raw.published_at,
    notesUrl: raw.html_url,
    bodyMarkdown: raw.body ?? "",
    isPrerelease: raw.prerelease === true,
    assetsCount: raw.assets.filter(
      (a) =>
        !a.name.endsWith(".sig") &&
        a.name !== "latest.json" &&
        a.name !== SHA256SUMS_ASSET_NAME,
    ).length,
  };
}

export async function fetchRecentReleases(
  limit: number,
  revalidateSeconds: number,
): Promise<ReleaseSummary[]> {
  const token = process.env["GITHUB_TOKEN"];
  const clamped = Math.max(1, Math.min(limit, 30));
  const res = await fetch(`${RELEASES_URL}?per_page=${clamped}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    next: { revalidate: revalidateSeconds },
  });
  if (!res.ok) throw new GitHubApiError(res.status, res.statusText);
  const raw = (await res.json()) as RawRelease[];
  return raw.filter((r) => !r.draft).map(summarizeRelease);
}
