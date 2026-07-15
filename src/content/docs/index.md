---
title: "StrataDB Documentation"
description: "An embedded multi-model database with git-style branching and time travel."
source: "strata-core@v1.0.0"
---


StrataDB is an embedded database. It runs inside your process against a local
directory — no server to start, no daemon to manage — the way SQLite or DuckDB
does. One binary and one database file tree hold everything.

Five data capabilities share a single storage substrate:

- **Key-value** — store and read values by key.
- **JSON documents** — set and read values at JSON paths.
- **Event log** — an append-only, hash-chained record of typed events.
- **Vectors** — collections you upsert embeddings into and search by similarity.
- **Graph** — nodes and edges with properties.

All five sit on top of one branch-aware MVCC store, so they share the same
branches, the same versioning, and the same durability guarantees.

## What makes it different

- **Git-style branches.** Fork a branch and its data is isolated; writes on the
  fork are invisible to its parent. A fork is cheap — it shares the parent's
  data until you change something. See [Branches](/docs/concepts/branches).
- **Time travel.** Every write returns a commit with a timestamp. Pass that
  value back to any read with `--as-of` to see the data as it was at that
  commit. See [Time travel](/docs/concepts/time-travel).
- **Durable or in-memory.** Point StrataDB at a directory and it persists
  through a write-ahead log; run it with `--cache` and nothing touches disk.
  See [Durability](/docs/concepts/durability).
- **Built for agents.** The binary describes itself — a usage guide, a command
  catalog, and an error registry are all emitted from the running binary — and
  it speaks the Model Context Protocol over stdio. See
  [For AI agents](/docs/agents).

## Start here

| I want to… | Go to |
|---|---|
| Decide whether StrataDB fits my problem | [Why Strata](/docs/why-strata) |
| Install the CLI | [Installation](/docs/getting-started/installation) |
| Create a database and run real commands | [Your first database](/docs/getting-started/first-database) |
| Use it from Python | [Python SDK](/docs/python) |
| Wire StrataDB into a coding agent | [For AI agents](/docs/agents) |
| Understand the mental model | [Concepts](/docs/concepts) |
| Learn one data primitive in depth | [Working with data](/docs/data/key-value) |
| Build a real pattern | [Cookbook](/docs/cookbook) |
| Look up a command or error | [Reference](/docs/reference) |

## Section map

- **[Why Strata](/docs/why-strata)** — what it is,
  [when to use it (and when not)](/docs/why-strata/when-to-use), and
  [honest comparisons](/docs/why-strata/comparisons) vs SQLite, DuckDB, Redis,
  Postgres, and vector databases.
- **[Getting started](/docs/getting-started)** — [install the
  CLI](/docs/getting-started/installation) and create your
  [first database](/docs/getting-started/first-database).
- **[Concepts](/docs/concepts)** — the mental model:
  [embedded architecture](/docs/concepts/embedded-architecture),
  [primitives](/docs/concepts/primitives), [branches](/docs/concepts/branches),
  [time travel](/docs/concepts/time-travel), [commits](/docs/concepts/commits),
  [durability](/docs/concepts/durability), [spaces](/docs/concepts/spaces),
  [value types](/docs/concepts/value-types),
  [hub and clone](/docs/concepts/hub-and-clone), and
  [errors](/docs/concepts/errors).
- **[Working with data](/docs/data/key-value)** — one primitive at a time:
  [key-value](/docs/data/key-value), [JSON](/docs/data/json),
  [events](/docs/data/events), [vectors](/docs/data/vectors), and
  [graph](/docs/data/graph), plus
  [combining primitives](/docs/data/combining-primitives).
- **[Inference](/docs/inference)** — chat, embeddings, and reranking over cloud
  providers with [your own keys](/docs/inference/providers-and-keys), or
  [local models](/docs/inference/local-models).
- **[Guides](/docs/guides)** — cross-cutting how-to:
  [branching workflows](/docs/guides/branching-workflows),
  [time travel](/docs/guides/time-travel), [spaces](/docs/guides/spaces),
  [configuration](/docs/guides/configuration),
  [observability](/docs/guides/observability),
  [error handling](/docs/guides/error-handling),
  [import/export](/docs/guides/import-export),
  [cloning datasets](/docs/guides/cloning-datasets),
  [migrating](/docs/guides/migrating), and [deploying](/docs/guides/deploying).
- **[Cookbook](/docs/cookbook)** — end-to-end patterns:
  [agent state](/docs/cookbook/agent-state-management),
  [multi-agent coordination](/docs/cookbook/multi-agent-coordination),
  [RAG with vectors](/docs/cookbook/rag-with-vectors),
  [deterministic replay](/docs/cookbook/deterministic-replay), and
  [A/B testing with branches](/docs/cookbook/ab-testing-with-branches).
- **[Python SDK](/docs/python)** — [install the
  wheel](/docs/python/installation), the
  [namespace surface](/docs/python/namespaces),
  [typed errors](/docs/python/errors), [inference](/docs/python/inference), and
  [agent helpers](/docs/python/agents).
- **[For AI agents](/docs/agents)** — the [MCP
  server](/docs/agents/mcp-server), the
  [self-describing binary](/docs/agents/agents-guide), the
  [machine-readable catalogs](/docs/agents/command-index), and
  [machine docs](/docs/agents/machine-docs).
- **[Reference](/docs/reference)** — the generated command reference by family,
  the [CLI](/docs/reference/cli),
  [configuration](/docs/reference/configuration-reference),
  [value types](/docs/reference/value-type-reference), and
  [errors](/docs/reference/error-reference).
- **[Architecture](/architecture)** — how V1 is built: the layered stack, the
  storage substrate, durability and recovery, and the capability model.

Stuck? Check the [FAQ](/docs/faq) or
[Troubleshooting](/docs/troubleshooting).
