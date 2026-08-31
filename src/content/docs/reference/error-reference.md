---
title: "Error Reference"
section: "reference"
description: "How to read Strata error envelopes and use the generated error registry."
source: "strata-core@v1.1.0"
---

Strata errors are structured. Runtime failures carry a class, code, retry
policy, commit outcome, message, hint, docs URL, and reference ID. Handle them
by fields, not by parsing prose.

## Runtime envelope

```json
{
  "error": {
    "class": "not_found",
    "code": "not_found.engine.branch",
    "retry_policy": "never",
    "retryable": false,
    "commit_outcome": "not_applicable",
    "message": "branch `no-such-branch` does not exist",
    "suggested_fix": "Check that the requested branch, space, collection, graph, document, key, or model exists.",
    "docs_url": "https://stratadb.org/e/not_found.engine.branch",
    "reference_id": "err_local_..."
  }
}
```

Use `class` for broad handling, `code` for exact handling, `retry_policy` before
retrying, and `commit_outcome` before retrying writes. Log `reference_id` with
the human message.

## Registry

The generated registry lives at [`/e/`](/e/). Each public runtime code has its
own page at `/e/<code>`.

The same registry is available from the binary:

```bash
strata agents errors --json
```

CLI guardrail errors can happen before a database opens. They are useful for
diagnostics, but public runtime recovery should use the `/e/` registry.

## Absence

Missing data is usually a successful read with an empty result. Missing targets,
such as a branch, collection, graph, or model named by the operation, are errors.

## Related

- [Error handling guide](/docs/guides/error-handling)
- [The command index](/docs/agents/command-index)
- [Generated registry](/e/)
