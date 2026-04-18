import { NextResponse } from "next/server";
import { fetchRecentReleases, GitHubApiError } from "@/lib/github";

export const revalidate = 600;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limitParam = url.searchParams.get("limit");
  const parsed = limitParam ? Number.parseInt(limitParam, 10) : 10;
  const limit = Number.isFinite(parsed) && parsed > 0 ? parsed : 10;

  try {
    const releases = await fetchRecentReleases(limit, 600);
    return NextResponse.json(
      { releases },
      {
        headers: {
          "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600",
          "X-Release-Source": "github",
        },
      },
    );
  } catch (error) {
    const status = error instanceof GitHubApiError ? error.status : 500;
    return NextResponse.json(
      { releases: [], error: "github_unavailable" },
      {
        status: status >= 400 && status < 500 ? status : 502,
        headers: { "Cache-Control": "public, s-maxage=60" },
      },
    );
  }
}
