export const SHA256_PATTERN = /^[a-f0-9]{64}$/;

export interface VirusTotalStats {
  malicious: number;
  suspicious: number;
  undetected: number;
  harmless: number;
  timeout: number;
}

export interface VirusTotalBadgeData {
  sha256: string;
  stats: VirusTotalStats;
  totalEngines: number;
  reportUrl: string;
  lastAnalysisDate: number | null;
}

export type VirusTotalLookup =
  | { state: "ok"; data: VirusTotalBadgeData }
  | { state: "not-submitted" }
  | { state: "invalid-hash" }
  | { state: "unauthorized" }
  | { state: "unavailable" };

interface VtApiResponse {
  data: {
    attributes: {
      last_analysis_stats: Partial<VirusTotalStats>;
      last_analysis_date: number | null;
    };
  };
}

export async function lookupVirusTotal(
  sha256: string,
  apiKey: string | undefined,
  revalidateSeconds: number,
): Promise<VirusTotalLookup> {
  if (!SHA256_PATTERN.test(sha256)) return { state: "invalid-hash" };
  if (!apiKey) return { state: "unauthorized" };

  const res = await fetch(`https://www.virustotal.com/api/v3/files/${sha256}`, {
    headers: { "x-apikey": apiKey },
    next: { revalidate: revalidateSeconds },
  });

  if (res.status === 404) return { state: "not-submitted" };
  if (!res.ok) return { state: "unavailable" };

  const json = (await res.json()) as VtApiResponse;
  const raw = json.data.attributes.last_analysis_stats;
  const stats: VirusTotalStats = {
    malicious: raw.malicious ?? 0,
    suspicious: raw.suspicious ?? 0,
    undetected: raw.undetected ?? 0,
    harmless: raw.harmless ?? 0,
    timeout: raw.timeout ?? 0,
  };
  return {
    state: "ok",
    data: {
      sha256,
      stats,
      totalEngines:
        stats.malicious +
        stats.suspicious +
        stats.undetected +
        stats.harmless +
        stats.timeout,
      reportUrl: `https://www.virustotal.com/gui/file/${sha256}/detection`,
      lastAnalysisDate: json.data.attributes.last_analysis_date,
    },
  };
}
