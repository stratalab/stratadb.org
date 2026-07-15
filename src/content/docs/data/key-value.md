---
title: "Key-Value"
section: "data"
description: "Store, read, version, and scan raw byte values with the KV primitive."
source: "strata-core@v1.0.0"
---

The KV store maps a byte key to a byte value. It is the simplest of the five
[primitives](/docs/concepts/primitives) and the closest to the underlying
storage substrate: every other primitive is layered over the same
branch-aware, versioned rows. Reach for KV when you want a plain lookup table —
session data, feature flags, cached blobs, small config — and you do not need
JSON paths, similarity search, or an append-only log.

Every example below was run against the shipped binary. Durable databases live
in a directory you name; add `--cache` for a throwaway in-memory run.

## Write and read one key

`kv put` writes a single key. The value is a positional argument; use `@path`
or `-f <file>` to read bytes from a file instead.

```bash
strata ./mydb kv put greeting "hello world"
strata ./mydb kv get greeting
```

```text
created greeting applied=true
hello world
```

Each write auto-commits — there is no separate transaction step. The `--json`
envelope shows the commit that the write produced:

```bash
strata --json ./mydb kv put counter 1
```

```text
{"data":{"commit":{"delete_count":0,"durable":true,"put_count":1,"timestamp":4,"version":4},"effect":{"affected_count":1,"applied":true,"kind":"created","matched":false},"key":"Y291bnRlcg=="},"type":"write_result"}
```

On the JSON wire, keys and values are base64 strings (`Y291bnRlcg==` is
`counter`). Note `commit.timestamp` — you pass that value back to read the
database as it stood at that point. See [Commits](/docs/concepts/commits).

## Existence, counts, and listing

```bash
strata ./mydb kv exists greeting
strata ./mydb kv count
strata ./mydb kv list --prefix c
```

```text
true
3
counter
```

`exists` returns `true`/`false`, `count` returns the number of visible keys,
and `list` returns keys, optionally filtered by `--prefix`. Reading a key that
was never written is not an error — `kv get missing` prints `(nil)` and exits
zero.

## Scanning rows

`kv scan` returns keys with their values and version facts, paged by `--limit`.
When more rows remain, the last line is a base64 continuation cursor you pass
back verbatim via `--cursor`.

```bash
strata ./mydb kv scan --limit 2
```

```text
{"key":"counter","timestamp":4,"value":"1","version":4}
{"key":"doc","timestamp":6,"value":"final","version":6}
-- more: Z3JlZXRpbmc=
```

`kv sample --count <n>` returns an arbitrary handful of rows without paging —
useful for a quick peek at a large keyspace.

## Version history and time travel

Overwriting a key retains its prior versions. `kv history` lists them
newest-first with the commit timestamp that produced each:

```bash
strata ./mydb kv history doc
```

```text
{"timestamp":6,"tombstone":false,"value":"final","version":6}
{"timestamp":5,"tombstone":false,"value":"draft","version":5}
```

To read the value as of an earlier commit, pass that timestamp with `--as-of`.
Capture the timestamp from a write receipt (the `commit.timestamp` field) and
reuse it:

```bash
strata ./mydb kv get doc --as-of 5
```

```text
draft
```

Every read command (`get`, `list`, `scan`) accepts `--as-of`, so you can view a
consistent historical snapshot of the whole keyspace.

## Branches

KV rows are branch-scoped. Fork a branch, write on it, and the parent is
untouched — no copy is made until you write.

```bash
strata ./mydb branch fork default experiment
strata ./mydb kv put doc branched --branch experiment
strata ./mydb kv get doc --branch experiment   # branched
strata ./mydb kv get doc                        # final
```

Merging a branch back is strict: it refuses when both sides changed
concurrently. See [Branches](/docs/concepts/branches) and
[Branch Management](/docs/guides/branching-workflows).

## Deleting

```bash
strata ./mydb kv delete greeting
```

```text
deleted greeting applied=true
```

Deleting a key that does not exist reports `not_found nope applied=false`
and still exits zero — the operation simply had no effect. The delete is
recorded as a tombstone, so history and `--as-of` reads before the delete still
resolve.

## Error cases worth knowing

Errors carry a stable `<class>.<area>.<detail>` code and a docs ref. An empty
key is rejected:

```bash
strata --json ./mydb kv put "" x
```

```text
{"error":{"class":"invalid_argument","code":"invalid_argument.engine.kv_key","retry_policy":"never","retryable":false,"commit_outcome":"not_started","message":"KV key must not be empty","suggested_fix":"Correct the request input and retry the operation.","docs_url":"https://stratadb.org/e/invalid_argument.engine.kv_key","reference_id":"err_local_1f01a1d8_000001"}}
```

Recover by code, never by message text. See
[/e/invalid_argument.engine.kv_key](/e/invalid_argument.engine.kv_key) and the
[error handling guide](/docs/guides/error-handling).

## When to use KV vs other primitives

- Use **KV** for opaque values keyed by a string, with no structure to query.
- Use [JSON](/docs/data/json) when you need to read or update fields
  inside a document by path, or index by field.
- Use [Vectors](/docs/data/vectors) for similarity search over embeddings.
- Use the [Event Log](/docs/data/events) for an ordered, hash-linked,
  append-only history.

The full verb list is in the [CLI reference](/docs/reference/cli). To batch many
writes into one shared commit, use the raw `command` path or MCP tools; the CLI
`kv` verbs operate on one key at a time.

## From Python

The same surface, from the [Python SDK](/docs/python) — values are bytes, a
miss returns `None`:

```python
import stratadb

db = stratadb.Strata("./mydb")
db.kv.put("setting", "v1")
db.kv.get("setting")        # b"v1"
db.kv.exists("setting")     # True
db.kv.count()               # 1
db.close()
```

See [namespaces](/docs/python/namespaces) for scans, history, batches, and
`as_of` reads.

## Reference

Every key-value command — parameters, returns, errors, and runnable CLI/wire/Python
examples — is in the generated [Key-Value command reference](/docs/reference/kv).
