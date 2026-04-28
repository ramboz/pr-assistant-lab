# Mock PRs

> **Status: TBD.** Branches will be created as part of building out
> the M4 lab content. This directory currently holds nothing but this
> stub.

The M4 lab promises three sample pull requests learners can run
PR Assistant against. They'll be implemented as branches in this
repo, not as files in this directory. Branch names will follow the
pattern `mock-pr/<short-slug>`.

When created, the three mock PRs will represent:

1. **A small bug fix** — short diff, one or two seeded issues to
   catch. Calibration baseline: a clean review should find them.
2. **A medium-sized feature** — multi-file change, mixed signals
   (some real issues, some red herrings). Tests the reviewer's
   ability to triage.
3. **A risky refactor** — large diff touching shared code paths,
   includes design-level concerns the reviewer should flag for
   human attention rather than auto-fix.

The full set of seeded issues across these PRs will be documented in
[../SEEDED-ISSUES.md](../SEEDED-ISSUES.md) once they exist.

## Why a directory, then

The M4 lab references `MOCK-PRS/` as a known location. Keeping the
directory (with this stub) means the lab instructions don't need to
work around an absent path before the branches land. When the
branches land, this README will list them with one-line summaries.

## How to find them, when they exist

```
git branch --list 'mock-pr/*'
```

Until then, the branch list will be empty.
