---
title: "What is StrataDB"
section: "why-strata"
description: "StrataDB is an embedded database you can fork: five data shapes, one versioned local store, no server."
source: "strata-core@v1.1.0"
---

StrataDB is an embedded database you can fork.

It runs inside your process against a local directory, like SQLite or DuckDB in
shape. The difference is the data model: key-value, JSON, events, vectors, and
graph all share one branch-aware, versioned store.

## What You Get

- **A local database, not a service.** Point the CLI or SDK at a path. No daemon,
  port, pool, or network dependency is required.
- **Branches for data.** Fork `default`, change the fork, preview the merge, and
  promote what worked.
- **One clock for history.** Writes commit automatically. Reads can pass
  `--as-of` to see an earlier version.
- **Five shapes in one place.** Use KV for simple values, JSON for documents,
  events for history, vectors for similarity, and graph for relationships.
- **A machine-readable surface.** The binary can print its guide, command
  catalog, error catalog, and run as an MCP server.

## Why It Exists

Some workloads need local state that can be branched, inspected, and replayed:
agent memory, experiment state, retrieval datasets, audit trails, and app-local
working sets. You can assemble that from several databases and a lot of glue.
StrataDB puts the shared parts - branches, commits, history, durability - under
the data shapes instead.

That is the trade. StrataDB is not trying to be the best SQL planner, the
largest vector index, or a network cache. It is trying to make branch-isolated,
versioned, multi-shape state feel ordinary.

## Keep Reading

- [When to use StrataDB](/docs/why-strata/when-to-use) for the fit boundaries.
- [Comparisons](/docs/why-strata/comparisons) for SQLite, DuckDB, Redis,
  Postgres, and vector databases.
- [Your first database](/docs/getting-started/first-database) when you are ready
  to run it.
