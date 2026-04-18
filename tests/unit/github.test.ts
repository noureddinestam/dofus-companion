import { describe, expect, it } from "vitest";
import { shapeRelease } from "@/lib/github";

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
      ],
    });
    expect(shaped.assets).toHaveLength(0);
  });
});
