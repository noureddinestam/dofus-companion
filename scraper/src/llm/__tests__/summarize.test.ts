import { describe, it, expect } from 'vitest';
import { validateSummaryResponse } from '../summarize.ts';

const SOURCE_TEXT =
  'Kolosso is Invulnerable and accompanied by Professor Xa, who is vulnerable from the start. ' +
  'To make Kolosso vulnerable, he has to be hit by a summon. That will make him vulnerable for one turn. ' +
  'At the start of the fight, Professor Xa casts Telepathy, which deals -10,000 Heals for everybody during the whole fight. ' +
  'Recommended strategy: focus Professor Xa first, keep pressure on Kolosso through summons. ' +
  'Avoid direct melee with Kolosso as he has high tackle values.';

function makeBullet(overrides: Partial<{
  icon: string;
  severity: string;
  text: string;
  quote: string;
}> = {}): Record<string, string> {
  return {
    icon: 'priority',
    severity: 'critical',
    text: 'Focus Professor Xa first.',
    quote: 'focus Professor Xa first, keep pressure on Kolosso',
    ...overrides,
  };
}

describe('validateSummaryResponse — happy path', () => {
  it('returns 5 validated bullets with anchors when all valid', () => {
    const raw = JSON.stringify({
      bullets: [
        {
          icon: 'priority',
          severity: 'critical',
          text: 'Focus Professor Xa, vulnerable from start.',
          quote: 'Professor Xa, who is vulnerable from the start',
        },
        {
          icon: 'summon',
          severity: 'danger',
          text: 'Kolosso invulnerable unless hit by a summon.',
          quote: 'To make Kolosso vulnerable, he has to be hit by a summon',
        },
        {
          icon: 'avoid',
          severity: 'danger',
          text: 'Telepathy disables heals for whole fight.',
          quote: 'Telepathy, which deals -10,000 Heals for everybody',
        },
        {
          icon: 'position',
          severity: 'caution',
          text: 'Avoid melee with Kolosso (high tackle).',
          quote: 'Avoid direct melee with Kolosso as he has high tackle',
        },
      ],
    });
    const result = validateSummaryResponse(raw, SOURCE_TEXT);
    expect(result).not.toBeNull();
    expect(result!.bullets).toHaveLength(4);
    expect(result!.rejected).toBe(0);
    expect(result!.anchors).toHaveLength(4);
    expect(result!.anchors[0].bulletIndex).toBe(0);
    expect(result!.anchors[0].similarity).toBeGreaterThanOrEqual(0.75);
  });

  it('strips markdown code fence wrapper', () => {
    const raw = [
      '```json',
      JSON.stringify({
        bullets: [
          makeBullet({ quote: 'Professor Xa, who is vulnerable from the start' }),
          makeBullet({
            icon: 'summon',
            text: 'summon',
            quote: 'To make Kolosso vulnerable, he has to be hit by a summon',
          }),
          makeBullet({
            icon: 'avoid',
            text: 'avoid melee',
            quote: 'Avoid direct melee with Kolosso as he has high tackle',
          }),
        ],
      }),
      '```',
    ].join('\n');
    const result = validateSummaryResponse(raw, SOURCE_TEXT);
    expect(result).not.toBeNull();
  });
});

describe('validateSummaryResponse — rejections', () => {
  it('returns null on invalid JSON', () => {
    expect(validateSummaryResponse('not json', SOURCE_TEXT)).toBeNull();
    expect(validateSummaryResponse('', SOURCE_TEXT)).toBeNull();
  });

  it('returns null when bullets is not an array', () => {
    expect(validateSummaryResponse('{"bullets": "string"}', SOURCE_TEXT)).toBeNull();
    expect(validateSummaryResponse('{}', SOURCE_TEXT)).toBeNull();
  });

  it('rejects bullets with unknown icon', () => {
    const raw = JSON.stringify({
      bullets: [
        makeBullet({ icon: 'explosion', text: 'bad icon bullet', quote: 'Professor Xa, who is vulnerable from the start' }),
        makeBullet({ icon: 'summon', text: 'summon pressure', quote: 'To make Kolosso vulnerable, he has to be hit by a summon' }),
        makeBullet({ icon: 'avoid', text: 'avoid melee', quote: 'Avoid direct melee with Kolosso as he has high tackle' }),
        makeBullet({ icon: 'tip', text: 'tip about heal', quote: 'Telepathy, which deals -10,000 Heals for everybody' }),
      ],
    });
    const result = validateSummaryResponse(raw, SOURCE_TEXT);
    expect(result).not.toBeNull();
    expect(result!.bullets).toHaveLength(3);
    expect(result!.rejected).toBe(1);
  });

  it('rejects bullets with text out of range (keeps enough valid to pass min)', () => {
    const raw = JSON.stringify({
      bullets: [
        makeBullet({ text: 'x', quote: 'Professor Xa, who is vulnerable from the start' }), // too short
        makeBullet({ text: 'a'.repeat(200), quote: 'To make Kolosso vulnerable, he has to be hit by a summon' }), // too long
        makeBullet({ text: 'Focus Xa', quote: 'Telepathy, which deals -10,000 Heals for everybody' }),
        makeBullet({ text: 'Avoid melee', quote: 'Avoid direct melee with Kolosso as he has high tackle' }),
        makeBullet({ text: 'Summon pressure', quote: 'keep pressure on Kolosso through summons' }),
      ],
    });
    const result = validateSummaryResponse(raw, SOURCE_TEXT);
    expect(result).not.toBeNull();
    expect(result!.rejected).toBe(2);
    expect(result!.bullets).toHaveLength(3);
  });

  it('rejects bullets whose quote is not found in source (sim < 0.75)', () => {
    const raw = JSON.stringify({
      bullets: [
        makeBullet({
          quote: 'A completely unrelated quote about dragons and purple fire everywhere',
        }),
        makeBullet({ quote: 'Professor Xa, who is vulnerable from the start' }),
        makeBullet({ quote: 'To make Kolosso vulnerable, he has to be hit by a summon' }),
        makeBullet({ quote: 'Avoid direct melee with Kolosso as he has high tackle' }),
      ],
    });
    const result = validateSummaryResponse(raw, SOURCE_TEXT);
    expect(result).not.toBeNull();
    expect(result!.bullets).toHaveLength(3);
    expect(result!.rejected).toBe(1);
  });

  it('returns null when fewer than 3 valid bullets subsist', () => {
    const raw = JSON.stringify({
      bullets: [
        makeBullet({ quote: 'unrelated 1' }),
        makeBullet({ quote: 'unrelated 2' }),
        makeBullet({ quote: 'unrelated 3' }),
        makeBullet({ quote: 'Professor Xa, who is vulnerable from the start' }),
      ],
    });
    const result = validateSummaryResponse(raw, SOURCE_TEXT);
    expect(result).toBeNull();
  });

  it('returns null when more than 6 bullets are provided', () => {
    const validQuote = 'Professor Xa, who is vulnerable from the start';
    const raw = JSON.stringify({
      bullets: Array.from({ length: 7 }, (_, i) => makeBullet({
        text: `Bullet ${i + 1} — focus Xa first for survival`,
        quote: validQuote,
      })),
    });
    const result = validateSummaryResponse(raw, SOURCE_TEXT);
    expect(result).toBeNull();
  });

  it('accepts exactly 3 bullets (min)', () => {
    const raw = JSON.stringify({
      bullets: [
        makeBullet({ quote: 'Professor Xa, who is vulnerable from the start' }),
        makeBullet({ quote: 'To make Kolosso vulnerable, he has to be hit by a summon' }),
        makeBullet({ quote: 'Avoid direct melee with Kolosso as he has high tackle' }),
      ],
    });
    const result = validateSummaryResponse(raw, SOURCE_TEXT);
    expect(result).not.toBeNull();
    expect(result!.bullets).toHaveLength(3);
  });

  it('accepts exactly 6 bullets (max)', () => {
    const raw = JSON.stringify({
      bullets: [
        makeBullet({ quote: 'Professor Xa, who is vulnerable from the start' }),
        makeBullet({ quote: 'To make Kolosso vulnerable, he has to be hit by a summon' }),
        makeBullet({ quote: 'Avoid direct melee with Kolosso as he has high tackle' }),
        makeBullet({ quote: 'Telepathy, which deals -10,000 Heals for everybody' }),
        makeBullet({ quote: 'focus Professor Xa first, keep pressure on Kolosso' }),
        makeBullet({ quote: 'keep pressure on Kolosso through summons' }),
      ],
    });
    const result = validateSummaryResponse(raw, SOURCE_TEXT);
    expect(result).not.toBeNull();
    expect(result!.bullets).toHaveLength(6);
  });

  it('anchors bulletIndex matches position in validated array after rejections', () => {
    const raw = JSON.stringify({
      bullets: [
        makeBullet({ quote: 'nonexistent quote about nothing' }), // rejet
        makeBullet({ quote: 'Professor Xa, who is vulnerable from the start' }), // → bulletIndex 0
        makeBullet({ quote: 'To make Kolosso vulnerable, he has to be hit by a summon' }), // → bulletIndex 1
        makeBullet({ quote: 'Avoid direct melee with Kolosso as he has high tackle' }), // → bulletIndex 2
      ],
    });
    const result = validateSummaryResponse(raw, SOURCE_TEXT);
    expect(result).not.toBeNull();
    expect(result!.anchors.map((a) => a.bulletIndex)).toEqual([0, 1, 2]);
  });
});
