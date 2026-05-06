import { describe, expect, it } from 'vitest';
import { runReview } from './index.js';
import type { PullRequest } from '../api/types.js';

const samplePr: PullRequest = {
  metadata: {
    ref: { owner: 'ramboz', repo: 'pr-assistant-lab', number: 1 },
    title: 'Add review engine',
    body: 'Stub PR for the reviewer subsystem.',
    author: 'octocat',
    baseRef: 'main',
    headRef: 'feat/review-engine',
    baseSha: 'aaa',
    headSha: 'bbb',
  },
  files: [],
};

describe('runReview', () => {
  it('returns an empty review from the stub', async () => {
    const review = await runReview(samplePr);
    expect(review.findings).toEqual([]);
    expect(review.score).toBe(0);
    expect(review.pr.title).toBe('Add review engine');
  });
});
