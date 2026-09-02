---
title: "Multi-Agent Coordination"
section: "cookbook"
description: "Give each agent an isolated branch, share an append-only event journal, and separate independent runs with spaces."
source: "strata-core@v1.1.0"
---

Goal: let several agents work in parallel without stepping on each other, then
gather their results - using isolated branches for private work and a shared event
log as the common journal.

Prerequisite: the `strata` binary on your PATH. Open a durable database with
`strata ./team` before step 1. Shell pipeline snippets use the same database
path explicitly.

## 1. Publish the shared task list

Work everyone can read starts on the `default` branch.

```text
strata:default/default › kv put task:1 "summarize the changelog"
strata:default/default › kv put task:2 "draft release notes"
```

```text
created task:1 applied=true
created task:2 applied=true
```

## 2. Give each agent an isolated branch

```text
strata:default/default › branch fork default agent-a
strata:default/default › branch fork default agent-b
```

```text
{ "name": "agent-a", "parent": { "name": "default", "fork_version": 4 }, "status": "active" }
{ "name": "agent-b", "parent": { "name": "default", "fork_version": 4 }, "status": "active" }
```

## 3. Each agent works privately

Writes on one agent's branch are invisible to the other, so they never collide -
even on the same key (`result`).

```text
strata:default/default › use agent-a
strata:agent-a/default › kv put result "changelog summary: 12 fixes, 3 features"
strata:agent-a/default › use agent-b
strata:agent-b/default › kv put result "release notes draft"
```

```text
created result applied=true
created result applied=true
```

## 4. Report progress to a shared journal

Appends to `default` are atomic and auto-commit, so the event log is a safe shared
journal that any agent can add to.

```text
strata:agent-b/default › use default
strata:default/default › event append progress '{"agent":"a","task":1,"state":"done"}'
strata:default/default › event append progress '{"agent":"b","task":2,"state":"done"}'
```

```text
created applied=true
created applied=true
```

## 5. Aggregate the results

A coordinator reads each agent's branch and the shared journal.

```text
strata:default/default › use agent-a
strata:agent-a/default › --raw kv get result
strata:agent-a/default › use agent-b
strata:agent-b/default › --raw kv get result
strata:agent-b/default › use default
strata:default/default › event count
```

For the journal details, use a shell pipeline:

```bash
strata ./team event range 0 --json | jq -c '.data.items[] | {seq: .event.sequence, payload: .event.payload}'
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

```text
strata:default/default › space create team-2
strata:default/default › use default team-2
strata:default/team-2 › kv put task:1 "unrelated task"
strata:default/team-2 › use default
strata:default/default › --raw kv get task:1
strata:default/default › use default team-2
strata:default/team-2 › --raw kv get task:1
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
outcomes by reading each branch. A shared append-only
[event journal](/docs/data/events) plus per-branch reads keep the runs
observable - and when you want an agent's KV, JSON, or vector result to graduate
to the shared branch, promote it with `branch merge`, as shown in
[A/B Testing with Branches](/docs/cookbook/ab-testing-with-branches).
[Spaces](/docs/guides/spaces) add an orthogonal partition for keeping independent
runs apart, and the [branch management guide](/docs/guides/branching-workflows)
covers forking and deleting agent branches.
