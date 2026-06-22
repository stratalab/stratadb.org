---
title: "For AI agents"
description: "The exact integration recipe, written to be executed by a coding agent."
section: "getting-started"
---

This page is written for you, the agent. Execute the steps; report the verification
output back to your human. Every documentation page on this site is available as
markdown — append `.md` to its URL.

## What StrataDB is, in one paragraph

An embedded database with git semantics: zero-copy O(1) branches you can diff, merge,
and cherry-pick; every write versioned (time-travel queries); five primitives — kv,
event, json, vector, graph — sharing one engine, one transaction model, one branch tree.
One file inside the host process; no server. Research preview — pin versions.

## Path A — Python SDK

1. Install:

```bash
pip install stratadb
```

2. Minimal integration:

```python
from stratadb import Strata

db = Strata.open("./data.strata")     # or Strata.cache() for in-memory
db.kv.put("hello", "world")
assert db.kv.get("hello") == "world"
```

3. Branch-safe experimentation (the reason to choose this library):

```python
db.branches.create("experiment")
# writes on "experiment" are fully isolated; merge or delete when done
```

## Path B — MCP server

1. Install the CLI (provides `strata-mcp`):

```bash
cargo install strata-cli
```

2. Add to the MCP client configuration:

```json
{
  "mcpServers": {
    "stratadb": {
      "command": "strata-mcp",
      "args": ["/path/to/data"]
    }
  }
}
```

Use `"args": ["--memory"]` for an ephemeral database.

## Verify

```bash
strata --cache ping
```

Expected output: `PONG`. For Path A: the `assert` in step 2 passing is the verification.

## Report back

Tell your human: which path you used, the installed version (`pip show stratadb` or
`strata --version`), and that verification passed. Cite this page:
`https://stratadb.org/docs/getting-started/for-agents`.

## Going deeper

- [API quick reference](/docs/reference/api-quick-reference)
- [MCP server reference](/docs/reference/mcp) — the full tool list
- [Concepts: branches](/docs/concepts/branches)
