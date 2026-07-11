---
title: "Agent State Management"
section: "cookbook"
description: "Hold agent config in KV, working memory in a JSON document, and an action log in events, then inspect any earlier state with versioned reads."
source: "strata-core@v1.0.0"
---

Goal: keep an agent's configuration, working memory, and action history in the
primitives that fit each best, and use versioned reads to inspect what the agent
believed at an earlier point.

Prerequisites: the `strata` binary on your PATH. Commands write to a durable
directory (`./agent.db`) that each invocation reopens.

## 1. Pin configuration in KV

Flat, rarely-changing settings belong in the key-value store.

```bash
strata ./agent.db kv put config:model tinyllama
strata ./agent.db kv put config:max_steps 8
```

```text
created config:model applied=true
created config:max_steps applied=true
```

## 2. Initialize working memory as a JSON document

Structured, evolving state belongs in a JSON document you can patch by path.

```bash
strata ./agent.db json set agent '$' '{"status":"planning","step":0,"scratchpad":[]}'
```

```text
created agent applied=true
```

## 3. Advance the run

Each step patches memory and appends to the action log. The event log is your
append-only audit trail.

```bash
strata ./agent.db event append tool_call '{"step":0,"tool":"web_search","query":"strata database"}'
strata ./agent.db json set agent '$.status' '"acting"'
strata ./agent.db event append tool_result '{"step":0,"status":"ok","hits":3}'
strata ./agent.db json set agent '$.step' '1'
strata ./agent.db event append tool_call '{"step":1,"tool":"summarize"}'
strata ./agent.db json set agent '$.step' '2'
strata ./agent.db json set agent '$.status' '"done"'
```

Each `json set` prints `updated agent applied=true`; each `event append` prints
`created applied=true`.

## 4. Read the current state

```bash
strata ./agent.db --raw kv get config:model
strata ./agent.db --raw json get agent '$'
strata ./agent.db event len
```

```text
tinyllama
{"scratchpad":[],"status":"done","step":2}
3
```

## 5. Inspect an earlier state

Every write carries a commit timestamp. List the document's history, then read
`--as-of` any of those timestamps to see the exact memory at that point — a
rollback-style inspection with no rollback.

```bash
strata ./agent.db json history agent
strata ./agent.db --raw json get agent '$' --as-of 5
strata ./agent.db --raw json get agent '$' --as-of 9
```

```text
{"document_version":5,"timestamp":12,"tombstone":false,"value":{"scratchpad":[],"status":"done","step":2},"version":12}
{"document_version":4,"timestamp":11,"tombstone":false,"value":{"scratchpad":[],"status":"acting","step":2},"version":11}
{"document_version":3,"timestamp":9,"tombstone":false,"value":{"scratchpad":[],"status":"acting","step":1},"version":9}
{"document_version":2,"timestamp":7,"tombstone":false,"value":{"scratchpad":[],"status":"acting","step":0},"version":7}
{"document_version":1,"timestamp":5,"tombstone":false,"value":{"scratchpad":[],"status":"planning","step":0},"version":5}
{"scratchpad":[],"status":"planning","step":0}
{"scratchpad":[],"status":"acting","step":1}
```

## Why this works

Each primitive carries its own version history, so you never overwrite the past —
you append to it. Config lives in [KV](/docs/guides/kv-store), evolving memory in
a [JSON document](/docs/guides/json-store), and every action in the
[event log](/docs/guides/event-log). Because reads accept a
[commit](/docs/concepts/commits) timestamp via `--as-of`, "what did the agent
know at step 1" is one query, not a reconstruction. When you need to branch from
an earlier point rather than just read it, fork the branch at that version — see
[A/B Testing with Branches](/docs/cookbook/ab-testing-with-branches).
