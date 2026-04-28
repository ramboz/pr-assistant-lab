# Seeded issues — answer key

> **Status: TBD.** Filled in when the actual seeded issues land in
> the codebase as part of building out the M4-M10 lab content. Do not
> edit prematurely.

This file is the answer key for the bugs, style violations, and
design problems planted in this codebase for PR Assistant to find.

The M4 lab references this file as the canonical source of truth for
"what was PR Assistant supposed to catch." Don't read it before
completing the lab unless you're deliberately spoiling yourself.

## Format (when filled in)

For each seeded issue, this file will document:

| Field | Description |
|---|---|
| **ID** | Stable identifier, e.g. `BUG-001`, `STYLE-003`, `DESIGN-002` |
| **Category** | Bug / Style / Design / Security / Performance |
| **Severity** | Low / Medium / High |
| **Location** | File path and line range |
| **What's wrong** | The defect, in plain language |
| **How PR Assistant should detect it** | The signal a reviewer (human or agent) would key on |
| **Introduced by** | The lab module that added it (M4, M5, etc.) — or "initial" if always present |

## Categories planned

When seeding starts, expect a mix of:

- **Bugs:** off-by-one errors, null/undefined handling, async race conditions
- **Style:** naming inconsistencies, dead code, magic numbers
- **Design:** poorly-scoped functions, unclear ownership, leaky abstractions
- **Security:** unvalidated input, missing escape, dangerous defaults
- **Performance:** N+1 patterns, unbounded loops, memory leaks

The seeding density and difficulty are calibrated against the M6
oracle (which uses seeded-issue detection rate as one of its
composite metrics).

## When this file gets filled

By the time the M4 lab ships. Until then, this is a stub.
