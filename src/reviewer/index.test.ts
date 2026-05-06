import { describe, expect, it, vi } from 'vitest';
import { runReview } from './index.js';
import type { Finding } from './types.js';
import type { PullRequest } from '../api/types.js';

const samplePr: PullRequest = {
  metadata: {
    ref: { owner: 'ramboz', repo: 'pr-assistant-lab', number: 1 },
    title: 'Add review engine',
    body: 'Wires up the persona dispatch.',
    author: 'octocat',
    baseRef: 'main',
    headRef: 'feat/review-engine',
    baseSha: 'aaa',
    headSha: 'bbb',
  },
  files: [
    {
      filename: 'src/reviewer/index.ts',
      status: 'modified',
      additions: 30,
      deletions: 0,
      patch: '@@ -1,3 +1,30 @@ ...',
    },
  ],
};

describe('runReview', () => {
  it('aggregates findings across all personas', async () => {
    const invoke = vi
      .fn()
      .mockResolvedValueOnce([
        { file: 'src/reviewer/prompt.ts', line: 14, severity: 'high', message: 'prompt injection' },
      ] satisfies Omit<Finding, 'reviewer'>[])
      .mockResolvedValueOnce([
        { file: 'src/reviewer/prompt.ts', line: 22, severity: 'low', message: 'string concat' },
      ] satisfies Omit<Finding, 'reviewer'>[])
      .mockResolvedValueOnce([
        { file: 'src/reviewer/personas.ts', line: 36, severity: 'low', message: 'single-letter param' },
      ] satisfies Omit<Finding, 'reviewer'>[]);

    const review = await runReview(samplePr, { invoke });

    expect(review.findings).toHaveLength(3);
    expect(review.findings.map((f) => f.reviewer)).toEqual([
      'security',
      'performance',
      'readability',
    ]);
    expect(review.score).toBe(10 + 1 + 1);
  });

  it('honors options.reviewers to skip personas', async () => {
    const invoke = vi.fn().mockResolvedValue([]);
    await runReview(samplePr, { invoke, reviewers: ['security'] });
    expect(invoke).toHaveBeenCalledTimes(1);
  });

  it('returns an empty review when no persona finds anything', async () => {
    const invoke = vi.fn().mockResolvedValue([]);
    const review = await runReview(samplePr, { invoke });
    expect(review.findings).toEqual([]);
    expect(review.score).toBe(0);
  });
});
