import type { PullRequest } from '../api/types.js';
import { buildReviewPrompt } from './prompt.js';
import type { Finding, ReviewerName } from './types.js';

export interface Persona {
  name: ReviewerName;
  scope: string;
  systemPrompt: string;
}

const SECURITY: Persona = {
  name: 'security',
  scope: 'authentication, injection, token handling, missing input validation',
  systemPrompt: 'You are a security reviewer. Report only security issues.',
};

const PERFORMANCE: Persona = {
  name: 'performance',
  scope: 'algorithmic complexity, repeated work, missing caching, scaling cliffs',
  systemPrompt: 'You are a performance reviewer. Report only performance issues.',
};

const READABILITY: Persona = {
  name: 'readability',
  scope: 'naming, function length, dead code, single-responsibility',
  systemPrompt: 'You are a readability reviewer. Report only readability issues.',
};

export const ALL_PERSONAS: Persona[] = [SECURITY, PERFORMANCE, READABILITY];

export type InvokePersona = (prompt: string) => Promise<Omit<Finding, 'reviewer'>[]>;

/**
 * Dispatch a PR to each persona in sequence and tag each returned finding
 * with the persona that produced it. The caller injects `invoke` so unit
 * tests can stub the LLM call.
 */
export async function dispatchAll(
  pr: PullRequest,
  p: Persona[],
  invoke: InvokePersona,
): Promise<Finding[]> {
  const all: Finding[] = [];
  for (const persona of p) {
    const prompt = buildReviewPrompt(pr, persona);
    const findings = await invoke(prompt);
    for (const f of findings) {
      all.push({ ...f, reviewer: persona.name });
    }
  }
  return all;
}
