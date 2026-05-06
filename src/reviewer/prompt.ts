import type { FileChange, PullRequest } from '../api/types.js';
import type { Persona } from './personas.js';

/**
 * Build the prompt sent to one persona for a single PR review.
 * The persona's instructions go first, followed by the PR title, body,
 * and a textual rendering of every file change.
 */
export function buildReviewPrompt(pr: PullRequest, persona: Persona): string {
  return [
    persona.systemPrompt,
    `Scope: ${persona.scope}`,
    '',
    `PR title: ${pr.metadata.title}`,
    `PR body: ${pr.metadata.body}`,
    '',
    'Files changed:',
    formatFiles(pr.files),
  ].join('\n');
}

/**
 * Format a list of file changes for inclusion in the prompt.
 */
export function formatFiles(files: FileChange[]): string {
  let out = '';
  for (const file of files) {
    out += `\n--- ${file.filename} (${file.status}, +${file.additions}/-${file.deletions}) ---\n`;
    out += file.patch;
    out += '\n';
  }
  return out;
}
