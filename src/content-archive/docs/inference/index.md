---
title: "Inference"
section: "inference"
description: "Run generation, embedding, ranking, and tokenization through local models or cloud providers."
source: "strata-core@v1.1.1"
---

Inference runs models. It is not a stored data primitive.

Use inference to generate text, embed text, rank passages, tokenize, or inspect
model capability. Store model outputs yourself when they matter: embeddings
usually go into [vectors](/docs/data/vectors), source text into
[JSON](/docs/data/json) or [KV](/docs/data/key-value), and decisions into
[events](/docs/data/events).

## Model Specs

Every inference command takes a model spec:

| Spec | Meaning |
|---|---|
| `miniLM` | Bare name; resolved from the local catalog. |
| `tinyllama` | Bare name; local catalog. |
| `openai:gpt-4o-mini` | Provider-prefixed cloud model. |
| `anthropic:<model>` | Provider-prefixed cloud model. |
| `google:<model>` | Provider-prefixed cloud model. |

Supported providers in this release are `local`, `openai`, `anthropic`, and
`google`.

## Inspect Before Running

Catalog and capability checks do not need an API key:

```bash
strata --cache inference models list
strata --cache inference models local
strata --cache inference capability openai:gpt-4o-mini
```

Capability output tells you whether the model can generate, embed, rank, or
tokenize, and whether it requires a key or network.

## Run Operations

```text
strata --cache inference generate openai:gpt-4o-mini "Summarize branch isolation." --max-tokens 80
strata --cache inference embed <model> "branch isolation"
strata --cache inference rank <model> "query" "passage one" "passage two"
strata --cache inference tokenize <model> "hello"
strata --cache inference detokenize <model> 101 7592
```

Cloud calls need a provider key. Local calls need a binary built with local
inference support and the model present on disk.

## Cloud Providers

Use [Providers & API keys](/docs/inference/providers-and-keys) to configure
OpenAI, Anthropic, or Google. Environment variables win over stored config.

## Local Models

Use [Local models](/docs/inference/local-models) for GGUF models that run
in-process without a network call.

## Errors To Handle

- [`inference.missing_api_key`](/e/inference.missing_api_key): the provider key
  is not configured.
- [`inference.unsupported_operation`](/e/inference.unsupported_operation): the
  model or build cannot run that operation.
- [`inference.provider_unavailable`](/e/inference.provider_unavailable): the
  provider prefix is unknown or unavailable.

Recover by code. See [Error handling](/docs/guides/error-handling).

## Reference

Exact parameters, return shapes, and error lists are generated in the
[Inference command reference](/docs/reference/inference).
