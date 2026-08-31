---
title: "The MCP server"
section: "agents"
description: "Run Strata as a stdio Model Context Protocol server and inspect the tools it exposes."
source: "strata-core@v1.1.0"
---

`strata mcp serve` runs a Model Context Protocol server over stdio. It uses the
same database targeting rules as the CLI and returns the same database envelopes
behind MCP `content` items.

## Start it

```bash
strata ./mydb mcp serve
strata --db ./mydb mcp serve
strata --cache mcp serve
```

A missing database target fails with `invalid_argument.cli.no_database`. Pass a
path, set `STRATA_DB`, or use `--cache` deliberately.

## Client config

```json
{
  "mcpServers": {
    "strata": {
      "command": "strata",
      "args": ["/absolute/path/to/mydb", "mcp", "serve"]
    }
  }
}
```

Use an absolute path to the binary if `strata` is not on the client's `PATH`.
For an in-memory session, use `["--cache", "mcp", "serve"]`.

## Handshake

The server speaks newline-delimited JSON-RPC on stdin/stdout and writes logs to
stderr. A client sends `initialize`, then `notifications/initialized`, then
calls `tools/list` and `tools/call`.

```bash
printf '%s\n%s\n%s\n' \
  '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"probe","version":"1.0"}}}' \
  '{"jsonrpc":"2.0","method":"notifications/initialized"}' \
  '{"jsonrpc":"2.0","id":2,"method":"tools/list"}' \
  | strata ./agent mcp serve
```

`tools/list` is the authority for tool names, schemas, and wire value shapes in
the binary you are running.

## Tools

The curated tools cover common KV, JSON, vector, event, graph, and branch
operations. Two meta-tools are worth calling out:

- `strata_guide` returns the agent guide.
- `strata_command` runs any cataloged command by raw wire JSON.

Use `strata_command` when a capability exists in the command catalog but is not
promoted to a named MCP tool.

Wire values are not always spelled like CLI flags. For example, a vector metric
may be `dot_product` in a tool schema while the CLI flag uses `dot-product`.
Treat the `inputSchema` returned by `tools/list` as the source for MCP calls.

## Errors

Database operation failures carry the same public error codes as the CLI. Handle
them by `code`. On the wire, byte fields such as KV keys, KV values, and cursors
are base64.

## Related

- [For AI agents](/docs/agents)
- [The command index](/docs/agents/command-index)
- [Error Reference](/docs/reference/error-reference)
