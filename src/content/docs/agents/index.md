---
title: "For AI agents"
section: "agents"
description: "How agents should discover Strata: database targeting, generated catalogs, repo onboarding, and the built-in MCP server."
source: "strata-core@v1.1.1"
---

Agents should not infer Strata's command surface from examples. The binary can
print its own guide, emit structured command and error catalogs, install repo
onboarding files, and run as an MCP server over stdio.

Start here for the rules. Use the generated reference when you need exhaustive
syntax.

## Target the database

Every data command needs a target database. Pass a path, pass `--db`, set
`STRATA_DB`, or use `--cache` for an explicit in-memory database.

```bash
strata ./mydb kv get portfolio.value
strata --db ./mydb kv get portfolio.value
STRATA_DB=./mydb strata kv get portfolio.value
strata --cache ping
```

Strata does not open the current directory implicitly. A missing target fails
with `invalid_argument.cli.no_database`, a CLI guardrail code. Runtime operation
errors use the public `/e/<code>` registry.

## Read the binary

```bash
strata agents guide
strata agents commands --json
strata agents errors --json
```

`agents guide` is the prose playbook. `agents commands --json` is the structured
catalog for commands, inputs, outputs, docs paths, and possible errors.
`agents errors --json` is the public error registry with hints and retry policy.

For programmatic use, branch on command IDs and error codes. Do not scrape
messages intended for humans.

## Onboard a repo

```bash
strata agents init
strata agents skill --write
strata agents skill --write --for all
```

`agents init` writes a short `.strata/AGENTS.md` pointer to the live guide and
catalogs. Add `--apply` when you want Strata to add the pointer to the repo's
`AGENTS.md` or `CLAUDE.md`.

`agents skill --write` installs the condensed coding-agent playbook. By default
it targets Claude Code; `--for all` writes native surfaces for Claude, Cursor,
and Codex.

## Run MCP

```bash
strata ./mydb mcp serve
```

Client configuration:

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

The MCP server exposes curated tools for common operations, plus
`strata_guide` for the guide and `strata_command` for any cataloged command by
wire JSON. Call `tools/list` for the exact schema your installed binary
advertises.

## Machine docs

- [`/llms.txt`](/llms.txt) is the short index.
- [`/llms-full.txt`](/llms-full.txt) is the full corpus.
- Append `.md` to any docs URL for CommonMark.
- [`/e/`](/e/) lists public error codes.

## Keep reading

- [The agents guide](/docs/agents/agents-guide)
- [The command index](/docs/agents/command-index)
- [The MCP server](/docs/agents/mcp-server)
- [Machine-readable docs](/docs/agents/machine-docs)
