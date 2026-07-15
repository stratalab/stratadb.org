---
title: "Inference"
section: "inference"
description: "Run generation, embedding, ranking, and tokenization through local GGUF models and cloud providers, and inspect the model catalog offline."
source: "strata-core@v1.0.0"
---

Inference is a **capability**, not a stored primitive: the `inference` commands
execute models — text generation, embeddings, ranking, and tokenization —
without keeping any model output in the database. Two provider families are
available: **local** GGUF models that run in-process, and **cloud** providers
reached over the network. The catalog and capability facts are always available
offline; running a model needs either a local model on disk
([Local models](/docs/inference/local-models)) or a configured cloud API key
([Providers & API keys](/docs/inference/providers-and-keys)).

## Model specs

Every command takes a model spec. A bare name (`miniLM`, `tinyllama`) resolves
against the built-in catalog and runs **locally**. A `provider:model` spec routes
to a **cloud** provider — the supported providers are `local`, `anthropic`,
`openai`, and `google`. An unknown provider prefix fails fast:

```text
inference.provider_unavailable: provider error: unknown provider: "voyage" (expected: local, anthropic, openai, google)
  ref: https://stratadb.org/e/inference.provider_unavailable
```

## The catalog

`inference models list` prints the catalog — name, task, architecture,
quantization, availability, and size. `inference models local` narrows it to
models already on disk:

```bash
strata --cache inference models local
```

```text
miniLM	embed	bert	f16	local	42.9 MB
tinyllama	generate	llama	q4_k_m	local	638.9 MB
```

`inference capability <spec>` reports what a model can do without running it —
useful for routing decisions in a script:

```bash
strata --cache inference capability openai:gpt-4o-mini
```

```text
{
  "can_embed": true,
  "can_generate": true,
  "can_rank": false,
  "can_tokenize": false,
  "embedding_dim": 0,
  "model": "gpt-4o-mini",
  "network_enabled": true,
  "provider": "openai",
  "provider_feature_enabled": true,
  "requires_api_key": true,
  "requires_network": true
}
```

`requires_api_key` and `requires_network` tell you what a call will need;
`provider_feature_enabled` tells you whether this binary was built with that
provider compiled in. Because the catalog and capability are computed offline,
these two commands never touch the network or a key.

## The operations

Every operation takes a model spec and routes to local or cloud by the rule
above. The flags are the same regardless of provider; what differs is the
prerequisite — a cloud spec needs a key, a local spec needs the local build
feature and a model on disk.

- **`inference generate <spec> <prompt>`** — text generation. Accepts
  `--max-tokens` (default 256), `--temperature` (default 0.0, greedy), `--top-k`,
  `--top-p`, `--seed` for deterministic sampling, and a repeatable `--stop <text>`.
  Chat models expect their chat template verbatim in the prompt. `--stop-token
  <id>` and `--grammar <gbnf>` are local-only refinements.
- **`inference embed <spec> <text>`** embeds one string; **`inference embed-batch
  <spec> <text…>`** embeds several in order. Embedding output feeds the
  [vector store](/docs/data/vectors) — see
  [Combining primitives](/docs/data/combining-primitives) for the retrieval flow.
- **`inference rank <spec> <query> <passage…>`** scores passages against a query.
  Ranking is a local-model operation; cloud providers do not expose a reranker, so
  a cloud spec here returns `inference.unsupported_operation`.
- **`inference tokenize <spec> <text>`** and **`inference detokenize <spec>
  <ids…>`** convert between text and token ids for a local model; `--special`
  adds the model's special tokens.

A cloud call refuses before touching the network when its key is unset, and a
local call refuses when the binary lacks the local feature — both with a clear
code. Those prerequisites, and how to satisfy them, are on the two pages below.

## In this section

- **[Providers & API keys](/docs/inference/providers-and-keys)** — the cloud
  provider families, the environment variables and `strata config` storage for
  their keys, and where to acquire a key.
- **[Local models](/docs/inference/local-models)** — running GGUF models
  in-process: pulling them, the model directory, the resident-model cache, and
  the local build feature.

## Related

- [Vectors](/docs/data/vectors) — where embeddings are stored and searched
- [Agents and MCP](/docs/guides/agents-and-mcp) — exposing the database to model-driven agents
- [Error Handling](/docs/guides/error-handling) — reading structured error codes

## Reference

Every inference command — parameters, returns, errors, and runnable CLI/wire/Python
examples — is in the generated
[Inference command reference](/docs/reference/inference).
