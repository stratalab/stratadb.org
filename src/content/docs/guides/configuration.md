---
title: "Configuration"
section: "guides"
description: "Read a database's config, manage the global hub setting, and understand hub URL resolution."
source: "strata-core@v1.0.0"
---


The `strata config` command reads and writes configuration. It covers two
distinct things: the read-only facts about an open database, and the writable
user setting that points Strata at a hub. This guide walks through all six
verbs — `get`, `get-key`, `set`, `unset`, `path`, and `show` — and explains how
the hub URL is resolved. For every configurable key, see the
[Configuration Reference](/docs/reference/configuration-reference).

## Read a database's config

`config get` prints the sanitized configuration of an open database. It needs a
database target:

```bash
strata ./mydb config get
```

```text
{
  "created": false,
  "default_branch": "default",
  "durable": true,
  "target": "durable_local"
}
```

These are facts about how the database was opened — its default branch, whether
it is durable, and its storage target. They are read-only; you change them by
how you open the database, not by writing config.

## The global hub setting

The remaining verbs manage the user config, whose one key in this release is
`hub.url` — the hub that [`clone`](/docs/guides/cloning-datasets) fetches from.
It lives in a global file. `config path` prints where:

```bash
strata config path
```

The path is `~/.config/strata/config.toml`. Read the current key with
`config get-key`, which returns `null` when nothing is set:

```bash
strata config get-key hub.url
```

```text
{
  "key": "hub.url",
  "value": null
}
```

Set it with `config set`. The value is normalized (a trailing slash is added)
and written to the global file:

```bash
strata config set hub.url https://hub.example.com
```

```text
{
  "key": "hub.url",
  "path": "/home/you/.config/strata/config.toml",
  "value": "https://hub.example.com/"
}
```

The file now contains a `[hub]` table:

```toml
[hub]
url = "https://hub.example.com/"
```

Remove the key with `config unset hub.url`, which returns `"unset": true`. Once
unset, `config show` falls back to the built-in default again.

## Which hub URL wins

`config show` prints the resolved hub URL and the layer that supplied it. With
nothing configured, that is the built-in default:

```bash
strata config show
```

```text
{
  "hub.url": "https://hub.stratahub.io/",
  "source": "built-in default"
}
```

Set the global key and the source becomes the config file's path. Export
`STRATA_HUB_URL` and it wins over the file:

```bash
STRATA_HUB_URL=https://env.example.com strata config show
```

```text
{
  "hub.url": "https://env.example.com/",
  "source": "STRATA_HUB_URL"
}
```

Run from a directory that has a `.strata/config.toml` with its own `[hub]` table,
and that project file wins over the global file — but still loses to the
environment variable. The full precedence, highest first:

| Layer | Source | Scope |
|-------|--------|-------|
| `--hub <url>` flag | this invocation | one hub command, e.g. `clone` |
| `STRATA_HUB_URL` | environment | current shell session |
| `.strata/config.toml` | project file | the working directory tree |
| `~/.config/strata/config.toml` | global file | this user |
| built-in default | Strata | fallback |

The `--hub` flag sits on commands that reach a hub, such as `clone`, and its
help states it overrides both the environment variable and the config files for
that single invocation.

## Next

- [Cloning Datasets](/docs/guides/cloning-datasets) — put the hub URL to work.
- [Observability](/docs/guides/observability) — inspect a database's health and facts.
- [Configuration Reference](/docs/reference/configuration-reference) — the full key list.
