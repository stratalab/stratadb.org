---
title: "Architecture overview"
description: "How StrataDB is layered: shared vocabulary, storage mechanics, engine semantics, retrieval orchestration, and model execution."
order: 0
---

StrataDB is a layered Rust workspace. The short version:

```text
core -> storage -> engine -> intelligence
                         -> inference
```

Dependencies point down. Meaning flows up. The engine owns database semantics;
storage owns persistence mechanics.

## Layers

- **core** defines shared vocabulary: branch IDs, spaces, versions, timestamps,
  and error categories that belong below storage and engine.
- **storage** persists generic versioned rows. It owns backends, the write-ahead
  log, manifests, snapshots, checkpoints, compaction, retention, and recovery.
- **engine** turns those rows into product behavior: branches, commits, time
  travel, five data shapes, batches, derived state, and public errors.
- **intelligence** coordinates retrieval workflows using engine state and model
  calls.
- **inference** executes models through local or hosted providers. It is not a
  database layer.

## One substrate

KV, JSON documents, events, vectors, and graph records all sit on one physical
primitive: a branch-aware, versioned key-value row. That is why the data shapes
share branch isolation, time travel, durability, and commit history.

## Read next

- [The layered stack](/architecture/layered-stack)
- [The storage substrate](/architecture/storage-substrate)
- [Durability and recovery](/architecture/durability-and-recovery)
- [Commits and versioning](/architecture/commits-and-versioning)
- [Data capabilities](/architecture/data-capabilities)
- [Runtime modes](/architecture/runtime-modes)
- [Errors and diagnostics](/architecture/errors-and-diagnostics)

For the product mental model, start with [Concepts](/docs/concepts).
