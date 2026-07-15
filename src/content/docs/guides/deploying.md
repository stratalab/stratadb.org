---
title: "Deploying"
section: "guides"
description: "How to ship Strata: embed the binary in an app, bundle or clone the database, and run it in the browser."
source: "strata-core@v1.0.0"
---

Because Strata is [embedded](/docs/concepts/embedded-architecture), deploying it
is unlike deploying a database server — there is no service to run, scale, or
secure a network boundary around. "Deployment" is mostly a matter of shipping a
binary and getting a database directory next to it. This guide covers the ways to
do that.

## The embedded model

A durable Strata database is a **local directory**, and the engine runs
**in-process**. So a deployment has two pieces:

1. **The binary** — the `strata` CLI (or, later, a language SDK that embeds the
   engine). Distribute it like any other executable; per-platform builds are
   published with each release.
2. **The database directory** — created on first write, or shipped alongside the
   app. There is no connection string, no port, and no separate process to
   supervise.

One durable database is opened with an exclusive lock, so the deployment unit is
"one process owns one database directory." For throwaway or read-mostly
workloads, [cache mode](/docs/concepts/durability) (`--cache`) needs no directory
at all.

## Bundle or clone the data

Two ways to get a database in place at deploy time:

- **Bundle a prepared directory.** Because a database is just a directory, you can
  build one during your release process and ship it with the app — copy the whole
  directory as a unit (never individual files inside it). The app opens it in
  place.
- **Clone at first run.** For curated datasets, pull one from a hub on startup
  with [`strata clone`](/docs/guides/cloning-datasets); the result is an ordinary
  local database that remembers its origin. This keeps large prepared data out of
  your build artifact.

Either way, the app then branches and writes locally — a shipped database is a
starting point, not a read-only bundle.

## In the browser

Strata compiles to **WebAssembly** and runs entirely in the browser in
[cache mode](/docs/concepts/durability) — the same engine and the same commands,
with nothing written to a server. The [playground](/playground) runs a full
database this way, with no installation. This is the path for docs, demos, and
client-side apps that want branch-and-time-travel semantics without a backend.

Browser deployments are cache-mode: state lives for the life of the page, so
persist anything you need to keep through your own application layer.

## Agent and tool deployments

To expose a deployed database to an AI agent, run the built-in
[MCP server](/docs/agents/mcp-server) — `strata <db> mcp serve` — as the app's
subprocess. It speaks stdio, so there is still no network service to operate; the
agent drives the same database in-process.

## Edge and constrained environments

The embedded model — one static-ish binary, one directory, no server — is a
natural fit for local-first apps, CLIs, notebooks, and constrained devices. Tuning
Strata for very small footprints (single-board computers and smaller) is an active
direction rather than a turnkey recipe today; if that is your target, the
[embedded architecture](/docs/concepts/embedded-architecture) is the place to
start and the shape the roadmap is building toward.

## Related

- [Embedded architecture](/docs/concepts/embedded-architecture) — why deployment
  is this simple.
- [Cloning datasets](/docs/guides/cloning-datasets) — getting a prepared database
  at startup.
- [For AI agents](/docs/agents) — the MCP server and self-describing surface.
