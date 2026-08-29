---
title: "Branching workflows"
section: "guides"
description: "List, read, create, fork, diff, preview, promote, and delete branches, and understand the promotion model."
source: "strata-core@v1.1.0"
---


A branch is an isolated line of history. Every primitive is branch-aware, forks
are cheap, and writes on one branch are invisible to every other branch until
you fork again. For the mental model, see
[Concepts: Branches](/docs/concepts/branches). This guide covers the branch
verbs on the CLI: `list`, `get`, `create`, `fork`, `diff`, `preview`, `merge`,
and `delete`.

Examples use a durable database at `./mydb`. Every branch command also accepts
`--branch`, `--space`, and `--json`.

## List branches

`branch list` prints one branch record per line. A fresh database has only
`default`:

```bash
strata ./mydb branch list
```

```text
{"branch_id":"00000000-0000-0000-0000-000000000000","created_at":null,"deleted_at":null,"generation":1,"name":"default","parent":null,"state_revision":0,"status":"active"}
```

## Read one branch

`branch get <name>` returns the full record. The human form is pretty-printed;
add `--json` for a compact envelope:

```bash
strata ./mydb branch get default
```

```text
{
  "branch_id": "00000000-0000-0000-0000-000000000000",
  "created_at": null,
  "deleted_at": null,
  "generation": 1,
  "name": "default",
  "parent": null,
  "state_revision": 0,
  "status": "active"
}
```

## Create an empty branch

`branch create <name>` makes a new root branch with no data and no parent. It
does not switch you onto it — pass `--branch` on later commands to target it:

```bash
strata ./mydb branch create scratch
strata ./mydb kv count --branch scratch
```

```text
0
```

## Fork a branch

`branch fork <source> <name>` copies a branch's visible history into a new
branch. There are three variants, chosen by which flags you pass. To show them,
first make three writes to `config` and note the version and timestamp on each
receipt (`strata --json ./mydb kv put config v1` prints
`"commit":{...,"timestamp":3,"version":3}`, and so on for `v2` at 4 and `v3` at 5).

**From the tip** (no flags) forks the source's latest state:

```bash
strata ./mydb branch fork default review
strata ./mydb kv get config --branch review
```

```text
v3
```

**At a version** (`--version`) forks from a retained commit version:

```bash
strata ./mydb branch fork default rollback --version 3
strata ./mydb kv get config --branch rollback
```

```text
v1
```

**At a timestamp** (`--timestamp`) forks from a retained commit timestamp:

```bash
strata ./mydb branch fork default snapshot --timestamp 4
strata ./mydb kv get config --branch snapshot
```

```text
v2
```

The fork record records where it split from under `parent`, for example
`"parent":{"name":"default","fork_version":5,"fork_timestamp":null,...}`.

## Isolation

Writes are scoped to their branch. Writing `config` on `review` leaves `default`
untouched:

```bash
strata ./mydb kv put config review-only --branch review
strata ./mydb kv get config --branch review   # review-only
strata ./mydb kv get config                    # v3
```

## Delete a branch

`branch delete <name>` removes a branch and its history:

```bash
strata ./mydb branch delete scratch
```

```text
deleted applied=true
```

The default branch cannot be deleted:

```text
invalid_argument.engine.branch_delete: default branch cannot be deleted (err_local_0b3b7d37_000001)
  hint: Correct the request input and retry the operation.
  ref: https://stratadb.org/e/invalid_argument.engine.branch_delete
```

## Refusals

Branch operations fail with stable codes, not prose. Recover by code — see
[Error Handling](/docs/guides/error-handling). Common cases:

- Reserved names (the `_system_` prefix is engine-owned) →
  [`invalid_argument.engine.branch_name_reserved`](/e/invalid_argument.engine.branch_name_reserved).
- Re-creating an existing branch →
  [`already_exists.engine.branch`](/e/already_exists.engine.branch).
- Reading or forking a missing branch →
  [`not_found.engine.branch`](/e/not_found.engine.branch).
- Forking at a version or timestamp outside retained history →
  [`history_unavailable.engine.persistence_history`](/e/history_unavailable.engine.persistence_history).

## Compare, preview, and promote

Diverged branches can be inspected and reconciled with three verbs. All are
directional and take branch names positionally.

`branch diff <a> <b>` reports what differs between two branches across every
capability — KV, JSON, vectors, events, and graph nodes, edges, and ontology —
grouped by space, as entries `added` on `b`, `removed` relative to `a`, and
`modified` on both. It is read-only:

```bash
strata ./mydb branch diff default review
```

`branch preview <source> <target>` runs a three-way comparison from the fork
point and reports the conflicts a promotion would hit, mutating neither branch.
Each conflict reports what the chosen `--strategy` would do:

```bash
strata ./mydb branch preview review default
```

`branch merge <source> <target>` promotes the source's changes into the target as
a single atomic commit, leaving the source unchanged:

```bash
strata ./mydb branch merge review default
```

Promotion applies to key-value, JSON, and vector data (with their collection
configs). Event streams and graphs are compared but never merged — divergent
append-only and structural data cannot be three-way merged — so a promotion
leaves them untouched.

The default `--strategy strict` refuses with
[`conflict.engine.promotion`](/e/conflict.engine.promotion) and mutates nothing
when both branches changed the same entity differently since the fork point.
`--strategy source-wins` applies the source side's value or tombstone for each
such conflict and reports every overwritten or deleted target entry. A promotion
that applies nothing writes no commit. Branches with no shared fork lineage are
rejected with
[`invalid_argument.engine.branch_point`](/e/invalid_argument.engine.branch_point).

## Next

- [Spaces](/docs/guides/spaces) — organize data within a branch.
- [KV Store](/docs/data/key-value) — versioned reads and `--as-of` time travel.
- [Concepts: Branches](/docs/concepts/branches) — the model behind these verbs.
