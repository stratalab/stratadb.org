---
title: "Working with Data"
section: "data"
description: "Pick the right StrataDB data shape: key-value, JSON, events, vectors, graph, or a combination."
source: "strata-core@v1.1.0"
---

StrataDB gives you five data shapes in one local database. Pick by the shape of
the thing you need to store. Branches, spaces, commits, durability, and
time-travel reads apply to all of them.

## Choose The Shape

| Use this | When the data is | Start here |
|---|---|---|
| Key-value | Opaque bytes or simple strings addressed by key | [Key-value](/docs/data/key-value) |
| JSON | Structured documents you read or update by path | [JSON documents](/docs/data/json) |
| Events | An ordered, append-only record of what happened | [Events](/docs/data/events) |
| Vectors | Embeddings you search by similarity | [Vectors](/docs/data/vectors) |
| Graph | Entities and relationships you traverse | [Graph](/docs/data/graph) |

Most applications use more than one. Store source text in JSON, embeddings in a
vector collection, and user-visible actions in events. Keep relationships in the
graph when traversal matters. Use [Combining primitives](/docs/data/combining-primitives)
when a workflow crosses shapes.

## What Carries Across

- A branch isolates every shape at once.
- A commit advances one version clock.
- `--as-of` reads the past across the whole database, not just one primitive.
- Durable mode writes to a local directory; `--cache` stays in memory for one
  process.

## Start

The first tutorial writes key-value and JSON data, forks a branch, merges it,
and reads an earlier version: [Your first database](/docs/getting-started/first-database).

For exact syntax, use the generated command references:
[KV](/docs/reference/kv), [JSON](/docs/reference/json),
[Events](/docs/reference/event), [Vectors](/docs/reference/vector), and
[Graph](/docs/reference/graph).
