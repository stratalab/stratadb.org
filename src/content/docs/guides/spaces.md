---
title: "Spaces"
section: "guides"
description: "Group data into named product spaces within a branch, and manage them with the space verbs."
source: "strata-core@v1.0.0"
---


A product space is a named partition of data inside a branch. Spaces and
branches are Strata's two organizing dimensions, not data types of their own:
your data always lives in one of the five capabilities — KV, JSON, events,
vectors, and graphs — while branches isolate history across forks and spaces
scope which slice of that data you see within a branch. Every branch has a
`default` space, and you can add more to keep unrelated data apart — one space
per tenant, per agent session, or per dataset. This guide covers the four space
verbs: `list`, `create`, `exists`, and `delete`.

Examples use a durable database at `./mydb`. Pass `--space <name>` on any command
to target a space; omit it to use `default`.

## The default space

A fresh database reports exactly one space:

```bash
strata ./mydb space list
```

```text
default
```

With `--json`, the list arrives as an envelope with a continuation cursor:

```bash
strata --json ./mydb space list
```

```text
{"data":{"cursor":null,"has_more":false,"items":["default"]},"type":"space_list"}
```

## Create a space

`space create <name>` registers a new space:

```bash
strata ./mydb space create analytics
```

```text
created analytics applied=true
```

## Check existence

`space exists <name>` prints a bare boolean — handy in scripts:

```bash
strata ./mydb space exists analytics   # true
strata ./mydb space exists ghost       # false
```

## How spaces scope data

Each space holds its own independent instance of every primitive. The same key
in two spaces refers to two different values. Write `report` in `analytics`, and
the `default` space does not see it:

```bash
strata ./mydb --space analytics kv put report q3
strata ./mydb --space analytics kv get report   # q3
strata ./mydb kv get report                      # (nil)
```

Counts confirm the isolation — `kv count` returns `1` in `analytics` and `0` in
`default`. This applies to every primitive: KV, JSON, vectors, events, and
graphs are all space-scoped.

## Delete a space

`space delete <name>` drops a space. By default it refuses to delete a space
that still holds visible data:

```bash
strata ./mydb space delete analytics
```

```text
failed_precondition.engine.space_not_empty: product space `analytics` contains visible data; retry with force=true to delete it (err_local_33f20156_000001)
  hint: Reload the current state and retry the operation against the latest version.
  ref: https://stratadb.org/e/failed_precondition.engine.space_not_empty
```

Pass `--force` to delete the space and its visible data together:

```bash
strata ./mydb space delete analytics --force
```

```text
deleted analytics applied=true
```

Deleting an empty space needs no flag. Deleting a space that does not exist is a
no-op — it reports `applied=false` and exits zero rather than failing:

```bash
strata ./mydb space delete ghost
```

```text
not_found ghost applied=false
```

The default space cannot be deleted:

```bash
strata ./mydb space delete default
```

```text
invalid_argument.engine.space_delete_default: default product space cannot be deleted (err_local_35ac8288_000001)
  hint: Correct the request input and retry the operation.
  ref: https://stratadb.org/e/invalid_argument.engine.space_delete_default
```

## Spaces or branches?

Reach for a space when you want to keep related data organized inside one line
of history — tenants, sessions, or datasets that live and version together.
Reach for a [branch](/docs/guides/branch-management) when you want an isolated
copy of history you can fork, time-travel, and discard. The two compose: a
branch contains spaces, and forking a branch carries its spaces along.

## Next

- [Branch Management](/docs/guides/branch-management) — isolate history with forks.
- [KV Store](/docs/guides/kv-store) — the primitive used in these examples.
- [Concepts: Primitives](/docs/concepts/primitives) — how the five data types relate.
