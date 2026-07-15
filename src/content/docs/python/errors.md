---
title: "Errors"
section: "python"
description: "Typed exceptions carrying stable codes — recover by code, never by message. Misses return None rather than raising."
source: "strata-python@v1.0.0"
---

Every failure raises a typed subclass of `stratadb.errors.StrataError`, carrying
the same stable `<class>.<area>.<detail>` [code](/docs/concepts/errors) the CLI
and MCP server use. The rule is identical across every Strata channel:

> **Match on `code`, never on the message.** The code is stable; the message is
> for humans and may change.

```python
from stratadb import errors

try:
    db.at(branch="ghost").kv.get("k")
except errors.NotFoundError as e:
    assert e.code == "not_found.engine.branch"
    print(e.message)   # human-readable
    print(e.hint)      # the safe next step
    print(e.ref)       # https://stratadb.org/e/not_found.engine.branch
```

## The exception hierarchy

`StrataError` is the base; each error class in the taxonomy has its own subclass,
so you can catch broadly or narrowly:

| Exception | Code class |
|---|---|
| `NotFoundError` | `not_found` |
| `AlreadyExistsError` | `already_exists` |
| `InvalidArgumentError` | `invalid_argument` |
| `FailedPreconditionError` | `failed_precondition` |
| `ConflictError` | `conflict` |
| `HistoryUnavailableError` | `history_unavailable` |
| `UnsupportedError` | `unsupported` |
| `ResourceExhaustedError` | `resource_exhausted` |
| `AccessDeniedError` | `access_denied` |
| `UnavailableError` | `unavailable` |
| `AmbiguousCommitError` | `ambiguous_commit` |
| `SerializationError` | `serialization` |
| `CorruptionError` | `corruption` |
| `IoError` | `io` |
| `InternalError` | `internal` |

Catch `StrataError` to handle anything, or a specific subclass to react to one
kind. The enum is open, so an unknown class maps to the base `StrataError` rather
than failing.

```python
try:
    db.kv.put(bad_key, value)
except errors.InvalidArgumentError:
    ...            # fix the input
except errors.StrataError as e:
    log.error("strata failed", code=e.code, ref=e.ref)
```

## Misses are not errors

A read that finds nothing returns `None` and does **not** raise — a missing key,
document, or path is a normal result, not a failure. The one historical exception
is a time-travel read outside retained history, which raises
`HistoryUnavailableError` (distinct from `NotFoundError`).

```python
db.kv.get("missing")            # None
db.kv.get("k", as_of=0)         # raises HistoryUnavailableError if 0 is too old
```

## What each error tells you

Beyond `code`, every `StrataError` carries a `message`, a `hint` (the safe next
step), a `ref` (the `/e/<code>` docs URL), and — where relevant — retry and
commit-outcome information. For the full model, see the
[errors concept](/docs/concepts/errors) and the
[error reference](/docs/reference/error-reference).
