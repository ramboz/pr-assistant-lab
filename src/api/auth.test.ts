import { describe, expect, it } from 'vitest';
import { buildAuthHeader, getGithubToken, MissingTokenError } from './auth.js';

describe('getGithubToken', () => {
  it('returns the token when set', () => {
    expect(getGithubToken({ GITHUB_TOKEN: 'ghp_abc123' })).toBe('ghp_abc123');
  });

  it('throws MissingTokenError when unset', () => {
    expect(() => getGithubToken({})).toThrow(MissingTokenError);
  });

  it('throws MissingTokenError when empty', () => {
    expect(() => getGithubToken({ GITHUB_TOKEN: '' })).toThrow(MissingTokenError);
  });
});

describe('buildAuthHeader', () => {
  it('formats a bearer header', () => {
    expect(buildAuthHeader('ghp_abc123')).toBe('Bearer ghp_abc123');
  });
});
