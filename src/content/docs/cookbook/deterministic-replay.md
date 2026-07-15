---
title: "Deterministic Replay"
section: "cookbook"
description: "Record external inputs in the event log and reconstruct any past state exactly, using versioned reads and fork-at-version."
source: "strata-core@v1.0.0"
---

Goal: make an agent run reproducible by recording every nondeterministic input in
the event log, then reconstruct the exact committed state at any past point.

Prerequisites: the `strata` binary on your PATH, and `jq` for readable event
output. Commands write to a durable directory (`./replay.db`) that each
invocation reopens.

## 1. Record every external input

Before the agent acts on a clock reading, an API response, or a random draw, write
it to the event log. The log is append-only and hash-linked, so it is the source
of truth for the run. Derived decisions go in KV.

```bash
strata ./replay.db event append input '{"source":"clock","epoch":1706900000}'
strata ./replay.db event append input '{"source":"weather_api","temp_c":12}'
strata ./replay.db event append input '{"source":"rng","value":2}'
strata ./replay.db kv put decision "option 2"
```

```text
created applied=true
created applied=true
created applied=true
created decision applied=true
```

## 2. Walk the recorded inputs in order

Read the log back by sequence. Because the decision was a pure function of these
inputs, re-running the same logic over them reproduces the same result.

```bash
strata ./replay.db event range 0 --json | jq -c '.data.items[] | {seq: .event.sequence, type: .event.event_type, payload: .event.payload}'
```

```text
{"seq":0,"type":"input","payload":{"epoch":1706900000,"source":"clock"}}
{"seq":1,"type":"input","payload":{"source":"weather_api","temp_c":12}}
{"seq":2,"type":"input","payload":{"source":"rng","value":2}}
```

## 3. Verify the log was not tampered with

Every event links to the previous one by hash. `verify-chain` confirms the
sequence is dense and the linkage is intact.

```bash
strata ./replay.db event verify-chain
```

```text
{
  "error": null,
  "first_invalid": null,
  "length": 3,
  "valid": true
}
```

## 4. Reconstruct an exact past state

Suppose the agent later overwrites its decision. You can still recover the earlier
committed state: fork a branch at the version where `option 2` was written. The
`decision` write committed at version 6, so fork there.

```bash
strata ./replay.db kv put decision "option 9"
strata ./replay.db branch fork default replay --version 6 --json | jq -c '{name: .data.name, forked_from: .data.parent.name, at_version: .data.parent.fork_version}'
strata ./replay.db --raw kv get decision --branch replay
strata ./replay.db --raw kv get decision
```

```text
updated decision applied=true
{"name":"replay","forked_from":"default","at_version":6}
option 2
option 9
```

The `replay` branch reads the historical `option 2`; `default` keeps the current
`option 9`.

## Why this works

Nondeterminism only breaks reproducibility if it is thrown away. Recording each
input in the [event log](/docs/data/events) turns the run into a replayable
transcript, and hash linkage lets you prove it is unaltered. Every write also
gets a monotonic [commit](/docs/concepts/commits) version, so forking a
[branch](/docs/concepts/branches) at that version rebuilds the exact state the
agent saw — no snapshots to manage. See the
[branch management guide](/docs/guides/branching-workflows) for the fork variants
(at-version and at-timestamp).
