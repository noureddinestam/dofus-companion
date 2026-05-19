#!/usr/bin/env node
// Mirrors lib/github.ts::shapeRelease for workflow usage (Node-only, no TS).
// Keep rules in sync with lib/github.ts — covered by tests/unit/github.test.ts.

import { readFileSync, writeFileSync } from "node:fs";

const [, , inputPath, outputPath = "data/release-fallback.json"] = process.argv;

if (!inputPath) {
  console.error("Usage: shape-release.mjs <raw-release.json> [output.json]");
  process.exit(1);
}

const SHA256SUMS_ASSET_NAME = "SHA256SUMS.txt";

function parseSha256Sums(text) {
  const out = {};
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^([a-f0-9]{64})\s+\*?(.+)$/i);
    if (match) out[match[2]] = match[1].toLowerCase();
  }
  return out;
}

const raw = JSON.parse(readFileSync(inputPath, "utf8"));

let sha256Map = {};
const sumsAsset = raw.assets.find((a) => a.name === SHA256SUMS_ASSET_NAME);
if (sumsAsset) {
  try {
    const res = await fetch(sumsAsset.browser_download_url);
    if (res.ok) sha256Map = parseSha256Sums(await res.text());
  } catch (err) {
    console.warn(
      `Warn: failed to fetch ${SHA256SUMS_ASSET_NAME} — shipping without hashes (${err.message})`,
    );
  }
}

const shaped = {
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
      const asset = {
        name: a.name,
        size: a.size,
        downloadUrl: a.browser_download_url,
        kind: a.name.endsWith(".msi") ? "msi" : "nsis",
      };
      if (sha256Map[a.name]) asset.sha256 = sha256Map[a.name];
      return asset;
    }),
};

writeFileSync(outputPath, JSON.stringify(shaped, null, 2) + "\n");
const hashCount = shaped.assets.filter((a) => a.sha256).length;
console.log(
  `Wrote ${outputPath}: ${shaped.version} with ${shaped.assets.length} assets (${hashCount} hashed)`,
);
