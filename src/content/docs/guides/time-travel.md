---
title: "Time travel"
section: "guides"
description: "Read the past with --as-of, list a key's history, and reproduce or investigate state at a point in time."
source: "strata-core@v1.0.0"
---

Strata keeps history, so you can read the database as it was at an earlier commit
instead of restoring a backup. This guide is the hands-on patterns; for the model
behind them see [the time-travel concept](/docs/concepts/time-travel). Examples
use a durable database at `./mydb`.

## Capture a commit timestamp

Time-travel reads take a **commit timestamp** — the small logical clock value a
write returns, not a wall-clock time. Grab it from a write receipt under `--json`:

```bash
strata --json ./mydb json set config '$.tier' '"free"'
```

```text
{"data":{"commit":{"delete_count":0,"durable":true,"put_count":1,"timestamp":3,"version":3}, ...},"type":"json_versioned_value"}
```

The `commit.timestamp` (here `3`) names this moment. Do another write and it
advances:

```bash
strata --json ./mydb json set config '$.tier' '"pro"'   # commit.timestamp 4
```

## Read as of a past commit

Pass `--as-of <timestamp>` to any read to see the state at that commit, ignoring
later writes:

```bash
strata ./mydb json get config '$.tier'              # "pro"   (latest)
strata ./mydb --as-of 3 json get config '$.tier'    # "free"  (as of commit 3)
```

The same flag works on every primitive — KV, JSON, vectors, events, and the
graph — so one timestamp gives you a consistent snapshot of the whole database.

## List a key's history

Where `--as-of` reads *as of* a moment, the `history` verbs show *what changed*.
Each primitive with mutable values exposes one, newest-first:

```bash
strata ./mydb json history config
```

```text
{"document_version":4,"timestamp":4,"tombstone":false,"value":{"tier":"pro"},"version":4}
{"document_version":3,"timestamp":3,"tombstone":false,"value":{"tier":"free"},"version":3}
```

KV has `kv history <key>`, vectors have `vector history <collection> <key>`, and
so on. Reach for history to find the commit you want, then read `--as-of` it.

## Reproduce state at a point in time

To *work with* a past state rather than just read it, fork a branch anchored to
that commit. The fork starts from the old state and evolves independently, leaving
the source branch untouched:

```bash
strata ./mydb branch fork main investigate --timestamp 3
strata ./mydb --branch investigate json get config '$.tier'   # "free"
```

This is the "reproduce the bug as of last Tuesday, then poke at it" workflow — see
[branching workflows](/docs/guides/branching-workflows) for the full fork surface.

## Audit what changed

Combine the two: `history` tells you the sequence of versions, and `--as-of`
reads any of them back in full. To compare two points, read the same key at two
timestamps:

```bash
strata ./mydb --as-of 3 json get config '$'
strata ./mydb --as-of 4 json get config '$'
```

For an append-only audit trail rather than point-in-time diffs, the
[event log](/docs/data/events) is hash-linked and verifiable, and
`event range-time` selects events by their own wall-clock timestamp.

## When history runs out

History is retained but not unbounded. Asking for a timestamp older than retained
history returns a typed `history_unavailable` error rather than a wrong answer —
branch on that class if you reach far back. See
[error handling](/docs/guides/error-handling).

## Related

- [Time travel (concept)](/docs/concepts/time-travel) — the commit clock and the model.
- [Branching workflows](/docs/guides/branching-workflows) — forking from a past point.
- [Combining primitives](/docs/data/combining-primitives) — one snapshot across all five.
