---
title: "The command index"
section: "agents"
description: "The structured command and error catalogs emitted by the Strata binary."
source: "strata-core@v1.1.0"
---

The command index is the machine surface behind the docs. It tells an agent what
commands exist, how they are classified, where their reference pages live, and
which errors each command can return.

## Commands

```bash
strata --cache agents commands --json
```

The response includes command IDs, families, path displays, input and output
models, access class, commit behavior, pagination shape, reference URLs, and
possible errors. Use it when an agent needs to enumerate the product instead of
guessing from examples.

Typical uses:

- allow only `read` commands in an inspection step
- put `write` commands on an isolated branch
- route help links from `docs`
- precompute which error codes a command may return
- generate a client-side command palette

## Errors

```bash
strata --cache agents errors --json
```

The error registry includes each public code, class, message, hint, retry
policy, commit outcome, and reference URL. Runtime errors should be handled by
`code`, not by human message text.

CLI guardrail errors, such as `invalid_argument.cli.no_database`, can be emitted
before a database opens. They are useful to humans and agents, but they are not
part of the public `/e/` registry.

## Generated reference

The generated command reference is a human rendering of the same product
contract. If you need exact current syntax, use:

- [Command Reference](/docs/reference/command-reference)
- [Error Reference](/docs/reference/error-reference)
- [Value Type Reference](/docs/reference/value-type-reference)

For the live binary in your environment, prefer `strata agents commands --json`.

## Related

- [For AI agents](/docs/agents)
- [The agents guide](/docs/agents/agents-guide)
- [Machine-readable docs](/docs/agents/machine-docs)
