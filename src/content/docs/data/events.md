---
title: "Events"
section: "data"
description: "Append typed events, list them by sequence or type, and verify the hash-linked log."
source: "strata-core@v1.1.0"
---

Use events when the order of what happened matters. The event log is append-only:
you add typed JSON payloads, read them back by sequence, and can verify the
hash chain.

Use [JSON](/docs/data/json) or [KV](/docs/data/key-value) for mutable current
state. Use events for the record that should not be overwritten.

Examples below assume you opened a database with `strata ./mydb`.

## Append

```text
strata:default/default › event append order.created '{"id":"A1","total":42}'
strata:default/default › event append order.paid '{"id":"A1"}'
```

```text
created applied=true
created applied=true
```

Use `--json` when you need the assigned sequence and commit facts:

```bash
strata --json ./mydb event append order.shipped '{"id":"A1"}'
```

Sequences start at `0` inside the branch and space.

## Read

```text
strata:default/default › event get 0
strata:default/default › event count
strata:default/default › event exists 99
```

`event get` returns the event payload, type, sequence, hash, previous hash, and
commit version. A missing sequence returns a not-found value instead of throwing.

## List And Filter

```text
strata:default/default › event list --limit 20
strata:default/default › event types
strata:default/default › event by-type order.created --limit 5
```

For paging, use `--after-sequence`. For a window, use sequence or event
wall-clock time:

```text
strata:default/default › event range 0 --limit 50
strata:default/default › event range-time <start-event-timestamp> --end-ts <end-event-timestamp>
```

Event wall-clock timestamps are not the same as `--as-of` commit timestamps.

## Verify The Chain

```text
strata:default/default › event verify-chain
```

The command checks dense sequence numbers and each event's link to the previous
hash. Use it when the log is part of an audit or replay path.

## Branches And History

Each branch has its own event sequence. Forking a branch lets a session append
events without touching the parent stream.

Read an earlier log snapshot with the commit timestamp from a write receipt:

```text
strata:default/default › event list --as-of <timestamp-from-receipt>
```

In `v1.1.0`, branch merge compares event streams but does not merge them.

## Errors To Handle

Invalid event types and oversized payloads are rejected with codes such as
[`invalid_argument.engine.event_type`](/e/invalid_argument.engine.event_type) and
[`invalid_argument.engine.event_payload_too_large`](/e/invalid_argument.engine.event_payload_too_large).

Recover by code. See [Error handling](/docs/guides/error-handling).

## Reference

Exact parameters, return shapes, range commands, and error lists are generated in
the [Event command reference](/docs/reference/event).
