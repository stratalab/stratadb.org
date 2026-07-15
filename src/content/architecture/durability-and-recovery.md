---
title: "Durability and recovery"
description: "Two storage modes, two durability policies, a write-ahead log that halts on fsync failure, and deterministic recovery on open."
order: 3
---

StrataDB's durability is designed to be honest and testable: a committed write
survives an ordinary process crash, recovery is deterministic, and the failure
modes are typed rather than silent. This page covers the model; the row store it
protects is [the storage substrate](/architecture/storage-substrate).

## Two axes: storage mode and durability policy

Durability is expressed as two independent axes, not a single dial:

```text
StorageMode      = Cache | Durable
DurabilityPolicy = Standard | Always   (only meaningful when Durable)
```

The three product modes fall out of that:

- **`cache`** — an ephemeral *storage mode*. No write-ahead log, no crash
  durability, no durable files at all. Cache still allocates versions, records
  commit timestamps, and maintains branch state in memory; it simply promises
  nothing across a restart.
- **`standard`** — a durable storage mode with a WAL-backed crash-recovery path and
  background or periodic durability barriers. It has a bounded crash-loss window
  set by its configured interval and the backend's capabilities.
- **`always`** — the same durable storage mode with a force-durability barrier
  before *each* committed write is acknowledged. No crash-loss window, at the cost
  of a sync per commit.

A runtime may switch between `standard` and `always` where the backend supports
both. Moving into or out of `cache` is not a durability-policy switch — it is a
different storage mode entirely.

## What "committed" means

Durable mode defines committed precisely: a write counts as committed once its
commit unit is durable according to the active policy, and it becomes visible at
that point. Everything the substrate persists — the WAL, snapshots, the manifest,
and table blocks — is written with **one uniform codec**, and the durable format
is frozen and guarded by golden vectors, so a database written by one build reads
identically in another.

## The write-ahead log

Durable writes go through a write-ahead log first. The WAL is what makes crash
recovery possible: a commit is appended and made durable there before its effects
are considered committed. The WAL has one non-negotiable rule:

> **The WAL writer halts on fsync failure.** If the log cannot be made durable,
> the writer stops rather than pretending the write succeeded.

A halt is not a silent degradation — it surfaces, and the database is resumed
through an explicit recovery path, never by best-effort guessing.

## Recovery on open

Opening a durable database runs **deterministic recovery before it serves any
traffic**. Recovery replays the durable log and manifest to reconstruct the last
consistent committed state, accepts the writes that were fully committed, and
rejects torn or partial state at the tail. Because recovery is deterministic, the
same on-disk bytes always recover to the same state — which is exactly what makes
crash recovery testable under fault injection (torn writes, failed syncs, stale
manifests, checksum failures).

Corruption, an incompatible on-disk format, an unsupported backend, a permission
error, or an IO failure each surface as a **typed** open failure rather than a
crash or a wrong answer — see [errors and diagnostics](/architecture/errors-and-diagnostics).

## Maintenance is internal

Flush, compaction, checkpointing, and retention are lifecycle *mechanics*, not
product workflows. They run under engine-owned policy with observable status, so
a normal user never issues a manual `flush`, `compact`, or `checkpoint` command.
The details of how they run are the substrate's concern; what the product exposes
is health, metrics, and durability counters.

## Cache is deliberately different

Cache mode is not "durable but weaker" — it is a different storage mode with no
durable services at all. It creates no WAL, manifest, snapshot, checkpoint, or
durable table objects, and info and health output make the distinction visible so
a cache database is never mistaken for a durable one. See
[runtime modes](/architecture/runtime-modes) and the
[durability concept](/docs/concepts/durability) for the product-level view.
