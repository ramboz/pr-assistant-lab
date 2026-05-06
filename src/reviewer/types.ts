/**
 * Public types for the review engine. The engine takes a fetched pull
 * request, dispatches it to the configured persona reviewers, and returns
 * a single aggregated review.
 */

import type { PullRequestMetadata } from '../api/types.js';

export type Severity = 'high' | 'medium' | 'low';
export type ReviewerName = 'security' | 'performance' | 'readability';

export interface Finding {
  reviewer: ReviewerName;
  file: string;
  line: number;
  severity: Severity;
  message: string;
}

export interface Review {
  pr: PullRequestMetadata;
  findings: Finding[];
  score: number;
}

export interface ReviewOptions {
  reviewers?: ReviewerName[];
}
