---
title: "Providers & API keys"
section: "inference"
description: "Configure OpenAI, Anthropic, and Google provider keys for cloud inference."
source: "strata-core@v1.1.0"
---

Cloud inference uses a `provider:model` spec and a key you supply.

| Provider | Spec prefix | Environment variable | Key page |
|---|---|---|---|
| OpenAI | `openai:` | `OPENAI_API_KEY` | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| Anthropic | `anthropic:` | `ANTHROPIC_API_KEY` | [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys) |
| Google | `google:` | `GOOGLE_API_KEY` | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |

## Use An Environment Variable

```bash
export OPENAI_API_KEY="sk-..."
strata --cache inference generate openai:gpt-4o-mini "Write one sentence about branch isolation." --max-tokens 40
```

Environment variables are the simplest path for local shells and CI jobs.

## Store A Default Key

Use Strata config when you want a default key outside the shell environment:

```bash
strata config set openai.api_key "sk-..."
strata config get-key openai.api_key
```

`get-key` reports whether the key is set and returns a redacted preview. Remove a
stored key with:

```bash
strata config unset openai.api_key
```

Stored keys live in the global Strata config file with restricted permissions.
Find the file with:

```bash
strata config path
```

## Resolution Order

Environment wins over config:

1. `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, or `GOOGLE_API_KEY`.
2. A key stored by `strata config set <provider>.api_key`.
3. No key: the call fails before network access.

## Check A Model

```bash
strata --cache inference capability openai:gpt-4o-mini
```

Use `requires_api_key` and `requires_network` to decide whether a call can run in
the current environment.

## Errors To Handle

- [`inference.missing_api_key`](/e/inference.missing_api_key): no key for the
  selected provider.
- [`inference.provider_auth_failed`](/e/inference.provider_auth_failed): the
  provider rejected the key.
- [`inference.provider_rate_limited`](/e/inference.provider_rate_limited): retry
  according to the error policy.
- [`inference.provider_timeout`](/e/inference.provider_timeout): provider request
  timed out.

## Related

- [Inference](/docs/inference)
- [Local models](/docs/inference/local-models)
