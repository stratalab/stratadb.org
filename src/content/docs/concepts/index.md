---
title: "Concepts"
section: "concepts"
description: "The mental model behind StrataDB: branches, commits, durability, primitives, and value types."
source: "strata-core@v1.0.0"
---

StrataDB is an embedded multi-model database: one binary, one file-backed database, no server, in the same spirit as SQLite or DuckDB. Five data capabilities — key-value, JSON documents, an event log, vectors, and graphs — share a single branch-aware, versioned storage substrate. That shared foundation is what makes the concepts here small in number and consistent across every capability: isolate with a branch, and every capability isolates; version a write, and every read can travel back to it.

These pages explain the ideas you need to use it well. Read them in order if you are new, or jump to the one you need.

**The model**

- **[Embedded architecture](/docs/concepts/embedded-architecture)** — in-process, no server, one directory; durable vs cache mode.
- **[Primitives](/docs/concepts/primitives)** — the five capabilities and when to reach for each, all layered over the same storage row.
- **[Value Types](/docs/concepts/value-types)** — what a value actually is in each capability, from opaque KV bytes to full JSON documents.

**History and isolation**

- **[Branches](/docs/concepts/branches)** — the isolation model. Every piece of data lives in a branch, forks are cheap, and writes on one branch are invisible to another. Learn this one first — everything else happens inside a branch.
- **[Commits](/docs/concepts/commits)** — how writes happen. Every write auto-commits atomically and returns a version and timestamp. There are no manual `begin`, `commit`, or `rollback` calls.
- **[Time travel](/docs/concepts/time-travel)** — reading the past. Any read accepts `--as-of` to see the database as of an earlier commit, and you can fork from a past point.
- **[Durability](/docs/concepts/durability)** — where data lives. A durable database is backed by a write-ahead log and recovers on reopen; a cache database is pure in-memory.

**Organizing and sharing**

- **[Spaces](/docs/concepts/spaces)** — named partitions of data within a branch, the second organizing dimension alongside branches.
- **[Hub and clone](/docs/concepts/hub-and-clone)** — how prepared datasets are distributed and cloned into a local database.

**The contract**

- **[Errors](/docs/concepts/errors)** — the stable `class.area.detail` codes you recover by, and the fixed class taxonomy.

## How they fit together

A database holds one or more **branches**. Inside a branch you use the five **primitives**, and each write is a **commit** with a version. Whether those commits survive a restart is a matter of **durability** — durable or cache. And what a stored value means depends on the primitive, which is the subject of **value types**. Learn the five ideas once and they apply the same way everywhere.

Once the model makes sense, [Working with Data](/docs/data/key-value) walks through each capability's API, the [cookbook](/docs/cookbook/rag-with-vectors) shows end-to-end patterns, and the [reference](/docs/reference/cli) documents every command and [error code](/docs/reference/error-reference).

If you are wiring StrataDB into an agent, the binary also describes itself: `strata agents guide` prints an offline usage guide generated from the installed build, and `strata agents commands --json` emits a machine-readable catalog. Because that surface comes straight from the binary, it always matches the version you have installed. The [For Agents](/docs/agents) page is the fastest way in. Everywhere in these docs, the commands and outputs shown are ones the CLI actually produces — if a page and the binary ever disagree, trust the binary and check whether your installed version matches these docs.
