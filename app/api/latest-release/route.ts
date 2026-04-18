import { NextResponse } from "next/server";
import fallback from "@/data/release-fallback.json";
import { fetchLatestRelease, GitHubApiError } from "@/lib/github";

// Next.js 16 requires route segment config exports to be statically
// analyzable literals — keep this in sync with the s-maxage header below.
export const revalidate = 600;

export async function GET() {
  try {
    const release = await fetchLatestRelease(600);
    return NextResponse.json(release, {
      headers: {
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600",
        "X-Release-Source": "github",
      },
    });
  } catch (error) {
    const status = error instanceof GitHubApiError ? error.status : 0;
    return NextResponse.json(fallback, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=60",
        "X-Release-Source": "fallback",
        "X-Release-Fallback-Reason": String(status || "network"),
      },
    });
  }
}
