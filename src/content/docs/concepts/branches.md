---
title: "Branches"
section: "concepts"
description: "Branches isolate database state: fork a branch, change it, preview a merge, and promote the result."
source: "strata-core@v1.1.0"
---

A branch is an isolated database view. Every key, document, event, vector, and
graph row belongs to a branch. A new database starts with `default`.

## Fork

`branch fork <source> <name>` creates a copy-on-write branch. It sees the
source branch at the fork point, but later writes stay on the fork.

```bash
strata ./db kv put city london
strata ./db branch fork default experiment
strata ./db --branch experiment kv put city tokyo
```

```bash
strata ./db --branch experiment kv get city
strata ./db --branch default kv get city
```

```text
tokyo
london
```

Nothing is copied up front. The branch records its parent and fork version.

## Create An Empty Branch

`branch create <name>` makes a root branch with no parent data:

```bash
strata ./db branch create scratch
strata ./db --branch scratch kv get city
```

```text
(nil)
```

Use `create` for a clean namespace. Use `fork` when you want existing state.

## Compare Before You Promote

Use three verbs when a branch is ready to come back:

```bash
strata ./db branch diff default experiment
strata ./db branch preview experiment default
strata ./db branch merge experiment default
```

- `diff` is read-only. It reports changes by capability and space.
- `preview` reports the conflicts a merge would hit.
- `merge` applies the source into the target as one commit.

In `v1.1.0`, merge applies key-value, JSON, and vector changes. Events and
graphs are compared but not merged.

The default merge strategy is `strict`: if both sides changed the same entity
since the fork point, the merge refuses with `conflict.engine.promotion`.
`--strategy source-wins` takes the source side for conflicts.

## Fork From The Past

A fork can start from a retained point in history:

```bash
strata ./db branch fork default older --version 3
strata ./db branch fork default yesterday --timestamp 12
```

Use a version or commit timestamp from the source branch. The new branch starts
at that point while the source keeps moving.

## Choose A Branch

One-shot commands default to `default`. Pass `--branch` when you want another
branch:

```bash
strata ./db --branch experiment kv get city
```

In the REPL, switch the current context:

```text
strata:default/default> use experiment
strata:experiment/default>
```

## Safety Rules

- `default` cannot be deleted.
- Deleted branch names get a new generation if reused.
- Cross-branch references are rejected.
- Merge is explicit; StrataDB does not auto-promote branch changes.

## Next

- [Commits](/docs/concepts/commits) for write versions.
- [Time travel](/docs/concepts/time-travel) for `--as-of`.
- [Branching workflows](/docs/guides/branching-workflows) for the command-level
  guide.
