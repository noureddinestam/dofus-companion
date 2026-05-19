import { describe, expect, it } from "vitest";
import fr from "@/messages/fr.json";
import en from "@/messages/en.json";

// Recursively collect every leaf path (a.b[0].c style) so structural drift
// between locales fails the test regardless of depth.
function collectPaths(value: unknown, prefix = ""): string[] {
  if (value === null || typeof value !== "object") return [prefix];
  if (Array.isArray(value)) {
    return value.flatMap((item, i) => collectPaths(item, `${prefix}[${i}]`));
  }
  return Object.keys(value as Record<string, unknown>)
    .sort()
    .flatMap((key) => {
      const childPrefix = prefix ? `${prefix}.${key}` : key;
      return collectPaths((value as Record<string, unknown>)[key], childPrefix);
    });
}

describe("messages parity", () => {
  it("fr.json and en.json share the exact same key structure", () => {
    const frPaths = new Set(collectPaths(fr));
    const enPaths = new Set(collectPaths(en));
    const missingInEn = [...frPaths].filter((p) => !enPaths.has(p));
    const missingInFr = [...enPaths].filter((p) => !frPaths.has(p));
    expect(
      { missingInEn, missingInFr },
      "fr/en messages diverged — every key must exist in both locales",
    ).toEqual({ missingInEn: [], missingInFr: [] });
  });

  it("footer.buildLines has at least 5 entries in both locales", () => {
    expect(fr.footer.buildLines.length).toBeGreaterThanOrEqual(5);
    expect(en.footer.buildLines.length).toBeGreaterThanOrEqual(5);
  });

  it("supportPage surfaces 2 tiers covering primary (coffee) and secondary (sponsors) CTAs", () => {
    for (const locale of [fr, en]) {
      expect(locale.supportPage.tiers).toHaveLength(2);
      const variants = locale.supportPage.tiers.map((t) => t.variant);
      expect(variants).toContain("primary");
      expect(variants).toContain("secondary");
      for (const tier of locale.supportPage.tiers) {
        expect(tier.href).toMatch(/^https:\/\//);
      }
    }
  });
});
