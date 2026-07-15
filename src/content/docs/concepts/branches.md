---
title: "Branches"
section: "concepts"
description: "Branches are the isolation model: every value lives in a branch, forks are cheap, and writes on one branch stay invisible to another."
source: "strata-core@v1.0.0"
---

A **branch** is an isolated namespace for data. Every value in StrataDB lives inside a branch, and every capability — KV, JSON, event log, vectors, graphs — is branch-aware. Branches are how you keep one agent session, experiment, or tenant from seeing another's data, without copying the whole database.

A database always has a `default` branch. You never create it; it is there the moment the database exists.

## Forking a branch

`branch fork` creates a new branch from an existing one. The fork starts as a copy-on-write view of its parent — you see the parent's data, but your writes go only to your branch.

```bash
strata ./db kv put city london
strata ./db branch fork default experiment
strata ./db kv put city tokyo --branch experiment
```

Reading each branch shows the isolation:

```text
$ strata ./db kv get city --branch experiment
tokyo
$ strata ./db kv get city
london
```

The write on `experiment` never touched `default`. Forking is cheap because nothing is copied up front; the branch records its parent and the commit version it forked from:

```text
$ strata ./db branch get experiment
{
  "branch_id": "1a29fdd4-745b-5b66-ad18-75b3cf51cef6",
  "created_at": 3,
  "deleted_at": null,
  "generation": 1,
  "name": "experiment",
  "parent": {
    "branch_id": "00000000-0000-0000-0000-000000000000",
    "fork_timestamp": null,
    "fork_version": 3,
    "generation": 1,
    "name": "default"
  },
  "state_revision": 0,
  "status": "active"
}
```

The `parent` block names the branch you forked from and the `fork_version` you forked at; `default` always has the all-zero `branch_id`.

## Empty branches

`branch create` makes a fresh **root** branch with no parent and no data — useful when you want a clean namespace rather than a fork of existing state.

```text
$ strata ./db branch create fresh
$ strata ./db kv get city --branch fresh
(nil)
```

## Listing and inspecting

```bash
strata ./db branch list            # every branch, one per line
strata ./db branch get experiment  # one branch's metadata
strata ./db branch delete fresh    # remove a branch and its data
```

Branch generations are monotonic per name: delete a branch and create it again, and the new one has a higher generation, so stale references never silently resolve to fresh data.

## Forking a point in time

A fork does not have to start from the tip. Pass `--version` or `--timestamp` to fork from a retained point in the source branch's history:

```bash
strata ./db branch fork default older --version 3
```

The new branch sees the source exactly as it stood at that version, while the source keeps moving forward:

```text
$ strata ./db kv get x --branch older
v1
$ strata ./db kv get x
v2
```

## Safety rules

- The `default` branch cannot be deleted. Attempting it fails with `invalid_argument.engine.branch_delete`.
- Cross-branch references are rejected — you cannot point an operation at data in a branch other than the one it targets.
- There is no merge command in this release. Branches diverge freely; to bring work from one branch onto another, re-apply (replay) the writes you want on the target. This release ships forking, isolated writes, and deletion, and leaves merge to a future surface.

## Choosing a branch per command

One-shot commands take `--branch <name>`; without it they target `default`. This is the clearest way to script against a specific branch, because each process is independent:

```bash
strata ./db kv put status ready --branch session-42
strata ./db kv get status --branch session-42
```

In the interactive REPL (`strata ./db` with no command), the branch is sticky: `use <branch>` — or passing `--branch` on any line — switches the current branch for the lines that follow, and the prompt reflects it.

```text
strata:default/default> use experiment
strata:experiment/default>
```

## When to use branches

| Scenario | Pattern |
|----------|---------|
| Each agent session gets its own state | One branch per session id |
| A/B testing two strategies | One branch per variant, compare, keep the winner |
| Safe experiments | Fork, try changes, delete the branch if it goes wrong |
| Multi-tenant isolation | One branch per tenant |
| Reproducible snapshots | Fork at a known point and read it later |

## Next

- [Commits](/docs/concepts/commits) — how writes on a branch become versioned and durable
- [Branch Management Guide](/docs/guides/branching-workflows) — the full branch API
- [A/B Testing with Branches](/docs/cookbook/ab-testing-with-branches) and [Multi-Agent Coordination](/docs/cookbook/multi-agent-coordination) — worked patterns
