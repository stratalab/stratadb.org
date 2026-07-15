---
title: "Error Handling"
section: "guides"
description: "Read Strata's coded errors, recover by class and retry policy, and parse the JSON error shape."
source: "strata-core@v1.0.0"
---


Every failure carries a stable code, a one-line hint, and a link to a per-code
doc page. Recover by code and class, never by matching the message text — the
message can change, the code will not. The full registry ships in the binary
(`strata agents errors --json`, 204 codes today) and online in the
[Error Reference](/docs/reference/error-reference).

## Anatomy of a code

Codes are `<class>.<area>.<detail>`. The class is the broad kind of failure, the
area is the subsystem, and the detail pins the exact case:

```text
not_found.engine.branch
failed_precondition.engine.space_not_empty
invalid_argument.engine.branch_name_reserved
```

Branch on the class for control flow; log the full code for diagnosis.

## The human-readable shape

A failed command prints the code, message, a stable reference id, a hint, and a
doc ref, then exits non-zero:

```text
not_found.engine.branch: branch `scratch` does not exist (err_local_073b160f_000001)
  hint: Check that the requested branch, space, collection, graph, document, key, or model exists.
  ref: https://stratadb.org/e/not_found.engine.branch
```

The `ref` resolves to [`/e/<code>`](/docs/reference/error-reference) — for the
example above, [`/e/not_found.engine.branch`](/e/not_found.engine.branch). The
`err_local_...` reference id is unique per occurrence; quote it when reporting a
problem.

## The JSON shape

Add `--json` and an engine error is emitted as one envelope on stderr:

```text
{"error":{"class":"not_found","code":"not_found.engine.branch","retry_policy":"never","retryable":false,"commit_outcome":"not_applicable","message":"branch `nope` does not exist","suggested_fix":"Check that the requested branch, space, collection, graph, document, key, or model exists.","docs_url":"https://stratadb.org/e/not_found.engine.branch","reference_id":"err_local_0ac6b2ff_000001"}}
```

The machine fields are `class`, `code`, `retry_policy`, `retryable`,
`commit_outcome`, `message`, `suggested_fix`, `docs_url`, and `reference_id`.

## Exit codes

- `0` — success. Note that a miss is not always a failure: `kv get` on an absent
  key prints `(nil)` and exits `0`.
- `1` — an engine error, carrying a code as shown above.
- `2` — a usage error caught before the database opens, such as a missing
  argument or `invalid_argument.cli.no_database` when no target is given. These
  print a plain `error:` line even under `--json`.

## Error classes

The fifteen classes and what each tells you:

| Class | Meaning |
|-------|---------|
| `invalid_argument` | Input was malformed; correct it and retry. |
| `not_found` | A named resource does not exist. |
| `already_exists` | The resource is already present. |
| `failed_precondition` | A required condition was not met (for example, a space still holds data). |
| `conflict` | The request clashes with current state; reload and retry against the latest version. |
| `unavailable` | A required backend or capability is temporarily unavailable. |
| `unsupported` | The active backend does not support the requested capability. |
| `resource_exhausted` | A budget or limit was reached. |
| `access_denied` | Credentials or permissions were rejected. |
| `history_unavailable` | The requested version or timestamp is outside retained history. |
| `corruption` | Stored data failed validation — stop writing and inspect recovery. |
| `serialization` | Serialized data (such as a provider response) was malformed. |
| `ambiguous_commit` | The commit outcome could not be proven. |
| `internal` | An internal engine fault; capture the reference id and report it. |
| `io` | An I/O failure in the local runtime. |

## Retry policy and commit outcome

Each error states whether retrying helps, via `retry_policy`:

- `never` — the same request will fail again; fix input or state first.
- `same_request` — the failure was transient; the identical request is safe to
  resend.
- `after_state_change` — retry only once the underlying state changes, such as a
  capability becoming available.
- `unknown` — the outcome is uncertain; inspect before deciding.

For writes, `commit_outcome` tells you what happened to your data:
`not_started` (nothing was written), `definitely_not_committed` (the write was
attempted and rolled back), `maybe_committed` (unproven — verify state before
assuming), or `not_applicable` for reads. When you see `maybe_committed`
(paired with `ambiguous_commit`), re-open the database and check before
retrying.

## Next

- [Error Reference](/docs/reference/error-reference) — the full code registry.
- [Observability](/docs/guides/observability) — check health before and after failures.
- [Branch Management](/docs/guides/branching-workflows) — the refusals shown here in context.
