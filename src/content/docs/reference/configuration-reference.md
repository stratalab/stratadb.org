---
title: "Configuration Reference"
section: "reference"
description: "Everything the strata binary lets you configure: config verbs, the config file, known keys, environment variables, hub resolution, and open options."
source: "strata-core@v1.0.0"
---

> **Interim page.** Maintained by hand until it is generated from the resolved command index (IDL). Where this page and `strata agents commands --json` disagree, the command index wins.

Strata's configurable surface is deliberately small. There is one global config file with one user key, a handful of environment variables, and per-invocation flags. Everything below is verified against the binary.

## `strata config` verbs

```console
$ strata config --help
```

| Verb | Purpose |
|------|---------|
| `strata config path` | Print the global config file path. |
| `strata config show` | Print the resolved hub configuration and which layer supplied it. |
| `strata config get` | Print the sanitized config. |
| `strata config get-key <KEY>` | Print one sanitized value (`hub.url` reads the user config). |
| `strata config set <KEY> <VALUE>` | Set a user-config key in the global config. |
| `strata config unset <KEY>` | Remove a user-config key from the global config. |

## Config file

`strata config path` reports the file location, which honors `XDG_CONFIG_HOME`:

```console
$ strata config path
{"path":"/home/you/.config/strata/config.toml"}
```

`strata config set` writes TOML. After setting `hub.url` the file contains:

```toml
[hub]
url = "https://your-hub.example/"
```

The file is created on first `set`; `unset` removes the key.

## Known keys

The only user-config key in this release is `hub.url` — the address of the dataset hub used by `strata clone`. `strata config show` reports the resolved value and its source:

```console
$ strata config show
{"hub.url":"https://hub.stratahub.io/","source":"built-in default"}
```

No other user-writable config keys are exposed by the binary. Durability, cache sizing, and similar engine behavior are not surfaced as config-file keys on the CLI in this release — if you need them, drive the database through the SDK.

## Hub URL resolution

The hub address is resolved from four layers, highest precedence first. `strata config show` names the winning layer in its `source` field.

| Precedence | Layer | `source` shown | Notes |
|-----------:|-------|----------------|-------|
| 1 | `--hub <URL>` flag | (per invocation) | On `strata clone`; overrides env and config files for that call. |
| 2 | `STRATA_HUB_URL` env | `STRATA_HUB_URL` | Overrides the config file. |
| 3 | Config file `hub.url` | the config file path | Set with `strata config set hub.url …`. |
| 4 | Built-in default | `built-in default` | `https://hub.stratahub.io/`. |

Observed precedence — the environment variable wins over the file:

```console
$ STRATA_HUB_URL=https://env.example/ strata config show
{"hub.url":"https://env.example/","source":"STRATA_HUB_URL"}
```

## Environment variables

Honored by the **binary**:

| Variable | Effect |
|----------|--------|
| `STRATA_DB` | Default database path when no `[DB]` argument, `--db`, or `--cache` is given. The no-database error explicitly suggests it. |
| `STRATA_HOME` | Overrides the Strata home directory that `strata init` prepares. |
| `STRATA_HUB_URL` | Overrides the config-file hub address (layer 2 above). |
| `XDG_CONFIG_HOME` | Relocates the config file (`$XDG_CONFIG_HOME/strata/config.toml`). |

Honored by the **install script only** (not the binary):

| Variable | Effect |
|----------|--------|
| `STRATA_VERSION` | Pin the version the installer downloads. |
| `STRATA_INSTALL_DIR` | Choose where the installer places the binary. |

## Database open options (CLI)

Every command opens a database through the top-level options:

| Option | Meaning |
|--------|---------|
| `[DB]` (positional) | Durable database path. |
| `--db <PATH>` | Durable database path. Cannot be combined with the positional form. |
| `--cache` | Open an in-memory (non-durable) database for this process. |
| `--branch <BRANCH>` | Default branch for commands that accept one. |
| `--space <SPACE>` | Product space for commands that accept one. |
| `--json` | Emit compact JSON. |
| `--raw` | Emit script-friendly raw output where possible. |

A command with no durable path, no `--db`, no `--cache`, and no `STRATA_DB` refuses:

```console
$ strata info
error: [invalid_argument.cli.no_database]: no database specified
  hint: pass a path (strata ./mydb kv put …), set STRATA_DB, or use --cache for ephemeral
```

## Could not verify

- No config-file keys other than `hub.url` are exposed by the binary; durability mode is not a CLI config key in this release.
- `STRATA_VERSION` and `STRATA_INSTALL_DIR` are installer variables and were not exercised here beyond their presence in the install script.

## See also

- [Database Configuration guide](/docs/guides/configuration) — choosing durable vs. cache, and open options.
- [Cloning Datasets guide](/docs/guides/cloning-datasets) — where `hub.url` and `--hub` are used.
- [CLI Reference](/docs/reference/cli) and [Command Reference](/docs/reference/command-reference).
- [Error Reference](/docs/reference/error-reference) — the structured error model.
