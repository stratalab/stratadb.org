---
title: "Installation"
section: "python"
description: "Install the stratadb wheel, choose CPU or GPU inference, and get type checking for free."
source: "strata-python@v1.0.0"
---

```bash
pip install stratadb
```

That is the whole install. Wheels are **prebuilt** — there is no Rust toolchain
to set up and nothing compiles on your machine.

## Wheels and platforms

- **`abi3`** — one wheel per platform works across Python **3.9+**, so upgrades
  don't need a new download.
- Platforms: manylinux and musllinux (x86_64, aarch64), macOS (arm64, x86_64),
  and Windows x86_64.
- The version tracks the engine: `stratadb.__version__` equals the engine
  version, so the SDK and the database format always match.

## CPU and GPU inference

The base wheel runs **cloud inference on CPU** — chat, embeddings, and reranking
through cloud providers work out of the box. For **GPU-accelerated local models**,
install the companion extra:

```bash
pip install "stratadb[cuda]"     # GPU-accelerated local model execution
```

Cloud inference needs no extra — only a provider API key (see
[`db.ai`](/docs/python/inference)). Local model execution is the piece that
benefits from the GPU build.

## Type checking

The package ships `py.typed` and generated stubs, so type checkers (mypy,
pyright) see the full typed surface — every namespace method, its parameters, and
its return model. Editors get autocomplete and inline signatures with no extra
setup.

## Verifying

```python
import stratadb

print(stratadb.__version__)              # the installed engine/SDK version
with stratadb.Strata(cache=True) as db:  # ephemeral, no files touched
    db.kv.put("k", "v")
    assert db.kv.get("k") == b"v"
```

If that runs, the native binding loaded and the engine is live in your process.

## Next

- [Namespaces](/docs/python/namespaces) — the data-plane API.
- [Inference](/docs/python/inference) — `db.ai` and provider keys.
