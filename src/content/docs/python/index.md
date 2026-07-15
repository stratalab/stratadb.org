---
title: "Python SDK"
section: "python"
description: "stratadb — the embedded Strata engine in your Python process, with typed namespaces over the same command surface as the CLI and MCP server."
source: "strata-python@v1.0.0"
---

`stratadb` is the Python SDK for Strata: it links the engine **in your process**
and opens a file-backed (or in-memory) database directly — SQLite-shaped, not a
server. It speaks the exact same command surface, value shapes, and
[error codes](/docs/concepts/errors) as the [`strata` CLI](/docs/reference/cli)
and the [MCP server](/docs/agents/mcp-server), so learning one channel is
learning all of them.

> **Availability:** `stratadb` `1.0.0` is the V1 line, and its version tracks the
> engine (`stratadb.__version__` equals the engine version). The V1 wheels are
> rolling out to PyPI.

## Install

```bash
pip install stratadb
```

No Rust toolchain required — wheels are prebuilt (`abi3`, one per platform,
Python 3.9+). The base wheel runs cloud inference on CPU; GPU-accelerated local
models come from a companion wheel (`stratadb[cuda]`). See
[installation](/docs/python/installation) for the extras and platform matrix.

## Quickstart

```python
import stratadb

db = stratadb.open("./app-data")      # durable (creates if absent)
# db = stratadb.open(cache=True)      # ephemeral, in-memory

# Key-value — values are bytes; str is encoded as UTF-8
db.kv.put("greeting", "hello")
db.kv.get("greeting")                    # b"hello"

# JSON documents, addressed by path
db.json.set("user:1", "$", {"name": "Ada", "roles": ["admin"]})
db.json.get("user:1", "$.name")          # "Ada"

# Vectors — similarity search with metadata filters
from stratadb import filters
db.vectors.create_collection("notes", dimension=3)
db.vectors.upsert("notes", "n1", [0.1, 0.2, 0.3], metadata={"kind": "note"})
hits = db.vectors.query("notes", [0.1, 0.2, 0.3], k=5,
                        filter=filters.eq("kind", "note"))

# Events (append-only, hash-chained) and graph
db.events.append("signup", {"user": "ada"})
db.graphs.create("social")
db.graphs.add_node("social", "ada")
db.graphs.add_node("social", "grace")   # both endpoints must exist first
db.graphs.add_edge("social", "ada", "follows", "grace")

db.close()   # or use it as a context manager (below)
```

`stratadb.open()` **never opens the current directory implicitly** — pass a path, set
`STRATA_DB` (`stratadb.from_env()`), or use `cache=True`, or it raises
`InvalidArgumentError`. It is also a context manager:

```python
with stratadb.open("./app-data") as db:
    db.kv.put("k", "v")
```

## How it is built

Three layers, so the ergonomics are handwritten but the surface can't drift from
the engine:

1. **Namespaces** — the handwritten, ergonomic API (`db.kv`, `db.json`, `db.ai`, …).
2. **Generated core** — one typed method and model per command, generated from
   the engine's IDL and drift-guarded in CI.
3. **PyO3 binding** — a thin native layer that links the engine in process.

Because the middle layer is generated from the same IDL that produces the
[command reference](/docs/reference/kv), the SDK and the docs describe one surface.

## In this section

- **[Installation](/docs/python/installation)** — wheels, the `[cuda]`/`[gpu]`
  extras, and `py.typed` type checking.
- **[Namespaces](/docs/python/namespaces)** — the data-plane API: the ten
  namespaces, `db.at()` scoping, `as_of`, and filters.
- **[Inference (`db.ai`)](/docs/python/inference)** — chat, embeddings, reranking,
  structured outputs, and tools.
- **[Errors](/docs/python/errors)** — the typed exception hierarchy; recover by code.
- **[Agent integration](/docs/python/agents)** — `agents_guide()`,
  `mcp_config()`, and the raw command escape hatch.
