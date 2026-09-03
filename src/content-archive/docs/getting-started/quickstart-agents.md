---
title: "Quickstart: AI agents"
section: "getting-started"
description: "Give a coding agent the Strata playbook and the commands it should use first."
source: "strata-core@v1.1.1"
---

Use this page when an agent is going to edit code that opens Strata or calls the
`strata` binary.

## Install the playbook

```bash
strata agents skill --write
```

By default this writes the Claude Code skill:

```text
{
  "next": null,
  "path": ".claude/skills/strata/SKILL.md",
  "state": "created"
}
```

For the common coding-agent surfaces:

```bash
strata agents skill --write --for all
```

This writes Claude, Cursor, and Codex instructions in their native locations.
Re-run with `--force` only when you intend to replace existing Strata-owned
content.

## Give the agent rules

The two rules that prevent most bad calls:

1. Target the database explicitly. Use a path, `--db`, `STRATA_DB`, or `--cache`.
2. Handle failures by error `code`, not by message text.

Useful discovery commands:

```bash
strata agents guide
strata agents commands --json
strata agents errors --json
```

## Use MCP when the client supports it

```bash
strata ./mydb mcp serve
```

Client config:

```json
{
  "command": "strata",
  "args": ["./mydb", "mcp", "serve"]
}
```

Call `tools/list` after the MCP handshake. The tool schema is the authority for
wire inputs.

## Python entry points

```python
import stratadb

stratadb.agents_guide()
stratadb.command_index()
stratadb.mcp_config("./mydb")
```

## Next

- [For AI agents](/docs/agents)
- [The MCP server](/docs/agents/mcp-server)
- [Python SDK](/docs/python)
- [Cookbook](/docs/cookbook)
