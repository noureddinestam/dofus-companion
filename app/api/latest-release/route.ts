import { NextResponse } from "next/server";
import { getLatestRelease } from "@/lib/release";

// Next.js 16 requires route segment config exports to be statically
// analyzable literals — keep this in sync with the s-maxage header below.
export const revalidate = 600;

export async function GET() {
  const { release, source } = await getLatestRelease(600);
  return NextResponse.json(release, {
    headers: {
      "Cache-Control":
        source === "github"
          ? "public, s-maxage=600, stale-while-revalidate=3600"
          : "public, s-maxage=60",
      "X-Release-Source": source,
    },
  });
}
