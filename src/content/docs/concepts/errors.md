---
title: "Errors"
section: "concepts"
description: "Strata's error contract: stable class.area.detail codes you recover by, a fixed class taxonomy, and per-occurrence diagnostics."
source: "strata-core@v1.0.0"
---

Strata treats errors as part of its contract, not as prose. Every failure carries
a **stable, structured code** you can branch on, plus human-readable context for
diagnosis. This page is the model; the [error-handling guide](/docs/guides/error-handling)
covers parsing and retry, and the [error reference](/docs/reference/error-reference)
lists every code.

## Recover by code, never by message

The single rule: **branch on the code, not the message text.** The message is for
humans and may be reworded between versions; the code is stable and will not
change meaning. Anything that reacts programmatically to an error should match on
its code or class.

The full registry ships in the binary — `strata agents errors --json` (see
[the command index](/docs/agents/command-index)) — and online at
[`/e/`](/e/), so the set of codes is enumerable, not something you discover by
hitting it.

## The shape of a code

Codes are three parts, `<class>.<area>.<detail>`:

```text
not_found.engine.branch
failed_precondition.engine.space_not_empty
invalid_argument.cli.no_database
```

- **class** — the broad kind of failure; branch on this for control flow.
- **area** — the subsystem it came from (`engine`, `executor`, `cli`, …).
- **detail** — the exact case; log the full code for diagnosis.

## A fixed class taxonomy

There is a closed set of **fifteen classes**, each telling you the shape of the
problem — for example `not_found` (a named resource is absent),
`already_exists`, `invalid_argument` (fix the input), `failed_precondition` (a
required condition was not met), `conflict` (reload and retry),
`history_unavailable` (outside retained history), `unsupported`, and `internal`.
The [error-handling guide](/docs/guides/error-handling#error-classes) has the full
table with what each one means and how to react.

Because the taxonomy is fixed, you can write recovery once per class rather than
per code — handle `not_found` uniformly wherever it appears.

## Diagnostics travel with the error

Beyond the code, each error carries the context you need to act and to report:

- a one-line **hint** (`suggested_fix`) — the safe next step;
- a **docs reference** — the `https://stratadb.org/e/<code>` URL, resolvable to a
  per-code page;
- a per-occurrence **reference id** (`err_local_…`) — unique to that failure;
  quote it when reporting a problem;
- machine fields that say whether retrying helps (`retry_policy`) and, for writes,
  what happened to your data (`commit_outcome`).

## A miss is not an error

Reads distinguish *failure* from *absence*. Reading a key that does not exist is
not an error — it returns a null/`(nil)` result and exits zero. Errors are for
things that genuinely went wrong; a normal "not there" stays on the success path.
An out-of-range historical read is the exception that *is* an error —
`history_unavailable`, distinct from `not_found`.

## Secrets are redacted

The error path never leaks sensitive material. Provider API keys, signed URLs,
prompts, and document contents are redacted by default, so an error is safe to
log and to surface to a user without exposing what produced it.

## Next

- [Error handling](/docs/guides/error-handling) — the JSON shape, exit codes,
  retry policy, and commit outcome, with worked examples.
- [Error reference](/docs/reference/error-reference) — the full registry, paired
  with the browsable [`/e/`](/e/) pages.
