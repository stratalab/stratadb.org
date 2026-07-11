---
title: "Command Reference"
section: "reference"
description: "Every strata command in every family, with its syntax and a one-line description."
source: "strata-core@v1.0.0"
---

> **Interim page.** Maintained by hand until it is generated from the resolved command index (IDL). Where this page and `strata agents commands --json` disagree, the command index wins.

Every command the `strata` CLI accepts, grouped by family. For how to invoke the binary — targeting a database, global options, output formats — see the [CLI Reference](/docs/reference/cli). For the one-per-capability cheat sheet, see the [API Quick Reference](/docs/reference/api-quick-reference).

## Conventions

- `<ARG>` is required; `[ARG]` is optional; `<ARG>...` takes one or more values.
- Every command also accepts the global flags `--branch`, `--space`, `--json`, `--raw`, and `-h/--help`. They are omitted from the tables below.
- Reads that support time travel accept `--as-of <commit>` — the commit clock value from a write receipt (`data.commit.timestamp`, a small integer), not a wall-clock time.
- Paginated lists accept `--cursor <token>` and `--limit <n>`; pass a printed cursor back verbatim.
- Arguments that take a value can read it from a file: `@path` inline, or `-f/--file <path>`.
- Writes auto-commit. There are no transaction verbs and no state-cell capability in this surface.

The five data capabilities are KV, JSON, event log, vector, and graph. Branches and product spaces are the organizing dimensions layered over all of them.

## Setup and diagnostics

| Syntax | Description |
|--------|-------------|
| `strata init` | Prepare the Strata home directory and print next steps. Needs no database. |
| `strata doctor` | Check the installation and, when a database is targeted, its health. Exits non-zero on issues. |

## Database facts

| Syntax | Description |
|--------|-------------|
| `strata ping` | Lightweight liveness check. Prints `pong` and the version. |
| `strata info` | Print database information: branch and space counts, target, durability. |
| `strata health` | Print health facts for the branch catalog, space catalog, registry, and identity. |
| `strata metrics` | Print metrics facts: control status, counts, durability. |
| `strata describe` | Print a compact database description: capabilities, primitive counts, branches, spaces. |

## Configuration

| Syntax | Description |
|--------|-------------|
| `strata config get` | Print sanitized config. |
| `strata config get-key <KEY>` | Print one sanitized config value (`hub.url` reads the user config). |
| `strata config set <KEY> <VALUE>` | Set a user-config key (`hub.url`) in the global strata config. |
| `strata config unset <KEY>` | Remove a user-config key from the global config. |
| `strata config path` | Print the global strata config file path. |
| `strata config show` | Print the resolved hub configuration and which layer supplied it. |

See the [Configuration Reference](/docs/reference/configuration-reference) and [Database Configuration](/docs/guides/database-configuration).

## Cloning

| Syntax | Description |
|--------|-------------|
| `strata clone <DATASET> [DEST]` | Clone a dataset from a hub into a new local database. `--branch <BRANCH>` selects the branch to fetch; `--hub <HUB>` overrides the hub URL. `DEST` defaults to `./<dataset>.strata`. |
| `strata remote` | Show where this database was cloned from. `origin` is null when the database was not cloned. |

See [Cloning Datasets](/docs/guides/cloning-datasets).

## Agents

| Syntax | Description |
|--------|-------------|
| `strata agents guide` | Print the complete offline usage guide (markdown, version-matched). |
| `strata agents commands` | Print the machine-readable command catalog. |
| `strata agents errors` | Print the public error-code registry. |
| `strata agents init` | Write repo onboarding files (`.strata/AGENTS.md`); `--apply` appends a pointer block to the repo's `AGENTS.md` or `CLAUDE.md`. |

## MCP

| Syntax | Description |
|--------|-------------|
| `strata mcp serve` | Serve MCP over stdio (newline-delimited JSON-RPC; logs on stderr). |

See [Agents and MCP](/docs/guides/agents-and-mcp) and the [MCP Server Reference](/docs/reference/mcp).

## Branch

| Syntax | Description |
|--------|-------------|
| `strata branch list` | List branches. |
| `strata branch get <BRANCH>` | Read one branch. |
| `strata branch create <BRANCH>` | Create an empty root branch. |
| `strata branch fork <SOURCE> <BRANCH>` | Fork a branch. `--version <V>` or `--timestamp <T>` forks from a retained source point. |
| `strata branch delete <BRANCH>` | Delete a branch. |

See [Branches](/docs/concepts/branches) and [Branch Management](/docs/guides/branch-management).

## Space

| Syntax | Description |
|--------|-------------|
| `strata space list` | List spaces. |
| `strata space create <SPACE>` | Create a space. |
| `strata space exists <SPACE>` | Check whether a space exists. |
| `strata space delete <SPACE>` | Delete a space. `--force` deletes visible data in the space first. |

See [Spaces](/docs/guides/spaces).

## KV

| Syntax | Description |
|--------|-------------|
| `strata kv put <KEY> [VALUE]` | Write one key. `-f/--file` or `@path` reads value bytes from a file. |
| `strata kv get <KEY>` | Read one key. |
| `strata kv delete <KEY>` | Delete one key. |
| `strata kv list` | List keys. `--prefix`. |
| `strata kv scan` | Scan rows with values and version facts. `--start`. |
| `strata kv exists <KEY>` | Check key existence. |
| `strata kv history <KEY>` | Read version history. |
| `strata kv count` | Count keys. `--prefix`. |
| `strata kv sample` | Sample rows. `--prefix`, `--count`. |

See [KV Store](/docs/guides/kv-store).

## JSON

| Syntax | Description |
|--------|-------------|
| `strata json set <KEY> <PATH> [VALUE]` | Set a JSON path (`$` is the document root). Non-JSON text is stored as a string. `-f/--file` or `@path`. |
| `strata json get <KEY> <PATH>` | Read a JSON path. |
| `strata json delete <KEY> <PATH>` | Delete a JSON path. |
| `strata json list` | List JSON document keys. `--prefix`. |
| `strata json exists <KEY>` | Check whether a document exists. |
| `strata json history <KEY>` | Read document history. |
| `strata json count` | Count documents. `--prefix`. |
| `strata json sample` | Sample documents. `--prefix`, `--count`. |

### JSON secondary indexes

| Syntax | Description |
|--------|-------------|
| `strata json index create <NAME> <FIELD_PATH>` | Create an index. `--index-type <numeric\|tag\|text>` (default `tag`). |
| `strata json index drop <NAME>` | Drop an index. |
| `strata json index list` | List indexes. |

See [JSON Store](/docs/guides/json-store).

## Vector

### Collections

| Syntax | Description |
|--------|-------------|
| `strata vector collection create <COLLECTION> <DIMENSION>` | Create a collection. `--metric <cosine\|euclidean\|dot-product>` (default `cosine`). |
| `strata vector collection delete <COLLECTION>` | Delete a collection. |
| `strata vector collection list` | List collections. |
| `strata vector collection stats <COLLECTION>` | Read collection stats. |

### Vectors

| Syntax | Description |
|--------|-------------|
| `strata vector upsert <COLLECTION> <KEY> [VECTOR]` | Upsert one vector (JSON array, comma-separated floats, or `@path`). `--metadata`/`--metadata-file` attaches metadata. |
| `strata vector get <COLLECTION> <KEY>` | Read one vector. |
| `strata vector history <COLLECTION> <KEY>` | Read vector history. |
| `strata vector exists <COLLECTION> <KEY>` | Check vector existence. |
| `strata vector keys <COLLECTION>` | List vector keys. `--prefix`. |
| `strata vector update-metadata <COLLECTION> <KEY> [PATCH]` | Patch vector metadata (top-level patch JSON or `@path`). |
| `strata vector delete <COLLECTION> <KEY>` | Delete one vector. |
| `strata vector delete-all <COLLECTION>` | Delete all vectors in a collection. |
| `strata vector delete-by-filter <COLLECTION>` | Delete vectors matching a metadata filter. `--filter`/`--filter-file`. |
| `strata vector query <COLLECTION> [QUERY]` | Search vectors. `-k/--k` (default 10), `--filter`/`--filter-file`, `--diagnostics`. |
| `strata vector count <COLLECTION>` | Count vectors. |

See [Vector Store](/docs/guides/vector-store).

## Event

| Syntax | Description |
|--------|-------------|
| `strata event append <EVENT_TYPE> [PAYLOAD]` | Append one event (payload JSON or `@path`; `-f/--file`). |
| `strata event get <SEQUENCE>` | Read one event. Sequences start at 0. |
| `strata event exists <SEQUENCE>` | Check event existence. |
| `strata event len` | Count visible events. |
| `strata event list` | List events. `--event-type`, `--limit`, `--after-sequence`. |
| `strata event types` | List event types. |
| `strata event by-type <EVENT_TYPE>` | List events by type. `--limit`, `--after-sequence`. |
| `strata event range <START_SEQ>` | Read an event sequence range. `--end-seq`, `--limit`, `--direction <forward\|reverse>`, `--event-type`. |
| `strata event range-time <START_TS>` | Read events by timestamp range. `--end-ts`, `--limit`, `--direction`, `--event-type`. |
| `strata event verify-chain` | Verify sequence density and hash linkage. |

See [Event Log](/docs/guides/event-log).

## Graph

### Core

| Syntax | Description |
|--------|-------------|
| `strata graph create <GRAPH>` | Create a graph. |
| `strata graph delete <GRAPH>` | Delete a graph. |
| `strata graph list` | List graphs. |
| `strata graph meta <GRAPH>` | Read graph metadata. |
| `strata graph add-node <GRAPH> <NODE_ID>` | Add or replace a node. `--properties`/`--properties-file`, `--type <OBJECT_TYPE>`. |
| `strata graph get-node <GRAPH> <NODE_ID>` | Read a node. |
| `strata graph remove-node <GRAPH> <NODE_ID>` | Remove a node. |
| `strata graph list-nodes <GRAPH>` | List nodes. `--prefix`. |
| `strata graph add-edge <GRAPH> <SRC> <EDGE_TYPE> <DST>` | Add or replace an edge. `--weight`, `--properties`/`--properties-file`. |
| `strata graph get-edge <GRAPH> <SRC> <EDGE_TYPE> <DST>` | Read an edge. |
| `strata graph remove-edge <GRAPH> <SRC> <EDGE_TYPE> <DST>` | Remove an edge. |
| `strata graph neighbors <GRAPH> <NODE_ID>` | List neighbors. `--direction <outgoing\|incoming\|both>`, `--edge-type`. |
| `strata graph nodes-by-type <GRAPH> <OBJECT_TYPE>` | List nodes declaring an object type. |

### Ontology

| Syntax | Description |
|--------|-------------|
| `strata graph ontology define-object-type <GRAPH> <NAME>` | Define (or, while draft, redefine) an object type. `--properties`/`--properties-file`. |
| `strata graph ontology define-link-type <GRAPH> <NAME> <SOURCE> <TARGET>` | Define a link type. `--cardinality`, `--properties`/`--properties-file`. |
| `strata graph ontology delete-object-type <GRAPH> <NAME>` | Delete a draft object type. |
| `strata graph ontology delete-link-type <GRAPH> <NAME>` | Delete a draft link type. |
| `strata graph ontology freeze <GRAPH>` | Freeze the ontology; writes then validate against it. |
| `strata graph ontology get <GRAPH>` | Read the ontology (status plus every declared type). |
| `strata graph ontology summary <GRAPH>` | Read the ontology with per-type usage counts. |

### Analytics and traversal

| Syntax | Description |
|--------|-------------|
| `strata graph wcc <GRAPH>` | Compute weakly connected components. |
| `strata graph lcc <GRAPH>` | Compute local clustering coefficients. |
| `strata graph sssp <GRAPH> <SOURCE>` | Compute shortest-path distances from a source node. `--direction`. |
| `strata graph pagerank <GRAPH>` | Compute pagerank importance scores. `--damping`, `--max-iterations`, `--tolerance`, `--personalization`. |
| `strata graph cdlp <GRAPH>` | Detect communities via label propagation. `--max-iterations`, `--direction`. |
| `strata graph bulk-insert <GRAPH>` | Ingest nodes and edges from JSON in chunked commits. `--data`/`--file`, `--chunk-size`. |
| `strata graph bfs <GRAPH> <START>` | Run a bounded breadth-first traversal. `--max-depth`, `--max-nodes`, `--edge-type` (repeatable), `--direction`. |

See [Graph](/docs/guides/graph).

## Arrow

| Syntax | Description |
|--------|-------------|
| `strata arrow import <FILE_PATH> --target <kv\|json\|vector>` | Import an Arrow-compatible file. `--format <parquet\|csv\|jsonl>`, `--key-column`, `--value-column`, `--collection`. |
| `strata arrow export <PATH> --primitive <kv\|json\|event\|vector\|graph> --format <parquet\|csv\|jsonl>` | Export a primitive to a file. `--prefix`, `--limit`, `--collection`, `--graph`, `--event-type`. Graph exports use `<PATH>` as a stem for node and edge files. |

See [Arrow](/docs/guides/arrow).

## Inference

### Models

| Syntax | Description |
|--------|-------------|
| `strata inference models list` | List catalog models. |
| `strata inference models local` | List locally available models. |
| `strata inference models pull <MODEL>` | Download a model into the local model directory. Honors `STRATA_MODELS_DIR`, `STRATA_HF_ENDPOINT`, and `STRATA_HF_TOKEN`/`HF_TOKEN`. |

### Execution

| Syntax | Description |
|--------|-------------|
| `strata inference capability <MODEL>` | Show capability facts for one model spec. |
| `strata inference generate <MODEL> <PROMPT>` | Generate text. `--max-tokens`, `--temperature`, `--top-k`, `--top-p`, `--seed`, `--stop` (repeatable), `--stop-token`, `--grammar`. |
| `strata inference tokenize <MODEL> <TEXT>` | Tokenize text with a local model. `--special`. |
| `strata inference detokenize <MODEL> <IDS>...` | Detokenize token ids with a local model. |
| `strata inference embed <MODEL> <TEXT>` | Embed one text. |
| `strata inference embed-batch <MODEL> <TEXTS>...` | Embed multiple texts in order. |
| `strata inference rank <MODEL> <QUERY> <PASSAGES>...` | Rank passages against a query. |
| `strata inference unload [MODEL]` | Unload one cached model, or all cached models when the spec is omitted. |
| `strata inference cache-status` | Show runtime model-cache diagnostics. |

See [Inference](/docs/guides/inference).

## Raw command escape hatch

The programmatic path: build a command as wire JSON and run it. On the wire, keys and values are base64, and command names use the catalog spelling (`strata agents commands --json`), not the CLI verb spelling.

| Syntax | Description |
|--------|-------------|
| `strata command run` | Execute a serialized executor command. `--command-json <JSON>` or `--file <PATH>`. |
| `strata command print` | Validate and print a serialized executor command without opening a database. `--command-json` or `--file`. |

```bash
strata ./my-db command run --command-json '{"type":"kv_get","key":"a2V5"}'
```

## Wire-only commands (batches)

The command index includes wire-level commands the CLI does not expose as subcommands — the batch operations `kv batch-put`, `kv batch-get`, `kv batch-delete`, `kv batch-exists`, `vector batch-upsert`, `vector batch-get`, `vector batch-delete`, and their peers. There is no `strata kv batch-put` verb:

```bash
$ strata ./my-db kv batch-put
error: unrecognized subcommand 'batch-put'
```

Run them through the escape hatch above (or over MCP). For example, writing two KV keys (`a`→`1`, `b`→`2`) in one commit:

```bash
strata ./my-db command run --command-json \
  '{"type":"kv_batch_put","entries":[{"key":"YQ==","value":"MQ=="},{"key":"Yg==","value":"Mg=="}]}'
```

## Machine catalog coverage

`strata agents commands --json` is the authoritative catalog. Today it carries full metadata for 32 commands across the KV and vector families, including the batch operations above. When this page and the catalog disagree, the catalog wins.

This page documents 117 CLI commands in total.
