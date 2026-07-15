---
title: "Observability"
section: "guides"
description: "Check a database's liveness, facts, health, metrics, and installation with the read-only status commands."
source: "strata-core@v1.0.0"
---


Six read-only commands report on a database and the installation: `ping`,
`info`, `health`, `metrics`, `describe`, and `doctor`. Each prints
human-readable output by default and a compact envelope with `--json`, so the
same command serves both a quick eyeball and a script. None of them writes
anything. Examples use a durable database at `./mydb`.

## ping — liveness

`ping` confirms the binary responds and reports its version:

```bash
strata ./mydb ping
```

```text
pong 1.0.0
```

```bash
strata --json ./mydb ping
```

```text
{"data":{"version":"1.0.0"},"type":"pong"}
```

## info — top-line facts

`info` prints the essential facts about an open database — branch and space
counts, the default branch, whether it is durable and open, and its storage
target:

```bash
strata ./mydb info
```

```text
{
  "branch_count": 1,
  "created": false,
  "default_branch": "default",
  "durable": true,
  "open": true,
  "space_count": 1,
  "target": "durable_local",
  "version": "1.0.0"
}
```

## health — subsystem checks

`health` reports the status of each control-plane subsystem and an overall
`status`. Everything healthy looks like this:

```bash
strata ./mydb health
```

```text
{
  "branch_catalog": "healthy",
  "branch_count": 1,
  "default_branch": "default",
  "identity": "healthy",
  "registry": "healthy",
  "space_catalog": "healthy",
  "status": "healthy"
}
```

Watch the top-level `status`: it is the single field to alert on.

## metrics — operational facts

`metrics` reports operational state — control status, durability, open state,
target, and the branch and space counts:

```bash
strata ./mydb metrics
```

```text
{
  "branch_count": 1,
  "control_status": "healthy",
  "durable": true,
  "open": true,
  "space_count": 1,
  "target": "durable_local"
}
```

## describe — full snapshot

`describe` is the widest view: which capabilities are present, the current and
available branches and spaces, and per-primitive counts. It is the fastest way
to see what a database actually contains:

```bash
strata ./mydb describe
```

```text
{
  "branch": "default",
  "branches": [
    "default"
  ],
  "capabilities": {
    "arrow": true,
    "event": true,
    "graph_core": true,
    "inference": true,
    "json": true,
    "kv": true,
    "vector": true,
    "vector_index": true
  },
  "config": {
    "created": false,
    "default_branch": "default",
    "durable": true,
    "target": "durable_local"
  },
  "default_branch": "default",
  "primitives": {
    "event_count": 0,
    "graphs": [],
    "json_count": 0,
    "kv_count": 2,
    "vector_collections": []
  },
  "spaces": [
    "default"
  ],
  "target": "durable_local",
  "version": "1.0.0"
}
```

## doctor — installation and database check

`doctor` checks the installation: the binary version, the Strata home
directory, whether it is on your `PATH`, the platform, and any `issues`. With no
target it checks the install alone and exits zero when clean:

```bash
strata doctor
```

```text
{
  "binary": "1.0.0",
  "database": null,
  "home": "~/.strata",
  "issues": [],
  "path_ok": true,
  "platform": "linux-x86_64"
}
```

Pass a database as the global target — before the `doctor` verb — to also open
it and report its facts under `database`:

```bash
strata ./mydb doctor
```

The `database` object then carries `exists`, `open_ok`, `path`, and the same
`info` block shown above. `doctor` exits non-zero when anything in `issues`
needs attention, which makes it a natural preflight check in scripts and CI.

## Next

- [Error Handling](/docs/guides/error-handling) — decode failures when a check goes red.
- [Database Configuration](/docs/guides/database-configuration) — read a database's config.
- [Agents and MCP](/docs/agents) — the self-describing surface behind these facts.
