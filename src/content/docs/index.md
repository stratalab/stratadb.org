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
  commit. See [Commits](/docs/concepts/commits).
- **Durable or in-memory.** Point StrataDB at a directory and it persists
  through a write-ahead log; run it with `--cache` and nothing touches disk.
  See [Durability](/docs/concepts/durability).
- **Built for agents.** The binary describes itself — a usage guide, a command
  catalog, and an error registry are all emitted from the running binary — and
  it speaks the Model Context Protocol over stdio. See
  [For AI agents](/docs/getting-started/for-agents).

## Start here

| I want to… | Go to |
|---|---|
| Install the CLI | [Installation](/docs/getting-started/installation) |
| Create a database and run real commands | [Your first database](/docs/getting-started/first-database) |
| Wire StrataDB into a coding agent | [For AI agents](/docs/getting-started/for-agents) |
| Understand the mental model | [Concepts](/docs/concepts/branches) |
| Learn one capability in depth | [Guides](/docs/guides/kv-store) |
| Build a real pattern | [Cookbook](/docs/cookbook/agent-state-management) |
| Look up a command or error | [Reference](/docs/reference/cli) |

## Section map

- **[Getting started](/docs/getting-started/installation)** — install the CLI,
  create your [first database](/docs/getting-started/first-database), and set up
  the [agent front door](/docs/getting-started/for-agents).
- **[Concepts](/docs/concepts/branches)** — the ideas you build on:
  [branches](/docs/concepts/branches), [commits](/docs/concepts/commits),
  [durability](/docs/concepts/durability),
  [primitives](/docs/concepts/primitives), and
  [value types](/docs/concepts/value-types).
- **[Guides](/docs/guides/kv-store)** — one capability at a time:
  [KV](/docs/guides/kv-store), [JSON](/docs/guides/json-store),
  [event log](/docs/guides/event-log), [vectors](/docs/guides/vector-store),
  [graph](/docs/guides/graph), plus cross-cutting guides on
  [branch management](/docs/guides/branch-management),
  [spaces](/docs/guides/spaces),
  [configuration](/docs/guides/database-configuration),
  [observability](/docs/guides/observability),
  [error handling](/docs/guides/error-handling),
  [agents and MCP](/docs/guides/agents-and-mcp),
  [cloning datasets](/docs/guides/cloning-datasets),
  [Arrow](/docs/guides/arrow), and [inference](/docs/guides/inference).
- **[Cookbook](/docs/cookbook/agent-state-management)** — end-to-end patterns:
  [agent state](/docs/cookbook/agent-state-management),
  [multi-agent coordination](/docs/cookbook/multi-agent-coordination),
  [RAG with vectors](/docs/cookbook/rag-with-vectors),
  [deterministic replay](/docs/cookbook/deterministic-replay), and
  [A/B testing with branches](/docs/cookbook/ab-testing-with-branches).
- **[Reference](/docs/reference/cli)** — precise surfaces:
  [CLI](/docs/reference/cli),
  [command reference](/docs/reference/command-reference),
  [API quick reference](/docs/reference/api-quick-reference),
  [configuration](/docs/reference/configuration-reference),
  [value types](/docs/reference/value-type-reference),
  [errors](/docs/reference/error-reference), and [MCP](/docs/reference/mcp).

Stuck? Check the [FAQ](/docs/faq) or
[Troubleshooting](/docs/troubleshooting).
