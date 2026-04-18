import { describe, expect, it } from "vitest";
import { parseSha256Sums, shapeRelease } from "@/lib/github";

const RAW_RELEASE = {
  tag_name: "v0.4.0",
  name: "Dofus Companion v0.4.0",
  published_at: "2026-04-18T00:50:07Z",
  html_url:
    "https://github.com/noureddinestam/dofus-companion/releases/tag/v0.4.0",
  assets: [
    {
      name: "Dofus.Companion_0.4.0_x64-setup.exe",
      size: 3345608,
      browser_download_url:
        "https://github.com/noureddinestam/dofus-companion/releases/download/v0.4.0/Dofus.Companion_0.4.0_x64-setup.exe",
    },
    {
      name: "Dofus.Companion_0.4.0_x64-setup.exe.sig",
      size: 118,
      browser_download_url:
        "https://github.com/noureddinestam/dofus-companion/releases/download/v0.4.0/Dofus.Companion_0.4.0_x64-setup.exe.sig",
    },
    {
      name: "Dofus.Companion_0.4.0_x64_en-US.msi",
      size: 4882432,
      browser_download_url:
        "https://github.com/noureddinestam/dofus-companion/releases/download/v0.4.0/Dofus.Companion_0.4.0_x64_en-US.msi",
    },
    {
      name: "Dofus.Companion_0.4.0_x64_en-US.msi.sig",
      size: 118,
      browser_download_url:
        "https://github.com/noureddinestam/dofus-companion/releases/download/v0.4.0/Dofus.Companion_0.4.0_x64_en-US.msi.sig",
    },
    {
      name: "latest.json",
      size: 280,
      browser_download_url:
        "https://github.com/noureddinestam/dofus-companion/releases/download/v0.4.0/latest.json",
    },
  ],
};

describe("shapeRelease", () => {
  it("passes through top-level metadata", () => {
    const shaped = shapeRelease(RAW_RELEASE);
    expect(shaped.version).toBe("v0.4.0");
    expect(shaped.name).toBe("Dofus Companion v0.4.0");
    expect(shaped.publishedAt).toBe("2026-04-18T00:50:07Z");
    expect(shaped.notesUrl).toContain("/tag/v0.4.0");
  });

  it("drops .sig and latest.json assets", () => {
    const shaped = shapeRelease(RAW_RELEASE);
    expect(shaped.assets).toHaveLength(2);
    const names = shaped.assets.map((a) => a.name);
    expect(names).toEqual([
      "Dofus.Companion_0.4.0_x64-setup.exe",
      "Dofus.Companion_0.4.0_x64_en-US.msi",
    ]);
  });

  it("classifies .msi as msi and .exe as nsis", () => {
    const shaped = shapeRelease(RAW_RELEASE);
    const msi = shaped.assets.find((a) => a.name.endsWith(".msi"));
    const exe = shaped.assets.find((a) => a.name.endsWith(".exe"));
    expect(msi?.kind).toBe("msi");
    expect(exe?.kind).toBe("nsis");
  });

  it("preserves download URL and size from the raw asset", () => {
    const shaped = shapeRelease(RAW_RELEASE);
    const setup = shaped.assets.find((a) => a.name.endsWith("x64-setup.exe"));
    expect(setup?.size).toBe(3345608);
    expect(setup?.downloadUrl).toContain("/releases/download/v0.4.0/");
  });

  it("keeps assets array empty when input contains only skipped assets", () => {
    const shaped = shapeRelease({
      ...RAW_RELEASE,
      assets: [
        { name: "latest.json", size: 1, browser_download_url: "x" },
        { name: "anything.sig", size: 1, browser_download_url: "x" },
        { name: "SHA256SUMS.txt", size: 1, browser_download_url: "x" },
      ],
    });
    expect(shaped.assets).toHaveLength(0);
  });

  it("attaches sha256 to matching assets when a map is provided", () => {
    const shaped = shapeRelease(RAW_RELEASE, {
      "Dofus.Companion_0.4.0_x64-setup.exe": "a".repeat(64),
      "Dofus.Companion_0.4.0_x64_en-US.msi": "b".repeat(64),
    });
    const setup = shaped.assets.find((a) => a.name.endsWith("-setup.exe"));
    const msi = shaped.assets.find((a) => a.name.endsWith(".msi"));
    expect(setup?.sha256).toBe("a".repeat(64));
    expect(msi?.sha256).toBe("b".repeat(64));
  });

  it("leaves sha256 undefined when the map does not cover the asset", () => {
    const shaped = shapeRelease(RAW_RELEASE, {});
    expect(shaped.assets.every((a) => a.sha256 === undefined)).toBe(true);
  });
});

describe("parseSha256Sums", () => {
  it("parses a standard sha256sum(1) file with two-space separator", () => {
    const hash =
      "5c20062e5fc8ebd59626e9a08c8794f24c30b8be0d67a92f60ead09feecd2503";
    const text = `${hash}  Dofus.Companion_0.4.0_x64-setup.exe`;
    expect(parseSha256Sums(text)).toEqual({
      "Dofus.Companion_0.4.0_x64-setup.exe": hash,
    });
  });

  it("handles multiple lines, CRLF, and BSD-style asterisk prefix", () => {
    const a = "a".repeat(64);
    const b = "b".repeat(64);
    const text = `${a}  file.exe\r\n${b} *other.msi\r\n\r\n# comment line\n`;
    expect(parseSha256Sums(text)).toEqual({
      "file.exe": a,
      "other.msi": b,
    });
  });

  it("returns empty object on empty or malformed input", () => {
    expect(parseSha256Sums("")).toEqual({});
    expect(parseSha256Sums("not a hash\nnope\n")).toEqual({});
  });

  it("lowercases hashes regardless of input casing", () => {
    const hash = "ABCDEF0123456789".repeat(4);
    expect(parseSha256Sums(`${hash}  file.exe`)["file.exe"]).toBe(
      hash.toLowerCase(),
    );
  });
});
