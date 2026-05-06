import type { PullRequest } from '../api/types.js';
import type { Review, ReviewOptions } from './types.js';

export type { Finding, Review, ReviewerName, ReviewOptions, Severity } from './types.js';

/**
 * Run the configured persona reviewers against a PR and aggregate their
 * findings into a single review. The stub returns an empty review; the
 * mock-pr/add-review-engine branch fills in the persona dispatch,
 * prompt construction, and scoring.
 */
export async function runReview(
  pr: PullRequest,
  options: ReviewOptions = {},
): Promise<Review> {
  void options;
  return {
    pr: pr.metadata,
    findings: [],
    score: 0,
  };
}
