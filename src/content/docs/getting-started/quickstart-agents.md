---
title: "Quickstart: AI agents"
section: "getting-started"
description: "Teach a coding agent StrataDB in one step — install the skill, or let the wheel and binary describe themselves."
source: "strata-core@v1.0.0"
---

StrataDB is built to be learned by agents, not just humans: the wheel and the
binary carry their own documentation, errors teach the fix, and one command
installs a Claude Code skill into your repo. This page is the shortest path
from "use StrataDB for this" to an agent that writes correct code.

## One step: install the skill

In any repo an agent works on:

```bash
strata agents skill --write
```

```text
{
  "next": null,
  "path": ".claude/skills/strata/SKILL.md",
  "state": "created"
}
```

That file is the condensed playbook — opening a database, choosing a
primitive, branch isolation, `as_of` reads, the error contract, and inference
— version-stamped from the installed binary. Claude Code loads it
automatically whenever a session touches Strata. Re-running is idempotent;
it refuses to overwrite a file you've edited unless you pass `--force`.

The same text ships inside the Python wheel, so an agent (or a setup script)
can install it without the CLI:

```python
from pathlib import Path
import stratadb

path = Path(".claude/skills/strata/SKILL.md")
path.parent.mkdir(parents=True, exist_ok=True)
path.write_text(stratadb.agents_skill())
```

## The self-describing surface

Everything an agent needs is one hop from wherever it lands:

```python
import stratadb

stratadb.agents_guide()      # the complete Python guide, offline, in the wheel
stratadb.command_index()     # the machine-readable command catalog (the IDL)
stratadb.mcp_config("./mydb")
# {'command': 'strata', 'args': ['./mydb', 'mcp', 'serve']}
```

```bash
strata agents guide            # the CLI guide, version-matched
strata agents commands --json  # command catalog
strata agents errors --json    # every public error code with hints
strata agents init --apply     # plants a pointer block in AGENTS.md/CLAUDE.md
```

## Two rules that prevent most agent mistakes

1. **Always target the database explicitly.** Pass a path
   (`stratadb.open("./mydb")`, `strata ./mydb …`) or set `STRATA_DB`. Strata
   never opens the current directory implicitly — the refusal is
   [`invalid_argument.cli.no_database`](/e/invalid_argument.cli.no_database).
2. **Recover by error code, never by message text.** Failures carry a stable
   `<class>.<area>.<detail>` code, a hint, and a per-code URL
   (`https://stratadb.org/e/<code>`). A missing key/document/path is `None`,
   not an error.

## MCP, for chat-based agents

The binary is also an MCP server — the path for Claude Desktop, claude.ai,
and any MCP client:

```bash
strata ./mydb mcp serve
```

Client config: `{"command": "strata", "args": ["./mydb", "mcp", "serve"]}`.
Roughly 20 curated tools plus `strata_guide` (the usage guide as a tool) and
`strata_command` (any cataloged command as raw wire JSON). Same value shapes,
same error codes as the CLI and SDK.

## For the agent reading this page

Fetch [/llms.txt](/llms.txt) for the curated index, or append `.md` to any
docs URL for CommonMark. The full corpus is at
[/llms-full.txt](/llms-full.txt).

## Next

- [For AI agents](/docs/agents) — the full machine surface, in depth.
- [MCP server](/docs/agents/mcp-server) — the handshake and the tool table.
- [Python SDK](/docs/python) — the surface the skill teaches.
- [Cookbook](/docs/cookbook) — agent-shaped end-to-end recipes.
