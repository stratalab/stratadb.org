---
title: "Data capabilities"
description: "How the engine turns one branch-aware MVCC row into six capabilities — KV, JSON, event, vector, graph, and branches — plus derived state."
order: 5
---

StrataDB has exactly one physical storage primitive: a branch-aware, versioned
(MVCC) key–value row. KV, JSON, events, vectors, graph, and branches are not six
storage engines bolted together — they are six *engine capabilities* layered over
that one row. Storage persists bytes, versions, timestamps, and tombstones under
opaque space IDs. It does not know what a JSON document, an event log, a vector,
or a graph edge *is*. All of that meaning lives in the engine. This page is the
"engine owns semantics" story: how each capability is built over the same
substrate, what each one declares, and how graph doubles as a relationship layer
across every other capability.

## One row, six capabilities

The engine sees a generic `Key`/`Value` MVCC substrate. KV, JSON, event, vector,
and graph each build *typed* keys, values, indexes, and derived state over that
substrate. None of them is a peer storage engine, and none of them can reach
around the engine to talk to storage directly — only the engine's persistence
adapter imports storage at all.

Branches are the sixth capability, but of a different kind: every row is already
branch-tagged and versioned, so branching is the isolation-and-history dimension
baked into the substrate itself. The other five are data *shapes*; branch is the
axis they all vary along.

## What "engine owns semantics" means

The engine is the layer that assigns meaning to operations. Concretely it owns:

- **Open policy** — durable, cache, and read-only open; same-path reuse; layout
  validation. Pre-V1 database directories are refused at open.
- **Branch, space, version, history, time-travel, and restore semantics** — the
  product model for isolation and time.
- **The data-capability APIs** — the KV/JSON/event/vector/graph surfaces.
- **Derived-state management** — search indexes, vector (ANN) indexes, graph
  relationship and traversal projections, shadow vectors, and recipe outputs,
  each with manifests, watermarks, health, and rebuild behavior.
- **Commit-unit and batch semantics as product operations** — not public
  transaction sessions (see below).
- **Engine-owned public errors** and **the serializable command boundary** used
  by the CLI, IPC, tests, and agents.

Storage owns none of this. It stores generic rows; the engine decides what they
mean. Upper layers (executor, CLI, SDK, Strata AI) consume the engine's command
boundary and never import storage. See [The layered stack](/architecture/layered-stack)
and [The storage substrate](/architecture/storage-substrate).

## The capability contract

Every capability is built to the same shape, so branch operations, retrieval, and
cross-capability workflows can treat them uniformly. A capability declares:

- a **facade** (its product-facing handle and methods) and its **types**;
- **entity addressing** — how user objects map to typed entity references;
- **row families**, **key encoding**, and **value encoding** over the persistence
  adapter;
- **read operations** — latest, by-version, by-timestamp, history, and
  prefix/range, all branch-aware;
- **write operations** over the internal commit unit;
- a **branch adapter** (how the capability participates in branch operations —
  diff, revert, copy, and merge-conflict granularity);
- a **search/text adapter** (optional text projection and search participation);
- a **relationship adapter** (optional entity resolution and relationship-layer
  participation);
- **derived-state hooks** (index rebuild, shadow state, recovery, diagnostics);
- **conformance tests** — shared capability tests plus capability-specific ones.

The engine's target semantics per capability:

| Capability | Branch-merge adapter | Search adapter | Relationship participation | Derived runtime state |
|---|---|---|---|---|
| KV | Simple | Yes | As entity | None |
| JSON | Structured | Yes | As entity / subpath | Indexes |
| Event | Append / ordered | Yes | As entity | Optional |
| Vector | Config + record aware | Vector search | As entity / source link | ANN indexes |
| Graph | Relationship / ontology aware | Graph search | Native + entity-bound | Traversal / index projections |

Two V1 refinements narrow the table: JSON branch merge resolves at **whole-document**
granularity, and a branch merge across **divergent concurrent history is refused**,
not auto-reconciled.

A capability may own its own row encodings and expose these adapters, but it must
not call a sibling capability's internals or hide cross-capability behavior inside
its own CRUD methods. Cross-capability work is coordinated above the capabilities,
never smuggled inside one.

## Branches: the sixth capability

Branching is a first-class product capability, not a copy utility. One canonical
`BranchId` lives in core; the engine owns its derivation and the branch DAG. The
guarantees:

- **Branch generations are monotonic**, scoped per branch name.
- **Empty-branch creation is supported** — a branch need not fork existing data.
- **Cross-branch references are rejected** — an entity reference is valid only
  within its own branch.
- **Merge is strict.** In V1 the branching model is fork / isolate / time-travel;
  a merge across divergent concurrent history is a structured refusal rather than
  an automatic reconcile. The engine owns fork, branch-from-current,
  branch-from-version, branch-from-time, diff, revert, and restore.

Storage provides generic branch-isolated physical mechanics; the engine provides
branch *names*, the DAG, and user-facing conflict policy. See
[Commits and versioning](/architecture/commits-and-versioning) and
[Branches](/docs/concepts/branches).

### Commits, not sessions

The engine keeps an internal commit unit — commit context, batch construction,
version coordination with storage, write ordering, and observers — but it does
**not** expose manual begin/commit/rollback sessions as the product model. Instead:
every normal public write is **one commit**, and explicit batch operations (such
as KV batch put/delete) are **atomic inside a single capability**. Cross-capability
public batches are not a V1 surface.

## Graph's two roles

Graph is the one capability with a dual identity, and it is the most novel part of
the design.

**1. A standalone capability.** Nodes, edges, ontology, traversal, and analytics —
graph as its own data shape, with graph-aware search and traversal/index
projections as its derived state.

**2. A relationship layer across everything.** Because every capability declares
entity addressing, any KV row, JSON document, event, vector, or graph node can be
named by a typed entity reference. Graph stores relationships *between those
references*, letting you link records that live in different capabilities:

```text
entity-addressable records (KV / JSON / event / vector / graph)
  -> a relationship policy or explicit link
  -> graph stores the relationship as nodes/edges
  -> graph traversal returns entity references
  -> callers fetch each source record through its owning capability
```

Traversal returns *references*, not copies — you follow edges in the graph, then
read each endpoint through the capability that actually owns it. This is how graph
becomes the connective tissue of a multi-model database without duplicating the
data it connects. See [Graph](/docs/data/graph) and
[Combining primitives](/docs/data/combining-primitives).

## Derived state accelerates; it never replaces

Search indexes, ANN indexes, graph projections, and shadow vectors are all
**derived state**: engine-owned, rebuildable acceleration structures. The
invariant is absolute — **source rows are authoritative**, and derived state must
never silently contradict a committed source row. Every derived structure carries
a manifest, a watermark, health, and rebuild behavior, tracked in the per-branch
`_system_` control space so retrieval only trusts an index when it is compatible
with the requested branch and time.

**Shadow vectors** are the clearest example. A shadow vector is an engine-owned
*derived row*: the engine owns the row, its lifecycle, and its link back to the
source record. Deciding *what* to embed — and running any model — belongs above
the engine, in intelligence and inference; the engine never calls a model
provider. In V1 the shadow-vector *mechanism* exists and is engine-owned; it is
the substrate for embedding-driven retrieval, not a shipped end-to-end
auto-embedding feature.

## Retrieval is a service, not a capability

Search and retrieval — BM25 indexing, recipe resolution, vector retrieval,
graph-aware expansion, result fusion, and temporal index-compatibility checks —
are **engine services over the capability adapters**, not a seventh data
capability. They consume each capability's search/text adapter and the control
plane's recipes and manifests; they do not own authored capability data. That is
why there are exactly six capabilities — KV, JSON, event, vector, graph, branch —
and no more.

Errors raised at every boundary above use structured `<class>.<area>.<detail>`
codes — opening a pre-V1 database, an embedding-model mismatch during retrieval,
or a cross-branch reference each surface as engine-owned typed errors. See
[Errors and diagnostics](/architecture/errors-and-diagnostics) and
[Primitives](/docs/concepts/primitives).
