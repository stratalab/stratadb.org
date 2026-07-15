---
title: "The command index"
section: "agents"
description: "The machine-readable command and error catalogs the binary emits — the same IDL the generated reference is built from."
source: "strata-core@v1.0.0"
---

Where [the agents guide](/docs/agents/agents-guide) is prose, the command index is
**structured**: two JSON catalogs an agent can load and enumerate directly, so it
never has to guess a verb or the meaning of an error. Both come straight from the
installed binary, and both are the same source the generated
[command reference](/docs/reference/kv) is built from.

## The command catalog

`strata agents commands --json` returns the command catalog — each command with
its access class, batching and commit behavior, description, docs path, and the
error codes it can raise:

```bash
strata --cache agents commands --json
```

```text
{"data":{"command_count":32,"commands":[{"access":"write","batch":"itemwise", ... }]}}
```

Each entry is fully described: its path, access mode (`read`/`write`), batch
semantics, commit behavior, response model, and the exact error codes it can
return. An agent can route on those fields — for example, only calling `write`
commands inside a branch it forked, or knowing in advance which codes a command
may raise.

## The error registry

`strata agents errors --json` returns the public error registry — every code with
its class, hint, retry policy, and reference URL:

```bash
strata --cache agents errors --json
```

```text
{"data":{"count":204,"errors":[{"class":"invalid_argument","code":"invalid_argument.engine.branch_catalog","commit_outcome":"not_started","hint":"Correct the invalid field named by the error message and retry the operation.","message":"The request contains invalid input.","ref":"https://stratadb.org/e/invalid_argument.engine.branch_catalog","retry_policy":"never"}, ... ]}}
```

This is the same registry that backs the browsable [`/e/<code>`](/e/) pages and
the [error reference](/docs/reference/error-reference). Recover by **code**, never
by message text — the message is for humans and may change; the code is stable.

## One source, many renderings

The command index is the IDL: the machine-readable contract for every command.
The generated [command reference](/docs/reference/kv) on this site, the CLI's own
help, and the MCP tool schemas are all renderings of it. Because they share one
source, they cannot drift — if a page and the binary ever disagree, the binary
wins, and you should check that your installed version matches these docs.

## Related

- [For AI agents](/docs/agents) — the section overview.
- [The agents guide](/docs/agents/agents-guide) — the prose counterpart.
- [Machine-readable docs](/docs/agents/machine-docs) — the website's own machine
  surface (`llms.txt`, `.md` mirrors, the `/e/` registry).
- [Command reference](/docs/reference/kv) — the human-readable rendering, per family.
