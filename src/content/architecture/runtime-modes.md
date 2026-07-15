---
title: "Runtime modes"
description: "Durable, cache, read-only, and IPC-backed access, plus the resource-profile model that runs one binary from edge devices to servers."
order: 6
---

The same StrataDB binary opens a database in several ways, and adapts its resource
use to the machine it runs on. This page covers the runtime modes and the
resource-profile model; how those modes persist data is
[durability and recovery](/architecture/durability-and-recovery).

## Access modes

### Durable local

The reference V1 mode. It opens or creates a database at a local filesystem path,
acquires writer protection, runs deterministic recovery before serving traffic,
and preserves committed data across ordinary crashes. Local filesystem is the
reference durable backend.

### Cache

Explicit and non-durable. Cache mode avoids all hidden disk durability — no WAL,
manifest, checkpoint, or durable files — while still supporting normal data
capability behavior in memory. It is visibly different from durable mode in info
and health output, so it is never mistaken for a durable database. Disk-backed
cache mode is not a V1 mode.

### Read-only

Opens an existing database without permitting mutation, and rejects writes before
they mutate anything. It preserves the same branch, space, search, graph, and
time-travel *read* semantics as a writable open, and it explains clearly when an
operation would require write access (for example, when recovery or repair is
needed).

### IPC-backed local shared access

Strata is embedded, but two local processes — an application and a Strata AI
assistant, say — sometimes need the same database. Rather than open a second
direct writer, the secondary process connects over **IPC** to the process that
already owns the database. IPC:

- routes secondary access through the existing database owner;
- preserves access-mode semantics and the same command classification, so writes
  are rejected exactly as they would be for a local handle;
- uses the serializable command boundary and never bypasses engine validation;
- surfaces stale-socket, permission, protocol, lock, and server failures
  explicitly.

IPC is a supported path, not a mandatory server: ordinary single-process embedded
use needs no daemon. (The older follower mode is not part of V1.)

## The backend capability contract

A backend is not "supported" because its adapter compiles — it is supported for a
mode only when it **declares and passes the capabilities that mode requires**. The
contract defines backend address syntax, capability declarations, the required
capabilities per runtime mode, explicit unsupported-capability errors, and backend
conformance tests. Local filesystem is the reference; browser/WASM and cache
targets are explicit about their durability limits; object-storage and
OpenDAL-backed targets are supported only where their declared capabilities pass
conformance. Open fails clearly when a backend cannot satisfy the selected mode.

## The resource-profile model

One binary must run on a constrained edge device, a laptop, a cloud VM, and a
large server. The engine owns that adaptation:

- The **engine probes the host**, classifies a resource profile, applies any
  explicit user overrides in precedence order, and allocates product-wide budgets.
- **Storage receives resolved budgets** and spends within them — it does not
  classify the host or mutate product defaults.
- Graph, vector, search, and retrieval features receive engine-owned budget
  guidance instead of independently probing the machine.
- Resolved runtime plans are **observable but not persisted** as user
  configuration — they are a computed plan, not saved state.
- Low-memory conditions produce typed resource errors or bounded/degraded
  operation *before* uncontrolled out-of-memory behavior.

The result is that scaling from small to large is a matter of the resolved plan,
not a different build — the same architecture, sized to the host.

## Related

- [Durability and recovery](/architecture/durability-and-recovery) — what each
  mode guarantees across a crash.
- [The storage substrate](/architecture/storage-substrate) — the backend layer the
  capability contract sits over.
- [Embedded architecture](/docs/concepts/embedded-architecture) — the product-level
  view of these modes.
