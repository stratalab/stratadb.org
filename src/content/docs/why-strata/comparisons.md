---
title: "Comparisons"
section: "why-strata"
description: "How StrataDB sits next to SQLite, DuckDB, Redis, Postgres, and dedicated vector databases."
source: "strata-core@v1.0.0"
---

StrataDB borrows its shape — embedded, single-file-ish, zero-config — from SQLite
and DuckDB, and its branching model from git. It is not a drop-in replacement for
any of the systems below; it occupies a different point in the design space.
Here is where it overlaps and where it differs.

## At a glance

| System | Shape | Overlap with StrataDB | Where they differ |
|--------|-------|---------------------|-------------------|
| **SQLite** | Embedded relational | In-process, single-directory, zero-config | SQLite is relational with SQL and joins; StrataDB is multi-model with branches and time travel, and is not a SQL database |
| **DuckDB** | Embedded analytical (OLAP) | In-process, embedded, columnar via [Arrow](/docs/guides/import-export) import/export | DuckDB is built for analytical SQL over columnar data; StrataDB is built for branched, versioned operational state across five primitives |
| **Redis** | In-memory data structures, networked | KV and structured values, a fast in-memory ([cache](/docs/concepts/durability)) mode | Redis is a networked server shared across processes; StrataDB is embedded with no server, and adds durable branches and history |
| **Postgres** | Client-server relational | Durable, structured data; JSON support | Postgres is a full relational server; StrataDB is embedded, non-relational, and branch/versioned. Use Postgres for primary relational data |
| **Vector databases** (Pinecone, Chroma, LanceDB, …) | Similarity search | Vector collections with metadata filters and similarity [query](/docs/data/vectors) | Dedicated vector DBs specialize in scale and index tuning; StrataDB puts vectors alongside KV, JSON, events, and graph on one branched substrate |

## The through-line

Every other system on that list does one shape well. StrataDB's bet is different:
put several shapes on **one branch-aware, versioned substrate**, so isolation and
history are properties you get everywhere at once instead of per-integration.
That is the trade — you gain branches and time travel across five primitives, and
you give up the depth a single-purpose engine has in its niche (a mature SQL
planner, a networked cache, a purpose-built vector index at massive scale).

## Choosing in practice

- Need **SQL, joins, relational integrity**? Use SQLite (embedded) or Postgres
  (server). StrataDB complements them for the multi-model, branched slice.
- Need **analytical queries over big columnar data**? Use DuckDB. Move data
  between the two with [Arrow](/docs/guides/import-export).
- Need a **shared cache across processes/machines**? Use Redis. StrataDB's
  [cache mode](/docs/concepts/durability) is in-process, not networked.
- Need **billion-scale, heavily-tuned vector search as the whole product**? A
  dedicated vector database will go deeper. Need vectors *alongside* documents,
  events, and a graph, branched together? That is StrataDB's lane.
- Need **branch-isolated, versioned, multi-model state**? That is what StrataDB is
  for — see [When to use StrataDB](/docs/why-strata/when-to-use).

For the honest boundaries of what StrataDB is *not*, see
[When to use StrataDB](/docs/why-strata/when-to-use); for the FAQ versions of these
questions, see the [FAQ](/docs/faq).
