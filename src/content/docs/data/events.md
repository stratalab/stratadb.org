---
title: "Events"
section: "data"
description: "Append hash-linked events and read them back by sequence, type, or time."
source: "strata-core@v1.0.0"
---

The event log is an append-only, ordered sequence of typed events. Each event
gets a monotonic sequence number and is hash-linked to the one before it, so the
log is tamper-evident. Use it for audit trails, agent action histories, change
feeds, or anything where the order and integrity of what happened matters. Like
every [primitive](/docs/concepts/primitives), the log is branch-aware and
versioned.

Examples below were run against the shipped binary. Use a directory path for a
durable database or `--cache` for a throwaway run.

## Append events

`event append <type> <payload>` adds one event. The payload is parsed as JSON;
use `@path` or `-f <file>` to read it from a file. Appends auto-commit.

```bash
strata ./mydb event append order.created '{"id":"A1","total":42}'
```

```text
created applied=true
```

The `--json` envelope shows the assigned sequence. Sequences start at 0:

```bash
strata --json ./mydb event append order.paid '{"id":"A1"}'
```

```text
{"data":{"commit":{"delete_count":0,"durable":true,"put_count":3,"timestamp":4,"version":4},"effect":{"affected_count":1,"applied":true,"kind":"created","matched":false},"event_type":"order.paid","sequence":1,"timestamp":4,"version":4},"type":"event_append_result"}
```

## Read one event

`event get <sequence>` returns a single event. Alongside the payload and type
it carries a `hash`, the `previous_hash` it links to, and an internal wall-clock
`timestamp` in microseconds.

```bash
strata ./mydb event get 0
```

```text
{
  "event": {
    "event_type": "order.created",
    "hash": "82e2c6af52801cb5376a91937ddf98f0dddb10bf335b797035308179b0de29f6",
    "payload": {
      "id": "A1",
      "total": 42
    },
    "previous_hash": "0000000000000000000000000000000000000000000000000000000000000000",
    "sequence": 0,
    "timestamp": 1783735254224134
  },
  "timestamp": 3,
  "version": 3
}
```

The first event links to an all-zero `previous_hash`. Reading a sequence that
does not exist is not an error — it returns null and exits zero. `event exists
<sequence>` returns `true`/`false`, and `event count` counts visible events.

## List, filter by type

`event list` returns events in order; `--limit`, `--event-type`, and
`--after-sequence` (an exclusive cursor) page and filter it. `event types` lists
the distinct types present, and `event by-type <type>` returns only that type.

```bash
strata ./mydb event types
strata ./mydb event by-type order.created --limit 5
```

```text
order.created
order.paid
order.shipped
{"event":{"event_type":"order.created","hash":"82e2c6af52801cb5376a91937ddf98f0dddb10bf335b797035308179b0de29f6","payload":{"id":"A1","total":42},"previous_hash":"0000000000000000000000000000000000000000000000000000000000000000","sequence":0,"timestamp":1783735254224134},"timestamp":3,"version":3}
{"event":{"event_type":"order.created","hash":"3d44143df25625c0833ba804cff9530e502b0fc8bfd4ba2514f64afce1cee341","payload":{"id":"A2","total":17},"previous_hash":"4dc2683aad6b5f2ac92da28bfc738b21bc0d4db3424840abd8de7f4bc46a0c22","sequence":2,"timestamp":1783735254242541},"timestamp":5,"version":5}
```

## Read ranges by sequence

`event range <start-seq>` reads from a sequence forward; `--end-seq` is an
exclusive upper bound, `--limit` caps the page, and `--direction reverse` walks
backward from the start. A trailing `-- more:` line carries the next cursor.

```bash
strata ./mydb event range 3 --direction reverse --limit 2
```

```text
{"event":{"event_type":"order.shipped","hash":"ac28ae25f43d627ca1503c3ec49be79930781526e747039283f158a027685387","payload":{"id":"A1"},"previous_hash":"3d44143df25625c0833ba804cff9530e502b0fc8bfd4ba2514f64afce1cee341","sequence":3,"timestamp":1783735254251352},"timestamp":6,"version":6}
{"event":{"event_type":"order.created","hash":"3d44143df25625c0833ba804cff9530e502b0fc8bfd4ba2514f64afce1cee341","payload":{"id":"A2","total":17},"previous_hash":"4dc2683aad6b5f2ac92da28bfc738b21bc0d4db3424840abd8de7f4bc46a0c22","sequence":2,"timestamp":1783735254242541},"timestamp":5,"version":5}
-- more: 2
```

## Read ranges by time

`event range-time <start-ts>` selects events by their wall-clock timestamp
(microseconds, as printed in each event). `--end-ts` is an inclusive upper
bound; `--direction` and `--event-type` work as with sequence ranges.

```bash
strata ./mydb event range-time 1783735254224134 --end-ts 1783735254251352
```

This returns every event whose internal timestamp falls in that window. Note
the distinction from `--as-of`: the internal event `timestamp` is wall-clock,
while `--as-of <timestamp>` on reads uses the commit clock (the small
`commit.timestamp` from a write receipt) to view a historical snapshot of the
log.

## Verify the chain

`event verify-chain` walks the log and confirms both that sequence numbers are
dense and that each event's hash links to its predecessor.

```bash
strata ./mydb event verify-chain
```

```text
{
  "error": null,
  "first_invalid": null,
  "length": 4,
  "valid": true
}
```

If a link were broken, `valid` would be `false` and `first_invalid` would name
the offending sequence.

## Branches and time travel

The log is branch-scoped — each branch has its own sequence. Fork a branch to
record a separate stream of events without touching the parent, and pass
`--as-of` to any read verb (including `event count`) to see the log as of an
earlier commit. See [Branches](/docs/concepts/branches) and
[Commits](/docs/concepts/commits).

## Error cases worth knowing

An invalid event type or an oversized payload is rejected with a coded error —
for example [/e/invalid_argument.engine.event_type](/e/invalid_argument.engine.event_type)
or
[/e/invalid_argument.engine.event_payload_too_large](/e/invalid_argument.engine.event_payload_too_large).
A payload that is not valid JSON fails to parse before it reaches the log.
Recover by code, never by message — see
[error handling](/docs/guides/error-handling).

## When to use the event log vs other primitives

- Use the **event log** when order and integrity matter and you only ever
  append.
- Use [KV](/docs/data/key-value) or [JSON](/docs/data/json) for mutable
  state you overwrite in place.
- Use [Vectors](/docs/data/vectors) for similarity search.

For a worked pattern, see
[deterministic replay](/docs/cookbook/deterministic-replay). The full verb list
is in the [CLI reference](/docs/reference/cli).

## Reference

Every event command — parameters, returns, errors, and runnable CLI/wire/Python
examples — is in the generated [Event command reference](/docs/reference/event).
