---
title: "Your First Database"
section: "getting-started"
description: "Create a durable database, write across capabilities, fork a branch, and read history."
source: "strata-core@v1.0.0"
---


This tutorial creates a real on-disk database and walks through the everyday
moves: writing and reading, working in the REPL, forking a branch, and reading
an earlier version. Every command and output below comes from a live run.

## Prerequisites

- The [CLI installed](/docs/getting-started/installation).

## Create a database

A database is a directory. Name a path and StrataDB creates it on first write —
no separate "create" step:

```bash
strata ./mydb kv put greeting hello
```

```text
created greeting applied=true
```

Read it back:

```bash
strata ./mydb kv get greeting
```

```text
hello
```

That directory now holds a write-ahead log and a manifest. It is durable: the
data survives the process exiting. For a throwaway database that never touches
disk, swap the path for `--cache` (for example `strata --cache kv put a b`).

## Two ways to run

Everything above used the **one-shot** form: `strata <db> <command>`, one
command per invocation, good for scripts.

For an interactive session, pass just the path to open a **REPL**:

```text
$ strata ./mydb
strata:default/default> kv put agent:model gpt-4
created agent:model applied=true
strata:default/default> kv get agent:model
gpt-4
strata:default/default> kv list
agent:model
greeting
strata:default/default> quit
```

The prompt shows your current branch and space (`default/default`). Inside the
REPL, type commands without the leading `strata`. A few meta-commands help you
move around: `use <branch>` (optionally `use <branch>/<space>`) switches context,
`help` prints the command list, and `quit`, `exit`, or Ctrl-D leaves. Quote rules
differ from the shell, so for JSON documents the one-shot form below is easier to
get right.

## Write JSON documents

The JSON capability stores documents you address by key and mutate at JSON
paths. `$` is the document root:

```bash
strata ./mydb json set profile '$' '{"name":"Ada","score":95}'
```

```text
created profile applied=true
```

Read the whole document, then a single path:

```bash
strata ./mydb json get profile '$'
```

```text
{"name":"Ada","score":95}
```

```bash
strata ./mydb json get profile '$.score'
```

```text
95
```

Updating one path leaves the rest of the document untouched:

```bash
strata ./mydb json set profile '$.score' 99
```

```text
updated profile applied=true
```

KV and JSON both live in the same database on the same branch — one store, many
shapes of data.

## Fork a branch

A branch is an isolated line of data. Fork the current one and writes on the
fork stay off the parent. First put a value on `default`:

```bash
strata ./mydb kv put city tokyo
strata ./mydb branch fork default experiment
```

```text
created city applied=true
{
  "branch_id": "1a29fdd4-745b-5b66-ad18-75b3cf51cef6",
  "created_at": 6,
  "deleted_at": null,
  "generation": 1,
  "name": "experiment",
  "parent": {
    "branch_id": "00000000-0000-0000-0000-000000000000",
    "fork_timestamp": null,
    "fork_version": 6,
    "generation": 1,
    "name": "default"
  },
  "state_revision": 0,
  "status": "active"
}
```

The fork starts as a copy of its parent, so `city` already reads `tokyo` on
`experiment`. Overwrite it there and check both branches:

```bash
strata ./mydb kv put city kyoto --branch experiment
strata ./mydb kv get city --branch experiment
strata ./mydb kv get city
```

```text
updated city applied=true
kyoto
tokyo
```

`experiment` sees `kyoto`; `default` still reads `tokyo`. The write on the fork
was invisible to its parent. (The `created_at` and `fork_version` numbers above
track your database's own commit history, so yours will differ.)

## Read an earlier version

Every write returns a commit. Ask for the commit's timestamp with `--json`:

```bash
strata --json ./mydb kv put note first
```

```text
{"data":{"commit":{"delete_count":0,"durable":true,"put_count":1,"timestamp":11,"version":11},"effect":{"affected_count":1,"applied":true,"kind":"created","matched":false},"key":"bm90ZQ=="},"type":"write_result"}
```

Note `data.commit.timestamp` (here `11`). Overwrite the key, then read it back
both live and as of that earlier commit with `--as-of`:

```bash
strata ./mydb kv put note second
strata ./mydb kv get note
strata ./mydb kv get note --as-of 11
```

```text
updated note applied=true
second
first
```

The live read returns `second`; the `--as-of` read returns the value as it
stood at that commit. Time travel works the same way for JSON, vectors, events,
and the graph.

## Look at the whole database

`describe` prints a compact summary — branches, capabilities, and per-capability
counts (the `version` field is omitted here):

```bash
strata ./mydb describe
```

```text
{
  "branch": "default",
  "branches": [
    "default",
    "experiment"
  ],
  "capabilities": {
    "arrow": true,
    "event": true,
    "graph_core": true,
    "inference": true,
    "json": true,
    "kv": true,
    "vector": true,
    "vector_index": true
  },
  "config": {
    "created": false,
    "default_branch": "default",
    "durable": true,
    "target": "durable_local"
  },
  "default_branch": "default",
  "primitives": {
    "event_count": 0,
    "graphs": [],
    "json_count": 1,
    "kv_count": 4,
    "vector_collections": []
  },
  "spaces": [
    "default"
  ],
  "target": "durable_local"
}
```

`strata ./mydb info` gives the shorter version — branch count, durability, and
target.

## Next

- [Concepts: branches](/docs/concepts/branches) and
  [commits](/docs/concepts/commits) — the model behind fork and `--as-of`.
- [Guides](/docs/guides/kv-store) — each capability in depth:
  [KV](/docs/guides/kv-store), [JSON](/docs/guides/json-store),
  [event log](/docs/guides/event-log), [vectors](/docs/guides/vector-store),
  [graph](/docs/guides/graph).
- [For AI agents](/docs/getting-started/for-agents) — wire this into an agent.
