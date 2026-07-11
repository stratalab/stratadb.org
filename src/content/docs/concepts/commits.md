---
title: "Commits"
section: "concepts"
description: "Every write auto-commits atomically and returns a commit version and timestamp; there are no manual begin, commit, or rollback calls."
source: "strata-core@v1.0.0"
---

Every write in StrataDB is a **commit**. When you put a key, set a JSON path, append an event, upsert a vector, or add a graph node, that change is applied atomically and becomes durable on its own — there is no separate step to commit it. This keeps one canonical path for every write and removes a whole class of "did I remember to commit?" bugs.

## Writes auto-commit

A write returns a receipt telling you what happened:

```text
$ strata ./db kv put config prod
created config applied=true
```

The `--json` envelope carries the full commit facts:

```text
$ strata --json ./db kv put config staging
{"data":{"commit":{"delete_count":0,"durable":true,"put_count":1,"timestamp":4,"version":4},"effect":{"affected_count":1,"applied":true,"kind":"updated","matched":true},"key":"Y29uZmln"},"type":"write_result"}
```

Two objects matter here:

- **`commit`** — the `version` and `timestamp` this write was assigned, plus how many rows it put or deleted and whether it was made `durable`. Versions are a monotonic per-database clock: every commit gets a strictly higher number than the last.
- **`effect`** — what the write did to the target: `kind` is `created`, `updated`, or `deleted`; `matched` says whether a prior value existed; `affected_count` is how many rows changed.

## No manual transactions

There is no session to open and no transaction to manage. The old `begin`, `commit`, and `rollback` verbs are gone:

```text
$ strata ./db begin
error: `begin` is recognized from the old CLI, but is not available in the V1 CLI surface yet
```

Each write is its own atomic unit. When you need several writes to land together, use a batch (below) rather than a manual transaction.

## Versioned reads

Because every commit has a version, you can read the past. History lists a key's retained versions, newest first:

```text
$ strata ./db kv history config
{"timestamp":4,"tombstone":false,"value":"staging","version":4}
{"timestamp":3,"tombstone":false,"value":"prod","version":3}
```

Pass a commit timestamp to `--as-of` to read the value as it stood then — the same flag works on `kv`, `json`, `event`, `vector`, and `graph` reads:

```text
$ strata ./db kv get config --as-of 3
prod
$ strata ./db kv get config --as-of 4
staging
```

Deletes are commits too. A delete writes a **tombstone** rather than erasing history, so a time-travel read still returns the value that existed before the delete, and `history` shows the tombstone with `"tombstone":true`.

## Batches: itemwise with a shared commit

A batch applies many items in one call. Batches are part of the command surface used by the SDKs, the [MCP tools](/docs/guides/agents-and-mcp), and the raw command path — not a bare CLI verb — so the semantics below are what you get from those callers. StrataDB's batches are **itemwise**: you get one positional result per input item, and the outer status summarizes whether all, some, or none succeeded. Valid items that the engine applies together share one commit.

Putting two keys in a single batch, both land at the same `version` and `timestamp`:

```text
"commit": { "put_count": 2, "version": 3, "timestamp": 3 },
"items": [
  { "index": 0, "status": "ok", "result": { "key": "YQ==" } },
  { "index": 1, "status": "ok", "result": { "key": "Yg==" } }
],
"mode": "itemwise",
"status": "ok"
```

(Abbreviated from the real `--json` envelope; every item also repeats the shared `commit`.) Each item reports its own outcome, so a batch where one item fails validation returns an outer `status` of `partial` — the offending item is flagged with its own error while the valid items still commit. See the [CLI reference](/docs/reference/cli) for the full command surface.

## Why this design

Auto-commit plus versioning gives you atomic writes, a single canonical write path, and full time travel without the ceremony of transactions. When you need multi-write atomicity, reach for a batch; when you need an isolated line of history, reach for a [branch](/docs/concepts/branches).

## Next

- [Durability](/docs/concepts/durability) — when `durable` is true and how recovery works
- [Value Types](/docs/concepts/value-types) — what a value is in each capability
- [Deterministic Replay](/docs/cookbook/deterministic-replay) — using versions and `--as-of` to reproduce state
