---
title: "Local models"
section: "inference"
description: "Run local GGUF models when the installed binary was built with local inference support."
source: "strata-core@v1.1.1"
---

Local inference runs GGUF models in the Strata process. Use it when you want a
model call without a hosted provider, or when you need embeddings and test
generation to work offline.

Local support is a build capability. The default product path is still explicit:
inspect the model before you rely on it.

## Check a model

```bash
strata --cache inference capability miniLM
```

The capability response tells you whether the model can embed, generate, rank,
or tokenize, whether it needs an API key, and whether it is available locally.
For scripts, add `--json` and branch on the returned fields instead of parsing
human text.

## List and pull

```bash
strata --cache inference models list
strata --cache inference models local
strata --cache inference models pull miniLM
```

`models list` shows the catalog. `models local` shows artifacts already present
on disk. `models pull` downloads a catalog model or model spec into the local
model directory.

The pull command honors:

- `STRATA_MODELS_DIR`
- `STRATA_HF_ENDPOINT`
- `STRATA_HF_TOKEN` or `HF_TOKEN` for gated repositories

## Run

Use the same inference verbs as hosted providers. The model name decides whether
the call is local or remote.

```bash
strata --cache inference embed miniLM "branch-aware database"
strata --cache inference rank jina-reranker-v1-tiny "database branches" "fork a database" "store a blob"
strata --cache inference generate tinyllama "Explain MVCC in one paragraph." --max-tokens 120
```

Generation has local-only options for constrained decoding and load behavior:

```bash
strata --cache inference generate tinyllama "Return a JSON object." \
  --response-schema schema.json \
  --n-ctx 4096 \
  --n-gpu-layers -1
```

If a provider or model does not support the requested operation, Strata returns
`inference.unsupported_operation`. If the artifact is missing, it returns
`inference.missing_model`.

## Model cache

Loaded local models stay in the process cache while the process is alive.

```bash
strata --cache inference cache-status
strata --cache inference unload tinyllama
strata --cache inference unload
```

Omit the model name on `unload` to clear the cache.

## Related

- [Inference](/docs/inference)
- [Providers and keys](/docs/inference/providers-and-keys)
- [Inference reference](/docs/reference/inference)
