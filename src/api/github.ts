import { buildAuthHeader, getGithubToken } from './auth.js';
import type {
  FileChange,
  PullRequest,
  PullRequestMetadata,
  PullRequestRef,
} from './types.js';

const GITHUB_API_BASE = 'https://api.github.com';

export class GithubApiError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(`GitHub API error ${status}: ${message}`);
    this.name = 'GithubApiError';
    this.status = status;
  }
}

export interface FetchPrOptions {
  fetchImpl?: typeof fetch;
  env?: NodeJS.ProcessEnv;
}

/**
 * Fetch a pull request's metadata and file-by-file diff. Two REST calls:
 * one for the PR object, one for the files list. Caller passes a custom
 * fetch implementation in tests; production uses the global one.
 */
export async function fetchPr(
  ref: PullRequestRef,
  options: FetchPrOptions = {},
): Promise<PullRequest> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const token = getGithubToken(options.env);
  const headers = {
    Accept: 'application/vnd.github+json',
    Authorization: buildAuthHeader(token),
    'X-GitHub-Api-Version': '2022-11-28',
  };

  const prUrl = `${GITHUB_API_BASE}/repos/${ref.owner}/${ref.repo}/pulls/${ref.number}`;
  const prResponse = await fetchImpl(prUrl, { headers });
  if (!prResponse.ok) {
    throw new GithubApiError(prResponse.status, await prResponse.text());
  }
  const prJson = (await prResponse.json()) as RawPullRequest;

  const filesUrl = `${prUrl}/files?per_page=100`;
  const filesResponse = await fetchImpl(filesUrl, { headers });
  if (!filesResponse.ok) {
    throw new GithubApiError(filesResponse.status, await filesResponse.text());
  }
  const filesJson = (await filesResponse.json()) as RawFile[];

  return {
    metadata: toMetadata(ref, prJson),
    files: filesJson.map(toFileChange),
  };
}

function toMetadata(ref: PullRequestRef, raw: RawPullRequest): PullRequestMetadata {
  return {
    ref,
    title: raw.title,
    body: raw.body ?? '',
    author: raw.user?.login ?? 'unknown',
    baseRef: raw.base.ref,
    headRef: raw.head.ref,
    baseSha: raw.base.sha,
    headSha: raw.head.sha,
  };
}

function toFileChange(raw: RawFile): FileChange {
  return {
    filename: raw.filename,
    status: raw.status,
    additions: raw.additions,
    deletions: raw.deletions,
    patch: raw.patch ?? '',
  };
}

interface RawPullRequest {
  title: string;
  body: string | null;
  user: { login: string } | null;
  base: { ref: string; sha: string };
  head: { ref: string; sha: string };
}

interface RawFile {
  filename: string;
  status: 'added' | 'modified' | 'removed' | 'renamed';
  additions: number;
  deletions: number;
  patch?: string;
}
