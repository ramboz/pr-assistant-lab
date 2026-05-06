# Mock PRs

Sample pull requests learners run PR Assistant against in the
Module 4, 5, and 6 labs. They're implemented as branches in this
repo, not as files in this directory. Branch names follow the
pattern `mock-pr/<short-slug>`.

The first three (`fix-link-parsing`, `add-toc`, `extract-plugins`)
are the M4 lab set: review-quality calibration on the markdown
renderer. The next two (`api-rate-limiting`, `tests-fixture-overhaul`)
are the M5 lab set: scope-disjoint diffs that let a learner observe
which path-scoped rules load for which file changes. The sixth
(`add-review-engine`) is the M6 lab set: the diff three persona
sub-agents review side-by-side against the M5 rules-only baseline.

The full set of seeded issues across these PRs is documented in
[../SEEDED-ISSUES.md](../SEEDED-ISSUES.md). Don't read it before
completing the lab unless you're deliberately spoiling yourself.

## The PRs

### `mock-pr/fix-link-parsing` — small bug fix

Widens the link regex in `markdown.ts` to allow balanced parens inside
URLs (e.g. Wikipedia disambiguation links). Short diff (~20 lines)
across `src/markdown.ts` and `src/markdown.test.ts`. Two seeded
issues, both pivoting around what disappeared in the simplification.
Calibration baseline: a clean review should find them.

### `mock-pr/add-toc` — medium-sized feature

Adds a `--toc` CLI flag and a `withToc` render option that prepend a
generated `<nav>` table of contents. Headings get slugified anchor
IDs. Multi-file change (~100 lines) across `src/toc.ts` (new),
`src/markdown.ts`, `src/index.ts`, `src/types.ts`, `src/cli.ts`, and
the test file. Five seeded issues spanning security, design,
correctness, performance, and style. Tests the reviewer's ability to
triage across categories.

### `mock-pr/extract-plugins` — risky refactor

Introduces a plugin system. Inline-rendering rules are extracted into
a registry; plugins can also override sanitization. Larger diff
(~140 lines) touching `src/markdown.ts`, `src/index.ts`,
`src/types.ts`, plus the new `src/plugins.ts` and `src/plugins.test.ts`.
Six seeded issues, several at the design level (circular dependency,
async/sync race, unsafe extension points). The kind of change
where a reviewer should slow down and flag for human attention
rather than auto-fix.

### `mock-pr/api-rate-limiting` — small feature, scoped to `src/api/`

Adds a token-bucket rate limiter in front of the GitHub client.
Diff (~80 lines) is confined to `src/api/github.ts`,
`src/api/github.test.ts`, and a new `src/api/rate-limiter.ts` plus
its test. Two seeded issues. Useful to the M5 lab because the diff
fits cleanly under a single `src/api/**` glob: the api rule should
load, the tests rule should load (test files are touched), and
rules scoped elsewhere stay dormant.

### `mock-pr/tests-fixture-overhaul` — refactor, scoped to test files

Pulls inline test fixtures out into a shared `src/test-fixtures.ts`
module and updates several `*.test.ts` files to import from it.
Diff (~60 lines) touches only test files plus the new fixtures
module. Two seeded issues. Useful to the M5 lab because only the
tests rule should load; api, markdown, and any other path-scoped
rules stay dormant.

### `mock-pr/add-review-engine` — medium feature, scoped to `src/reviewer/`

Fleshes out the `src/reviewer/` subsystem from the empty stub on
`main` into a working orchestrator: persona definitions, prompt
builder, scoring helper, and the `runReview` orchestration on top.
Diff (~200 lines) touches `src/reviewer/index.ts` and adds
`src/reviewer/personas.ts`, `src/reviewer/prompt.ts`,
`src/reviewer/scoring.ts` plus their tests. Six seeded issues, two
each in security, performance, and readability scope. Used by the
M6 lab as the diff three persona sub-agents review side-by-side,
with a direct comparison against the M5 rules-only baseline.

## How to find them locally

```
git branch --list 'mock-pr/*'
```

Each branch is forked off `main` directly; they don't depend on each
other. Check one out and review its diff against `main`:

```
git checkout mock-pr/fix-link-parsing
git log main..HEAD --stat
git diff main...HEAD
```
