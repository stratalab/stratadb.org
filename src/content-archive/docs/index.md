---
title: "StrataDB Documentation"
description: "Install StrataDB, create a database, fork a branch, and find the generated reference for the shipped CLI."
source: "strata-core@v1.1.1"
---

StrataDB is an embedded database you can fork. It runs in your process against a
local directory; there is no server to start.

Narrative docs show the REPL by default: open a database once with
`strata ./mydb`, then run commands at the `strata:branch/space ›` prompt.
Generated reference pages and shell pipelines keep the one-shot CLI form.

Start with the shortest path:

1. [Install the CLI](/docs/getting-started/installation).
2. [Create your first database](/docs/getting-started/first-database).
3. [Fork a branch and merge it back](/docs/concepts/branches).

If you are evaluating the product, read [Why Strata](/docs/why-strata). If you
are wiring an agent, start with [For AI agents](/docs/agents). If you need an
exact command shape, go straight to the generated [Reference](/docs/reference).

## The Model

StrataDB has five data shapes:

- [Key-value](/docs/data/key-value) for opaque values by key.
- [JSON](/docs/data/json) for documents and path writes.
- [Events](/docs/data/events) for append-only history.
- [Vectors](/docs/data/vectors) for similarity search over embeddings.
- [Graph](/docs/data/graph) for nodes, edges, traversal, and analytics.

They share one branch-aware, versioned store. A branch isolates all five. A
historical read sees all five at the same commit.

## Where To Go

| Need | Page |
|---|---|
| Decide if StrataDB fits | [Why Strata](/docs/why-strata) |
| Install the binary | [Installation](/docs/getting-started/installation) |
| Run the first write, fork, merge, and time-travel read | [Your first database](/docs/getting-started/first-database) |
| Pick the right data shape | [Working with data](/docs/data) |
| Run models | [Inference](/docs/inference) |
| Use StrataDB from Python | [Python SDK](/docs/python) |
| Give StrataDB to an agent or MCP client | [For AI agents](/docs/agents) |
| Look up command syntax or errors | [Reference](/docs/reference) |
| Read the internals | [Architecture](/architecture) |

## Generated Truth

Command pages under `/docs/reference/<family>` are generated from the
`strata-core v1.1.1` release bundle. Error pages under `/e/<code>` are generated
from the shipped error registry. Narrative pages explain how to use the product;
the generated reference owns exhaustive parameters, return shapes, and error
lists.

Every docs page is also available as CommonMark by appending `.md` to the URL.
Agents can start from [llms.txt](/llms.txt) or [llms-full.txt](/llms-full.txt).
