# Seeded issues — answer key

This file is the answer key for the bugs, style violations, and design
problems planted in this codebase for PR Assistant to find.

The M4 lab references this file as the canonical source of truth for
"what was PR Assistant supposed to catch." Don't read it before
completing the lab unless you're deliberately spoiling yourself.

## Issue index

17 issues across five mock PRs. The first three branches are the
M4 lab set; `mock-pr/api-rate-limiting` and
`mock-pr/tests-fixture-overhaul` are the M5 lab set.

| ID            | Category    | Severity | Branch                          |
|---------------|-------------|----------|---------------------------------|
| PR1-SEC-001   | Security    | High     | mock-pr/fix-link-parsing        |
| PR1-BUG-001   | Bug         | Low      | mock-pr/fix-link-parsing        |
| PR2-SEC-001   | Security    | High     | mock-pr/add-toc                 |
| PR2-DESIGN-001| Design      | Medium   | mock-pr/add-toc                 |
| PR2-BUG-001   | Bug         | Medium   | mock-pr/add-toc                 |
| PR2-PERF-001  | Performance | Low      | mock-pr/add-toc                 |
| PR2-STYLE-001 | Style       | Low      | mock-pr/add-toc                 |
| PR3-DESIGN-001| Design      | High     | mock-pr/extract-plugins         |
| PR3-BUG-001   | Bug         | High     | mock-pr/extract-plugins         |
| PR3-SEC-001   | Security    | High     | mock-pr/extract-plugins         |
| PR3-DESIGN-002| Design      | Medium   | mock-pr/extract-plugins         |
| PR3-PERF-001  | Performance | Medium   | mock-pr/extract-plugins         |
| PR3-STYLE-001 | Style       | Low      | mock-pr/extract-plugins         |
| PR4-BUG-001   | Bug         | High     | mock-pr/api-rate-limiting       |
| PR4-DESIGN-001| Design      | Medium   | mock-pr/api-rate-limiting       |
| PR5-DESIGN-001| Design      | Medium   | mock-pr/tests-fixture-overhaul  |
| PR5-BUG-001   | Bug         | Low      | mock-pr/tests-fixture-overhaul  |

---

## PR 1 — `mock-pr/fix-link-parsing`

A small bug fix: the link regex is widened to allow balanced parens
inside URLs (e.g. Wikipedia disambiguation links). The diff is
intentionally tight; both seeded issues live in the same change.

### PR1-SEC-001 — Safe-URL guard removed

- **Category:** Security
- **Severity:** High
- **Location:** `src/markdown.ts`, `renderInline()` link branch
- **What's wrong:** The diff replaces the link-rendering closure with a
  bare `replace(LINK_PATTERN, '<a href="$2">$1</a>')`, dropping the
  `SAFE_URL_PATTERN` check that previously rejected `javascript:`,
  `data:`, and other non-allow-listed schemes. The unit test
  `strips unsafe link schemes` was renamed to
  `renders links regardless of scheme` and rewritten to assert the
  insecure behavior, which masks the regression in CI.
- **How PR Assistant should detect it:** Diff shows the closure being
  replaced by a string template; `SAFE_URL_PATTERN` is now an unused
  constant; the test was changed to assert the *new* behavior rather
  than fix the regression.

### PR1-BUG-001 — No regression test for the bug being fixed

- **Category:** Bug (test coverage)
- **Severity:** Low
- **Location:** `src/markdown.test.ts`
- **What's wrong:** The PR claims to fix link rendering when the URL
  contains parentheses (e.g. `[Wikipedia](https://en.wikipedia.org/wiki/Foo_(bar))`),
  but adds no test exercising this case. Existing tests pass but
  nothing locks in the new behavior, so the next refactor could
  regress silently.
- **How PR Assistant should detect it:** The commit message describes
  a specific input that should now work; no test in the diff (or in
  the existing test file) asserts that input renders correctly.

---

## PR 2 — `mock-pr/add-toc`

A medium feature: adds a `--toc` CLI flag and a `withToc` render
option that prepend a generated `<nav>` table of contents. Headings
get slugified anchor IDs.

### PR2-SEC-001 — XSS via unescaped heading text in the TOC

- **Category:** Security
- **Severity:** High
- **Location:** `src/toc.ts`, `generateToc()`
- **What's wrong:** Heading text is interpolated directly into the TOC
  HTML without escaping:
  `<a href="#${slugify(h.text)}">${h.text}</a>`. A heading like
  `## Bug <script>alert(1)</script>` produces a TOC entry with a live
  script tag. The renderer escapes heading content elsewhere
  (`renderInline` calls `escapeHtml`), so the TOC is the only place
  this leak exists.
- **How PR Assistant should detect it:** Compare TOC HTML construction
  against `renderHeading` in `markdown.ts`; the latter escapes via
  `renderInline`, the former does not.

### PR2-DESIGN-001 — TOC bolted into `renderMarkdown`

- **Category:** Design
- **Severity:** Medium
- **Location:** `src/markdown.ts`, `renderMarkdown()` signature and body
- **What's wrong:** TOC generation is spliced into `renderMarkdown` via
  a `withToc` option. The function now does two unrelated things
  (render a markdown body and prepend a TOC). A cleaner design would
  expose `generateToc()` separately and let `renderPost` (or the CLI)
  concatenate the two outputs.
- **How PR Assistant should detect it:** `renderMarkdown` now takes
  options and conditionally calls `generateToc`; the responsibilities
  diverge (rendering vs. layout), and the option only affects what
  comes *before* the rendered body.

### PR2-BUG-001 — Headings deeper than level 3 silently dropped

- **Category:** Bug
- **Severity:** Medium
- **Location:** `src/toc.ts` (`MAX_DEPTH`) and `src/markdown.ts`
  (`renderHeading` id branch)
- **What's wrong:** `generateToc` filters `level > MAX_DEPTH` (== 3)
  with no warning, no documentation in the option, and no
  configuration. Deep-nested posts lose entries from their TOC with no
  surfaced signal. Compounding it: `renderHeading` only emits an `id`
  attribute for `level <= 3`, so even if the user knew about the
  filter, anchor links would fail for h4-h6.
- **How PR Assistant should detect it:** The `MAX_DEPTH` constant is
  applied without a warning path; the option type doesn't expose it as
  configurable; no test covers level-4+ headings.

### PR2-PERF-001 — Headings scanned twice

- **Category:** Performance
- **Severity:** Low
- **Location:** `src/toc.ts`, `collectHeadings()` vs.
  `src/markdown.ts`, main rendering loop
- **What's wrong:** `collectHeadings` does its own `source.split('\n')`
  pass to find headings. The renderer's main loop already iterates
  every line and identifies headings via `HEADING_PATTERN`. Headings
  could be collected during rendering and emitted as a side-output;
  doing it as a separate pre-pass doubles the line scan.
- **How PR Assistant should detect it:** Two independent calls to
  `source.split('\n')` and `HEADING_PATTERN.exec` for the same input.

### PR2-STYLE-001 — Magic number `3` duplicated

- **Category:** Style
- **Severity:** Low
- **Location:** `src/toc.ts` (`MAX_DEPTH = 3`) and `src/markdown.ts`
  (`level <= 3` in `renderHeading`)
- **What's wrong:** The TOC depth limit appears as a named constant in
  one file and as a literal `3` in the other. Changing the limit
  requires editing two files; the two checks can drift.
- **How PR Assistant should detect it:** Search for `3` in the diff;
  the literal in `markdown.ts` should reference `MAX_DEPTH` (exported
  from `toc.ts`) or be replaced by a shared constant.

---

## PR 3 — `mock-pr/extract-plugins`

A risky refactor: introduces a plugin system. Inline transforms move
into a registry; plugins can also override the sanitizer. The diff
touches the renderer, sanitization, and the public API.

### PR3-DESIGN-001 — Circular dependency: `markdown.ts` ↔ `plugins.ts`

- **Category:** Design
- **Severity:** High
- **Location:** `src/markdown.ts` (`import { applyInline } from './plugins.js'`)
  and `src/plugins.ts` (`import { defaultInlineRules } from './markdown.js'`)
- **What's wrong:** Both modules import a *value* from the other at
  module load. ESM circular value imports are fragile: depending on
  load order, one side observes `undefined` exports during
  initialization. Today this happens to work because both values are
  used inside functions called at runtime, not at module load — but a
  small refactor (e.g., evaluating a default plugin list at the top of
  `plugins.ts`) would break the build.
- **How PR Assistant should detect it:** Trace the import graph;
  `markdown.ts → plugins.ts → markdown.ts` is a cycle. ESLint's
  `import/no-cycle` rule would flag this directly.

### PR3-BUG-001 — Async plugin registration called synchronously

- **Category:** Bug
- **Severity:** High
- **Location:** `src/plugins.ts`, bottom of file (auto-registration of
  `markdown-core`)
- **What's wrong:** `registerPlugin` is `async` (it `await`s
  `validatePlugin`). The auto-registration of the `markdown-core`
  plugin at module load is *not* awaited:
  `registerPlugin({ name: 'markdown-core', ... });`. There's a
  microtask gap between module evaluation and the plugin actually
  appearing in the registry. Synchronous code that runs immediately
  after the import (any code path that doesn't yield to the event
  loop first) sees an empty registry. Tests happen to work because
  vitest yields between cases, but production callers may not.
- **How PR Assistant should detect it:** `registerPlugin` returns a
  `Promise<void>`; the call site at the bottom of `plugins.ts`
  discards it. Either `await` is needed (which means top-level await,
  changing the module shape), or the validation needs to be
  synchronous. There's also a deliberate `it.skip` in
  `plugins.test.ts` (`'markdown-core is registered synchronously
  after import'`) flagging the same issue, with a TODO comment
  acknowledging it.

### PR3-SEC-001 — Plugins can override the sanitizer with no restriction

- **Category:** Security
- **Severity:** High
- **Location:** `src/plugins.ts`, `applySanitize()`
- **What's wrong:** `applySanitize` walks the pipeline and returns
  `plugin.sanitize(html)` for the *first* plugin that defines it,
  bypassing the default sanitizer entirely. A plugin can return its
  input unchanged (effectively disabling sanitization) and any later
  plugins (or the default) are skipped. Sanitization should be
  composable and the default should always run.
- **How PR Assistant should detect it:** The early `return` inside the
  loop short-circuits the rest of the pipeline and the default
  sanitizer; sanitization isn't additive.

### PR3-DESIGN-002 — `getPlugins()` returns the live registry

- **Category:** Design
- **Severity:** Medium
- **Location:** `src/plugins.ts`, `getPlugins()`
- **What's wrong:** `getPlugins()` returns the `registry` array
  directly. Callers can mutate the internal state of the plugin
  system: push, splice, reorder, replace plugins on the fly with no
  validation. Should return a defensive copy or a readonly view.
- **How PR Assistant should detect it:** The function body is
  `return registry`; no copy, no `Object.freeze`, no readonly type.

### PR3-PERF-001 — Pipeline rebuilt on every render call

- **Category:** Performance
- **Severity:** Medium
- **Location:** `src/plugins.ts`, `buildPipeline()` called from
  `applyInline()` and `applySanitize()`
- **What's wrong:** Every `applyInline` and `applySanitize` call
  copies the registry and sorts it by priority. For typical usage
  (many inline transforms per render, many renders per process),
  this allocates and sorts on every call. The pipeline is invariant
  between registrations; cache it and invalidate on
  `registerPlugin` / `addRule`.
- **How PR Assistant should detect it:** `buildPipeline` allocates
  (`[...registry].sort(...)`) and is called from the hot path
  (`applyInline` runs once per inline render).

### PR3-STYLE-001 — Inconsistent registration API

- **Category:** Style
- **Severity:** Low
- **Location:** `src/plugins.ts`, `registerPlugin()` and `addRule()`
- **What's wrong:** Two functions register into the same registry but
  with different signatures, different async semantics
  (`registerPlugin` is async, `addRule` is sync), and different
  parameter shapes. Either consolidate to one entry point or rename
  for clarity (e.g., `addInlineRule` vs `registerPlugin`).
- **How PR Assistant should detect it:** Two exported functions push
  into the same `registry` array; signatures and async-ness diverge
  with no documented reason.

---

---

## PR 4 — `mock-pr/api-rate-limiting`

A small feature: add a token-bucket rate limiter in front of the
GitHub client. Diff confined to `src/api/`. Used by the M5 lab to
demonstrate that an API-scoped rule loads here while a markdown-scoped
rule stays dormant.

### PR4-BUG-001 — Token bucket never refills under sustained load

- **Category:** Bug
- **Severity:** High
- **Location:** `src/api/rate-limiter.ts`, `consume()`
- **What's wrong:** The refill computation uses `Date.now() - this.lastRefill`
  but only updates `this.lastRefill` when a token is *actually consumed*,
  not on every call. Under a stream of `consume()` calls that all return
  false (bucket empty), the elapsed-time delta keeps growing but never
  resets, and the next successful consume jumps the bucket past its
  capacity. Easy to mis-test because single-call tests work; only a
  rapid loop exposes it.
- **How PR Assistant should detect it:** `consume()` reads
  `this.lastRefill` on every call but only writes to it inside the
  success branch. The classic "update timestamp regardless" pattern is
  missing.

### PR4-DESIGN-001 — Limiter coupled to wall-clock time

- **Category:** Design
- **Severity:** Medium
- **Location:** `src/api/rate-limiter.ts`, constructor and `consume()`
- **What's wrong:** The class calls `Date.now()` directly. Tests have
  to stub the global, and the implementation can't be reused with a
  fake clock for deterministic behavior in batch-replay mode (a use
  case M8 needs). A `now: () => number` constructor option, defaulting
  to `Date.now`, would have made the class testable and replayable
  without monkey-patching.
- **How PR Assistant should detect it:** No injected clock; tests
  resort to `vi.useFakeTimers()` or `vi.spyOn(Date, 'now')`. The
  testing pain is the design signal.

---

## PR 5 — `mock-pr/tests-fixture-overhaul`

A test refactor: pull inline fixtures out into `src/test-fixtures.ts`
and update several `*.test.ts` files to import from it. Used by the
M5 lab as the counterpart to the API PR — the diff lives entirely
under the tests glob, so a tests-scoped rule should load and an
API-scoped rule should stay dormant.

### PR5-DESIGN-001 — Fixture module imports from production code

- **Category:** Design
- **Severity:** Medium
- **Location:** `src/test-fixtures.ts`, top of file
- **What's wrong:** `test-fixtures.ts` lives under `src/` (so it
  ships in `dist/`) and imports `parsePost` from the production
  module to *generate* fixtures. The production bundle now contains
  test-only data, and a circular dependency lurks if any production
  code ever imports from a future helper that itself reaches into
  fixtures. Either move fixtures to a `tests/` tree outside `rootDir`,
  or add the file to `tsconfig.json`'s `exclude` list and import it
  via a relative `../` from each test.
- **How PR Assistant should detect it:** A `*-fixtures.ts` file
  shipped under `src/`, imported only by `*.test.ts` files, with no
  exclusion from the TypeScript build.

### PR5-BUG-001 — Fixture mutates a shared object across tests

- **Category:** Bug
- **Severity:** Low
- **Location:** `src/test-fixtures.ts`, `samplePost`
- **What's wrong:** `samplePost` is exported as a single object
  literal. Tests that need to tweak a field (e.g. adding a tag,
  changing the title) push into `samplePost.frontMatter.tags`
  directly rather than spreading first. Test order then matters:
  an earlier test that pushes into `tags` leaks into later tests.
  Hidden today because the test runner happens to load files
  alphabetically and the tweaking tests sit late in the order.
- **How PR Assistant should detect it:** Test code that mutates a
  shared exported fixture without cloning. The fixture should be a
  factory function (`makeSamplePost()`) or each test should spread
  before tweaking.

---

## What's *not* a seeded issue (red herrings)

A few things in the codebase look suspicious but are intentional:

- **The simple inline-format escaping (`escapeHtml` then regex)** in
  `markdown.ts` is order-sensitive. A reviewer may flag this. It's
  intentionally simple to keep the renderer small; a real renderer
  would tokenize first. Acknowledged trade-off, not a seeded issue.
- **The CLI's `argv` parser is positional and minimal.** Looks fragile
  but is consistent with the project's "small CLI" scope.
- **`parsePost` accepts unterminated front-matter as an error** rather
  than gracefully degrading. Intentional — the throw is the contract.

If a reviewer finds these and flags them, that's a calibration data
point, not a miss.
