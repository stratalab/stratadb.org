---
title: "When to use StrataDB"
section: "why-strata"
description: "The workloads StrataDB is built for, and the honest boundaries — what it deliberately is not."
source: "strata-core@v1.0.0"
---

StrataDB is opinionated about what it is good at. This page is the honest version:
where it fits, and where it does not.

## Good fits

- **Agent memory and state.** An agent needs durable, structured memory it can
  branch per session and roll back when a path fails. KV and JSON for working
  state, an event log for the action history, vectors for recall, a graph for
  relationships — one database, isolated per session with a
  [branch](/docs/concepts/branches).
- **Experiment isolation.** Fork the whole database, try a change, and discard
  the fork if it goes wrong — without copying data up front or touching the
  parent. Cheap [branches](/docs/concepts/branches) make "try it on a copy" the
  default, not a chore.
- **Replayable history.** When you need to answer "what did this look like last
  Tuesday?" or replay an event stream deterministically, per-commit
  [time travel](/docs/concepts/time-travel) and a hash-linked
  [event log](/docs/data/events) give you the past as a first-class read.
- **Multi-model in one place.** When a single workload genuinely spans key-value,
  documents, vectors, events, and relationships, keeping them on one substrate —
  branched and versioned together — beats gluing four systems together.
- **Embedded and edge.** In-process, single-directory, no server to operate — a
  fit for local-first apps, CLIs, notebooks, and constrained environments where
  running a database daemon is not an option.

## Poor fits (use something else)

- **Primary relational application data.** If your data is fundamentally
  relational and you need SQL, joins, and a mature query planner, use Postgres or
  SQLite. StrataDB complements a relational store; it does not replace one.
- **A shared network cache.** StrataDB is embedded and in-process — there is **no
  server or network mode** in this line. For a cache shared across many
  processes or machines, use Redis.
- **Cross-machine sync or fleet coordination.** A StrataDB database is a local
  directory. Sharing prepared datasets is done by
  [cloning from a hub](/docs/concepts/hub-and-clone); live multi-writer sync
  across machines is out of scope for this line.
- **Merging divergent branches.** Branching is fork-and-replay, not
  fork-and-merge — there is no merge command. If your workflow depends on merging
  two independently-edited branches back together, StrataDB does not do that today.

## The honest boundaries

A few capabilities are deliberately out of this line, so you are not surprised:

- **No local model execution in the released binary.** Inference runs through
  cloud providers by default; local GGUF execution is a build-time feature. See
  [Inference](/docs/inference).
- **No Node SDK yet.** The supported surfaces today are the `strata` CLI, its
  [MCP server](/docs/agents/mcp-server), and the
  [Python SDK](/docs/python) (`stratadb` on PyPI); a Node SDK is post-V1.
- **No standalone search surface.** Vector similarity search is here; the broader
  search product and its optimizer are deferred.

When a fit is marginal, the deciding question is usually: *do you need
branch-isolated, versioned, multi-model state?* If yes, StrataDB earns its place
alongside your primary store. If no, a single-purpose tool is probably simpler.

See [Comparisons](/docs/why-strata/comparisons) for the head-to-head.
