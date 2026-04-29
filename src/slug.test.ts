import { describe, expect, it } from 'vitest';
import { slugify } from './slug.js';

describe('slugify', () => {
  it('lowercases and hyphenates', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('strips diacritics', () => {
    expect(slugify('Café Résumé')).toBe('cafe-resume');
  });

  it('collapses non-alphanumeric runs', () => {
    expect(slugify('foo --- bar  ___  baz')).toBe('foo-bar-baz');
  });

  it('trims leading and trailing hyphens', () => {
    expect(slugify('---hello---')).toBe('hello');
  });

  it('handles empty input', () => {
    expect(slugify('')).toBe('');
  });
});
