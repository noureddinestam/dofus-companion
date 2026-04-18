import { describe, expect, it } from "vitest";
import heroDungeon from "@/data/hero-dungeon.json";

// The hero MockOverlay promises "zero hallucination" — this test enforces
// that the baked snapshot actually carries the shape the component reads
// from. If the snapshot is regenerated and loses a field, the hero breaks
// before a user sees it.

describe("hero-dungeon snapshot", () => {
  it("exposes fr + en dungeon names", () => {
    expect(heroDungeon.name.fr.length).toBeGreaterThan(0);
    expect(heroDungeon.name.en.length).toBeGreaterThan(0);
  });

  it("declares a level range and monster count", () => {
    const [min, max] = heroDungeon.levelRange;
    expect(heroDungeon.levelRange).toHaveLength(2);
    expect(min).toBeDefined();
    expect(max).toBeDefined();
    expect(min!).toBeLessThanOrEqual(max!);
    expect(heroDungeon.monsterCount).toBeGreaterThan(0);
  });

  for (const locale of ["fr", "en"] as const) {
    it(`has 3-6 short.${locale}.bullets with severity + text`, () => {
      const bullets = heroDungeon.short[locale].bullets;
      expect(bullets.length).toBeGreaterThanOrEqual(3);
      expect(bullets.length).toBeLessThanOrEqual(6);
      for (const b of bullets) {
        expect(b.text.length).toBeGreaterThan(0);
        expect(["critical", "danger", "caution", "info"]).toContain(b.severity);
      }
    });

    it(`carries a non-empty short.${locale}.provenance`, () => {
      const p = heroDungeon.short[locale].provenance;
      expect(p.kind.length).toBeGreaterThan(0);
      expect(p.baseSource.length).toBeGreaterThan(0);
      expect(p.baseSourceUrl).toMatch(/^https?:\/\//);
    });
  }
});
