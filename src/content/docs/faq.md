---
title: "Frequently Asked Questions"
description: "What StrataDB is and isn't, how it stores data, and what changed in the V1 line."
source: "strata-core@v1.0.0"
---


## What it is

### What is StrataDB?

An embedded, multi-model database. It runs inside your process against a local
directory — one binary, one database directory, no server. Five data
capabilities share one storage substrate: key-value, JSON documents, an event
log, vectors, and a graph. On top of that substrate you get git-style branches
and time travel. See [Your first database](/docs/getting-started/first-database)
for a hands-on tour.

### Is it a server?

No. StrataDB is embedded and in-process, like SQLite or DuckDB. You do not start
a daemon, open a port, or manage a connection pool — you point the CLI or the
[Python SDK](/docs/python) at a directory and it opens the database in-process.
There is no network mode in this line.

### Is it a replacement for Postgres or Redis?

No — it complements them. Keep Postgres for relational application data and
Redis for a shared cache. Reach for StrataDB when you want branch-isolated,
versioned state with a KV, JSON, event, vector, and graph model in one place —
agent memory, experiment isolation, and replayable history are the sweet spot.

### Why not just use SQLite?

SQLite is a great relational store, but it has no branch-scoped isolation, no
built-in vector or graph capability, and no per-commit time travel. StrataDB
gives you those on one substrate instead of asking you to build them yourself.

## Storage and durability

### Durable mode versus cache mode?

Point StrataDB at a path and it runs **durable**: writes go through a
write-ahead log and survive the process exiting. Run it with `--cache` and it
runs **in-memory** — nothing is written to disk and the data is gone when the
process ends. Durable mode is the default for any named path; cache mode is for
tests, scratch work, and ephemeral MCP servers.

### Where does my data live?

In the directory you name. A durable database directory holds a write-ahead log,
a manifest, and lock files — treat the directory as one unit; do not edit files
inside it by hand. Global CLI configuration lives separately under your home
directory, so uninstalling the binary never touches your databases.

### How does branching relate to git?

The mental model is the same: fork a branch, get an isolated line of data, and
writes on the fork are invisible to its parent. A fork is cheap because it
shares the parent's data until you change something (copy-on-write), and every
write is a commit you can read back with `--as-of`. Where it differs from git:
this release has no merge command. You fork, isolate, and time-travel; you do not
merge two divergent branches back together. The workflow is fork-and-replay, not
fork-and-merge. See [Branches](/docs/concepts/branches) and
[Commits](/docs/concepts/commits).

## What changed in this line

The V1 line is a clean break, so a few things from earlier previews are gone or
deferred. Straight answers:

### What happened to the state cell?

Removed. There is no separate state-cell capability. Use the KV store for
mutable keyed state, or a JSON document for structured state.

### What happened to sessions and transactions?

Removed as a public surface. There is no `begin` / `commit` / `rollback`. Writes
auto-commit, and multi-item batches commit itemwise or under one shared commit —
you do not manage a transaction by hand.

### What happened to branch bundles?

Replaced by hub clones. Instead of exporting a bundle file, you clone a dataset
from a hub into a new local database with `strata clone`, and `strata remote`
shows where a database was cloned from. See
[Cloning datasets](/docs/guides/cloning-datasets).

### What happened to search?

Vector similarity search is here — create a collection and run `vector query`.
The broader standalone search surface and its optimizer are deferred beyond this
line; the substrate for them is in place. See
[Vectors](/docs/data/vectors).

### Can it run local models?

Not with the released binary. The shipped build executes inference through
cloud providers (Anthropic, OpenAI, Google — bring an API key); local GGUF
execution is compiled in only when the binary is built with the local
feature. The model catalog commands work either way. See
[Inference](/docs/inference).

## Language SDKs and MCP

### Is there a Python or Node SDK?

The **Python SDK** (`stratadb`) links the engine in your process and speaks the
same command surface, value shapes, and error codes as the CLI — see the
[Python SDK](/docs/python) section. Its V1 wheels are rolling out to PyPI. A Node
SDK is later work. Beyond those, the `strata` CLI and its MCP server mean any
language that can run a subprocess or speak MCP can drive Strata today.

### How do I use it from an AI agent?

The Model Context Protocol server is built into the binary — run
`strata <db> mcp serve`; there is no separate package to install. See
[For AI agents](/docs/agents) and
[Agents and MCP](/docs/agents).

## Still stuck?

Check [Troubleshooting](/docs/troubleshooting) for concrete failure modes, or
the [error reference](/docs/reference/error-reference) to look up a specific
code.
