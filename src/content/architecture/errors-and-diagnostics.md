---
title: "Errors and diagnostics"
description: "How detailed storage mechanics become a small, stable set of engine-owned public errors, and what observability the engine exposes."
order: 7
---

Errors in StrataDB follow the same rule as everything else: **storage owns the
mechanics, the engine owns the meaning.** Storage failures are detailed and
mechanic-specific; the engine decides which of them become public product errors
and how they are explained. This page is the propagation architecture — the
product-level error contract is [errors](/docs/concepts/errors).

## Two audiences, one path

A failure deep in storage — a checksum mismatch, a torn write at the log tail, a
backend that cannot satisfy a capability — is described in storage's own terms,
with all the mechanic detail needed to diagnose it. That detail is for storage
tests and internal diagnostics.

Before it reaches a user, the engine **translates** it into a public error with a
stable `<class>.<area>.<detail>` code, a one-line hint, and a docs reference.
The user sees a small, stable vocabulary they can branch on; the mechanic detail
stays where it is useful. The consequence for callers is the core rule:

> Recover by **code and class**, never by message text. The code is stable; the
> message is for humans and may change.

## What the architecture must surface as typed errors

The error model is required to make each of these a typed failure rather than a
crash or a wrong answer:

- typed **open** failures;
- typed **backend capability** failures (a mode a backend cannot satisfy);
- typed **corruption and recovery** failures;
- **read-only write rejection**, before any mutation;
- **IPC** transport and protocol failures;
- search, index, and model **availability** failures.

Because these are typed at the boundary, an application can react to "this backend
can't do that" or "this history is out of range" specifically, instead of parsing
prose.

## Diagnostics stay above the mechanics

A guiding constraint: normal diagnostics must not require a user to understand
WAL records, manifests, checkpoints, memtables, segment compaction, or cleanup
history. Those are storage's concern. What the engine exposes instead is
**structured health, metrics, describe, and durability counters** — enough to
answer "is this database healthy, durable, and recovered?" without a tour of the
internals. When a raw storage fact *is* worth surfacing, the engine converts it
deliberately into an engine-owned diagnostic rather than leaking the mechanic.

## Secrets never travel with an error

The error and diagnostic path redacts sensitive material by default — provider API
keys, signed URLs, prompts, and document contents — so an error is safe to log and
to show a user without exposing what produced it. Redaction is a property of the
boundary, not something each call site has to remember.

## Recovery health is a storage-owned fact

Recovery outcomes — whether recovery was clean, degraded, or found a fault — are
**storage-owned facts** that the engine re-exports or wraps as public
diagnostics. Ownership sits with the layer that actually performs recovery, which
keeps the source of truth for "what happened on open" in one place. See
[durability and recovery](/architecture/durability-and-recovery).

## Related

- [Errors (concept)](/docs/concepts/errors) — the `class.area.detail` contract and
  the fixed class taxonomy.
- [Error handling (guide)](/docs/guides/error-handling) — parsing the envelope,
  retry policy, and commit outcome.
- [The layered stack](/architecture/layered-stack) — why meaning and mechanics are
  split in the first place.
