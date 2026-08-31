---
title: "When to use StrataDB"
section: "why-strata"
description: "The workloads StrataDB is built for, and the cases where another database is the better choice."
source: "strata-core@v1.1.0"
---

Use StrataDB when the branch and history model matters. Use something else when
you only need one specialized database shape.

## Good Fits

| Workload | Why StrataDB fits |
|---|---|
| Agent memory | Each run can get its own branch; events record actions; JSON and KV hold working state; vectors and graph support recall. |
| Experiments | Fork the database, try a change, compare it, then merge or delete the fork. |
| Replayable state | Commits and events let you answer what the database looked like at a point in time. |
| Local-first tools | The database is a local directory opened in-process. |
| Mixed data shapes | Use documents, events, vectors, graph, and simple keys without five separate stores. |

The deciding question is: do you need branch-isolated, versioned state across
more than one data shape? If yes, StrataDB is worth considering.

## Poor Fits

- **Primary relational data.** If you need SQL, joins, relational constraints,
  and a mature planner, use Postgres or SQLite.
- **Shared network cache.** StrataDB is embedded. It is not Redis and does not
  provide a network server in this line.
- **Fleet coordination or live sync.** A StrataDB database is a local directory.
  Prepared datasets can be cloned, but live multi-writer sync is out of scope.
- **Massive specialized vector search.** StrataDB has vector collections. A
  dedicated vector database will go deeper when vector search is the whole
  product.
- **Automatic conflict resolution.** `branch merge` applies KV, JSON, and vector
  changes. Under the default strict strategy it refuses conflicts instead of
  inventing a winner; events and graphs are compared, not merged.

## Boundaries In This Release

- The supported surfaces are the CLI, Python SDK, generated machine docs, and MCP
  server. A Node SDK is not part of `v1.1.0`.
- Local model execution is a build feature. Cloud inference is available when a
  provider key is configured.
- Broad search is not a separate product surface. Vector similarity search is
  the shipped search path.

For head-to-head choices, read [Comparisons](/docs/why-strata/comparisons).
