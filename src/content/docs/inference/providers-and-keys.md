---
title: "Providers & API keys"
section: "inference"
description: "Route to OpenAI, Anthropic, or Google with a provider:model spec, and supply the API key by environment variable or stored config."
source: "strata-core@v1.0.0"
---

Cloud inference routes on the spec prefix: `openai:`, `anthropic:`, or `google:`
(the fourth provider, `local:`, runs [on-device](/docs/inference/local-models)).
Each cloud provider needs an API key. Strata never bundles one — you bring your
own — and reads it from one of two places.

## The providers

| Provider | Spec prefix | Key variable | Get a key |
|----------|-------------|--------------|-----------|
| OpenAI | `openai:` | `OPENAI_API_KEY` | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| Anthropic | `anthropic:` | `ANTHROPIC_API_KEY` | [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys) |
| Google | `google:` | `GOOGLE_API_KEY` | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |

A spec like `openai:gpt-4o-mini` picks the provider and the model in one token.
`inference capability <spec>` reports `requires_api_key` and `requires_network`
for a spec without calling the provider.

## Supply the key by environment variable

The simplest path: export the provider's variable. The inference runtime reads it
directly.

```bash
export OPENAI_API_KEY="sk-…"
strata --cache inference generate openai:gpt-4o-mini "Write a haiku about databases" --max-tokens 40
```

With the key unset, the call refuses **before** touching the network:

```bash
strata --cache inference generate openai:gpt-4o-mini "Write a haiku about databases" --max-tokens 40
```

```text
inference.missing_api_key: provider error: OPENAI_API_KEY not set (required for openai provider)
  hint: Set the provider API key and retry.
  ref: https://stratadb.org/e/inference.missing_api_key
```

## Store the key in config

To avoid exporting a variable in every shell, store the key in the global Strata
config with `strata config set <provider>.api_key`. The settable keys are
`openai.api_key`, `anthropic.api_key`, and `google.api_key` (plus `hub.url`).
Keys are written with `0600` permissions and are never echoed back in plaintext.

```bash
strata config set openai.api_key "sk-…"
strata config get-key openai.api_key
```

```text
{"key":"openai.api_key","set":true,"value":"sk-…"}
```

`config get-key` reports whether a key is set and shows only a redacted preview,
never the raw value. Remove one with `strata config unset openai.api_key`, and
print the config file's location with `strata config path`.

## Resolution order

When both are present, **the environment variable wins.** On startup Strata
copies any stored key into its environment variable *only if that variable is
not already set*, so an exported `OPENAI_API_KEY` always overrides the stored
one. This lets you keep a default key in config and override it per-shell or
per-CI-job without editing the file.

1. `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` / `GOOGLE_API_KEY` in the environment.
2. Otherwise, the key stored by `strata config set <provider>.api_key`.
3. Otherwise, the call refuses with `inference.missing_api_key`.

## Errors worth knowing

- [`inference.missing_api_key`](/e/inference.missing_api_key) — no key for the
  provider (from either source).
- [`inference.provider_auth_failed`](/e/inference.provider_auth_failed) — the
  provider rejected the key.
- [`inference.provider_unavailable`](/e/inference.provider_unavailable) — unknown
  provider prefix, or the provider could not be reached.
- [`inference.provider_rate_limited`](/e/inference.provider_rate_limited) and
  [`inference.provider_timeout`](/e/inference.provider_timeout) — transient
  provider conditions; retry per the error's policy.

Match on the code, never the message — see
[error handling](/docs/guides/error-handling).

## Related

- [Inference](/docs/inference) — the model, catalog, and operations
- [Local models](/docs/inference/local-models) — the on-device alternative that
  needs no key
