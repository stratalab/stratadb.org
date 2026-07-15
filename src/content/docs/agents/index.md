---
title: "For AI agents"
section: "agents"
description: "The front door for coding agents and MCP clients — a self-describing binary, database targeting, repo onboarding, and a built-in MCP server."
source: "strata-core@v1.0.0"
---

Strata is built to be driven by agents. The binary **describes itself** — a
version-matched usage guide, machine-readable command and error catalogs, one
command to drop onboarding notes into a repo, and an MCP server that exposes the
core verbs as tools. Everything an agent needs is generated from the installed
binary's own metadata, so it can never drift from what your binary actually does.

This page orients you; the rest of the section goes deep. In a hurry? The
[agent quickstart](/docs/getting-started/quickstart-agents) is the one-step
version: `strata agents skill --write` installs the Claude Code skill into
your repo.

## Target a database explicitly

Every data command needs a database — including `mcp serve`. Pass a path, set
`STRATA_DB`, or use `--cache` for an ephemeral one. **Strata never opens the
current directory implicitly.** A bare invocation with no target refuses, and the
refusal teaches the fix:

```text
$ strata
error: [invalid_argument.cli.no_database]: no database specified
  hint: pass a path (strata ./mydb kv put …), set STRATA_DB, or use --cache for ephemeral
```

That is the `invalid_argument.cli.no_database` code. CLI usage errors like it
print a plain `error:` line and exit with status 2 even under `--json`, and their
`cli.*` codes are **not** in the `/e/` registry. Errors from data operations are
richer: each carries a `<class>.<area>.<detail>` code, a one-line hint, and a
`https://stratadb.org/e/<code>` reference. Recover by code, never by message text.

## The self-describing binary

Three commands emit everything an agent needs, generated from the installed
binary:

```bash
strata agents guide            # the complete usage guide, as markdown
strata agents commands --json  # the machine-readable command catalog
strata agents errors --json    # the public error-code registry
```

- The guide is the first thing to hand an agent with a shell — see
  [The agents guide](/docs/agents/agents-guide).
- The two catalogs let an agent enumerate every verb and every error rather than
  guess — see [The command index](/docs/agents/command-index).

## Onboard a repository

Drop a short pointer into the current repo so future agent sessions start
oriented:

```bash
strata agents init
```

```text
{
  "next": null,
  "pointer": "absent",
  "pointer_target": null,
  "written": [
    ".strata/AGENTS.md"
  ]
}
```

That writes `.strata/AGENTS.md`, a pointer block that tells any agent working in
the repo how to discover the rest — it points at the live guide and catalogs
rather than duplicating them. Add `--apply` to also append the pointer block to
the repo's `AGENTS.md` or `CLAUDE.md`, so agents that read those files find
Strata without being told.

## Speak MCP

The same binary is a Model Context Protocol server over stdio — no separate
package to install:

```bash
strata ./mydb mcp serve
```

Point an MCP client at it:

```json
{
  "mcpServers": {
    "strata": {
      "command": "strata",
      "args": ["./mydb", "mcp", "serve"]
    }
  }
}
```

The server exposes a curated set of tools plus `strata_guide` (the guide above)
and `strata_command` (any cataloged command as raw wire JSON). Tools return the
same envelopes and the same error codes as the CLI. The full tool list and
handshake are in [The MCP server](/docs/agents/mcp-server).

## Verify

```bash
strata --cache ping
```

This prints `pong` and the installed version. If you see it, the binary runs.

## In this section

- **[The agents guide](/docs/agents/agents-guide)** — `strata agents guide`,
  `stratadb.agents_guide()`, and the `strata_guide` tool: one version-matched
  guide, three front doors.
- **[The command index](/docs/agents/command-index)** — the machine-readable
  command and error catalogs, and how the generated reference derives from them.
- **[The MCP server](/docs/agents/mcp-server)** — running the stdio server, the
  handshake, and the exact tools it advertises.
- **[Machine-readable docs](/docs/agents/machine-docs)** — `llms.txt`, the `.md`
  mirror of every page, and the `/e/` error registry.

## Related

- [Error handling](/docs/guides/error-handling) and the
  [error reference](/docs/reference/error-reference) — recover by code.
- [Your first database](/docs/getting-started/first-database) — the hands-on
  basics if you want them.
