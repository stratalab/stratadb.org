---
title: "CLI Reference"
section: "reference"
description: "How to invoke the strata binary: targeting a database, global options, output formats, and the interactive REPL."
source: "strata-core@v1.0.0"
---

> **Interim page.** Maintained by hand until it is generated from the resolved command index (IDL). Where this page and `strata agents commands --json` disagree, the command index wins.

`strata` is a single binary. It opens one file-backed database — or an in-memory one — and runs commands against it. There is no server and no daemon.

For the full list of commands, see the [Command Reference](/docs/reference/command-reference). This page covers how you invoke the binary itself.

## Invocation forms

```bash
strata ./my-db kv put greeting hello   # one-shot command against a durable database
strata ./my-db                         # open the interactive REPL (on a TTY)
strata --cache kv put greeting hello   # one-shot against an ephemeral in-memory database
strata --cache                         # REPL against an ephemeral database
strata agents guide                    # a command that needs no database
```

A one-shot invocation runs a single command and exits. Passing a database path with no command opens the [REPL](#interactive-repl) when standard input is a terminal; when input is piped, `strata` reads one command per line instead.

## Targeting a database

`strata` never opens the current directory implicitly. A command that touches data must name its target one of three ways, in priority order:

1. **A path** — the positional argument or `--db <path>`. Always wins. A relative or absolute directory; it is created if it does not exist.
2. **`STRATA_DB=<path>`** — an environment variable, used when no path is passed.
3. **`--cache`** — an explicit in-memory database. Nothing is persisted. Cannot be combined with a path or `--db`.

A data command with no target refuses:

```bash
$ strata ping
error: [invalid_argument.cli.no_database]: no database specified
  hint: pass a path (strata ./mydb kv put …), set STRATA_DB, or use --cache for ephemeral
```

A handful of commands need no database at all — `strata init`, `strata agents guide`, `strata config path`, and the like.

See [Database Configuration](/docs/guides/database-configuration) for what durable and cache mode mean, and [Durability](/docs/concepts/durability) for the underlying model.

## Global options

These appear before the command. `--branch` and `--space` are also accepted after any command that operates on data, so either position works.

| Option | Description |
|--------|-------------|
| `[DB]` | Positional durable database path |
| `--db <PATH>` | Durable database path. Cannot be combined with the positional path |
| `--cache` | Use an in-memory cache database for this process |
| `--branch <BRANCH>` | Default branch for commands that accept a branch |
| `--space <SPACE>` | Product space for commands that accept a space |
| `--json` | Emit compact JSON |
| `--raw` | Emit script-friendly raw output where possible |
| `-h, --help` | Print help |
| `-V, --version` | Print the version |

Branches and spaces are the two organizing dimensions of a database. See [Branches](/docs/concepts/branches), [Branch Management](/docs/guides/branch-management), and [Spaces](/docs/guides/spaces).

## Output formats

Every command emits one of three shapes, chosen by the global flag.

### Human (default)

Readable output. Stored bytes are decoded to text when they are valid UTF-8.

```bash
$ strata ./my-db kv put greeting hello
created greeting applied=true

$ strata ./my-db kv get greeting
hello
```

### `--json`

One compact envelope per command, shaped `{"type": …, "data": …}`. KV keys and values, and continuation cursors, are base64 strings on the wire.

```bash
$ strata --json ./my-db kv get greeting
{"data":{"timestamp":3,"value":"aGVsbG8=","version":3},"type":"kv_versioned_value"}
```

Failures are also envelopes, printed on stderr with a non-zero exit:

```bash
$ strata --json ./my-db vector get missing k1
{"error":{"class":"not_found","code":"not_found.engine.vector_collection","retryable":false,"message":"vector collection does not exist","docs_url":"https://stratadb.org/e/not_found.engine.vector_collection", …}}
```

### `--raw`

Bare values, for scripts and pipelines.

```bash
$ strata --raw ./my-db kv get greeting
hello
```

Continuation cursors are opaque base64 tokens. Pass a printed cursor back verbatim through `--cursor` to fetch the next page. Time-travel reads take `--as-of <commit>`, where the value is the commit clock from a write receipt (`data.commit.timestamp`, a small integer), not a wall-clock time; see [Commits](/docs/concepts/commits).

## Command families

Every command belongs to a family. The [Command Reference](/docs/reference/command-reference) lists them all.

| Command | Description |
|---------|-------------|
| `init` | Prepare the Strata home directory and print next steps |
| `doctor` | Check the installation and, when a database is targeted, its health |
| `agents` | Self-describing surface for agents: guide, catalogs, repo onboarding |
| `mcp` | Model Context Protocol server commands |
| `ping` | Lightweight liveness check |
| `info` | Print database information |
| `health` | Print health facts |
| `metrics` | Print metrics facts |
| `describe` | Print a compact database description |
| `config` | Configuration reads |
| `remote` | Show where this database was cloned from (its remote origin) |
| `clone` | Clone a dataset from a hub into a new local database |
| `branch` | Branch lifecycle commands |
| `space` | Product space commands |
| `kv` | KV commands |
| `json` | JSON document commands |
| `vector` | Vector commands |
| `event` | Event log commands |
| `graph` | Graph core commands |
| `arrow` | Arrow import/export commands |
| `inference` | Model execution: local GGUF models and cloud providers |
| `command` | Raw serialized executor command |

## Interactive REPL

Opening a database with no command on a terminal starts the REPL. The prompt shows the current branch and space:

```text
strata:default/default>
```

Each line is a command in the same grammar as the one-shot form — `kv put a 1`, `branch list`, `vector query docs "[0.1,0.2]" -k 5`. Lines beginning with `#` are ignored. A few words are handled by the REPL itself rather than as database commands:

| Word | Effect |
|------|--------|
| `use <branch>` | Switch the current branch (validated to exist) |
| `use <branch>/<space>` or `use <branch> <space>` | Switch branch and space |
| `help` | Print the full command help |
| `clear` | Clear the screen |
| `quit` / `exit` | Leave the REPL |

`Ctrl-D` also exits. History is written to `~/.strata_history` (override with `STRATA_HISTORY`).

## Commands from the old CLI

Several verbs from the pre-V1 CLI are recognized but not part of the V1 surface. They refuse with a clear message rather than being silently unknown:

```bash
$ strata --cache txn
error: `txn` is recognized from the old CLI, but is not available in the V1 CLI surface yet
```

The recognized-but-refused verbs are `begin`, `commit`, `rollback`, `txn`, `search`, `recipe`, `flush`, `compact`, `up`, `down`, and `uninstall`. In V1 writes auto-commit, so there are no explicit transaction verbs; there is no state-cell capability.

## See also

- [Command Reference](/docs/reference/command-reference) — every command and its syntax.
- [API Quick Reference](/docs/reference/api-quick-reference) — the common operation per capability.
- [Configuration Reference](/docs/reference/configuration-reference) — database and hub configuration.
- [Error Reference](/docs/reference/error-reference) — the error model.
- [Agents and MCP](/docs/agents) — the self-describing surface and MCP server.
