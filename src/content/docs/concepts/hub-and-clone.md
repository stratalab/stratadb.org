---
title: "Hub and clone"
section: "concepts"
description: "How prepared datasets are shared: a hub hosts them, clone pulls one into a local database, and the clone remembers its origin."
source: "strata-core@v1.0.0"
---

A Strata database is a local directory, so the simplest way to share one is to
copy it. For *curated* datasets — a prepared corpus, an embeddings set, a demo —
Strata adds a lightweight distribution model: a **hub** hosts datasets, and
`strata clone` pulls one into a new local database. This page is the concept; the
[Cloning datasets guide](/docs/guides/cloning-datasets) has the commands.

## What a hub is

A hub is an HTTP endpoint that serves prepared datasets by slug. Strata resolves
which hub to use from a layered configuration — a `--hub` flag, the
`STRATA_HUB_URL` environment variable, project or global config, and finally a
built-in default. `strata config show` prints the resolved hub and names the
layer it came from. In this line the hub substrate is **metadata-only**: it is a
way to *distribute* prepared databases, not a sync service or a multi-writer
backend.

## Cloning a dataset

`strata clone <slug> [dest]` resolves a hub, requests the dataset, and writes a
new local database (defaulting to `./<slug>.strata`). A cloned database is an
**ordinary database** — it opens, branches, time-travels, and queries exactly
like one you created yourself. Cloning is how you go from "a dataset someone
prepared" to "a local database I can fork and explore" in one step.

## Clone artifacts, not bundles

A clone is delivered as a **clone artifact**: the hub's representation of a
dataset that `clone` materializes into a local database. This replaces the older
"branch bundle" export files — instead of producing and passing around a bundle,
you publish a dataset to a hub and clone it. The unit of sharing is a dataset you
clone, not a file you export.

## Provenance: a clone remembers its origin

A cloned database records **where it came from**. `strata remote` reports the
origin — the hub and dataset a database was pulled from — while a database you
created yourself has no origin (`origin: null`). That provenance lets you trace a
local copy back to its source, which matters when a dataset is shared, forked
locally, and evolved.

## How it composes

Clone once, then use every other concept locally: fork [branches](/docs/concepts/branches)
off the cloned data, read it as of past [commits](/docs/concepts/time-travel), and
partition it with [spaces](/docs/concepts/spaces). The hub gets you a starting
database; everything after is ordinary local Strata.

## Next

- [Cloning datasets guide](/docs/guides/cloning-datasets) — `clone`, hub
  resolution, and `remote`, with the exact commands.
- [Configuration reference](/docs/reference/configuration-reference) — the hub
  config keys and resolution layers.
- [Embedded architecture](/docs/concepts/embedded-architecture) — why a database
  is a directory in the first place.
