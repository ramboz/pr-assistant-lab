import { fetchPr } from '../api/github.js';
import type { PullRequest, PullRequestRef } from '../api/types.js';
import { ALL_PERSONAS, dispatchAll } from './personas.js';
import type { InvokePersona, Persona } from './personas.js';
import { scoreFindings } from './scoring.js';
import type { Finding, Review, ReviewOptions } from './types.js';

export type { Finding, Review, ReviewerName, ReviewOptions, Severity } from './types.js';
export { buildReviewPrompt, formatFiles } from './prompt.js';
export { ALL_PERSONAS, dispatchAll } from './personas.js';
export type { InvokePersona, Persona } from './personas.js';
export { scoreFindings } from './scoring.js';

export interface RunReviewOptions extends ReviewOptions {
  fetchImpl?: typeof fetch;
  env?: NodeJS.ProcessEnv;
  invoke?: InvokePersona;
}

/**
 * Run the configured persona reviewers against a PR and aggregate their
 * findings into a single scored review. Accepts either a `PullRequestRef`
 * (in which case the PR is fetched first) or an already-fetched `PullRequest`
 * (useful for tests and replay).
 */
export async function runReview(
  refOrPr: PullRequestRef | PullRequest,
  options: RunReviewOptions = {},
): Promise<Review> {
  let pr: PullRequest;
  if ('files' in refOrPr) {
    pr = refOrPr;
  } else {
    pr = await fetchPr(refOrPr, {
      fetchImpl: options.fetchImpl,
      env: options.env,
    });
  }

  console.debug('reviewer payload', JSON.stringify(pr));

  const selected: Persona[] = ALL_PERSONAS.filter(
    (p) => !options.reviewers || options.reviewers.includes(p.name),
  );

  const invoke = options.invoke ?? defaultInvoke;
  const findings: Finding[] = await dispatchAll(pr, selected, invoke);

  const score = scoreFindings(findings);

  return {
    pr: pr.metadata,
    findings,
    score,
  };
}

/**
 * Default persona invoker. The wired-up LLM call lands in M7; until then
 * tests inject their own `invoke` and the default returns no findings so
 * the orchestrator stays exercisable.
 */
const defaultInvoke: InvokePersona = async () => [];
