---
title: "Getting Started"
section: "getting-started"
description: "The path from installing the CLI to running your first database."
source: "strata-core@v1.0.0"
---


New to StrataDB? Take these three steps in order.

1. **[Installation](/docs/getting-started/installation)** — install the `strata`
   CLI and confirm it runs.
2. **[Your first database](/docs/getting-started/first-database)** — create a
   durable database, work in the REPL and one-shot forms, write across the KV
   and JSON capabilities, fork a branch, and read an earlier version.
3. **[For AI agents](/docs/getting-started/for-agents)** — if you are wiring
   StrataDB into a coding agent or an MCP client, start here for the integration
   recipe.

## What you are installing

StrataDB is embedded: it runs inside your process against a local directory,
the way SQLite or DuckDB does. There is no server to start, no port to open, and
no daemon to keep alive. You install one binary, `strata`, and point it at a
path — that directory is your database.

That one binary carries five data capabilities over a single storage substrate —
key-value, JSON documents, an event log, vectors, and a graph — plus git-style
branches and per-commit time travel. The same binary is also a Model Context
Protocol server, so an AI agent can drive it with no extra package.

## What each step gives you

The **installation** page covers the installer script, Homebrew, and building
from source, and ends with a one-line check that the CLI works.

The **first database** tutorial is hands-on against the real binary: you create
a database on disk, write and read data, open the interactive REPL, fork a
branch to isolate a change, and read a value as it stood at an earlier commit.
Every command and output on that page comes from a live run.

The **for AI agents** page is the tight integration recipe — how the binary
describes its own commands and errors, how to onboard a repository, and how to
run the built-in MCP server.

## After the tutorial

Once the moves feel familiar, read [Concepts](/docs/concepts/branches) to
understand [branches](/docs/concepts/branches), [commits](/docs/concepts/commits),
and [durability](/docs/concepts/durability). Then use the
[Guides](/docs/guides/kv-store) to go deep on one capability at a time, and the
[Cookbook](/docs/cookbook/agent-state-management) for end-to-end patterns.

If something breaks, [Troubleshooting](/docs/troubleshooting) lists real failure
modes and the error codes they carry.
