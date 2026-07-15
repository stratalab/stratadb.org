---
title: "Embedded architecture"
section: "concepts"
description: "StrataDB runs in-process against a local directory — no server, no port. What that means for how you deploy and reason about it."
source: "strata-core@v1.0.0"
---

StrataDB is **embedded**: it runs inside your process, against a local directory,
in the same spirit as SQLite or DuckDB. There is no daemon to start, no port to
open, no connection pool to manage. You point the CLI (or an MCP client, or —
later — an SDK) at a directory and it opens the database in-process. This page
explains what that model means; the durability mechanics are in
[Durability](/docs/concepts/durability).

## In-process, not a server

A traditional database is a server you connect to over a socket. StrataDB is a
**library plus a binary that embeds it**. The database lives and dies with the
process that opens it, and it talks to your code directly rather than over a
network. The consequences are the point:

- **Zero operational surface.** Nothing to deploy, no health checks on a separate
  service, no version-skew between client and server. The binary *is* the
  database.
- **One writer per durable database.** A durable database is opened with an
  exclusive lock, so a second process that tries to open the same directory is
  refused rather than corrupting it. Reads and writes from within the one process
  are what you coordinate.
- **No network mode.** This line has no server or wire protocol. To expose the
  database to an agent, the binary itself speaks
  [MCP over stdio](/docs/agents/mcp-server) — still in-process, not a network
  service.

The closest analogy is SQLite: an application-embedded database that is a file on
disk, not a service on a host. StrataDB keeps that shape and layers branches, time
travel, and five data primitives on top.

## Two modes: durable and cache

An embedded database still has to decide whether data outlives the process. StrataDB
has two modes, chosen at open time:

- **Durable** — the default for any named path. Writes go through a write-ahead
  log and survive the process exiting; reopening recovers the last committed
  state.
- **Cache** — opened with `--cache`. Pure in-memory: nothing is written to disk,
  and the data is gone when the process ends. Ideal for tests, scratch work, and
  ephemeral MCP servers.

Same API, same primitives, same branching — the only difference is whether it
persists. [Durability](/docs/concepts/durability) covers the write-ahead log,
recovery, and how to choose.

## Where your data lives

A durable database is **the directory you name**. That directory holds a
write-ahead log, a manifest, and lock files — treat it as a single unit, and do
not edit files inside it by hand. Copy or move the whole directory, not its
parts.

Global CLI configuration (the resolved hub URL, stored provider keys) lives
**separately**, under your home config directory — so uninstalling the binary or
deleting a config never touches your databases, and vice versa.

Because a database is just a directory, sharing a prepared one is a matter of
copying it — or, for curated datasets, [cloning from a hub](/docs/concepts/hub-and-clone).

## Next

- [Durability](/docs/concepts/durability) — the write-ahead log, recovery, and
  choosing durable vs cache.
- [Branches](/docs/concepts/branches) — the isolation model layered on top.
- [When to use StrataDB](/docs/why-strata/when-to-use) — where the embedded model
  fits and where it does not.
