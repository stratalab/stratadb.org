---
title: "Architecture overview"
description: "How StrataDB is layered: five crates from shared vocabulary up to model execution, with one rule — engine owns meaning, storage owns mechanics."
order: 0
---

StrataDB is an embedded, local-first database built as a layered Rust workspace.
The whole system is designed to be explainable in one line:

```text
core → storage → engine → intelligence → inference
```

Data flows up through those layers, and dependencies point down. Only the engine
consumes storage directly; everything above the engine uses engine-owned product
APIs, intelligence APIs, or the serializable command boundary. The one invariant
that organizes everything else is this:

> **The engine owns the meaning of a database operation. Storage owns the
> mechanics of persisting and recovering rows.** Storage never decides product
> behavior; the engine never reaches around storage's lifecycle.

## The layers

- **core** — the smallest shared contract layer: stable IDs, version and
  timestamp vocabulary, branch and space identifiers, and the error-category
  building blocks that genuinely belong below both storage and engine. No runtime,
  no product policy, no helper sprawl.
- **storage** — the persistence substrate. It stores generic rows over a single
  physical primitive and owns backends, the write-ahead log, manifests, snapshots,
  checkpoints, compaction, retention, and recovery. It knows *nothing* about KV,
  JSON, events, vectors, or graphs. See [the storage substrate](/architecture/storage-substrate).
- **engine** — the database-semantics layer. Branches, versions, time travel, the
  six data capabilities, derived state, commit and batch semantics, public errors,
  and the command boundary all live here. See [data capabilities](/architecture/data-capabilities).
- **intelligence** — database-aware retrieval and AI orchestration: recipes, query
  expansion, reranking, RAG, and explanation provenance. It consumes the engine
  for state and inference for models.
- **inference** — model and provider execution: adapters, tokenization,
  embedding, and generation. It is not a database layer and depends on neither
  storage nor engine.

The dependency rules that keep these honest are the subject of
[the layered stack](/architecture/layered-stack).

## One substrate underneath

The five data capabilities are not five storage engines. Underneath, StrataDB has
a **single physical primitive: a branch-aware, versioned (MVCC) key-value row.**
KV, JSON, events, vectors, and graph nodes and edges are all encoded as rows in
that one store, which is why every capability inherits branch isolation,
versioning, time travel, and durability the same way — see
[the storage substrate](/architecture/storage-substrate) and
[data capabilities](/architecture/data-capabilities).

## The whitepapers

- **[The layered stack](/architecture/layered-stack)** — the five crates, their
  responsibilities, and the dependency rules the build enforces.
- **[The storage substrate](/architecture/storage-substrate)** — generic rows, the
  single physical primitive, and backend portability.
- **[Durability and recovery](/architecture/durability-and-recovery)** — storage
  modes, durability policies, the write-ahead log, and crash recovery.
- **[Commits and versioning](/architecture/commits-and-versioning)** — auto-commit
  semantics, the commit timeline, batches, and why there are no manual
  transactions.
- **[Data capabilities](/architecture/data-capabilities)** — how the engine turns
  one row into six capabilities, and graph's dual role.
- **[Runtime modes](/architecture/runtime-modes)** — durable, cache, read-only, and
  IPC access, plus the one-binary resource-profile model.
- **[Errors and diagnostics](/architecture/errors-and-diagnostics)** — how storage
  mechanics become engine-owned public errors.

For the product-level mental model rather than the internals, start with the
[concepts](/docs/concepts) documentation.
