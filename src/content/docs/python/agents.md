---
title: "Agent integration"
section: "python"
description: "The self-describing surface from Python: agents_guide(), command_index(), mcp_config(), and the raw command escape hatch."
source: "strata-python@v1.0.0"
---

The SDK carries the same self-describing surface as the binary, so an agent
working in Python never has to shell out to learn what Strata can do. Everything
here is bundled in the wheel — no network call.

## The offline guide

`stratadb.agents_guide()` returns the complete usage guide as markdown —
identical to `strata agents guide`, matched to the wheel's engine version. Hand it
to an agent at the start of a session:

```python
import stratadb

print(stratadb.agents_guide())   # the full guide, offline
```

See [the agents guide](/docs/agents/agents-guide) for the CLI and MCP forms of the
same artifact.

## The command catalog

`stratadb.command_index()` returns the full machine-readable command catalog —
every command with its access class, batching and commit behavior, and error
codes — bundled in the wheel:

```python
idx = stratadb.command_index()   # the IDL catalog, as a dict
```

This is the same catalog behind [the command reference](/docs/reference/kv) and
`strata agents commands --json`.

## MCP client config

`stratadb.mcp_config(path)` returns the client-config snippet for pointing an MCP
client at a database:

```python
stratadb.mcp_config("./app-data")
# {"command": "strata", "args": ["./app-data", "mcp", "serve"]}
```

Drop it into your MCP client's `mcpServers` map — see
[the MCP server](/docs/agents/mcp-server).

## The escape hatch

The typed namespaces cover the common path; for anything else in the catalog,
`db.execute()` runs a raw command as a dict and returns the response dict — the
same wire the CLI and MCP speak. The namespaces are built on it:

```python
db.execute({"type": "kv_scan", "limit": 10})
```

Reach for `db.execute()` when a command has no curated wrapper yet; reach for the
namespaces for everything else.

## Related

- [For AI agents](/docs/agents) — the section overview.
- [The agents guide](/docs/agents/agents-guide) and
  [command index](/docs/agents/command-index) — the CLI/MCP forms.
