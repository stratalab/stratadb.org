---
title: "The agents guide"
section: "agents"
description: "The version-matched guide that agents can read from the CLI, Python package, or MCP server."
source: "strata-core@v1.1.1"
---

The agents guide is a compact playbook shipped with Strata. It covers database
targeting, common commands, branches, time travel, output formats, and error
handling. Use it as the first context block for an agent that can run shell
commands.

## CLI

```bash
strata --cache agents guide
```

The command prints markdown and does not need a network call. The opening
section is the most important part:

```text
## Targeting a database

1. Explicit path or `--db <path>` - always wins: `strata ./my-db kv get k`
2. `STRATA_DB=<path>` - set once per session, used when no path is passed
3. `--cache` - explicit in-memory database (nothing persisted)
```

## Python

```python
import stratadb

print(stratadb.agents_guide())
```

The Python package exposes the same kind of guidance for agents that are already
working inside a Python process.

## MCP

Over MCP, call `strata_guide`. The server advertises it alongside the database
tools so a client can recover when it is unsure which command to use.

## When to use the catalog instead

The guide is prose. For routing, schema generation, retries, and codegen, use
the structured catalogs:

```bash
strata agents commands --json
strata agents errors --json
```

Those catalogs are covered in [The command index](/docs/agents/command-index).

## Related

- [For AI agents](/docs/agents)
- [The MCP server](/docs/agents/mcp-server)
- [Machine-readable docs](/docs/agents/machine-docs)
