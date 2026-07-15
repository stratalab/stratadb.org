---
title: "Namespaces"
section: "python"
description: "The data-plane API: ten namespaces over one handle, plus db.at() scoping, as_of reads, and metadata filters."
source: "strata-python@v1.0.0"
---

A `Strata` handle exposes the whole surface through **namespaces** — one per
capability, plus control-plane and integration namespaces. Each method is a
lossless wrapper over a single engine command, adding only Python ergonomics.

## The namespaces

| Namespace | What it covers |
|---|---|
| `db.kv` | key → bytes: `put`, `get`, `delete`, `keys`, `scan`, `exists`, `count`, `history`, and `*_many` batch ops |
| `db.json` | documents by path: `set`, `get`, `delete`, `keys`, indexes, `history` |
| `db.vectors` | collections, `upsert`, similarity `query` with filters, metadata |
| `db.events` | append-only log: `append`, `get`, `list`, `range`, `verify_chain` |
| `db.graphs` | `create`, `add_node`, `add_edge`, `neighbors`, traversal, analytics, ontology |
| `db.branches` | `list`, `create`, `fork` (from tip, version, or time), `delete` |
| `db.spaces` | `list`, `create`, `exists`, `delete` — partitions within a branch |
| `db.admin` | `ping`, `info`, `health`, `metrics`, `describe`, `config` |
| `db.arrow` | `import_` / `export` primitives as Parquet, CSV, or JSON lines |
| `db.ai` | chat, embeddings, reranking — [its own page](/docs/python/inference) |

Every method maps to a command in the [command reference](/docs/reference/kv),
where you'll find the full parameter and return detail for each one.

## Values are bytes

KV values are opaque bytes. A `str` you pass is encoded as UTF-8; what you read
back is `bytes`:

```python
db.kv.put("greeting", "hello")   # str → UTF-8
db.kv.get("greeting")            # b"hello"
db.kv.get("missing")             # None — a miss is not an error
```

JSON values are Python objects (dicts, lists, scalars), addressed by path:

```python
db.json.set("user:1", "$", {"name": "Ada", "age": 36})
db.json.set("user:1", "$.age", 37)      # update one field
db.json.get("user:1", "$")              # {"name": "Ada", "age": 37}
```

## Misses return `None`

Reads distinguish absence from failure: reading a key, document, or path that
does not exist returns `None` and does **not** raise. Errors are reserved for
things that actually went wrong — see [errors](/docs/python/errors).

## Time travel: `as_of`

Every read accepts `as_of`, a commit timestamp taken from a write receipt. It
returns the value as of that commit:

```python
receipt = db.kv.put("k", "v1")
db.kv.put("k", "v2")
db.kv.get("k")                              # b"v2"  (latest)
db.kv.get("k", as_of=receipt.commit.timestamp)   # b"v1"  (historical)
```

The same `as_of` works across every namespace, giving a consistent snapshot of
the whole database at that commit.

`history` returns the full version trail for a key, newest first — including
tombstones for deletes:

```python
db.kv.history("k")
```

```text
[HistoryItem(timestamp=7, tombstone=False, version=7, value=b'v2'),
 HistoryItem(timestamp=6, tombstone=False, version=6, value=b'v1')]
```

## Scoped views: `db.at()`

`db.at(branch=..., space=...)` returns a **cheap scoped view** over the same
handle — every call through it targets that branch and space, without changing
the base handle:

```python
db.branches.fork("default", "experiment")   # copy-on-write fork of the default branch
exp = db.at(branch="experiment")
exp.kv.put("k2", "only-on-experiment")      # written on the fork
exp.kv.get("k2")                            # b"only-on-experiment"
db.kv.get("k2")                             # None on default — isolated
```

Views compose with spaces the same way: `db.at(space="analytics")`.

## Filters

Vector queries (and filtered deletes) take a `filter` built with the `filters`
helper — an AND-of-equality builder that produces the wire filter shape:

```python
from stratadb import filters

f = filters.eq("lang", "en") & filters.eq("year", 2024)
db.vectors.query("notes", query_vec, k=5, filter=f)
```

## Pagination

List and scan methods that page expose `iter_*` helpers that walk the cursor for
you, so you rarely handle a cursor by hand:

```python
for key in db.kv.iter_keys(prefix="user:"):
    ...
```

## Next

- [Inference (`db.ai`)](/docs/python/inference) — the model surface.
- [Errors](/docs/python/errors) — the typed exception hierarchy.
- [Command reference](/docs/reference/kv) — per-command parameters and returns.
