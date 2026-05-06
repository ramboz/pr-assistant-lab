import { describe, expect, it, vi } from 'vitest';
import { ALL_PERSONAS, dispatchAll } from './personas.js';
import type { PullRequest } from '../api/types.js';

const pr: PullRequest = {
  metadata: {
    ref: { owner: 'ramboz', repo: 'pr-assistant-lab', number: 1 },
    title: 't',
    body: '',
    author: 'a',
    baseRef: 'main',
    headRef: 'feat',
    baseSha: 'aaa',
    headSha: 'bbb',
  },
  files: [
    {
      filename: 'src/reviewer/index.ts',
      status: 'modified',
      additions: 5,
      deletions: 0,
      patch: '@@ ...',
    },
  ],
};

describe('dispatchAll', () => {
  it('tags every finding with the persona that produced it', async () => {
    const invoke = vi.fn().mockResolvedValue([
      { file: 'x.ts', line: 1, severity: 'low', message: 'note' },
    ]);
    const findings = await dispatchAll(pr, ALL_PERSONAS, invoke);
    expect(findings.map((f) => f.reviewer)).toEqual([
      'security',
      'performance',
      'readability',
    ]);
  });

  it('invokes once per persona', async () => {
    const invoke = vi.fn().mockResolvedValue([]);
    await dispatchAll(pr, ALL_PERSONAS, invoke);
    expect(invoke).toHaveBeenCalledTimes(ALL_PERSONAS.length);
  });
});
