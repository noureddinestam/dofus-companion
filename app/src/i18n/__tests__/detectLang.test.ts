import { afterEach, describe, expect, it, vi } from 'vitest';
import { detectSystemLang } from '../detectLang';

function mockNavigatorLanguage(value: string | undefined) {
  if (value === undefined) {
    // On simule navigator absent en rendant la propriété undefined
    vi.stubGlobal('navigator', undefined);
    return;
  }
  vi.stubGlobal('navigator', { language: value, languages: [value] });
}

describe('detectSystemLang', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns fr for fr-FR', () => {
    mockNavigatorLanguage('fr-FR');
    expect(detectSystemLang()).toBe('fr');
  });

  it('returns fr for fr-CA', () => {
    mockNavigatorLanguage('fr-CA');
    expect(detectSystemLang()).toBe('fr');
  });

  it('returns fr for FR (uppercase)', () => {
    mockNavigatorLanguage('FR');
    expect(detectSystemLang()).toBe('fr');
  });

  it('returns en for en-US', () => {
    mockNavigatorLanguage('en-US');
    expect(detectSystemLang()).toBe('en');
  });

  it('returns en for en-GB', () => {
    mockNavigatorLanguage('en-GB');
    expect(detectSystemLang()).toBe('en');
  });

  it('returns en for de-DE (fallback non-fr = en)', () => {
    mockNavigatorLanguage('de-DE');
    expect(detectSystemLang()).toBe('en');
  });

  it('returns en for es-ES', () => {
    mockNavigatorLanguage('es-ES');
    expect(detectSystemLang()).toBe('en');
  });

  it('returns fr when navigator is undefined', () => {
    mockNavigatorLanguage(undefined);
    expect(detectSystemLang()).toBe('fr');
  });

  it('returns fr when navigator.language is empty string', () => {
    mockNavigatorLanguage('');
    expect(detectSystemLang()).toBe('fr');
  });
});
