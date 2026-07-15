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
provider; a `local:` prefix (or bare name) runs locally. See
[Inference](/docs/inference) for the model surface behind this.

## Chat

```python
r = db.ai.chat("Explain embeddings in one sentence.",
               model="openai:gpt-4o-mini", max_tokens=60)
r.content        # the first choice's text
r.usage          # token accounting, OpenAI-shaped
```

`chat` accepts a plain string or a full message list
(`[{"role": "user", "content": ...}, ...]`); the result's `.message`,
`.content`, `.tool_calls`, and `.finish_reason` read the first choice.

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
e.vectors      # all vectors, ordered by input index
e.vector       # convenience for a single-input call
```

Embedding output feeds the [vector store](/docs/python/namespaces) — embed text,
then `db.vectors.upsert` the result under the same key as its source record.

## Reranking

`rank` scores candidate passages against a query — the precision pass after a
vector search recall pass:

```python
scores = db.ai.rank("What is a commit clock?",
                    ["passage one...", "passage two..."],
                    model="local:bge-reranker-v2-m3")
```

Reranking runs on local models; on a build without the local feature it
refuses with a coded error (shown below) rather than degrading silently.

## Model handles

A model handle sets the spec once and reuses it across calls:

```python
qwen = db.ai.model("local:qwen3", n_ctx=8192)
qwen.chat("Summarize: ...")
qwen.capability()
```

## Capability, without a call

`db.ai.capability(spec)` reports what a model supports — computed offline, with
no request to the provider. Real output from the base wheel:

```python
db.ai.capability("openai:gpt-4o-mini")
```

```text
{'provider': 'openai', 'model': 'gpt-4o-mini',
 'can_generate': True, 'can_tokenize': False, 'can_embed': True, 'can_rank': False,
 'requires_network': True, 'requires_api_key': True,
 'provider_feature_enabled': True, 'network_enabled': True,
 'embedding_dim': 0,
 'supports_tools': True, 'supports_json_object': True,
 'supports_json_schema': True, 'supports_logprobs': True}
```

Use it to route in a script before spending a call.

## Errors you will actually see

Inference failures are [typed and coded](/docs/python/errors) like every other
Strata error. The two most common, reproduced verbatim:

**Missing provider key** — the call never leaves your process:

```python
db.ai.chat("hi", model="openai:gpt-4o-mini")
```

```text
FailedPreconditionError: inference.missing_api_key: provider error:
OPENAI_API_KEY is not set: the openai API key is missing. Get a key at
https://platform.openai.com/api-keys, then set it with
`strata config set openai.api_key <KEY>` or by exporting OPENAI_API_KEY.
  hint: Set the provider API key and retry.
  ref: https://stratadb.org/e/inference.missing_api_key
```

**Local model on a base build** — local execution is a build-time feature
(the base wheel runs cloud providers; see
[local models](/docs/inference/local-models)):

```python
db.ai.rank("query", ["doc a", "doc b"], model="local:jina-reranker-v1-tiny")
```

```text
UnsupportedError: inference.unsupported_operation: not supported:
ranking requires the local feature
  hint: Inspect inference configuration and retry with supported settings.
  ref: https://stratadb.org/e/inference.unsupported_operation
```

Catch them like any other typed error:

```python
from stratadb import errors

try:
    r = db.ai.chat("hi", model="openai:gpt-4o-mini")
except errors.FailedPreconditionError:
    ...   # key missing — configure and retry
except errors.UnavailableError:
    ...   # provider unreachable / rate limited — retryable
```

## Related

- [Providers & API keys](/docs/inference/providers-and-keys) — where keys come from.
- [Local models](/docs/inference/local-models) — running GGUF models in process.
- [Typed errors](/docs/python/errors) — the exception hierarchy.
- [Combining primitives](/docs/data/combining-primitives) — the embed-then-upsert
  retrieval flow.
