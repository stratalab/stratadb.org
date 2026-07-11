---
title: "Troubleshooting"
description: "Real failure modes, the error codes they carry, and how to diagnose them."
source: "strata-core@v1.0.0"
---


Every StrataDB failure carries a stable code. Read the code, not the prose, and
these situations resolve quickly.

## Start with `strata doctor`

`strata doctor` is the first diagnostic. With no argument it checks the
installation; give it a database path and it also tries to open it and reports
what it finds. It exits non-zero when something needs attention, so it is safe
to script.

A healthy run reports `path_ok: true` and an empty `issues` array. When a
database will not open, `doctor` says so and names the code (output abbreviated):

```bash
strata ./mydb doctor
```

```text
{
  "database": {
    "exists": true,
    "open_ok": false,
    "path": "./mydb"
  },
  "issues": [
    {
      "code": "unavailable.engine.persistence",
      "hint": "Retry after the local persistence layer is available."
    }
  ],
  "path_ok": true,
  "platform": "linux-x86_64"
}
```

## How to read an error

Failures print a `<class>.<area>.<detail>` code, a one-line hint, and a
reference URL:

```text
not_found.engine.branch: source branch `nonesuch` does not exist (err_local_37433bfb_000001)
  hint: Check that the requested branch, space, collection, graph, document, key, or model exists.
  ref: https://stratadb.org/e/not_found.engine.branch
```

The **class** (the first segment) tells you how to react: `not_found`,
`invalid_argument`, and `already_exists` mean fix the request;
`failed_precondition` means the database is in a state that blocks the
operation; `unavailable` means retry after the underlying layer recovers;
`corruption` means stop and inspect. Open the `ref` URL — the same
`/e/<code>` page — for the details, or look any code up offline with
`strata agents errors --json`. Add `--json` to any command to get the same
information as a structured envelope. Recover by code, never by message text.

## `command not found` after install

If your shell prints `strata: command not found`, the binary is installed but
not on your `PATH` for this shell. Open a new terminal (the installer edits your
shell profile), or follow the PATH steps in
[Installation](/docs/getting-started/installation). `strata doctor` reports
`path_ok` once the binary is reachable.

## No database specified

```text
error: [invalid_argument.cli.no_database]: no database specified
  hint: pass a path (strata ./mydb kv put …), set STRATA_DB, or use --cache for ephemeral
```

StrataDB never opens the current directory implicitly. Pass a path
(`strata ./mydb …`), set `STRATA_DB`, or use `--cache` for an ephemeral
database. This is the `invalid_argument.cli.no_database` code — CLI usage errors
like it print a plain `error:` line, exit with status 2, and are not in the
`/e/` registry, so look them up by reading the printed hint.

## The database will not open

A path that is not a directory, a directory the process cannot read or write,
or a database whose files were altered underneath it all surface as
[`unavailable.engine.persistence`](/e/unavailable.engine.persistence):

```text
unavailable.engine.persistence: persistence lower layer is unavailable (err_local_010d5985_000001)
  hint: Retry after the local persistence layer is available.
  ref: https://stratadb.org/e/unavailable.engine.persistence
```

Check that the path points at a database directory you own and can write, that
no other process is holding it, and that the disk is not full. `strata <path>
doctor` confirms whether the open succeeds — the path is a global argument, so
it comes before the subcommand. Treat a database directory as one
unit — do not edit or remove files inside it by hand.

## Opening a pre-V1 database

Databases created before the V1 line are rejected on open with
[`failed_precondition.engine.layout_version`](/e/failed_precondition.engine.layout_version),
class `failed_precondition`. From the registry, its message is "The database
layout is incompatible with this runtime," and its hint is to open the database
with a compatible version. This line does not migrate pre-V1 development
databases — create a fresh database and reload your data. Look the code up with
`strata agents errors --json`.

## Durability and recovery failures

If the storage layer cannot make a write durable, the writer stops rather than
report a false success, and operations surface in the `unavailable` class
(`unavailable.engine.persistence` and related codes) with a retry-after-recovery
hint. Recovery is explicit: fix the underlying condition — free space,
permissions, a healthy disk — and reopen the database.

If stored data fails validation while recovering, you get
[`corruption.engine.persistence_recovery`](/e/corruption.engine.persistence_recovery),
whose hint is blunt: "Stop writing to the database and inspect recovery
diagnostics before continuing." Do exactly that — take a copy of the directory
and inspect it before any further writes.

## Getting more help

- [FAQ](/docs/faq) — what changed in this line and why.
- [Error reference](/docs/reference/error-reference) — every code with its class
  and meaning.
- [Observability guide](/docs/guides/observability) — health and metrics
  surfaces beyond `doctor`.
