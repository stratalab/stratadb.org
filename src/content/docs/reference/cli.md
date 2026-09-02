---
title: "CLI Reference"
section: "reference"
description: "How to invoke the Strata binary and where generated command facts live."
source: "strata-core@v1.1.1"
---

`strata` is a single binary. It opens a durable database directory or an explicit
in-memory database. You can run one command from the shell, or open the REPL and
run many commands against the same target.

Most narrative docs use the REPL form so examples do not repeat the database
path on every line. Generated reference pages, scripts, pipelines, clone flows,
and MCP server startup keep the shell form because those commands are usually
copied as one-shot invocations.

## Targeting

Data commands need a database target:

```bash
strata ./mydb kv get portfolio.value
strata --db ./mydb kv get portfolio.value
STRATA_DB=./mydb strata kv get portfolio.value
strata --cache ping
```

Priority is: explicit path or `--db`, then `STRATA_DB`, then `--cache`.
Strata does not open the current directory implicitly.

## Output modes

- default: readable terminal output
- `--json`: compact envelopes for programs
- `--raw`: bare values where the command supports it

Byte values and cursors are base64 in JSON envelopes. Continuation cursors are
opaque; pass them back exactly as printed.

## Time travel

Reads that support time travel accept `--as-of <commit>`. The value is Strata's
logical commit clock from a write receipt, not wall-clock time.

## REPL

Passing a database target with no command opens the REPL on a terminal:

```bash
strata ./mydb
```

Inside the REPL, type commands without the leading `strata ./mydb`:

```text
strata:default/default › kv put portfolio.value 98400
strata:default/default › kv get portfolio.value
```

The prompt shows the current branch and space. Change context with `use`:

```text
strata:default/default › branch fork default experiment
strata:default/default › use experiment
strata:experiment/default › kv put portfolio.value 111080
```

## Command facts

Generated command pages start at [Command Reference](/docs/reference/command-reference).
For the live catalog in your environment:

```bash
strata agents commands --json
```

## Related

- [Installation](/docs/getting-started/installation)
- [Configuration Reference](/docs/reference/configuration-reference)
- [Error Reference](/docs/reference/error-reference)
