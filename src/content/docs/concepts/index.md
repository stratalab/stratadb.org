---
title: "Concepts"
section: "concepts"
description: "The small set of ideas behind StrataDB: embedded databases, primitives, branches, commits, time travel, durability, spaces, and errors."
source: "strata-core@v1.1.0"
---

You only need a few ideas to use StrataDB well.

## The Database

- [Embedded architecture](/docs/concepts/embedded-architecture): StrataDB opens a
  local directory in-process. There is no server.
- [Primitives](/docs/concepts/primitives): KV, JSON, events, vectors, and graph
  are the five data shapes.
- [Value types](/docs/concepts/value-types): how values appear in CLI, JSON, and
  SDK surfaces.

## Isolation And History

- [Branches](/docs/concepts/branches): fork a complete database view, change it,
  preview the merge, and promote or delete it.
- [Commits](/docs/concepts/commits): every write commits automatically and gets a
  version.
- [Time travel](/docs/concepts/time-travel): pass `--as-of` to read an earlier
  version.
- [Durability](/docs/concepts/durability): durable mode persists to disk; cache
  mode is in-memory for one process.

## Organization And Contracts

- [Spaces](/docs/concepts/spaces): named partitions inside a branch.
- [Hub and clone](/docs/concepts/hub-and-clone): clone prepared datasets into a
  local database.
- [Errors](/docs/concepts/errors): recover by stable error code, not message text.

## How They Fit

A database has branches. A branch has spaces. Inside a space you use one or more
data shapes. Every write creates a commit. A historical read chooses an earlier
commit. Durability decides whether committed data survives process exit.

If you are new, run [Your first database](/docs/getting-started/first-database)
before reading these pages in depth.
