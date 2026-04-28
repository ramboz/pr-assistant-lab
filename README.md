# pr-assistant-lab

The standalone sample codebase for the **PR Assistant** project in the
[Agentic Learning Path curriculum](https://github.com/ramboz/agentic-learning-path).
Learners clone this repo and work against it from Module 4 onward.

## What this repo is for

PR Assistant is the curriculum's anchor project — a code-review tool
that grows over the course of Modules 4 through 10:

- **M4** (Writing a CLAUDE.md): write a CLAUDE.md against this repo,
  run Claude Code with and without it, compare.
- **M5** (Sub-agents): decompose review into persona sub-agents
  (security, performance, readability).
- **M6** (Oracles): build `oracle.sh` to score PR-review quality
  objectively.
- **M7** (Headless / Ralph loop): wrap PR Assistant in a Ralph loop,
  run overnight.
- **M8** (Parallel workers): race fix strategies across worktrees.
- **M9** (Agent Teams): coordinate as an Agent Team.
- **M10** (Crews / MCP): package as a GitHub Action with Slack MCP.

Read [STARTER-NOTES.md](STARTER-NOTES.md) for the project's intended
scope and what's TBD.

The seeded issues in this codebase (the bugs and design problems
PR Assistant is meant to find) are documented in
[SEEDED-ISSUES.md](SEEDED-ISSUES.md). That file is the answer key for
the M4 lab — don't read it before completing the lab unless you're
deliberately spoiling yourself.

The three sample PRs the M4 lab references will live as branches; see
[MOCK-PRS/README.md](MOCK-PRS/README.md) for the current state.

## A note on CLAUDE.md

This repo intentionally ships **without** a CLAUDE.md. Writing one is
the M4 lab exercise. If you find a `CLAUDE.md` at the root, file an
issue — it shouldn't be there.

## Quick start

Requires Node.js (version pinned in `.nvmrc`).

```
npm install
npm run build
npm test
```

The current implementation is a stub. The interesting work happens
during the labs.

## Repository layout

```
pr-assistant-lab/
├── src/              # TypeScript source — implementation grows from M4 onward
├── MOCK-PRS/         # placeholder for the three sample PRs (TBD)
├── STARTER-NOTES.md  # intended project scope, TBD-flagged sections
├── SEEDED-ISSUES.md  # answer key for what's planted (TBD)
├── package.json
├── tsconfig.json
└── .nvmrc
```

## License

To be decided.
