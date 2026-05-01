import { describe, expect, it, vi } from 'vitest';
import { fetchPr, GithubApiError, RateLimitedError } from './github.js';
import { RateLimiter } from './rate-limiter.js';

function freshLimiter(): RateLimiter {
  return new RateLimiter({ capacity: 10, refillPerSecond: 1 });
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

const PR_PAYLOAD = {
  title: 'Add rate limiting',
  body: 'Adds a token bucket to the GitHub client.',
  user: { login: 'octocat' },
  base: { ref: 'main', sha: 'abc123' },
  head: { ref: 'feature/rate-limit', sha: 'def456' },
};

const FILES_PAYLOAD = [
  {
    filename: 'src/api/github.ts',
    status: 'modified',
    additions: 12,
    deletions: 3,
    patch: '@@ -1,3 +1,12 @@ ...',
  },
];

describe('fetchPr', () => {
  it('returns metadata and files for a successful response', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(PR_PAYLOAD))
      .mockResolvedValueOnce(jsonResponse(FILES_PAYLOAD));

    const pr = await fetchPr(
      { owner: 'ramboz', repo: 'pr-assistant-lab', number: 42 },
      { fetchImpl, env: { GITHUB_TOKEN: 'ghp_x' }, limiter: freshLimiter() },
    );

    expect(pr.metadata.title).toBe('Add rate limiting');
    expect(pr.metadata.author).toBe('octocat');
    expect(pr.metadata.baseSha).toBe('abc123');
    expect(pr.files).toHaveLength(1);
    expect(pr.files[0].filename).toBe('src/api/github.ts');
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('sends the bearer token and api-version headers', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(PR_PAYLOAD))
      .mockResolvedValueOnce(jsonResponse(FILES_PAYLOAD));

    await fetchPr(
      { owner: 'ramboz', repo: 'pr-assistant-lab', number: 42 },
      { fetchImpl, env: { GITHUB_TOKEN: 'ghp_x' }, limiter: freshLimiter() },
    );

    const firstCall = fetchImpl.mock.calls[0];
    const headers = firstCall[1].headers as Record<string, string>;
    expect(headers.Authorization).toBe('Bearer ghp_x');
    expect(headers['X-GitHub-Api-Version']).toBe('2022-11-28');
  });

  it('throws GithubApiError when the PR fetch fails', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(new Response('not found', { status: 404 }));

    await expect(
      fetchPr(
        { owner: 'ramboz', repo: 'pr-assistant-lab', number: 999 },
        { fetchImpl, env: { GITHUB_TOKEN: 'ghp_x' }, limiter: freshLimiter() },
      ),
    ).rejects.toBeInstanceOf(GithubApiError);
  });

  it('handles a missing patch field on a renamed file', async () => {
    const renamedFiles = [
      {
        filename: 'src/api/renamed.ts',
        status: 'renamed',
        additions: 0,
        deletions: 0,
      },
    ];
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(PR_PAYLOAD))
      .mockResolvedValueOnce(jsonResponse(renamedFiles));

    const pr = await fetchPr(
      { owner: 'ramboz', repo: 'pr-assistant-lab', number: 42 },
      { fetchImpl, env: { GITHUB_TOKEN: 'ghp_x' }, limiter: freshLimiter() },
    );

    expect(pr.files[0].patch).toBe('');
  });

  it('throws RateLimitedError when the limiter is empty', async () => {
    const exhausted = new RateLimiter({ capacity: 1, refillPerSecond: 0.0001 });
    exhausted.consume();

    await expect(
      fetchPr(
        { owner: 'ramboz', repo: 'pr-assistant-lab', number: 42 },
        { fetchImpl: vi.fn(), env: { GITHUB_TOKEN: 'ghp_x' }, limiter: exhausted },
      ),
    ).rejects.toBeInstanceOf(RateLimitedError);
  });
});
