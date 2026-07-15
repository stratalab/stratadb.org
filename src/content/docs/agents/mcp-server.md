---
title: "The MCP server"
section: "agents"
description: "The built-in Strata MCP server: stdio JSON-RPC, the initialize handshake, and the exact tools it advertises."
source: "strata-core@v1.0.0"
---

`strata mcp serve` runs a [Model Context Protocol](https://modelcontextprotocol.io)
server over **stdio**: newline-delimited JSON-RPC on stdin/stdout, logs on
stderr. It exposes the same database, the same JSON envelopes, and the same
[error codes](/docs/reference/error-reference) as the CLI — no separate package
to install. For the section overview see [For AI agents](/docs/agents).

## Running the server

The server opens a database the same way every command does — it needs a durable
path, `--cache`, or `STRATA_DB`.

```bash
strata ./my-db mcp serve   # durable, positional path
strata --db ./my-db mcp serve
strata --cache mcp serve          # ephemeral, in-memory
```

With no target it refuses with `invalid_argument.cli.no_database`:

```text
$ strata mcp serve
error: [invalid_argument.cli.no_database]: no database specified
  hint: pass a path (strata ./mydb kv put …), set STRATA_DB, or use --cache for ephemeral
```

## Handshake

A client sends `initialize`, then the `notifications/initialized` notification,
then may call `tools/list` and `tools/call`. You can drive it by hand with
newline-delimited JSON:

```bash
printf '%s\n%s\n%s\n' \
  '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"probe","version":"1.0"}}}' \
  '{"jsonrpc":"2.0","method":"notifications/initialized"}' \
  '{"jsonrpc":"2.0","id":2,"method":"tools/list"}' \
  | strata ./agent mcp serve
```

The `initialize` result advertises the tools capability and carries an
`instructions` string:

```json
{"id":1,"jsonrpc":"2.0","result":{
  "protocolVersion":"2025-06-18",
  "capabilities":{"tools":{"listChanged":false}},
  "serverInfo":{"name":"strata","version":"…"},
  "instructions":"Strata is an embedded multi-model database (KV, JSON, vectors, events, graphs) with branches and time travel. When unsure, call the `strata_guide` tool first …"
}}
```

The server **echoes back the `protocolVersion` the client requested** rather than
pinning one of its own — send `2024-11-05` and the result says `2024-11-05`.
`serverInfo.name` is `strata` and `serverInfo.version` matches the running binary.
Tool results come back as MCP `content` items whose text is the same JSON envelope
the CLI prints; errors carry the same `class` and `code`. On the wire, byte fields
(KV keys and values, list cursors) are **base64**.

## Tools

`tools/list` returns **20 tools**. Two are meta-tools; the rest are one canonical
verb per capability. Every tool takes optional `branch` and `space` arguments.

| Tool | Required inputs | Optional inputs | Purpose |
|------|-----------------|-----------------|---------|
| `strata_guide` | — | — | Return the complete usage guide (markdown, matched to this binary). Call first when unsure. |
| `strata_command` | `command` | — | Escape hatch: run any cataloged command as raw wire JSON. Byte fields are base64. |
| `strata_kv_put` | `key`, `value` | `branch`, `space` | Write one key (text value). Returns a commit receipt. |
| `strata_kv_get` | `key` | `as_of`, `branch`, `space` | Read one key. `data.value` is base64. |
| `strata_kv_delete` | `key` | `branch`, `space` | Delete one key. |
| `strata_kv_list` | — | `prefix`, `limit`, `cursor`, `as_of`, `branch`, `space` | List keys with base64 cursor pagination. |
| `strata_json_set` | `key`, `path`, `value` | `branch`, `space` | Set a JSON path (`$` replaces the document). |
| `strata_json_get` | `key`, `path` | `as_of`, `branch`, `space` | Read a JSON path. |
| `strata_json_delete` | `key`, `path` | `branch`, `space` | Delete a JSON path. |
| `strata_vector_create_collection` | `collection`, `dimension` | `metric`, `branch`, `space` | Create a collection (`metric`: `cosine`, `euclidean`, `dot_product`). |
| `strata_vector_upsert` | `collection`, `key`, `vector` | `metadata`, `branch`, `space` | Upsert one embedding. |
| `strata_vector_query` | `collection`, `query` | `k`, `filter`, `as_of`, `branch`, `space` | Similarity search with an AND-composed metadata filter. |
| `strata_event_append` | `event_type`, `payload` | `branch`, `space` | Append one immutable, hash-chained event. |
| `strata_event_list` | — | `event_type`, `limit`, `after_sequence`, `as_of`, `branch`, `space` | List events, optionally by type. |
| `strata_graph_create` | `graph` | `branch`, `space` | Create a graph. |
| `strata_graph_add_node` | `graph`, `node_id` | `properties`, `branch`, `space` | Add or replace a node. |
| `strata_graph_add_edge` | `graph`, `src`, `edge_type`, `dst` | `weight`, `properties`, `branch`, `space` | Add or replace a typed, optionally weighted edge. |
| `strata_graph_neighbors` | `graph`, `node_id` | `direction`, `edge_type`, `limit`, `as_of`, `branch`, `space` | Traverse a node's neighbors (`direction`: `outgoing`, `incoming`, `both`). |
| `strata_branch_list` | — | — | List branches with status and lineage. |
| `strata_branch_fork` | `source`, `branch` | `version`, `timestamp` | Fork a branch; anchor to a retained `version` or `timestamp` for time travel. |

The curated tools cover the core verbs. Anything else in the catalog — graph
deletes, analytics, history, spaces, batches — is reachable through
`strata_command`; the guide lists the full command catalog. `as_of` accepts a
commit timestamp taken from a prior write receipt's `data.commit.timestamp`.

### The two meta-tools

- **`strata_guide`** returns the full, version-matched usage guide as markdown. A
  client that is unsure how anything works should call this before guessing.
- **`strata_command`** executes any cataloged command by its raw wire JSON, for
  example `{"command":{"type":"kv_scan","limit":10}}`. Invalid input returns the
  exact field-level [error envelope](/docs/reference/error-reference).

### Wire values are not CLI flags

When calling tools by hand, wire values are not always spelled like CLI flags.
The vector metric is `dot_product` (underscore) in a
`strata_vector_create_collection` call, where the CLI's `vector collection create`
takes `dot-product` (hyphen). When in doubt, the tool's `inputSchema` from
`tools/list` is authoritative.

## Client configuration

A Claude-style `mcpServers` entry, with the database path baked into the
arguments:

```json
{
  "mcpServers": {
    "strata": {
      "command": "strata",
      "args": ["/absolute/path/to/my-db", "mcp", "serve"]
    }
  }
}
```

Use `strata` if it is on `PATH`, otherwise an absolute path to the binary. For an
ephemeral database use `["--cache", "mcp", "serve"]`; to keep the path out of the
arguments, drop the path argument and set `STRATA_DB` in the server's environment.

## See also

- [For AI agents](/docs/agents) — the section overview and database targeting.
- [The command index](/docs/agents/command-index) — the catalog the tools draw from.
- [Value Type Reference](/docs/reference/value-type-reference) — the value forms behind each tool.
- [Error Reference](/docs/reference/error-reference) — the `class`/`code` model shared with the CLI.
