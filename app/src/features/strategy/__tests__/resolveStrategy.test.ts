import { describe, it, expect } from 'vitest';
import { resolveStrategy } from '../resolveStrategy';
import type { StrategyBundle, StrategyLong, StrategyShort } from '../../../types/dungeon';

function makeLong(text: string): StrategyLong {
  return {
    text,
    provenance: {
      kind: 'native',
      lang: 'en',
      source: 'fandom-en',
      sourceUrl: 'https://dofuswiki.fandom.com/wiki/X',
    },
  };
}

function makeShort(label: string): StrategyShort {
  return {
    bullets: [
      { icon: 'priority', severity: 'critical', text: `${label} bullet 1` },
      { icon: 'avoid', severity: 'danger', text: `${label} bullet 2` },
      { icon: 'tip', severity: 'info', text: `${label} bullet 3` },
    ],
    provenance: {
      kind: 'native',
      lang: 'fr',
      source: 'fandom-fr',
      sourceUrl: 'https://dofus-fr.fandom.com/wiki/X',
    },
  };
}

function makeBundle(opts: {
  longFr?: boolean;
  longEn?: boolean;
  shortFr?: boolean;
  shortEn?: boolean;
}): StrategyBundle {
  return {
    long: {
      fr: opts.longFr ? makeLong('Long FR content here for testing.') : null,
      en: opts.longEn ? makeLong('Long EN content here for testing.') : null,
    },
    short: {
      fr: opts.shortFr ? makeShort('FR') : null,
      en: opts.shortEn ? makeShort('EN') : null,
    },
  };
}

describe('resolveStrategy', () => {
  it('returns null when bundle is null', () => {
    expect(resolveStrategy(null, 'fr', 'long')).toBeNull();
    expect(resolveStrategy(null, 'en', 'short')).toBeNull();
  });

  it('returns requested lang when available (long fr)', () => {
    const bundle = makeBundle({ longFr: true, longEn: true });
    const result = resolveStrategy(bundle, 'fr', 'long');
    expect(result).not.toBeNull();
    expect(result!.effectiveLang).toBe('fr');
    expect(result!.requestedLang).toBe('fr');
    expect(result!.fellBack).toBe(false);
    expect(result!.content.text).toContain('Long FR');
  });

  it('returns requested lang when available (short en)', () => {
    const bundle = makeBundle({ shortFr: true, shortEn: true });
    const result = resolveStrategy(bundle, 'en', 'short');
    expect(result).not.toBeNull();
    expect(result!.effectiveLang).toBe('en');
    expect(result!.fellBack).toBe(false);
    expect(result!.content.bullets[0].text).toContain('EN');
  });

  it('falls back to other lang when requested is absent', () => {
    const bundle = makeBundle({ longEn: true }); // only EN
    const result = resolveStrategy(bundle, 'fr', 'long');
    expect(result).not.toBeNull();
    expect(result!.requestedLang).toBe('fr');
    expect(result!.effectiveLang).toBe('en');
    expect(result!.fellBack).toBe(true);
    expect(result!.content.text).toContain('Long EN');
  });

  it('falls back en → fr if only fr available', () => {
    const bundle = makeBundle({ longFr: true });
    const result = resolveStrategy(bundle, 'en', 'long');
    expect(result).not.toBeNull();
    expect(result!.fellBack).toBe(true);
    expect(result!.effectiveLang).toBe('fr');
  });

  it('returns null when neither lang is available for the view', () => {
    const bundle = makeBundle({ shortFr: true, shortEn: true }); // only short
    expect(resolveStrategy(bundle, 'fr', 'long')).toBeNull();
  });

  it('separates short vs long — short requested but only long present', () => {
    const bundle = makeBundle({ longEn: true });
    expect(resolveStrategy(bundle, 'en', 'short')).toBeNull();
    expect(resolveStrategy(bundle, 'en', 'long')).not.toBeNull();
  });

  it('short bundle returns bullets not text', () => {
    const bundle = makeBundle({ shortEn: true });
    const result = resolveStrategy(bundle, 'en', 'short');
    expect(result).not.toBeNull();
    expect(result!.content.bullets).toHaveLength(3);
    expect(result!.content.bullets[0].icon).toBe('priority');
  });

  it('prefers requested lang even when both are present', () => {
    const bundle = makeBundle({ shortFr: true, shortEn: true });
    const fr = resolveStrategy(bundle, 'fr', 'short');
    const en = resolveStrategy(bundle, 'en', 'short');
    expect(fr!.effectiveLang).toBe('fr');
    expect(en!.effectiveLang).toBe('en');
    expect(fr!.fellBack).toBe(false);
    expect(en!.fellBack).toBe(false);
  });
});
