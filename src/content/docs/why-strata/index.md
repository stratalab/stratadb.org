---
title: "What is StrataDB"
section: "why-strata"
description: "An embedded multi-model database with git-style branches and time travel — five data primitives on one versioned substrate, in one directory, no server."
source: "strata-core@v1.0.0"
---

StrataDB is an **embedded, multi-model database**. It runs inside your process
against a local directory — one binary, one database directory, no server, in the
same spirit as SQLite or DuckDB. What makes it different is what sits on top of
that embedded core: **five data primitives on one versioned substrate, with
git-style branches and time travel.**

## The one-screen version

- **Five primitives, one database.** Key-value, JSON documents, an event log,
  vectors, and a graph — each a [primitive](/docs/concepts/primitives) you reach
  for by shape of data, all sharing a single branch-aware, versioned storage row.
  You do not stand up five systems; you open one directory.
- **Git-style branches.** [Fork a branch](/docs/concepts/branches) and get an
  isolated line of data. Forks are zero-copy and O(1) — a fork shares its
  parent's data until you change something (copy-on-write) — so branching is
  cheap enough to do per experiment, per tenant, or per agent session.
- **Time travel.** Every write is a [commit](/docs/concepts/commits) with a
  version and timestamp, and any read can travel back to an earlier commit with
  `--as-of`. History is a first-class read, not a backup you restore.
- **Embedded, not a server.** No daemon, no port, no connection pool. Point the
  CLI (or an MCP client) at a directory and it opens in-process. See
  [the embedded architecture](/docs/concepts/embedded-architecture).
- **Built for agents.** The binary describes itself and ships a Model Context
  Protocol server — an agent can enumerate every command and error, and drive the
  database over MCP, with no extra package. See [For AI agents](/docs/agents).

StrataDB is written in Rust and licensed Apache-2.0.

## Why it exists

Agent memory, experiment isolation, and replayable history all want the same
three things: several data shapes in one place, cheap isolation you can throw
away, and the ability to read the past exactly. Assembling that from a relational
database, a cache, a vector store, and a bespoke audit log means four systems and
the glue between them. StrataDB puts the four shapes on one substrate and makes
isolation and history properties of the substrate itself — so branching a whole
database, or reading every primitive as of a past commit, is one concept applied
everywhere rather than four integrations.

## Is it for you?

StrataDB is a complement to your primary datastore, not a replacement for it — keep
Postgres for relational application data and Redis for a shared cache. Reach for
StrataDB when branch-isolated, versioned, multi-model state is the point. The next
two pages are the honest version of that fit:

- **[When to use StrataDB](/docs/why-strata/when-to-use)** — the sweet spots and
  the boundaries, stated plainly.
- **[Comparisons](/docs/why-strata/comparisons)** — how it sits next to SQLite,
  DuckDB, Redis, Postgres, and vector databases.

Ready to try it? [Install](/docs/getting-started/installation) and open
[your first database](/docs/getting-started/first-database).
