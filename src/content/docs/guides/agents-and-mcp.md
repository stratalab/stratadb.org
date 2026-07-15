---
title: "Agents and MCP"
section: "guides"
description: "Wire the database into coding agents through its self-describing catalogs, repo onboarding files, and a stdio MCP server."
source: "strata-core@v1.0.0"
---

Strata is built to be driven by agents. It describes itself: a version-matched usage guide, machine-readable command and error catalogs, one command to drop onboarding notes into a repo, and an MCP server that exposes the core verbs as tools. Everything here is generated from the installed binary's own metadata, so it matches exactly what your binary does.

## The offline guide

`strata agents guide` prints the complete usage guide as markdown — targeting rules, every capability, branches, and time travel — with no network call. It is the first thing to hand an agent that has a shell:

```bash
strata --cache agents guide
```

```text
## Targeting a database

1. Explicit path or `--db <path>` — always wins: `strata ./my-db kv get k`
2. `STRATA_DB=<path>` — set once per session, used when no path is passed
3. `--cache` — explicit in-memory database (nothing persisted)
```

## Machine catalogs

Two commands emit structured catalogs an agent can load directly.

`strata agents commands --json` returns the command catalog — each command with its access class, batching and commit behavior, description, docs path, and the error codes it can raise:

```bash
strata --cache agents commands --json
```

```text
{"data":{"command_count":32,"commands":[{"access":"write","batch":"itemwise", ... }]}}
```

`strata agents errors --json` returns the public error registry — each code with its class, hint, retry policy, and reference URL:

```bash
strata --cache agents errors --json
```

```text
{"data":{"count":204,"errors":[{"class":"invalid_argument","code":"invalid_argument.engine.branch_catalog","commit_outcome":"not_started","hint":"Correct the invalid field named by the error message and retry the operation.","message":"The request contains invalid input.","ref":"https://stratadb.org/e/invalid_argument.engine.branch_catalog","retry_policy":"never"}, ... ]}}
```

Because both catalogs come from the binary, an agent never has to guess a verb or an error meaning — it can enumerate them.

## Repo onboarding

`strata agents init` writes `.strata/AGENTS.md`, a short pointer block that tells any agent working in the repo how to discover the rest:

```bash
strata --cache agents init
```

```text
{
  "next": null,
  "pointer": "absent",
  "pointer_target": null,
  "written": [ ".strata/AGENTS.md" ]
}
```

The written file points at the live guide and catalogs rather than duplicating them:

```text
## Strata

This repo uses Strata (embedded database — SQLite-shaped, zero-config).

- Full usage guide: run `strata agents guide` (offline, version-matched)
- Command catalog: `strata agents commands --json`; errors: `strata agents errors --json`
- Database targeting: pass a path or set `STRATA_DB`; never rely on cwd
- Structured output: add `--json` to any command; raw commands via `strata <db> command run --command-json`
- MCP: `strata <db> mcp serve` (stdio; same envelopes and error codes)
```

Add `--apply` to also append that pointer block to an existing `AGENTS.md` or `CLAUDE.md` at the repo root, so agents that read those files find Strata without being told:

```bash
strata --cache agents init --apply
```

```text
{
  "next": null,
  "pointer": "appended",
  "pointer_target": "CLAUDE.md",
  "written": [ ".strata/AGENTS.md" ]
}
```

## MCP server

`strata <db> mcp serve` speaks the Model Context Protocol over stdio: newline-delimited JSON-RPC on stdin and stdout, logs on stderr. Like every command, it needs a database target — a path, `--db`, `--cache`, or `STRATA_DB` — or it refuses with `invalid_argument.cli.no_database`. Point any MCP client at it as a command-type server with the database path as an argument.

You can drive it by hand. Send an `initialize` request, the `initialized` notification, then `tools/list`:

```bash
printf '%s\n%s\n%s\n' \
  '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"probe","version":"1.0"}}}' \
  '{"jsonrpc":"2.0","method":"notifications/initialized"}' \
  '{"jsonrpc":"2.0","id":2,"method":"tools/list"}' \
  | strata ./agent.strata mcp serve
```

The server acknowledges `initialize` with `serverInfo.name` `strata`, advertises a `tools` capability, and echoes back the `protocolVersion` your client requested. `tools/list` then returns each tool with a JSON Schema for its input — the first entry looks like this:

```text
{"description":"Return the complete Strata usage guide (markdown, version-matched to this server). Call this first when unsure how anything works.","inputSchema":{"properties":{},"type":"object"},"name":"strata_guide"}
```

The live handshake returns 20 tools:

| Tool | Purpose |
|------|---------|
| `strata_guide` | Return the complete usage guide; call first when unsure |
| `strata_command` | Escape hatch — run any cataloged command as raw wire JSON |
| `strata_kv_put` / `strata_kv_get` / `strata_kv_delete` / `strata_kv_list` | Key-value read, write, delete, and paginated list |
| `strata_json_set` / `strata_json_get` / `strata_json_delete` | JSON document path read, write, and delete |
| `strata_vector_create_collection` / `strata_vector_upsert` / `strata_vector_query` | Create a collection, upsert an embedding, similarity search |
| `strata_event_append` / `strata_event_list` | Append one immutable event; list events by type |
| `strata_graph_create` / `strata_graph_add_node` / `strata_graph_add_edge` / `strata_graph_neighbors` | Create a graph, add nodes and edges, traverse neighbors |
| `strata_branch_list` / `strata_branch_fork` | List branches; fork a branch, optionally anchored for time travel |

Every tool takes optional `branch` and `space` arguments and returns the same JSON envelopes and stable error codes as the CLI. The curated tools are the core verbs; everything else — graph analytics, spaces, history, batches — is reachable through the `strata_command` meta-tool, which executes any command from the catalog as raw wire JSON. That is the design: a small, well-described tool set for the common path, with the full surface one escape hatch away. When a tool call is unclear, the server's own instructions tell the client to call `strata_guide` first.

One thing to watch when calling tools by hand: wire values are not always spelled like CLI flags. The vector metric is `dot_product` (underscore) in a `strata_vector_create_collection` call, where the CLI's `vector create` takes `dot-product` (hyphen). When in doubt, the tool's `inputSchema` from `tools/list` is authoritative.

## Related

- [MCP Reference](/docs/reference/mcp) — the protocol-level detail behind this walkthrough
- [Inference](/docs/inference) — running the models that drive an agent
- [Command Reference](/docs/reference/command-reference) — the verbs the catalogs enumerate
- [Error Reference](/docs/reference/error-reference) — the codes `agents errors` returns
