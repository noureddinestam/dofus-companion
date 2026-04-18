const GH_OWNER = "noureddinestam";
const GH_REPO = "dofus-companion";
const LATEST_RELEASE_URL = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/releases/latest`;

export type AssetKind = "nsis" | "msi";

export interface ReleaseAsset {
  name: string;
  size: number;
  downloadUrl: string;
  kind: AssetKind;
}

export interface Release {
  version: string;
  name: string;
  publishedAt: string;
  notesUrl: string;
  assets: ReleaseAsset[];
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

export function shapeRelease(raw: RawRelease): Release {
  return {
    version: raw.tag_name,
    name: raw.name,
    publishedAt: raw.published_at,
    notesUrl: raw.html_url,
    assets: raw.assets
      .filter((a) => !a.name.endsWith(".sig") && a.name !== "latest.json")
      .map((a) => ({
        name: a.name,
        size: a.size,
        downloadUrl: a.browser_download_url,
        kind: a.name.endsWith(".msi") ? "msi" : "nsis",
      })),
  };
}

export async function fetchLatestRelease(
  revalidateSeconds: number,
): Promise<Release> {
  const token = process.env["GITHUB_TOKEN"];
  const res = await fetch(LATEST_RELEASE_URL, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    next: { revalidate: revalidateSeconds },
  });

  if (!res.ok) {
    throw new GitHubApiError(res.status, res.statusText);
  }

  const raw = (await res.json()) as RawRelease;
  return shapeRelease(raw);
}
