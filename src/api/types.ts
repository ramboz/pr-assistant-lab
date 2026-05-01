/**
 * Public types for the GitHub API client. Shape mirrors what callers in
 * the review pipeline need, not the full upstream schema.
 */

export interface PullRequestRef {
  owner: string;
  repo: string;
  number: number;
}

export interface PullRequestMetadata {
  ref: PullRequestRef;
  title: string;
  body: string;
  author: string;
  baseRef: string;
  headRef: string;
  baseSha: string;
  headSha: string;
}

export interface FileChange {
  filename: string;
  status: 'added' | 'modified' | 'removed' | 'renamed';
  additions: number;
  deletions: number;
  patch: string;
}

export interface PullRequest {
  metadata: PullRequestMetadata;
  files: FileChange[];
}
