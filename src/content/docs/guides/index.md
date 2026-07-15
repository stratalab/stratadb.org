---
title: "Guides"
section: "guides"
description: "Task-focused walkthroughs for every StrataDB capability and platform surface."
source: "strata-core@v1.0.0"
---


Each guide is a hands-on walkthrough you can follow against a running database.
Every command and output shown was produced by the shipped `strata` binary.

If you are new, start with [Your First Database](/docs/getting-started/first-database),
then come back here for depth on the surface you need.

## Data primitives

Strata stores five kinds of data over one branch-aware storage substrate.

- [KV Store](/docs/data/key-value) — keys and values, prefix listing, versioned reads.
- [JSON Store](/docs/data/json) — structured documents with path-level access.
- [Vector Store](/docs/data/vectors) — collections, similarity search, metadata filters.
- [Event Log](/docs/data/events) — append-only event streams read by type or range.
- [Graph](/docs/data/graph) — nodes, edges, and graph-core traversal.

## Platform

Surfaces that apply across every primitive: history, isolation, configuration,
failures, and health.

- [Branch Management](/docs/guides/branch-management) — list, create empty branches, fork from the tip or a past point, and delete.
- [Spaces](/docs/guides/spaces) — organize data into named product spaces within a branch.
- [Database Configuration](/docs/guides/database-configuration) — the `strata config` verbs and hub URL resolution.
- [Error Handling](/docs/guides/error-handling) — the coded error model, retry policy, and JSON error shape.
- [Observability](/docs/guides/observability) — `ping`, `info`, `health`, `metrics`, `describe`, and `doctor`.

## Integration

Connect Strata to columnar tooling and shared datasets. Two capabilities have
their own sections: [Inference](/docs/inference) for running models, and
[For AI agents](/docs/agents) for the self-describing surface and MCP server.

- [Arrow](/docs/guides/arrow) — import and export data as Apache Arrow.
- [Cloning Datasets](/docs/guides/cloning-datasets) — clone a dataset from a hub into a local database.

## Reference

When you want the exhaustive surface rather than a walkthrough:

- [CLI Reference](/docs/reference/cli) — every command and flag.
- [Command Reference](/docs/reference/command-reference) — the raw serialized command catalog.
- [Error Reference](/docs/reference/error-reference) — the full code registry.
- [Configuration Reference](/docs/reference/configuration-reference) — every configurable key.
