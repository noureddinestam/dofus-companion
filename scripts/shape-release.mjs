#!/usr/bin/env node
// Mirrors lib/github.ts::shapeRelease for workflow usage (Node-only, no TS).
// Keep rules in sync with lib/github.ts — covered by tests/unit/github.test.ts.

import { readFileSync, writeFileSync } from "node:fs";

const [, , inputPath, outputPath = "data/release-fallback.json"] = process.argv;

if (!inputPath) {
  console.error("Usage: shape-release.mjs <raw-release.json> [output.json]");
  process.exit(1);
}

const raw = JSON.parse(readFileSync(inputPath, "utf8"));

const shaped = {
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

writeFileSync(outputPath, JSON.stringify(shaped, null, 2) + "\n");
console.log(
  `Wrote ${outputPath}: ${shaped.version} with ${shaped.assets.length} assets`,
);
