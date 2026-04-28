/**
 * PR Assistant — entry point.
 *
 * This is intentionally minimal. Module 4 onward of the curriculum
 * fills in the actual implementation: GitHub API integration,
 * persona-based review sub-agents, the oracle, the Ralph loop, etc.
 *
 * For now: a stub `main` so `npm run build` produces a valid entry
 * point and `npm test` has something to type-check against.
 */

export function main(): string {
  return "PR Assistant — not yet implemented. See STARTER-NOTES.md.";
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(main());
}
