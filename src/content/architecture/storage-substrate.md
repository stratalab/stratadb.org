---
title: "The storage substrate"
description: "How StrataDB's storage layer persists generic versioned rows while knowing nothing about product meaning, and how the engine attaches through a stable runtime boundary."
order: 2
---

StrataDB is built as a stack: **core → storage → engine → intelligence → inference**. Storage sits near the bottom, and only the engine consumes it directly. This page describes what storage is responsible for — and, just as importantly, what it refuses to know.

The dividing line is simple to state and load-bearing everywhere: **storage owns persistence mechanics; the engine owns product meaning.** Storage moves bytes durably, orders commits, versions rows, and recovers after a crash. It does not know what a JSON path is, what an event chain means, how a vector is embedded, or what a graph edge represents. Those are [engine capabilities](/architecture/data-capabilities) layered over one generic row model.

## One physical primitive

There is exactly one physical storage primitive: a **branch-aware, versioned (MVCC) key-value row**. Every data capability — KV, JSON, event, vector, graph — is layered *over* that single row model by the engine. Storage never sees a capability. It sees physical keys, opaque storage-space identifiers, row values, and commit metadata.

The storage-space identifier is the mechanism that keeps meaning out of storage. Each row belongs to an opaque **storage space / family id** supplied by the engine. Storage may route by that byte, but it must not know whether the byte means KV, JSON, graph, vector, event, search, or a capability that does not exist yet. Storage reserves the low range `0x00..=0x1f` for its own internal row families (with `0x01` assigned to the commit timeline, below); the engine owns `0x20..=0xff` and publishes its own product-space registry. New capabilities extend storage by choosing spaces, key encodings, and derived rows in the engine — never by adding a storage layer.

## What storage owns, and what it excludes

Storage owns the full set of durable-row mechanics:

- Backend access and physical keyspace / row layout
- The internal commit unit: version allocation, commit ordering, and commit-unit persistence
- WAL, manifest, snapshot, and checkpoint services
- Compaction, retention, and recovery mechanics
- Backend capability validation and raw storage health facts

Storage explicitly excludes all product semantics — JSON document behavior, event-chain meaning, vector/embedding policy, graph ontology and traversal, search ranking and BM25, RAG, IPC, StrataHub datasets, and cross-branch merge strategy. It may *persist* rows the engine uses for any of these, but it does not define their meaning. Merge is a good example: storage retains branch history and rows, but the V1 merge strategy is engine-owned product behavior, not a storage CRDT.

## The L1–L9 layer stack

Storage is layered from the backend up to a single API boundary. The governing rule is that **a lower layer must not know the concepts of a higher layer** — backend IO must not know manifests, formats must not know recovery policy, table code must not know branch commands.

```text
strata-engine
        |
        v
+------------------------------------------------+
| L9. Storage API Boundary                       |
| L8. Lifecycle / Recovery / Maintenance         |
| L7. Commit Runtime                             |
| L6. Branch-Isolated LSM Runtime                |
| L5. Table Runtime                              |
| L4. Log / Manifest / Snapshot Services         |
| L3. Durable Format / Codec Layer               |
| L2. Object Layout Layer                        |
| L1. Backend IO Layer                           |
+------------------------------------------------+
        |
        v
   storage backend
```

- **L1 — Backend IO.** The portability layer. Owns access to storage backends in Strata's own vocabulary (read/write/list/delete objects, conditional publish, sync barriers, capability declaration). Knows nothing of branches, versions, WAL records, or manifests.
- **L2 — Object Layout.** Maps database-relative concepts to backend object names — WAL, table, manifest, snapshot, and temporary object names — behind a single layout contract.
- **L3 — Durable Format / Codec.** Owns bytes: WAL framing and record encoding, manifest and snapshot encoding, table metadata, checksums, and strict decode. It performs no IO and makes no recovery decisions.
- **L4 — Log / Manifest / Snapshot Services.** Turns backend IO, layout, and formats into usable durable services: append/read WAL, publish manifests, write/read snapshots, WAL truncation and safe deletion.
- **L5 — Table Runtime.** The reusable table primitives — mutable and frozen tables, immutable tables, ordered byte-key comparison, tombstones, TTL, block cache, bloom filters, indexes, merge cursors, and generic table compaction. (Immutable tables are called "tables," not "segments.")
- **L6 — Branch-Isolated LSM Runtime.** Where Strata's storage identity begins: a branch-indexed MVCC LSM forest. Each branch owns its table state and leveled view; forks inherit ancestor table layers under a copy-on-write, fork-version frontier. Owns MVCC visibility and version- and timestamp-bounded reads.
- **L7 — Commit Runtime.** The internal commit unit — version allocation, commit ordering, branch commit locks, WAL-before-visible discipline, and batch apply. This is not a public transaction product; it is the mechanism that makes writes ordered, durable, and visible.
- **L8 — Lifecycle / Recovery / Maintenance.** Storage-internal orchestration: open mechanics, WAL replay, snapshot install, table recovery, checkpoint and compaction scheduling, retention/pruning, quarantine and repair, shutdown sync, and raw health and metrics.
- **L9 — Storage API Boundary.** The only normal production surface. Exposes storage capabilities in storage language and hides WAL, table, manifest, and cache internals.

## The runtime boundary: L9 / L8 / L7

The engine attaches to storage only through the **L9 / L8 / L7 runtime contracts** — never through WAL, manifest, table, object, or backend-publish primitives directly. L9 is the sole boundary consumed in production: open a runtime from a backend and config, commit a batch, read latest, read by version, read by timestamp, scan by physical key range, read history, fork or materialize a branch, drive maintenance and health hooks, and shut down safely.

This is a durable design decision, not an accident of the current code. Keeping the boundary at L9/L8/L7 is what lets future compute nodes attach to storage through storage runtime contracts instead of reaching into lower-level durable objects. It is also why the engine is the only workspace crate that imports storage at all — see the [layered stack](/architecture/layered-stack).

## Backend portability

L1 makes the substrate portable. Strata owns a **backend capability contract**, and every backend declares what it supports; higher layers consume the contract rather than hand-rolling POSIX sequences. The durable publish primitive is a good illustration: L1 exposes a backend-owned publish / conditional-publish operation, and the local filesystem implements it internally with temp-write, sync, rename, and directory sync.

| Backend | Status |
|---|---|
| Local filesystem | Reference durable backend |
| Memory / test | Supported, non-durable |
| Browser / WASM | Explicit direction, durability limits stated |
| Object-storage / OpenDAL-backed | Architecture-aware direction, per-mode required capabilities and conformance tests |

Portability is architecture-aware, not a blanket promise: V1 implements cache mode and durable local-filesystem mode. Object-store and OpenDAL-backed durability are designed for but not claimed production-ready — Strata does not require OpenDAL, and V1 does not assert every OpenDAL backend is production-grade. Each target is explicit about its durability limits, and backend conformance and capability-mismatch faults are first-class tests.

Storage also does not detect host hardware. The engine supplies a **resolved storage runtime budget**, and storage owns how it is spent — table cache size, mutable-table sizing, compaction rate, pressure facts, and maintenance scheduling. The same binary runs from constrained edge devices to server-class machines through that budget. See [runtime modes](/architecture/runtime-modes) for how `cache`, `standard`, and `always` map onto storage mode and durability policy, and the [durability concept](/docs/concepts/durability) for the user-facing view.

## The commit timeline

Time travel rests on a storage-native substrate. L7 stamps **every committed batch with exactly one commit timestamp**, and storage persists a **per-branch commit-version → timestamp timeline** — stored as storage-owned system rows under storage space `0x01`, not as a separate object family. Storage exposes timestamp-to-version resolution to the engine, which owns the product UX for `as_of` and branch-from-time.

This keeps a clean split: the generic timeline is storage-owned mechanics; what a user means by "as of yesterday" is engine semantics. The details of that split live in [commits and versioning](/architecture/commits-and-versioning) and the [branches concept](/docs/concepts/branches).

## Recovery and maintenance are automatic

Users should never manually flush, compact, checkpoint, prune, or recover during normal use. L8 makes those mechanics automatic, observable database internals: WAL replay, snapshot install, table recovery, retention, and quarantine/repair all run below any product policy. The WAL follows a WAL-before-visible discipline and halts on fsync failure, with recovery by explicit resume. Committed rows recover from row-native storage snapshots plus the log — engine-owned snapshot sections are permitted only for derived, rebuildable state and are never required to recover a committed row.

The result is a substrate that is boring on purpose: one row model, one commit unit, one API boundary, and a strict refusal to learn what any of the bytes mean. Everything a user recognizes as a capability is assembled above it. See [durability and recovery](/architecture/durability-and-recovery) for the crash-consistency story in full.
