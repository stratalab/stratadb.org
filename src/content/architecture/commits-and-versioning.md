---
title: "Commits and versioning"
description: "Writes auto-commit into versioned commit units, storage keeps a per-branch version-to-timestamp timeline, and there are no manual transactions."
order: 4
---

StrataDB has no `begin` / `commit` / `rollback`. Writes commit automatically, each
into a versioned commit unit, and the commit timeline that results is what powers
time travel. This page explains how commits and versions work under the hood; the
product-level view is in [commits](/docs/concepts/commits) and
[time travel](/docs/concepts/time-travel).

## Writes auto-commit

Every write is applied as a **commit unit** — an atomic unit of change that the
storage commit runtime allocates a version for, orders, and makes durable through
the write-ahead log before its effects become visible. There is no session to open
and no transaction to hold; a write either commits as a unit or does not apply.

The commit unit is internal machinery. What the product exposes on top of it is
clear write and batch semantics, not a manual transaction API — a deliberate V1
decision, because a public transaction surface would imply an isolation and ACID
contract the product does not claim.

## Versions and the commit timeline

Two facts travel with every commit, and both are **storage-native substrate**, not
engine bookkeeping:

- a **version** — monotonically allocated, the identity of that committed state;
- a **commit timestamp** — one timestamp stamped on the whole committed batch.

Storage persists a **per-branch timeline mapping commit version to timestamp**, and
exposes timestamp-to-version resolution to the engine. That timeline is the entire
basis for reading the past: because every commit is on it, "the database as of
timestamp *T*" resolves to a concrete version, and every capability reads
consistently at that version.

The division of labor is clean: **storage owns the timeline as a fact; the engine
owns the product experience** of `as_of`, branch-from-time, and timeline
explanations. See [the storage substrate](/architecture/storage-substrate) for
where the commit runtime sits (L7) in the layering.

## Batches are itemwise under one commit

A batch applies many items in one call. StrataDB's batches are **itemwise**: you
get one positional result per input item, and an outer status summarizes whether
all, some, or none succeeded. The valid items the engine applies together share
**one commit** — so a batch is atomic at the commit-unit level while still
reporting per-item outcomes. Batches are part of the command surface used by the
SDKs, the MCP tools, and the raw command path rather than a bare CLI verb.

## Why no manual transactions

The engine keeps the internal commit machinery it needs, but the product surface
stops at write and batch semantics on purpose:

- Auto-commit means an agent or application never leaves a transaction open, never
  deadlocks on a held lock, and retries idempotently.
- The absence of a session removes a whole class of misuse — partial commits,
  forgotten rollbacks, long-lived read snapshots pinning resources.
- Isolation is provided by [branches](/docs/concepts/branches): to work against an
  isolated view, you fork a branch, not open a transaction.

If a future product decision ever introduces a public transaction, it would come
with an explicit isolation contract, backend requirements, and a conformance
suite — it is not something the current architecture leaves half-exposed.

## Versioning is uniform across capabilities

Because versioning lives in the substrate under the single physical row, it
applies identically to KV, JSON, events, vectors, and graphs — one commit can span
several capabilities and lands as one versioned unit, and a historical read at a
version sees all of them consistently. That uniformity is a direct consequence of
[one substrate underneath](/architecture/storage-substrate) rather than
per-capability version schemes.
