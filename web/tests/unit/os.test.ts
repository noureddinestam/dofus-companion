import { describe, expect, it } from "vitest";
import { detectOs } from "@/lib/os";

describe("detectOs", () => {
  it("detects Windows", () => {
    expect(
      detectOs("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"),
    ).toBe("windows");
  });

  it("detects macOS", () => {
    expect(
      detectOs("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605"),
    ).toBe("mac");
  });

  it("detects Linux desktop", () => {
    expect(detectOs("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36")).toBe(
      "linux",
    );
  });

  it("detects iPhone as mobile", () => {
    expect(
      detectOs("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)"),
    ).toBe("mobile");
  });

  it("detects Android as mobile", () => {
    expect(
      detectOs("Mozilla/5.0 (Linux; Android 14; Pixel 8) Chrome/123"),
    ).toBe("mobile");
  });

  it("prioritizes mobile UA over Linux substring (Android contains 'Linux')", () => {
    expect(
      detectOs("Mozilla/5.0 (Linux; Android 14; Pixel 8) Chrome/123"),
    ).toBe("mobile");
  });

  it("falls back to unknown on empty/missing UA", () => {
    expect(detectOs(null)).toBe("unknown");
    expect(detectOs(undefined)).toBe("unknown");
    expect(detectOs("")).toBe("unknown");
  });
});
