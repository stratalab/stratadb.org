---
title: "For AI agents"
section: "getting-started"
description: "The integration recipe for coding agents and MCP clients — self-describing surface plus MCP."
source: "strata-core@v1.0.0"
---


This page is the front door for an AI agent wiring up StrataDB. The binary
describes itself, so you never have to guess its surface. For the full walkthrough,
see [Agents and MCP](/docs/guides/agents-and-mcp).

## Learn the surface from the binary

Three commands emit everything an agent needs, generated from the installed
binary so they cannot drift from what it does:

```bash
strata agents guide            # the complete usage guide, as markdown
strata agents commands --json  # the machine-readable command catalog
strata agents errors --json    # the public error-code registry
```

`agents commands --json` returns an envelope whose `data.commands` array carries
one fully-described entry per command — its path, access mode, batch and commit
semantics, response model, and the exact error codes it can return.
`agents errors --json` returns `data.errors`, every public code with its class,
hint, retry policy, and docs URL. Recover by code, never by message text.

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

That writes `.strata/AGENTS.md`. Add `--apply` to also append a pointer block to
the repo's `AGENTS.md` or `CLAUDE.md`.

## Target a database explicitly

Every data command needs a database — including `mcp serve`. Pass a path, set
`STRATA_DB`, or use `--cache` for an ephemeral one — StrataDB never opens the
current directory implicitly. (`STRATA_DB` and the other environment variables
are documented in the
[configuration reference](/docs/reference/configuration-reference).) A bare
invocation with no target refuses, and the refusal teaches the fix:

```text
$ strata
error: [invalid_argument.cli.no_database]: no database specified
  hint: pass a path (strata ./mydb kv put …), set STRATA_DB, or use --cache for ephemeral
```

That is the `invalid_argument.cli.no_database` code. CLI usage errors like it
print a plain `error:` line and exit with status 2 even under `--json`, and their
`cli.*` codes are not in the `/e/` registry. Errors from data operations are
richer: each carries a `<class>.<area>.<detail>` code, a one-line hint, and a
`https://stratadb.org/e/<code>` reference, and under `--json` they emit a full
error envelope. Recover by code, never by message text.

## Speak MCP

The same binary is a Model Context Protocol server over stdio — no separate
package to install:

```bash
strata ./mydb mcp serve
```

Point an MCP client at it with:

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
same envelopes and the same error codes as the CLI. Use `--cache` in place of
the path for an ephemeral server.

## Verify

```bash
strata --cache ping
```

This prints `pong` and the installed version. If you see it, the binary runs.

## Next

- [Agents and MCP](/docs/guides/agents-and-mcp) — the full integration guide.
- [MCP reference](/docs/reference/mcp) — the complete tool list.
- [Error handling](/docs/guides/error-handling) and the
  [error reference](/docs/reference/error-reference) — recover by code.
- [Your first database](/docs/getting-started/first-database) — the hands-on
  basics if you want them.
