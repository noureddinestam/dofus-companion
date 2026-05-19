import { NextResponse } from "next/server";
import { lookupVirusTotal, SHA256_PATTERN } from "@/lib/virustotal";
import { env } from "@/lib/env";

export const revalidate = 86400;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ sha256: string }> },
) {
  const { sha256 } = await params;
  if (!SHA256_PATTERN.test(sha256)) {
    return NextResponse.json({ state: "invalid-hash" }, { status: 400 });
  }
  const result = await lookupVirusTotal(
    sha256.toLowerCase(),
    env.VIRUSTOTAL_API_KEY,
    86400,
  );
  const status =
    result.state === "ok"
      ? 200
      : result.state === "not-submitted"
        ? 404
        : result.state === "unauthorized"
          ? 501
          : 502;
  return NextResponse.json(result, {
    status,
    headers: {
      "Cache-Control":
        result.state === "ok"
          ? "public, s-maxage=86400, stale-while-revalidate=86400"
          : "public, s-maxage=300",
    },
  });
}
