---
title: "The layered stack"
description: "The workspace layers and dependency rules that keep storage mechanics separate from database meaning."
order: 1
---

StrataDB is split into layers so persistence mechanics do not leak into product
behavior, and model execution cannot affect durability.

```text
core <- storage <- engine <- intelligence <- executor / CLI / SDK
                         <- inference
```

Arrows point in the direction of dependency.

## Ownership

### core

`core` holds shared vocabulary that belongs below both storage and engine:
stable IDs, version and timestamp types, branch and space identifiers, and error
categories. It should stay small.

### storage

`storage` owns the physical lifecycle: backends, row encoding, WAL, manifests,
snapshots, checkpoints, compaction, retention, and recovery. It does not know
what a JSON path, event type, embedding, graph edge, or search result means.

### engine

`engine` owns database meaning: opening policy, branches, spaces, versions, time
travel, restores, five data shapes, derived state, commit behavior, batch
behavior, public errors, and the serializable command boundary.

### intelligence

`intelligence` owns retrieval orchestration: query expansion, reranking, RAG,
and provenance for which branches, records, versions, and models contributed to
a result. It uses engine APIs for state and inference APIs for model calls.

### inference

`inference` owns provider adapters, local model execution, tokenization,
embedding, ranking, and generation. It does not depend on storage or engine.

## Dependency rules

1. Storage may depend on core.
2. Engine may depend on storage and core.
3. Intelligence may depend on engine, core, and inference.
4. Product surfaces above the engine should not depend on storage directly.
5. Inference should not depend on engine or storage.
6. Upper layers consume engine and intelligence APIs, not storage APIs.

Two consequences matter in practice:

- If an upper layer needs storage-backed behavior, add an engine API.
- Optional model features cannot change what a committed write means.

## Why it matters

The split lets one storage substrate carry five data shapes while preserving one
commit clock, one branch model, and one recovery story. It also lets inference
stay optional: enabling a model provider should change model calls, not database
correctness.
