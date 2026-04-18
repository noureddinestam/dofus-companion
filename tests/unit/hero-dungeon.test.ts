import { describe, expect, it } from "vitest";
import heroDungeon from "@/data/hero-dungeon.json";

// The hero MockOverlay promises "zero hallucination" — this test enforces
// that the baked snapshot actually carries the shape the component reads
// from. If the snapshot is regenerated and loses a field, the hero breaks
// before a user sees it.

const BLOCK_KEYS = ["unlock", "constraints", "dangers", "tips"] as const;

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

  it("carries a 4-block combat card with at least one populated block", () => {
    const card = heroDungeon.combat;
    for (const key of BLOCK_KEYS) {
      expect(Array.isArray(card[key])).toBe(true);
    }
    const total =
      card.unlock.length +
      card.constraints.length +
      card.dangers.length +
      card.tips.length;
    expect(total).toBeGreaterThan(0);
  });

  for (const locale of ["fr", "en"] as const) {
    it(`has bilingual ${locale} bullet text in every populated block`, () => {
      const card = heroDungeon.combat;
      for (const key of BLOCK_KEYS) {
        for (const bullet of card[key]) {
          expect(bullet.text[locale]).toBeDefined();
          expect(bullet.text[locale].length).toBeGreaterThanOrEqual(3);
          expect(bullet.text[locale].length).toBeLessThanOrEqual(160);
        }
      }
    });
  }

  it("carries a top-level provenance pointing at an http(s) source", () => {
    const p = heroDungeon.provenance;
    expect(p.kind.length).toBeGreaterThan(0);
    expect(p.baseSource.length).toBeGreaterThan(0);
    expect(p.baseSourceUrl).toMatch(/^https?:\/\//);
  });
});
