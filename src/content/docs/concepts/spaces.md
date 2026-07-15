---
title: "Spaces"
section: "concepts"
description: "The second organizing dimension: a named partition of data within a branch. How spaces relate to branches and primitives."
source: "strata-core@v1.0.0"
---

A **space** is a named partition of data *inside* a branch. Spaces and
[branches](/docs/concepts/branches) are Strata's two organizing dimensions —
neither is a data type of its own. Your data always lives in one of the five
[primitives](/docs/concepts/primitives); branches isolate *history* across forks,
and spaces scope *which slice* of that data you see within a single branch. This
page is the mental model; the verbs are in the [Spaces guide](/docs/guides/spaces).

## Two dimensions, not three data types

Think of it as a grid. A database has one or more branches. Within each branch,
data is partitioned into spaces. Within each space, you use the five primitives.

- **Branch** answers *"which line of history?"* — forked, isolated, time-travellable.
- **Space** answers *"which partition within this line?"* — tenants, sessions,
  datasets.
- **Primitive** answers *"what shape of data?"* — KV, JSON, vectors, events, graph.

Every branch has a `default` space, and you can add more. A command targets a
space with `--space <name>`; omit it and you get `default`.

## Spaces scope every primitive

Each space holds its own independent instance of every primitive. The **same key
in two spaces refers to two different values** — write `report` in an `analytics`
space and the `default` space does not see it. This is true for KV, JSON,
vectors, events, and graphs alike: a space is a clean partition across the whole
data model, not just one primitive.

## Spaces compose with branches

A branch *contains* spaces, and forking a branch **carries its spaces along** — the
fork starts with the same partitions as its parent, then diverges independently.
So the two dimensions stack: fork a branch to get an isolated copy of history, and
within it use spaces to keep unrelated data apart.

## Spaces or branches?

- Reach for a **space** to keep related data organized inside one line of history
  that lives and versions together — one space per tenant, per agent session, or
  per dataset.
- Reach for a **branch** when you want an isolated copy of history you can fork,
  time-travel, and discard.

They are complementary, not alternatives: a per-tenant space inside a per-feature
branch is a perfectly normal layout.

## Next

- [Spaces guide](/docs/guides/spaces) — the `list` / `create` / `exists` /
  `delete` verbs and their semantics.
- [Branches](/docs/concepts/branches) — the other organizing dimension.
- [Primitives](/docs/concepts/primitives) — the data shapes a space partitions.
