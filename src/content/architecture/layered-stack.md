---
title: "The layered stack"
description: "Five crates from shared vocabulary to model execution, and the dependency rules the build enforces to keep meaning and mechanics apart."
order: 1
---

StrataDB is a Rust workspace of five layers. Each has one job, and the
dependency graph between them is enforced by a workspace guard so the boundaries
cannot erode over time.

```text
core  ←  storage  ←  engine  ←  intelligence  ←  executor / CLI / SDK
                              ←  inference     ←
```

Arrows point in the direction of *depends on*. Read top to bottom, each layer may
only reach the layer below it through that layer's public contract.

## What each layer owns

### core

The smallest shared contract layer — vocabulary that genuinely belongs below both
storage and engine. It holds stable IDs and transparent newtypes, version and
timestamp types, branch and space identifiers, and the shared error-category
building blocks. It deliberately does **not** hold storage IO, product behavior,
CLI or SDK affordances, data-capability objects, or general-purpose helpers. Every
public type in core has to justify itself by naming which lower layers need the
same concept.

### storage

The persistence substrate. It stores generic rows over a single physical
primitive and owns backend access, the physical keyspace, commit-unit
persistence, and the write-ahead log, manifest, snapshot, checkpoint, compaction,
retention, and recovery mechanics. It knows nothing about JSON paths, event
meaning, embeddings, graph ontology, or search ranking. Details:
[the storage substrate](/architecture/storage-substrate).

### engine

The database-semantics layer, and the heart of the product. It owns open policy;
branch, space, version, history, time-travel, and restore behavior; the six data
capabilities; derived-state management; commit and batch semantics; the public
error surface; and the serializable command boundary that the CLI, IPC, tests,
and agents all speak. Details: [data capabilities](/architecture/data-capabilities).

### intelligence

The database-aware AI and retrieval orchestration layer. It provides retrieval
recipes, query expansion and reranking, RAG and answer generation, and
explanations of which branches, records, versions, and models contributed to a
result. It depends on the engine for database state and on inference for models —
and it never bypasses the engine to touch storage.

### inference

The model and provider execution layer. It provides provider adapters, local or
remote execution, and tokenization, embedding, and generation utilities. It is
**not a database layer**: it depends on nothing from storage or engine, and it
never makes an implicit network call without explicit configuration.

## The dependency rules

The guard test enforces these on every change:

1. Storage may depend on core.
2. Engine may depend on storage and core.
3. Intelligence may depend on engine, core, and inference.
4. Product crates above the engine — executor, CLI, SDK, Strata AI — must **not**
   depend on storage.
5. Inference must **not** depend on engine or storage.
6. Everything above the engine consumes engine and intelligence APIs, not storage
   APIs.

Two consequences fall out of these rules and matter enough to state directly:

- **Only the engine consumes storage.** If an upper layer needs storage-backed
  behavior, the answer is a new engine API, never a direct storage import. The
  allowed exceptions — tests, benches, fuzz targets, diagnostic and migration
  tools — are explicit.
- **Optional model and provider features cannot affect durability.** Because
  inference sits off to the side and never reaches into storage, enabling or
  disabling a model feature can never change what a committed write means.

## Why the split is worth it

Keeping meaning (engine) strictly above mechanics (storage), with a thin shared
vocabulary (core) below both, is what lets the same substrate carry six
capabilities, lets storage be fault-injected and crash-tested without any product
semantics, and lets the AI layers be optional without ever putting database
correctness at risk. The boundaries are not stylistic — they are the reason the
[storage substrate](/architecture/storage-substrate) can stay simple while the
[data capabilities](/architecture/data-capabilities) stay rich.
