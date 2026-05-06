import type { Finding } from './types.js';

const WEIGHTS = { high: 10, medium: 3, low: 1 } as const;

/**
 * Convert a list of findings into a single review score. Higher scores
 * indicate more or more-severe findings; a clean review scores zero.
 */
export function scoreFindings(findings: Finding[]): number {
  return findings.reduce((sum, f) => sum + WEIGHTS[f.severity], 0);
}
