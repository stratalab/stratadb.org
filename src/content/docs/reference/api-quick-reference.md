---
title: "API Quick Reference"
section: "reference"
description: "A one-page cheat sheet of the most common strata operation per capability, with verified examples."
source: "strata-core@v1.0.0"
---

> **Interim page.** Maintained by hand until it is generated from the resolved command index (IDL). Where this page and `strata agents commands --json` disagree, the command index wins.

The operations you reach for most, one per capability. Examples assume a durable database at `./my-db`; swap in `--cache` for an ephemeral one. The full surface is in the [Command Reference](/docs/reference/command-reference); how to invoke the binary is in the [CLI Reference](/docs/reference/cli).

## Targeting and output

```bash
strata ./my-db kv get k        # durable path (or --db ./my-db, or STRATA_DB=./my-db)
strata --cache kv get k        # ephemeral, nothing persisted
strata --json ./my-db kv get k # {"type":…,"data":…} envelope; values base64
strata --raw  ./my-db kv get k # bare value, for scripts
```

## KV

```bash
strata ./my-db kv put greeting hello     # created greeting applied=true
strata ./my-db kv get greeting           # hello
strata ./my-db kv list --prefix user:    # keys with a prefix
strata ./my-db kv delete greeting
```

## JSON

```bash
strata ./my-db json set user:1 '$' '{"name":"Ada","age":36}'   # $ is the document root
strata ./my-db json get user:1 '$.name'                        # "Ada"
strata ./my-db json set user:1 '$.age' 37                      # update one path
strata ./my-db json list --prefix user:
```

## Event log

```bash
strata ./my-db event append signup '{"user":"ada"}'   # created applied=true
strata ./my-db event count                              # 1
strata ./my-db event get 0                            # sequences start at 0
strata ./my-db event by-type signup
```

## Vector

```bash
strata ./my-db vector collection create docs 4 --metric cosine
strata ./my-db vector upsert docs d1 '[0.1,0.2,0.3,0.4]' --metadata '{"lang":"en"}'
strata ./my-db vector query docs '[0.1,0.2,0.3,0.4]' -k 3     # d1  1.0
# metadata filter: AND-composed conditions, each value tagged by type
strata ./my-db vector query docs '[0.1,0.2,0.3,0.4]' -k 3 \
  --filter '{"conditions":[{"field":"lang","op":"eq","value":{"type":"string","value":"en"}}]}'
```

## Graph

```bash
strata ./my-db graph create social
strata ./my-db graph add-node social alice --properties '{"city":"tokyo"}'
strata ./my-db graph add-edge social alice follows bob --weight 1.0
strata ./my-db graph neighbors social alice --direction outgoing
strata ./my-db graph pagerank social         # analytics over the graph
```

## Branches

```bash
strata ./my-db branch fork default experiment   # cheap copy-on-write fork
strata ./my-db kv put city tokyo --branch experiment
strata ./my-db kv get city --branch experiment  # tokyo
strata ./my-db kv get city                       # unchanged on default
strata ./my-db branch list
```

## Spaces

```bash
strata ./my-db space create staging
strata ./my-db kv put k v --space staging   # isolated from the default space
strata ./my-db space list
```

## Time travel

Every write receipt carries a commit clock value at `data.commit.timestamp` (a small integer, visible with `--json`). Pass it back with `--as-of` on any read. It is the commit clock, not a wall-clock time.

```bash
strata --json ./my-db kv put k v1   # data.commit.timestamp: 3
strata ./my-db kv put k v2          # data.commit.timestamp: 4
strata ./my-db kv get k --as-of 3   # v1
```

## Inference

```bash
strata inference models list
strata inference embed <model> "text to embed"
strata inference generate <model> "prompt" --max-tokens 128 --temperature 0.7
```

## Errors

Failures carry a stable code, a hint, and a per-code reference. Recover by code and class, never by message text.

```bash
$ strata ./my-db vector get missing k1
not_found.engine.vector_collection: vector collection does not exist (err_local_…)
  hint: Check that the requested branch, space, collection, graph, document, key, or model exists.
  ref: https://stratadb.org/e/not_found.engine.vector_collection
```

Full registry: [Error Reference](/docs/reference/error-reference) and [Error Handling](/docs/guides/error-handling).

## For agents

```bash
strata agents guide              # the full offline usage guide, version-matched
strata agents commands --json    # the machine-readable command catalog
strata agents errors --json      # the public error-code registry
strata ./my-db mcp serve         # Model Context Protocol over stdio
```

See [Agents and MCP](/docs/agents) and the [MCP Server Reference](/docs/agents/mcp-server).
