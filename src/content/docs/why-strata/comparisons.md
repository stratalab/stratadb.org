---
title: "Comparisons"
section: "why-strata"
description: "How StrataDB sits next to SQLite, DuckDB, Redis, Postgres, and dedicated vector databases."
source: "strata-core@v1.1.0"
---

StrataDB overlaps with familiar systems, but it is not a drop-in replacement for
them. Choose by the job.

| If you need | Usually choose | Where StrataDB fits |
|---|---|---|
| Embedded SQL, joins, constraints | SQLite | Use StrataDB beside it for branched, versioned state. |
| Local analytical SQL | DuckDB | Use StrataDB for operational state; move tabular data through Arrow import/export. |
| Shared cache across processes | Redis | Use StrataDB only when embedded local state and history matter. |
| Primary relational app storage | Postgres | Keep Postgres for relational records; use StrataDB for forkable working state. |
| Vector search as the whole system | A vector database | Use StrataDB when vectors need to live beside documents, events, and graph state. |

## The Difference

SQLite and DuckDB are embedded. Redis and Postgres are servers. Vector databases
specialize in retrieval. StrataDB's bet is narrower: one local database where
several data shapes share branches and history.

That gives you a different default workflow:

```text
strata:default/default › branch fork default experiment
strata:default/default › use experiment
strata:experiment/default › json set config '$.enabled' true
strata:experiment/default › use default
strata:default/default › branch preview experiment default
```

The useful part is not that a branch exists. It is that the branch isolates the
JSON document, key-value rows, vector collections, event stream, and graph state
under the same model.

## What You Give Up

You do not get SQL joins, a network server, distributed coordination, or a
purpose-built vector service. You do get a small embedded database whose unusual
feature is cheap, inspectable isolation.

Read [When to use StrataDB](/docs/why-strata/when-to-use) for the full fit
boundary.
