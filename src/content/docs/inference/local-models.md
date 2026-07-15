---
title: "Local models"
section: "inference"
description: "Run GGUF models in-process — pulling them, the model directory, the resident-model cache, and the local build feature."
source: "strata-core@v1.0.0"
---

Local inference runs a GGUF model **in-process**, with no network and no API key.
Generation, embedding, ranking, and tokenization all work against a local model
named by a bare spec (`tinyllama`, `miniLM`). This is the path for offline,
private, or air-gapped use — the data and the model never leave the machine.

## The local build feature

Local execution paths require a binary **built with the local inference
feature**. The default distribution is cloud-first; when the local feature is
absent, a local call refuses with a clear code rather than silently doing
nothing:

```bash
strata --cache inference generate tinyllama "Hello" --max-tokens 5
```

```text
inference.unsupported_operation: not supported: local generation requires the local feature
  hint: Inspect inference configuration and retry with supported settings.
  ref: https://stratadb.org/e/inference.unsupported_operation
```

Check `provider_feature_enabled` in `inference capability <spec>` before relying
on a local model in a script. When the feature is present, the operations
documented in [Inference](/docs/inference#the-operations) run against local
models, and two `generate` refinements become available: `--stop-token <id>` and
`--grammar <gbnf>`.

GPU acceleration for local models ships separately from the default CPU build
(for example, the `stratadb[cuda]` Python wheel); the base CLI runs local models
on CPU.

## Pulling models

`inference models pull <spec>` downloads a model into the local model directory.
It reads:

- `STRATA_MODELS_DIR` — the destination directory for downloaded models.
- `STRATA_HF_ENDPOINT` — the Hugging Face endpoint to fetch from.
- `STRATA_HF_TOKEN` (or `HF_TOKEN`) — a token for gated repositories.

Pulling requires network access. Once pulled, a model appears in `inference
models local` and runs offline thereafter.

```bash
strata --cache inference models local
```

```text
miniLM	embed	bert	f16	local	42.9 MB
tinyllama	generate	llama	q4_k_m	local	638.9 MB
```

## The resident-model cache

Local models stay resident after first use, so repeated calls skip the load cost.
`inference cache-status` reports what is currently loaded:

```bash
strata --cache inference cache-status
```

```text
{
  "embedding_models": [],
  "generation_models": [],
  "ranking_models": []
}
```

`inference unload <spec>` evicts one cached model; `inference unload` with no
argument evicts everything. When nothing matches, it reports `no cached entry`.
Unloading frees memory without deleting the model from disk — the next call
reloads it.

## Related

- [Inference](/docs/inference) — the model, catalog, and operations
- [Providers & API keys](/docs/inference/providers-and-keys) — the cloud
  alternative
- [Vectors](/docs/data/vectors) — where local embeddings are stored and searched
