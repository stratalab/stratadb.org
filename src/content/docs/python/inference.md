---
title: "Inference (db.ai)"
section: "python"
description: "Chat, embeddings, and reranking through cloud providers or local models — an OpenAI-shaped surface on the database handle."
source: "strata-python@v1.0.0"
---

`db.ai` runs models: chat generation, embeddings, and reranking, over cloud
providers (OpenAI, Anthropic, Google) or local GGUF models — an OpenAI-shaped
surface right on the database handle. Strata ships no keys; provide them as
described in [providers & API keys](/docs/inference/providers-and-keys) (an
environment variable or `strata config set <provider>.api_key`).

Model specs are the same everywhere: a `provider:model` string routes to a cloud
provider; a bare name runs locally. See [Inference](/docs/inference) for the
model surface behind this.

## Chat

```python
r = db.ai.chat("Explain embeddings in one sentence.",
               model="openai:gpt-4o-mini", max_tokens=60)
print(r.content)
```

### Structured output

Pass a JSON Schema and the model returns conforming JSON:

```python
r = db.ai.chat("Capital of France and its population?",
               model="anthropic:claude-haiku-4-5-20251001",
               json_schema={"type": "object",
                            "properties": {"capital": {"type": "string"},
                                           "population": {"type": "integer"}},
                            "required": ["capital", "population"]})
```

### Tools / function calling

```python
r = db.ai.chat("What's the weather in Paris?", model="google:gemini-2.5-flash",
               tools=[{"type": "function",
                       "function": {"name": "get_weather",
                                    "parameters": {"type": "object",
                                                   "properties": {"city": {"type": "string"}},
                                                   "required": ["city"]}}}],
               tool_choice="required")
r.tool_calls   # [{'id': ..., 'function': {'name': 'get_weather', 'arguments': '{"city":"Paris"}'}}]
```

## Embeddings

```python
e = db.ai.embed(["hello", "world"], model="openai:text-embedding-3-small")
e.vectors      # [[...], [...]]
```

Embedding output feeds the [vector store](/docs/python/namespaces) — embed text,
then `db.vectors.upsert` the result under the same key as its source record.

## Model handles

A model handle sets load parameters once and reuses them across calls — useful
for local models:

```python
qwen = db.ai.model("local:qwen3", n_ctx=8192)
qwen.chat("Summarize: ...")
```

## Capability, without a call

`db.ai.capability(spec)` reports what a model supports — generate, embed, rank,
whether it needs a key or network — computed offline, with no request to the
provider:

```python
cap = db.ai.capability("openai:gpt-4o-mini")   # generate/embed/rank support, key + network needs
```

Use it to route in a script before spending a call.

## Related

- [Providers & API keys](/docs/inference/providers-and-keys) — where keys come from.
- [Local models](/docs/inference/local-models) — running GGUF models in process.
- [Combining primitives](/docs/data/combining-primitives) — the embed-then-upsert
  retrieval flow.
