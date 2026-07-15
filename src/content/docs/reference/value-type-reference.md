---
title: "Value Type Reference"
section: "reference"
description: "The concrete value forms each Strata capability stores and returns, shown with real write-then-read round-trips."
source: "strata-core@v1.0.0"
---

> **Interim page.** Maintained by hand until it is generated from the resolved command index (IDL). Where this page and `strata agents commands --json` disagree, the command index wins.

Strata has five capabilities — **kv**, **json**, **event**, **vector**, and **graph** — over one branch-aware versioned store. This page shows what each one accepts and returns, verified by writing and reading each value. For the conceptual model see [Primitives](/docs/concepts/primitives) and [Value Types](/docs/concepts/value-types).

Every write returns a commit receipt (`version`, `timestamp`, put/delete counts, `durable`, and an `effect`); reads return the value plus its `version` and `timestamp`. The `version`/`timestamp` pair is a logical commit clock, distinct from any wall-clock time stored inside a value.

## KV — opaque bytes

KV values are opaque byte strings. Text from the CLI is stored as its UTF-8 bytes; arbitrary bytes come from a file (`--file` or `@path`).

```console
$ strata --db ./db kv put greeting "hello world"
created greeting applied=true

$ strata --db ./db kv get greeting          # plain: UTF-8 decoded
hello world

$ strata --db ./db --json kv get greeting   # --json: value is base64
{"data":{"timestamp":3,"value":"aGVsbG8gd29ybGQ=","version":3},"type":"kv_versioned_value"}
```

Binary values round-trip byte-for-byte:

```console
$ strata --db ./db kv put blob --file ./payload.bin
created blob applied=true

$ strata --db ./db --json kv get blob
{"data":{"timestamp":4,"value":"AAEC/2Jpbg==","version":4},"type":"kv_versioned_value"}
```

Rules of thumb:

- Under `--json`, both the key and the value are **base64** (they are bytes on the wire).
- Plain and `--raw` output decode UTF-8 for display; non-text bytes are best read via `--json` and decoded by the caller.
- A read of a missing key returns `{"data":null,...}` with exit 0 — absence is not an error.

## JSON — documents addressed by path

JSON values are real JSON documents. Paths use `$` for the whole document and `$.field` for a member. Writing `$` replaces the document; a subpath read returns just that value.

```console
$ strata --db ./db json set user:1 '$' '{"name":"Ada","age":36,"tags":["a","b"]}'
created user:1 applied=true

$ strata --db ./db json get user:1 '$'
{"age":36,"name":"Ada","tags":["a","b"]}

$ strata --db ./db --json json get user:1 '$.name'
{"data":{"found":true,"value":{"document_version":1,"timestamp":3,"value":"Ada","version":3}},"type":"json_versioned_value"}
```

Documents carry a `document_version` (per-document revision) alongside the commit `version`/`timestamp`. Values may be any JSON type: object, array, string, number, boolean, or null. Non-JSON text passed to `json set` is stored as a JSON string.

## Event — immutable, hash-chained log

Events are append-only. Each event has a string `event_type`, a JSON `payload`, a dense `sequence` starting at 0, a microsecond wall-clock `timestamp`, and a SHA-256 `hash` chained to the `previous_hash` of the prior event.

```console
$ strata --db ./db event append user.created '{"id":1,"email":"a@b.co"}'
created applied=true

$ strata --db ./db --json event list
```

```json
{"data":{"items":[
  {"event":{"event_type":"user.created","sequence":0,
    "payload":{"email":"a@b.co","id":1},
    "hash":"1d2616c3…","previous_hash":"0000000000…",
    "timestamp":1783735353572894},
   "version":3,"timestamp":3},
  {"event":{"event_type":"user.updated","sequence":1,
    "payload":{"id":1},
    "hash":"f331b047…","previous_hash":"1d2616c3…",
    "timestamp":1783735353581986},
   "version":4,"timestamp":4}
],"has_more":false,"cursor":null},"type":"event_records"}
```

The genesis `previous_hash` is all zeros. Sequences are contiguous; `strata event verify-chain` checks density and hash linkage. Note the two clocks: the event's own `timestamp` is microsecond wall-clock; the outer `version`/`timestamp` is the logical commit clock.

## Vector — embeddings with a metric

A collection fixes a `dimension` and a distance `metric`. Metrics accepted at create time:

| Metric | Value |
|--------|-------|
| Cosine similarity (default) | `cosine` |
| Euclidean | `euclidean` |
| Dot product | `dot-product` |

Vector components are 32-bit floats — values are stored and returned at `f32` precision (note the rounding below). Each vector may carry a metadata object.

```console
$ strata --db ./db vector collection create docs 4
{"count":0,"dimension":4,"metric":"cosine","name":"docs"}

$ strata --db ./db vector upsert docs a '[0.1,0.2,0.3,0.4]' --metadata '{"kind":"note"}'
created a applied=true

$ strata --db ./db --json vector get docs a
{"data":{"data":{"embedding":[0.10000000149011612,0.20000000298023224,0.30000001192092896,0.4000000059604645],
  "metadata":{"kind":"note"}},"key":"a","vector_revision":1,"timestamp":5,"version":5},"type":"vector_data"}

$ strata --db ./db --json vector query docs '[0.1,0.2,0.3,0.4]' --k 3
{"data":[{"key":"a","metadata":{"kind":"note"},"score":1.0}],"type":"vector_matches"}
```

Components can be a JSON array, comma-separated floats, or `@path`. A dimension mismatch is rejected:

```console
$ strata --db ./db --json vector upsert docs b '[1,2]'
{"error":{"class":"invalid_argument","code":"invalid_argument.engine.vector_dimension",
  "message":"vector dimension mismatch: expected 4, got 2", …}}
```

The collection create surface exposes `dimension` and `metric` only; there is no per-collection storage-dtype selection on the CLI in this release.

Search filters are explicit and AND-composed, and **only equality is supported**. Each condition names a `field`, the op `eq`, and an adjacently-tagged scalar `value` (tag `string`, `number`, or `bool`):

```console
$ strata --db ./db --json vector query docs '[0.1,0.9]' \
    --filter '{"conditions":[{"field":"lang","op":"eq","value":{"type":"string","value":"en"}}]}'
{"data":[{"key":"a","metadata":{"lang":"en"},"score":1.0}],"type":"vector_matches"}
```

A bare `{"lang":"en"}` is rejected (`missing field conditions`), and any op other than `eq` is rejected (`unknown variant …, expected eq`).

## Graph — nodes and typed edges

A graph holds nodes (an id plus an optional properties object) and edges (a source, an `edge_type`, a destination, an optional `weight`, and optional properties).

```console
$ strata --db ./db graph create deps
$ strata --db ./db graph add-node deps core --properties '{"lang":"rust"}'
$ strata --db ./db graph add-node deps cli
$ strata --db ./db graph add-edge deps cli depends_on core --weight 2.5

$ strata --db ./db --json graph get-node deps core
{"data":{"graph":"deps","node_id":"core","properties":{"lang":"rust"},"version":4,"timestamp":4},"type":"graph_node_result"}

$ strata --db ./db --json graph get-edge deps cli depends_on core
{"data":{"graph":"deps","src":"cli","edge_type":"depends_on","dst":"core","weight":2.5,"version":6,"timestamp":6},"type":"graph_edge_result"}
```

`graph neighbors` walks a node's edges with `direction` `outgoing` (default), `incoming`, or `both`, and returns each neighbor's edge and node together. Edge weight is optional; omit it for an unweighted edge.

## Write receipts

Every mutating command returns the same receipt shape. A representative write under `--json`:

```json
{"data":{
  "commit":{"version":3,"timestamp":3,"put_count":1,"delete_count":0,"durable":false},
  "effect":{"applied":true,"kind":"created","matched":false,"affected_count":1},
  "key":"Z3JlZXRpbmc="
},"type":"write_result"}
```

`durable` reflects whether the commit reached disk (`false` in cache mode). `effect.kind` reports `created`, updated, or deleted; `applied` says whether the write changed anything.

## See also

- Store guides: [KV](/docs/data/key-value), [JSON](/docs/data/json), [Vector](/docs/data/vectors), [Event Log](/docs/data/events).
- [API Quick Reference](/docs/reference/api-quick-reference) and [CLI Reference](/docs/reference/cli).
- [Error Reference](/docs/reference/error-reference) — the structured error model.
