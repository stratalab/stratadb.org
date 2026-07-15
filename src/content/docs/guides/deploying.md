---
title: "Deploying"
section: "guides"
description: "Ship StrataDB with your app: seed a database in your release build, copy it as a unit, containerize it, and expose it to agents."
source: "strata-core@v1.0.0"
---

Because StrataDB is [embedded](/docs/concepts/embedded-architecture), deploying
it is unlike deploying a database server — there is no service to run, scale, or
secure a network boundary around. A deployment is two pieces: the `strata`
binary (or the [Python SDK](/docs/python), which links the engine directly) and
a database directory. This guide is the concrete recipes; every command below
was run against the shipped binary.

One durable database is opened by one process at a time (an exclusive lock
enforces it), so the deployment unit is "one process owns one database
directory." For throwaway or read-mostly workloads,
[cache mode](/docs/concepts/durability) (`--cache`) needs no directory at all.

## Seed a database in your release build

A database is created on first write, so "prepare a dataset" is just a script
that runs `strata` against the directory your build ships:

```bash
strata ./dist/appdb kv put config:mode production
strata ./dist/appdb json set catalog:1 '$' '{"name":"Starter dataset","rows":120}'
strata ./dist/appdb describe
```

```text
created config:mode applied=true
created catalog:1 applied=true
{
  "branch": "default",
  ...
  "primitives": {
    "event_count": 0,
    "graphs": [],
    "json_count": 1,
    "kv_count": 1,
    "vector_collections": []
  },
  "target": "durable_local",
  "version": "1.0.0"
}
```

`describe` at the end of the seed step doubles as a build-time sanity check —
assert on `kv_count`/`json_count` in CI and the artifact can't ship empty.

## Copy the directory as a unit

A database directory moves like any other build artifact — copy the **whole
directory**, never individual files inside it:

```bash
cp -a ./dist/appdb ./appdb-copy
strata ./appdb-copy kv get config:mode
```

```text
production
```

The copy is a fully independent database. Ship it in a tarball, bake it into an
image, or sync it to a target host; the app opens it in place.

## Ship it in a container

The same two pieces — binary plus directory — in a Dockerfile. This image
installs the binary with the official install script, copies the seeded
database from the build context, and starts the built-in
[MCP server](/docs/agents/mcp-server) as its entrypoint:

```dockerfile
FROM debian:bookworm-slim

# The strata binary — installed from the official script at build time.
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates \
    && curl -fsSL https://stratadb.org/install.sh | sh \
    && apt-get purge -y curl && rm -rf /var/lib/apt/lists/*
ENV PATH="/root/.strata/bin:${PATH}"

# The database directory — seeded during the release build, copied as a unit.
COPY dist/appdb /data/appdb

CMD ["strata", "/data/appdb", "mcp", "serve"]
```

```bash
docker build -t strata-app .
docker run --rm strata-app strata /data/appdb kv get config:mode
```

```text
production
```

Pin a release with `STRATA_VERSION=<x.y.z>` before the install line if you want
builds reproducible against a specific binary version.

## Clone at first run

For curated datasets, keep the data out of the artifact entirely and pull it
from a hub on startup — the result is an ordinary local database that
[remembers its origin](/docs/concepts/hub-and-clone):

```bash
[ -d ./appdb ] || strata clone starter-dataset ./appdb
```

The `[ -d ... ]` guard makes startup idempotent: an existing directory is
opened as-is, a missing one is cloned. See
[Cloning datasets](/docs/guides/cloning-datasets) for hub resolution and the
failure modes (bad URL, unreachable host) with their error codes.

## Expose it to an agent

To hand a deployed database to an AI agent, run the MCP server as the app's
subprocess — it speaks stdio, so there is still no network service to operate:

```bash
strata ./dist/appdb mcp serve
```

```text
{"id":1,"jsonrpc":"2.0","result":{"capabilities":{"tools":{"listChanged":false}},"instructions":"Strata is an embedded multi-model database (KV, JSON, vectors, events, graphs) with branches and time travel. ...
```

(The line above is the server's response to an `initialize` request on stdin —
the full handshake is on the [MCP server](/docs/agents/mcp-server) page.)

## In the browser

StrataDB compiles to **WebAssembly** and runs entirely in the browser in
[cache mode](/docs/concepts/durability) — the same engine and the same
commands, with nothing written to a server. The [playground](/playground) runs
a full database this way, with no installation. Browser deployments are
cache-mode: state lives for the life of the page, so persist anything you need
to keep through your own application layer.

## Edge and constrained environments

The embedded model — one binary, one directory, no server — is a natural fit
for local-first apps, CLIs, notebooks, and constrained devices. Tuning StrataDB
for very small footprints (single-board computers and smaller) is an active
direction rather than a turnkey recipe today; if that is your target, the
[embedded architecture](/docs/concepts/embedded-architecture) is the place to
start and the shape the roadmap is building toward.

## Related

- [Embedded architecture](/docs/concepts/embedded-architecture) — why deployment
  is this simple.
- [Cloning datasets](/docs/guides/cloning-datasets) — hub resolution and clone
  failure modes.
- [Configuration](/docs/guides/configuration) — tuning the database the app
  opens.
- [For AI agents](/docs/agents) — the MCP server and self-describing surface.
