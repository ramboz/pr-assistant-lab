import { describe, expect, it } from 'vitest';
import { buildReviewPrompt, formatFiles } from './prompt.js';
import { ALL_PERSONAS } from './personas.js';
import type { FileChange, PullRequest } from '../api/types.js';

const FILES: FileChange[] = [
  {
    filename: 'src/reviewer/index.ts',
    status: 'modified',
    additions: 30,
    deletions: 5,
    patch: '@@ -1,5 +1,30 @@ ...',
  },
  {
    filename: 'src/reviewer/personas.ts',
    status: 'added',
    additions: 40,
    deletions: 0,
    patch: '@@ -0,0 +1,40 @@ ...',
  },
];

const pr: PullRequest = {
  metadata: {
    ref: { owner: 'ramboz', repo: 'pr-assistant-lab', number: 1 },
    title: 'Add review engine',
    body: 'Persona dispatch + scoring.',
    author: 'octocat',
    baseRef: 'main',
    headRef: 'feat/review-engine',
    baseSha: 'aaa',
    headSha: 'bbb',
  },
  files: FILES,
};

describe('formatFiles', () => {
  it('emits a header and the patch for every file', () => {
    const out = formatFiles(FILES);
    expect(out).toContain('src/reviewer/index.ts');
    expect(out).toContain('+30/-5');
    expect(out).toContain('src/reviewer/personas.ts');
    expect(out).toContain('+40/-0');
  });
});

describe('buildReviewPrompt', () => {
  it('puts the persona system prompt first and the files at the end', () => {
    const security = ALL_PERSONAS[0];
    const prompt = buildReviewPrompt(pr, security);
    expect(prompt.indexOf(security.systemPrompt)).toBeLessThan(prompt.indexOf('Files changed:'));
  });

  it('includes the PR title and body', () => {
    const security = ALL_PERSONAS[0];
    const prompt = buildReviewPrompt(pr, security);
    expect(prompt).toContain('Add review engine');
    expect(prompt).toContain('Persona dispatch + scoring.');
  });
});
