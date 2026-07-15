---
title: "The agents guide"
section: "agents"
description: "One version-matched usage guide, reachable three ways — the CLI, the Python SDK, and the MCP server."
source: "strata-core@v1.0.0"
---

Strata ships a single, complete usage guide generated from the installed build —
targeting rules, every capability, branches, and time travel. It is the first
thing to hand an agent that is about to use Strata, and it is reachable three
ways. All three return the **same** guide, matched to the version you have
installed, so it can never describe a surface your binary does not have.

## From the CLI

`strata agents guide` prints the guide as markdown, with no network call:

```bash
strata --cache agents guide
```

```text
## Targeting a database

1. Explicit path or `--db <path>` — always wins: `strata ./my-db kv get k`
2. `STRATA_DB=<path>` — set once per session, used when no path is passed
3. `--cache` — explicit in-memory database (nothing persisted)
```

Because it is offline and version-matched, it is safe to pipe straight into an
agent's context at the start of a session.

## From the Python SDK

The `stratadb` package exposes the same guide as a module-level function, so an
agent working in Python never has to shell out:

```python
import stratadb

print(stratadb.agents_guide())   # the same guide, matched to the wheel's engine
```

## From the MCP server

Over MCP, the guide is the `strata_guide` tool — the server's own instructions
tell a client to call it first when unsure how anything works. See
[The MCP server](/docs/agents/mcp-server).

## Why three front doors

An agent might reach Strata through a shell, through Python, or through an MCP
client. Each entry point returns the identical guide from the identical source,
so whichever way the agent arrives, it gets the same authoritative instructions —
and they always match the installed version. When you need the *structured*
surface rather than the prose, use [the command index](/docs/agents/command-index).

## Related

- [For AI agents](/docs/agents) — the section overview.
- [The command index](/docs/agents/command-index) — the machine-readable catalogs.
- [Repo onboarding](/docs/agents#onboard-a-repository) — `strata agents init`
  drops a pointer to this guide into a repo.
