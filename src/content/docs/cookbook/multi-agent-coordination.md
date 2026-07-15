---
title: "Multi-Agent Coordination"
section: "cookbook"
description: "Give each agent an isolated branch, share an append-only event journal, and separate independent runs with spaces."
source: "strata-core@v1.0.0"
---

Goal: let several agents work in parallel without stepping on each other, then
gather their results — using isolated branches for private work and a shared event
log as the common journal.

Prerequisites: the `strata` binary on your PATH, and `jq` for readable output.
Commands write to a durable directory (`./team.db`) that each invocation reopens.

## 1. Publish the shared task list

Work everyone can read starts on the `default` branch.

```bash
strata ./team.db kv put task:1 "summarize the changelog"
strata ./team.db kv put task:2 "draft release notes"
```

```text
created task:1 applied=true
created task:2 applied=true
```

## 2. Give each agent an isolated branch

```bash
strata ./team.db branch fork default agent-a --json | jq -c '{name: .data.name, forked_from: .data.parent.name, at_version: .data.parent.fork_version}'
strata ./team.db branch fork default agent-b --json | jq -c '{name: .data.name, forked_from: .data.parent.name, at_version: .data.parent.fork_version}'
```

```text
{"name":"agent-a","forked_from":"default","at_version":4}
{"name":"agent-b","forked_from":"default","at_version":4}
```

## 3. Each agent works privately

Writes on one agent's branch are invisible to the other, so they never collide —
even on the same key (`result`).

```bash
strata ./team.db kv put result "changelog summary: 12 fixes, 3 features" --branch agent-a
strata ./team.db kv put result "release notes draft" --branch agent-b
```

```text
created result applied=true
created result applied=true
```

## 4. Report progress to a shared journal

Appends to `default` are atomic and auto-commit, so the event log is a safe shared
journal that any agent can add to.

```bash
strata ./team.db event append progress '{"agent":"a","task":1,"state":"done"}'
strata ./team.db event append progress '{"agent":"b","task":2,"state":"done"}'
```

```text
created applied=true
created applied=true
```

## 5. Aggregate the results

A coordinator reads each agent's branch and the shared journal.

```bash
strata ./team.db --raw kv get result --branch agent-a
strata ./team.db --raw kv get result --branch agent-b
strata ./team.db event len
strata ./team.db event range 0 --json | jq -c '.data.items[] | {seq: .event.sequence, payload: .event.payload}'
```

```text
changelog summary: 12 fixes, 3 features
release notes draft
2
{"seq":0,"payload":{"agent":"a","state":"done","task":1}}
{"seq":1,"payload":{"agent":"b","state":"done","task":2}}
```

## 6. Separate whole runs with spaces

A space is a second, independent axis of isolation. The same key holds different
values in different spaces, so a second team's run never collides with the first.

```bash
strata ./team.db space create team-2
strata ./team.db kv put task:1 "unrelated task" --space team-2
strata ./team.db --raw kv get task:1
strata ./team.db --raw kv get task:1 --space team-2
```

```text
created team-2 applied=true
created task:1 applied=true
summarize the changelog
unrelated task
```

## Why this works

Coordination here is by isolation and aggregation. Each agent owns a private
[branch](/docs/concepts/branches), so concurrent work cannot conflict; you gather
outcomes by reading each branch. Strata has no branch-merge step, so the pattern
is a shared append-only [event journal](/docs/data/events) plus per-branch
reads — and when you want an agent's result to graduate to the shared branch, you
replay its writes there, as shown in
[A/B Testing with Branches](/docs/cookbook/ab-testing-with-branches).
[Spaces](/docs/guides/spaces) add an orthogonal partition for keeping independent
runs apart, and the [branch management guide](/docs/guides/branching-workflows)
covers forking and deleting agent branches.
