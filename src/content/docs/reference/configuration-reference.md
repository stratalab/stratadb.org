---
title: "Configuration Reference"
section: "reference"
description: "Where Strata reads database targets, hub configuration, installer options, and model settings."
source: "strata-core@v1.1.1"
---

Strata has a small configuration surface. Most behavior is selected per command
with flags. Durable database behavior comes from the database you open, not from
a large global config file.

## Database target

The CLI chooses a database target in this order:

1. positional path or `--db <path>`
2. `STRATA_DB`
3. `--cache`

Use [CLI Reference](/docs/reference/cli) for invocation rules and
[Durability](/docs/concepts/durability) for the storage model.

## Hub

Dataset cloning uses a hub URL. The generated
[admin command reference](/docs/reference/admin) owns the exact command pages.

Use [Cloning datasets](/docs/guides/cloning-datasets) for the workflow.

## Installation

Installer-specific environment variables are documented in
[Installation](/docs/getting-started/installation). They affect the install
script, not the database runtime.

## Inference

Cloud providers and local model downloads use explicit environment variables:

- [Providers and keys](/docs/inference/providers-and-keys)
- [Local models](/docs/inference/local-models)

## Live command metadata

For automation, read the command catalog:

```bash
strata agents commands --json
```
