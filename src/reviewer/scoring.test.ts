import { describe, expect, it } from 'vitest';
import { scoreFindings } from './scoring.js';
import type { Finding } from './types.js';

const findings: Finding[] = [
  { reviewer: 'security', file: 'a.ts', line: 1, severity: 'high', message: 'h' },
  { reviewer: 'performance', file: 'b.ts', line: 2, severity: 'medium', message: 'm' },
  { reviewer: 'readability', file: 'c.ts', line: 3, severity: 'low', message: 'l' },
];

describe('scoreFindings', () => {
  it('weights high > medium > low', () => {
    expect(scoreFindings(findings)).toBe(10 + 3 + 1);
  });

  it('returns zero for an empty list', () => {
    expect(scoreFindings([])).toBe(0);
  });
});
