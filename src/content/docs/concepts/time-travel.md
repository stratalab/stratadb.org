---
title: "Time travel"
section: "concepts"
description: "Every write is a versioned commit, and any read can travel back to an earlier one. How historical reads work across every primitive."
source: "strata-core@v1.0.0"
---

Time travel is reading the database as it was at an earlier point, not restoring a
backup. Because every write is a [commit](/docs/concepts/commits) with a version
and timestamp, the past is still there — and any read can ask for it. This works
the same across all five [primitives](/docs/concepts/primitives), because they
share one versioned substrate.

## The commit clock

Each successful write returns a **commit**: a monotonically increasing version and
a small logical timestamp. That timestamp is a *commit clock* — the first user
write is a low integer, and it advances by one per commit — not a wall-clock time.
You capture it from a write receipt (`data.commit.timestamp` under `--json`) and
hand it back to a read to pin that read to that moment.

```bash
strata ./mydb json set user:1 '$.plan' '"pro"'      # receipt carries commit.timestamp, say 7
strata ./mydb json set user:1 '$.plan' '"free"'     # a later commit, say 8
```

## Reading the past with `--as-of`

Every read verb accepts `--as-of <timestamp>`. The read sees the state as of that
commit, ignoring everything written after it:

```bash
strata ./mydb json get user:1 '$.plan'              # "free"  (latest)
strata ./mydb --as-of 7 json get user:1 '$.plan'    # "pro"   (as of commit 7)
```

The same `--as-of` applies to KV, JSON, vectors, events, and the graph — pass one
timestamp and you get a **consistent snapshot of the whole database** at that
commit, not a per-primitive patchwork. That is the payoff of a shared substrate;
[Combining primitives](/docs/data/combining-primitives) shows it across all five
at once.

Alongside point-in-time reads, most primitives expose a `history` verb that lists
a key's prior revisions newest-first, so you can see *what* changed as well as
read *as of* a change.

## Two kinds of timestamp

Do not confuse the commit clock with data timestamps:

- The **commit timestamp** (`--as-of`) is the logical clock above — small
  integers from a write receipt. It selects a database snapshot.
- The [event log](/docs/data/events) additionally stamps each event with a
  wall-clock microsecond `timestamp`, used by `event range-time` to select events
  by real time. That is a property of the event payload, not the snapshot clock.

When in doubt: `--as-of` travels the database's history; `range-time` filters
events by their own recorded time.

## Forking at a point in time

Time travel composes with [branches](/docs/concepts/branches). You can not only
*read* a past commit — you can *fork* from one, creating a new branch anchored to
that moment and then evolving it independently:

```bash
strata ./mydb branch fork main investigate --timestamp 7
```

That gives you a live branch that starts from the state at commit 7, leaving
`main` untouched — the basis for "reproduce the bug as of last Tuesday, then poke
at it" workflows.

## The retention boundary

History is retained, but not unbounded. Asking for a version or timestamp that
has aged out of retained history is a distinct, typed error —
`history_unavailable` — rather than a silent wrong answer or a not-found. Branch
on that class if your workflow reaches far back; see
[error handling](/docs/guides/error-handling).

## Next

- [Commits](/docs/concepts/commits) — the write side: how versions and timestamps
  are produced.
- [Branches](/docs/concepts/branches) — isolation, and forking from a past point.
- [Combining primitives](/docs/data/combining-primitives) — one snapshot across
  all five primitives.
