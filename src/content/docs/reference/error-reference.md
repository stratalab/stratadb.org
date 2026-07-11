---
title: "Error Reference"
section: "reference"
description: "The Strata error model: classes, codes, retry policy, commit outcome, and the JSON error envelope."
source: "strata-core@v1.0.0"
---

> **Interim page.** Maintained by hand until it is generated from the resolved command index (IDL). Where this page and `strata agents commands --json` disagree, the command index wins.

Strata errors are structured, not prose. Every failure carries a machine-readable **class**, a stable **code**, a **retry policy**, and a **commit outcome**. Match on those. The human-readable `message` is for logs and can change between builds — never assert on it.

The complete registry of every code lives at [`/e/`](/e/). Each code has its own page at `https://stratadb.org/e/<code>`. There are 204 codes.

## The two artifacts

There are two places a code appears, with slightly different field names:

- **The catalog** — `strata agents errors --json` lists every code with its documentation. Fields: `class`, `code`, `commit_outcome`, `retry_policy`, `message`, `hint`, `ref`.
- **The runtime envelope** — a real failure emitted under `--json`. Fields: `class`, `code`, `retry_policy`, `retryable`, `commit_outcome`, `message`, `suggested_fix`, `docs_url`, `reference_id`.

A real failing invocation:

```console
$ strata --cache --json kv get missing-key --branch no-such-branch
```

```json
{"error":{
  "class":"not_found",
  "code":"not_found.engine.branch",
  "retry_policy":"never",
  "retryable":false,
  "commit_outcome":"not_applicable",
  "message":"branch `no-such-branch` does not exist",
  "suggested_fix":"Check that the requested branch, space, collection, graph, document, key, or model exists.",
  "docs_url":"https://stratadb.org/e/not_found.engine.branch",
  "reference_id":"err_local_2d588bba_000001"
}}
```

The process exits non-zero. The `reference_id` is unique per occurrence — quote it in bug reports; it is not a code.

### Envelope fields

| Field | Meaning |
|-------|---------|
| `class` | The category to switch on. One of the 15 classes below. |
| `code` | Stable identifier. Switch on this for exact handling; link users to its `/e/` page. |
| `retry_policy` | Whether and how a retry could succeed. See below. |
| `retryable` | Boolean convenience: `false` when `retry_policy` is `never`. |
| `commit_outcome` | What happened to any pending write. See below. |
| `message` | Human-readable summary. Not stable — do not parse. |
| `suggested_fix` / `hint` | Actionable next step (runtime / catalog field name). |
| `docs_url` / `ref` | The code's page under `/e/` (runtime / catalog field name). |
| `reference_id` | Unique per occurrence, for correlating logs and reports. |

## Code shape

Codes read left to right as `<class>.<area>.<detail>`, where `area` is `engine` or `executor`:

```text
not_found . engine . branch
invalid_argument . engine . vector_dimension
```

Two families deviate, so **treat the `class` field as authoritative**, not the code's first segment:

- **`data_loss.*` codes** report `class` `corruption` — the leading segment is the error family, not the class.
- **Inference codes** are two-segment, `inference.<detail>` (for example `inference.provider_timeout`), and each maps to a general class such as `unavailable` or `access_denied`.

## Classes

Every class present in `strata agents errors --json`, with its code count:

| Class | Codes | Meaning |
|-------|------:|---------|
| `invalid_argument` | 96 | Request input is malformed or violates a field rule. |
| `corruption` | 41 | Stored data failed an integrity or validation check. Includes the `data_loss.*` family. |
| `failed_precondition` | 27 | The database or environment is not in a state where the operation can proceed (layout version, embedding-model mismatch, missing model or API key). |
| `unavailable` | 10 | A dependency is temporarily unreachable (control plane, model provider, artifact download). |
| `not_found` | 7 | A named branch, space, collection, graph, document, key, or model does not exist. |
| `already_exists` | 6 | Creating a resource whose name is already taken. |
| `unsupported` | 4 | The operation or a parameter is not supported. |
| `conflict` | 3 | A concurrent modification or branch-generation conflict. |
| `internal` | 3 | An engine invariant broke — likely a bug. |
| `resource_exhausted` | 2 | A budget or limit was reached (persistence budget, graph-analytics budget). |
| `history_unavailable` | 1 | A requested historical version has been trimmed. |
| `ambiguous_commit` | 1 | A write's outcome is indeterminate — see `commit_outcome`. |
| `io` | 1 | An I/O operation failed. |
| `access_denied` | 1 | Authentication or authorization failed (model provider). |
| `serialization` | 1 | A provider response could not be deserialized. |

## Retry policy

`retry_policy` says whether repeating the operation could help:

| Value | Codes | Meaning |
|-------|------:|---------|
| `never` | 172 | Do not retry as sent. Fix the request or accept the failure. |
| `after_state_change` | 20 | Retry only after changing something first — re-read the current version, supply a missing key, wait for a resource, correct a precondition. |
| `same_request` | 5 | The failure is transient; the identical request may succeed on a later attempt (provider timeout, control-plane blip). |
| `unknown` | 7 | The outcome is indeterminate; a retry may or may not help. Reconcile before assuming either way. |

## Commit outcome

`commit_outcome` says what happened to any write the failed call was attempting:

| Value | Codes | Meaning |
|-------|------:|---------|
| `not_started` | 115 | The write never began; nothing changed. Safe to retry from scratch. |
| `not_applicable` | 84 | The operation has no commit (reads, catalog lookups, validation). |
| `definitely_not_committed` | 4 | A write was attempted and definitively did not apply. Carried by branch-generation and persistence conflicts, persistence-budget exhaustion, and persistence preconditions. |
| `maybe_committed` | 1 | The write may or may not have applied. You must reconcile state before assuming success. Carried only by `ambiguous_commit.engine.persistence`. |

## Reads: absence is not an error

A read for something that does not exist returns an empty result with a zero exit code — it is not a failure. This holds across capabilities:

```console
$ strata --cache --json kv get missing-key
{"data":null,"type":"kv_versioned_value"}

$ strata --db ./db --json json get user:1 '$.missing'
{"data":{"found":false,"value":null},"type":"json_versioned_value"}

$ strata --db ./db --json event get 999
{"data":null,"type":"event_record"}
```

Errors are reserved for invalid requests and genuine faults. A missing branch, collection, or graph named as the *target* of an operation does raise `not_found`.

## How to handle errors in code

1. Switch on `class` for broad handling (retry, surface, abort).
2. Switch on `code` when you need exact behavior, and link users to `docs_url`.
3. Consult `retry_policy` and `commit_outcome` before retrying a write.
4. Log `reference_id` and `message`; never branch on `message` text.

For patterns and worked examples, see the [Error Handling guide](/docs/guides/error-handling). For the complete code registry, see [`/e/`](/e/).
