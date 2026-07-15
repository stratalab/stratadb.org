---
title: "Primitives"
section: "concepts"
description: "Five data capabilities — KV, JSON, event log, vectors, and graphs — layered over one branch-aware, versioned KV storage substrate."
source: "strata-core@v1.0.0"
---

StrataDB gives you **five data primitives**, each shaped for a different job rather than forcing everything into one generic model. They all live in the same database, in the same branch, and share the same storage substrate underneath.

## The five primitives

| Primitive | Shape | Best for |
|-----------|-------|----------|
| **[KV](/docs/guides/kv-store)** | key → bytes | Working memory, config, scratchpads |
| **[JSON](/docs/guides/json-store)** | key → JSON document with path access | Structured records, conversation state |
| **[Event log](/docs/guides/event-log)** | append-only, hash-linked sequence of typed events | Audit trails, tool-call history, decision logs |
| **[Vector](/docs/guides/vector-store)** | collections of keyed embeddings with metadata | Similarity search, RAG context, agent memory |
| **[Graph](/docs/guides/graph)** | typed nodes and weighted, typed edges | Relationships, knowledge graphs, traversal |

A database reports exactly these capabilities. `describe` lists them and their current counts:

```text
$ strata ./db describe
{
  "capabilities": { "kv": true, "json": true, "event": true, "vector": true, "graph_core": true, ... },
  "primitives": { "kv_count": 1, "json_count": 0, "event_count": 0, "graphs": [], "vector_collections": [] },
  ...
}
```

## One substrate underneath

The five primitives are not five separate storage engines. Underneath, StrataDB has a single physical primitive: a **branch-aware, versioned (MVCC) key-value row**. JSON documents, events, vectors, and graph nodes and edges are all encoded as rows in that one store. This is why every primitive gets the same properties for free:

- **Branch isolation** — every row is scoped to a branch, so a fork isolates all five capabilities at once. See [Branches](/docs/concepts/branches).
- **Versioning and time travel** — every write is a [commit](/docs/concepts/commits) with a version and timestamp, so `--as-of` reads and history work the same across KV, JSON, events, vectors, and graphs.
- **Uniform durability** — the same [durability](/docs/concepts/durability) guarantees cover every primitive, because they all write to the same log.

You never manage the substrate directly. You work through each capability's own commands, and the shared row model is what keeps their semantics consistent.

## Choosing the right primitive

**A simple value under a key** → KV. Values are opaque bytes; the store does not interpret them.

**A structured record you update in place** → JSON. Read and write at paths like `$.config.temperature` without rewriting the whole document.

**An immutable history of what happened** → Event log. Events are append-only and hash-linked, so the sequence can be verified and never rewritten.

**Text or data you search by similarity** → Vector. Create a collection with a fixed dimension and distance metric, upsert embeddings with metadata, and query for nearest neighbors.

**Entities and the relationships between them** → Graph. Add nodes, connect them with typed edges, and walk neighbors. An edge requires both endpoints to exist first.

There is no general-purpose "state cell" primitive — coordination values live in KV or JSON, and history lives in the event log.

## Spaces: organizing within a branch

Within a single branch, you can partition primitives into **spaces**. A space is an organizational namespace — every operation targets the `default` space unless you pass `--space <name>` or switch spaces in the REPL. A database reports its spaces alongside its branches:

```text
$ strata ./db describe
{ "branches": ["default"], "spaces": ["default"], ... }
```

Spaces group related data inside a branch; branches are the isolation boundary between unrelated data. Reach for a branch when you need isolation, and a space when you just need tidy organization within it. See the [Spaces guide](/docs/guides/spaces).

## Beyond the five

Two more capabilities sit alongside the primitives but are not data types of their own: [Arrow](/docs/guides/arrow) import/export moves rows in and out in columnar batches, and [inference](/docs/inference) runs local and cloud models. Both operate on the primitives above rather than storing a distinct shape.

## Next

- [Value Types](/docs/concepts/value-types) — what a value actually is in each primitive
- [Guides](/docs/guides/kv-store) — per-primitive API walkthroughs
