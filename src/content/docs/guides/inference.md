---
title: "Inference Guide"
section: "guides"
description: "Run generation, embedding, and ranking through local GGUF models and cloud providers, and inspect the model catalog offline."
source: "strata-core@v1.0.0"
---

The `inference` commands execute models: text generation, embeddings, ranking, and tokenization. Two provider families are available — local GGUF models that run in-process, and cloud providers reached over the network. The catalog and capability facts are always available offline; running a model needs either a local model on disk or a configured cloud API key.

## Model specs

Every command takes a model spec. A bare name (`miniLM`, `tinyllama`) resolves against the built-in catalog and runs locally. A `provider:model` spec routes to a cloud provider — the supported providers are `local`, `anthropic`, `openai`, and `google`. An unknown provider prefix fails fast:

```text
inference.provider_unavailable: provider error: unknown provider: "voyage" (expected: local, anthropic, openai, google)
  ref: https://stratadb.org/e/inference.provider_unavailable
```

## The catalog

`inference models list` prints the catalog — name, task, architecture, quantization, availability, and size. `inference models local` narrows it to models already on disk:

```bash
strata --cache inference models local
```

```text
miniLM	embed	bert	f16	local	42.9 MB
tinyllama	generate	llama	q4_k_m	local	638.9 MB
```

`inference capability <spec>` reports what a model can do without running it — useful for routing decisions in a script:

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

`requires_api_key` and `requires_network` tell you what a call will need; `provider_feature_enabled` tells you whether this binary was built with that provider compiled in.

## Cloud generation

Cloud providers read their key from the environment. Each provider has one variable:

| Provider | Spec prefix | API key variable |
|----------|-------------|------------------|
| OpenAI | `openai:` | `OPENAI_API_KEY` |
| Anthropic | `anthropic:` | `ANTHROPIC_API_KEY` |
| Google | `google:` | `GOOGLE_API_KEY` |

With the key unset, the call refuses before touching the network:

```bash
strata --cache inference generate openai:gpt-4o-mini "Write a haiku about databases" --max-tokens 40
```

```text
inference.missing_api_key: provider error: OPENAI_API_KEY not set (required for openai provider)
  hint: Set the provider API key and retry.
  ref: https://stratadb.org/e/inference.missing_api_key
```

Export the key and the same command runs against the provider. `generate` accepts `--max-tokens` (default 256), `--temperature` (default 0.0, greedy), `--top-k`, `--top-p`, `--seed` for deterministic sampling, and a repeatable `--stop <text>`. Chat models expect their chat template verbatim in the prompt.

## Local execution

Local generation, embedding, ranking, and tokenization run in-process from a GGUF model in the model directory. These paths require a binary built with the local inference feature. When that feature is absent, they refuse with a clear code:

```bash
strata --cache inference generate tinyllama "Hello" --max-tokens 5
```

```text
inference.unsupported_operation: not supported: local generation requires the local feature
  hint: Inspect inference configuration and retry with supported settings.
  ref: https://stratadb.org/e/inference.unsupported_operation
```

Check `provider_feature_enabled` in `inference capability <spec>` before relying on a local model in a script. When the feature is present, the commands below run against local models; `--stop-token <id>` and `--grammar <gbnf>` on `generate` are local-only refinements.

### Tokenize, embed, and rank

- `inference tokenize <model> <text>` and `inference detokenize <model> <ids…>` convert between text and token ids for a local model. `--special` adds the model's special tokens.
- `inference embed <model> <text>` embeds one string; `inference embed-batch <model> <text…>` embeds several in order.
- `inference rank <model> <query> <passage…>` scores passages against a query. Ranking is a local-model operation; cloud providers do not expose a reranker, so a cloud spec here returns `inference.unsupported_operation`.

## Pulling models

`inference models pull <spec>` downloads a model into the local model directory. It reads `STRATA_MODELS_DIR` for the destination and `STRATA_HF_ENDPOINT`, plus `STRATA_HF_TOKEN` (or `HF_TOKEN`) for gated repositories. Pulling requires network access.

## Cache and diagnostics

Local models stay resident after first use. `inference cache-status` reports what is loaded:

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

`inference unload <spec>` evicts one cached model; `inference unload` with no argument evicts everything. When nothing matches, it reports `no cached entry`.

## Related

- [Vector Store](/docs/guides/vector-store) — where embeddings are stored and searched
- [Agents and MCP](/docs/guides/agents-and-mcp) — exposing the database to model-driven agents
- [Error Handling](/docs/guides/error-handling) — reading structured error codes
- [Command Reference](/docs/reference/command-reference) — every verb and flag
