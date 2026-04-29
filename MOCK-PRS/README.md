# Mock PRs

Three sample pull requests learners run PR Assistant against in the
M4 lab. They're implemented as branches in this repo, not as files
in this directory. Branch names follow the pattern
`mock-pr/<short-slug>`.

The full set of seeded issues across these PRs is documented in
[../SEEDED-ISSUES.md](../SEEDED-ISSUES.md). Don't read it before
completing the lab unless you're deliberately spoiling yourself.

## The three PRs

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
