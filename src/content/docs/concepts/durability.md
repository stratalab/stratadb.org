---
title: "Durability"
section: "concepts"
description: "A durable database is backed by a write-ahead log and recovers on reopen; a cache database is pure in-memory and writes nothing to disk."
source: "strata-core@v1.0.0"
---

StrataDB has two ways to hold data, and you choose between them when you open the database: a **durable** database backed by disk, or a **cache** database that lives entirely in memory. There is no in-between mode to configure and no per-write durability flag — durability is a property of the database you opened.

## Durable databases

Point the CLI at a path and you get a durable database. It is created on first use and reopened every time after:

```bash
strata ./my-db kv put greeting hello
```

`info` reports what you have:

```text
$ strata ./my-db info
{
  "durable": true,
  "target": "durable_local",
  "open": true,
  ...
}
```

On disk, a durable database is a directory of a few subdirectories:

```text
$ ls ./my-db
locks  manifest  wal
```

- **`wal`** — the write-ahead log. Every commit is written here before it is acknowledged.
- **`manifest`** — the record of the database's structure and committed state.
- **`locks`** — guards against two processes opening the same database at once.

### Write-ahead log and recovery

Durable writes follow a write-ahead protocol: the change is appended to the WAL and made durable, and only then does the write return success. Because the log records committed state before you see an acknowledgement, a durable database can rebuild itself after a crash. Recovery happens automatically the next time you open the path — you do not run a separate repair step:

```text
$ strata ./my-db kv put persisted yes
created persisted applied=true
# a brand-new process, later:
$ strata ./my-db kv get persisted
yes
```

The value survives because it was in the WAL before the first process exited.

### Halt on fsync failure

Durability is only meaningful if a successful write is actually on disk. If the operating system cannot flush the WAL — an `fsync` failure — the writer **halts** rather than acknowledging writes it cannot guarantee. It will not silently continue accepting data it might lose. You recover by resolving the underlying disk problem and reopening the database, which replays the log up to the last write it could prove was durable. This is a deliberate trade: StrataDB would rather stop than lie about durability.

## Cache databases

Pass `--cache` and the database lives only in memory. Nothing is ever written to disk — no WAL, no manifest, no lock files:

```text
$ strata --cache info
{
  "durable": false,
  "target": "cache",
  ...
}
```

You can confirm it leaves no trace. Run a cache write in an empty directory and the directory stays empty:

```text
$ strata --cache kv put x y
created x applied=true
$ ls
# (nothing)
```

Two consequences follow from being purely in-memory:

- **Data does not persist.** Each `--cache` process starts empty and forgets everything when it exits. Two separate `strata --cache` commands do not share state.
- **There is nothing to recover.** Cache mode has no WAL, snapshot, or lock objects by design, so there is no crash recovery — the data simply was never on disk.

Cache mode is the right choice for tests, one-off experiments, ephemeral agent scratch space, and running in environments where you do not want to touch the filesystem.

## Choosing a mode

| You want to… | Use |
|--------------|-----|
| Keep data across restarts | A durable database (`strata ./path …`) |
| Guarantee committed writes survive a crash | A durable database — writes are WAL-backed |
| Run a fast, throwaway experiment | A cache database (`strata --cache …`) |
| Avoid writing anything to disk | A cache database |

When in doubt, use a durable database. The cost of the write-ahead log is small, and you get recovery for free.

## Next

- [Commits](/docs/concepts/commits) — the `durable` flag on each write receipt
- [Database Configuration](/docs/guides/database-configuration) — opening, targeting, and inspecting a database
- [Observability](/docs/guides/observability) — `info`, `health`, and `doctor`
- [Troubleshooting](/docs/troubleshooting) — recovery and lock issues
