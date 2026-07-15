---
title: "Cloning Datasets"
section: "guides"
description: "Clone a prepared dataset from a hub into a local database, and control which hub is used through flags, environment, and config."
source: "strata-core@v1.0.0"
---

`strata clone` pulls a prepared dataset from a hub into a new local database. A cloned database is an ordinary database — it opens, branches, and queries like any other, and it remembers where it came from.

## Cloning

Give `clone` a dataset slug and, optionally, a destination directory:

```bash
strata clone wikipedia-embeddings ./wiki
```

The destination is optional; without it the clone lands in `./<dataset>.strata`. `--branch <name>` fetches a specific branch instead of the dataset's default branch. The clone resolves a hub, requests `<hub>/v1/datasets/<slug>`, and writes the database locally.

## Choosing a hub

The hub URL is resolved from the first source that supplies one, in this order:

1. `--hub <url>` on the command
2. the `STRATA_HUB_URL` environment variable
3. `hub.url` in the project's `.strata/config.toml`
4. `hub.url` in the global config
5. the built-in default, `https://hub.stratahub.io/`

`config show` prints the resolved hub and names the layer it came from. With nothing configured, that is the built-in default:

```bash
strata --cache config show
```

```text
{
  "hub.url": "https://hub.stratahub.io/",
  "source": "built-in default"
}
```

Set `STRATA_HUB_URL` and it wins over both config files:

```bash
STRATA_HUB_URL=https://env.example.com strata --cache config show
```

```text
{
  "hub.url": "https://env.example.com/",
  "source": "STRATA_HUB_URL"
}
```

A project-local `.strata/config.toml` with a `[hub]` section applies when you run from that directory and no environment variable or flag overrides it, with `source` pointing at the file. `--hub` on a `clone` command overrides everything for that one invocation.

## Persisting a hub

`config set hub.url <url>` writes the value into the global config so every command picks it up:

```bash
strata --cache config set hub.url https://hub.example.com
strata --cache config get-key hub.url
```

```text
{
  "key": "hub.url",
  "value": "https://hub.example.com/"
}
```

`config get-key hub.url` reads the user-config value (null when unset), `config unset hub.url` removes it, and `config path` prints where the global config lives:

```bash
strata --cache config path
```

```text
{
  "path": "/home/you/.config/strata/config.toml"
}
```

## Error paths

An invalid or empty `--hub` value is rejected before any network call:

```bash
strata clone demo ./demo --hub not-a-url
```

```text
failed_precondition.executor.hub_url: --hub: not a valid URL: relative URL without a base
  hint: Provide a valid URL via --hub, STRATA_HUB_URL, or hub.url in a project or global strata config.
  ref: https://stratadb.org/e/failed_precondition.executor.hub_url
```

A reachable-URL but unreachable host surfaces a transport error, marked retryable:

```bash
strata clone demo ./demo --hub http://127.0.0.1:1/
```

```text
unavailable.executor.hub_transport: hub transport failed: network error (retryable=true): error sending request for url (http://127.0.0.1:1/v1/datasets/demo)
  hint: Check connectivity and the hub URL, then retry.
  ref: https://stratadb.org/e/unavailable.executor.hub_transport
```

## Remote origin

`strata remote` reports where a database was cloned from. A database you created yourself has no origin:

```bash
strata ./fresh remote
```

```text
{
  "origin": null
}
```

On a cloned database, `remote` reports the origin instead — the hub and dataset it was pulled from — so you can trace a local copy back to its source.

## Related

- [Configuration Reference](/docs/reference/configuration-reference) — every config key and resolution layer
- [Branches](/docs/concepts/branches) — cloning a specific branch, and branching a clone locally
- [Arrow](/docs/guides/import-export) — moving individual primitives as files instead of whole datasets
- [Error Handling](/docs/guides/error-handling) — reading structured error codes
