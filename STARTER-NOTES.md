# Starter notes — PR Assistant

The intended scope of the PR Assistant project. Light on detail; more
gets filled in as Modules 4 through 10 of the curriculum take shape.

## What PR Assistant is meant to do

A GitHub PR review tool. Given a pull request, it produces a structured
review that flags:

- **Bugs** — likely defects in the diff
- **Style issues** — deviations from the repo's conventions
- **Design problems** — architectural concerns the diff introduces
- **Security concerns** — common vulnerabilities (OWASP-style)
- **Performance concerns** — obvious inefficiencies

The goal is not to replace a human reviewer. It's to catch the cheap,
mechanical issues so the human reviewer's attention goes to the parts
that need judgment.

## Architecture sketch

A single CLI entry point (eventually) plus three layers:

1. **GitHub API integration.** Fetch PR metadata, the diff, and the
   commit history. Lives under `src/api/` (added at M5): `github.ts`
   for the REST client, `auth.ts` for token handling, `types.ts` for
   the shapes. Uses the global `fetch` from Node 22; no third-party
   HTTP client.
2. **Review generation.** Multiple persona sub-agents (security,
   performance, readability) coordinated from a single Claude Code
   session. Persona definitions: TBD by M5.
3. **Oracle.** A composite score combining CI status, lint, coverage
   delta, and seeded-issue-detection rate. Implementation: TBD by M6.

## What ships in this repo

- The codebase under review (the thing PR Assistant runs against).
- Seeded bugs and style violations that PR Assistant is meant to
  detect. See [SEEDED-ISSUES.md](SEEDED-ISSUES.md).
- Sample PRs as branches under [`MOCK-PRS/`](MOCK-PRS/) the curriculum
  lab uses.
- Eventually: the PR Assistant implementation itself, built during the
  curriculum.

## What does NOT ship in this repo

- A CLAUDE.md (writing one is the M4 lab).
- Any module-specific instructions (those live in the curriculum repo).

## Open questions, TBD by curriculum module

- **M4:** What's the minimal viable CLAUDE.md for this project? What's
  the contrast between running Claude Code with and without it?
- **M5:** How to scope tool permissions per persona sub-agent? Do
  personas share state, or work from independent context?
- **M6:** What's in the composite oracle? Lint config, coverage
  threshold, seeded-issue detection rate, CI status. Weights TBD by
  the lab.
- **M7:** Ralph-loop budget controls. Maximum runtime per attempt,
  maximum total spend.
- **M8:** Worktree strategy. One agent per fix-strategy branch, or
  one agent per file?
- **M9:** Agent Team composition. Lead + how many teammates? How
  does the lead allocate work?
- **M10:** Which MCP servers to integrate? Slack for notifications is
  the obvious one; what else earns its place?

## Tech stack constraints

These are settled:

- TypeScript with strict mode
- ESM module system
- Vitest for tests
- Node 22.x (current LTS)

These are TBD:

- CLI framework (or roll our own)
- Output format (terminal-only, JSON, GitHub PR comment)
- Deployment target (local CLI, GitHub Action, both)

## Where to fill in detail

This file gets longer as M4 through M10 land. When a TBD becomes a
decision, update the relevant section here. Don't let the file grow
unbounded — if a section needs depth beyond a paragraph, split it
into its own doc and link from here.
