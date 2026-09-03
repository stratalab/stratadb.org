---
title: "Key-Value"
section: "data"
description: "Use the KV primitive for simple values addressed by key, with branch isolation and versioned reads."
source: "strata-core@v1.1.1"
---

Use key-value when the application already knows the key and wants one opaque
value back. Good fits: settings, session facts, small blobs, counters, cached
results, and simple state.

Use [JSON](/docs/data/json) when you need path updates inside the value. Use
[events](/docs/data/events) when the order of changes matters.

Examples below assume you opened a database with `strata ./mydb`.

## Put And Get

```text
strata:default/default › kv put greeting "hello world"
strata:default/default › kv get greeting
```

```text
created greeting applied=true
hello world
```

`kv put` commits immediately. `kv get missing` prints `(nil)` and exits
successfully.

For binary data, pass a file instead of inline text:

```text
strata:default/default › kv put image @avatar.png
```

## List And Scan

```text
strata:default/default › kv exists greeting
strata:default/default › kv count
strata:default/default › kv list --prefix g
```

`list` returns keys. `scan` returns keys with values and version facts, paged by
`--limit` and an opaque `--cursor`.

```text
strata:default/default › kv scan --limit 20
```

Pass a returned cursor back exactly as printed. Do not parse it.

## History

Overwrites keep prior versions:

```text
strata:default/default › kv put status draft
strata:default/default › kv put status final
strata:default/default › kv history status
```

Read an earlier value with the commit timestamp from a write receipt:

```bash
strata --json ./mydb kv put note first
```

```text
strata:default/default › kv put note second
strata:default/default › kv get note --as-of <timestamp-from-receipt>
```

`--as-of` is the StrataDB commit clock, not wall-clock time.

## Branches

KV rows are branch-scoped:

```text
strata:default/default › branch fork default experiment
strata:default/default › use experiment
strata:experiment/default › kv put greeting "hello from the fork"
strata:experiment/default › use default
strata:default/default › kv get greeting
```

The parent branch keeps its own value. A later `branch merge experiment default`
can promote KV changes back to `default`.

## Delete

```text
strata:default/default › kv delete greeting
```

Deletes are tombstones. Historical reads before the delete still resolve.
Deleting a missing key is a no-op result, not a crash.

## Errors To Handle

An empty key is rejected with
[`invalid_argument.engine.kv_key`](/e/invalid_argument.engine.kv_key). Recover by
error code, not message text. See [Error handling](/docs/guides/error-handling).

## Reference

Exact parameters, return shapes, batch commands, and error lists are generated in
the [KV command reference](/docs/reference/kv).
