---
title: "Guides"
section: "guides"
description: "Cross-cutting how-to: branching, time travel, spaces, configuration, import/export, deployment, and migration — the surfaces that apply across every primitive."
source: "strata-core@v1.0.0"
---

These guides are the **cross-cutting** how-to — the surfaces that apply across
every capability rather than to one data shape. Each is a hands-on walkthrough
you can follow against a running database; every command and output shown was
produced by the shipped `strata` binary.

Looking for a specific data primitive? Those live in
[Working with Data](/docs/data/key-value). Running models is
[Inference](/docs/inference); driving Strata from an agent is
[For AI agents](/docs/agents). If you are brand new, start with
[Your first database](/docs/getting-started/first-database).

## History and isolation

- [Branching workflows](/docs/guides/branching-workflows) — list, create empty branches, fork from the tip or a past point, and delete.
- [Time travel](/docs/guides/time-travel) — read the past with `--as-of`, list history, and reproduce state at a point in time.
- [Spaces](/docs/guides/spaces) — organize data into named product spaces within a branch.

## Operating a database

- [Configuration](/docs/guides/configuration) — the `strata config` verbs and hub URL resolution.
- [Error handling](/docs/guides/error-handling) — the coded error model, retry policy, and JSON error shape.
- [Observability](/docs/guides/observability) — `ping`, `info`, `health`, `metrics`, `describe`, and `doctor`.

## Moving data in and out

- [Import & export](/docs/guides/import-export) — move primitives to and from Parquet, CSV, and JSON lines.
- [Cloning datasets](/docs/guides/cloning-datasets) — clone a prepared dataset from a hub into a local database.
- [Migrating](/docs/guides/migrating) — bring data over from SQLite, DuckDB, or Redis.

## Shipping it

- [Deploying](/docs/guides/deploying) — embed in an app, run in the browser, and target the edge.

## Reference

When you want the exhaustive surface rather than a walkthrough, see the
[CLI reference](/docs/reference/cli), the generated
[command reference](/docs/reference/kv), and the
[error reference](/docs/reference/error-reference).
