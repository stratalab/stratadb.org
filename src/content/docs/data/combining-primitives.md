---
title: "Combining primitives"
section: "data"
description: "Use several StrataDB data shapes together while branches and historical reads stay consistent."
source: "strata-core@v1.1.0"
---

The five primitives are useful alone, but StrataDB is built for the cases where
you need more than one shape in the same local database.

The rule is simple: keep the source record where it belongs, and use other
primitives to index, explain, or connect it.

## Documents Plus Vectors

Store source text in JSON or KV. Store the embedding in a vector collection under
the same key.

```bash
strata ./kb json set doc:42 '$' \
  '{"title":"Branching model","body":"Forks are copy-on-write","tag":"branches"}'

strata ./kb vector collection create chunks 384 --metric cosine
strata ./kb vector upsert chunks doc:42 "@doc42.vec" --metadata '{"doc":"doc:42","tag":"branches"}'
```

At query time, search vectors first, then read the source document:

```bash
strata ./kb vector query chunks "@query.vec" -k 5
strata ./kb json get doc:42 '$'
```

The vector hit finds candidates. The JSON document remains the record you show
to a user or send to a model.

## Events Plus Current State

Use events for the append-only record and JSON or KV for the current value.

```bash
strata ./ledger event append account.credited '{"acct":"A1","amount":100}'
strata ./ledger json set account:A1 '$.balance' 100
```

If the materialized state is ever in doubt, replay events and rebuild it. Because
both writes share the same commit clock, you can inspect both as of the same
earlier commit.

## Graph Plus Source Records

Use graph when relationships need traversal. Keep rich records in JSON, and use
graph nodes or edges to connect them.

```bash
strata ./org json set person:alice '$' '{"name":"Alice","team":"Platform"}'
strata ./org graph create org
strata ./org graph add-node org alice --properties '{"record":"person:alice"}'
strata ./org graph add-node org platform --properties '{"kind":"team"}'
strata ./org graph add-edge org alice member_of platform
```

Now traversal finds the relationship, and JSON still owns the detailed record.

## Branch The Whole Workflow

Branches span every primitive. You can try a retrieval change, a new JSON
document shape, or a different graph edge set without touching `default`:

```bash
strata ./kb branch fork default experiment
strata ./kb --branch experiment json set doc:42 '$.tag' '"forks"'
strata ./kb branch diff default experiment
strata ./kb branch preview experiment default
```

In `v1.1.0`, merge applies KV, JSON, and vector changes. Events and graph are
included in diff but are not merged.

## Read One Historical Snapshot

Pass the same commit timestamp to each read:

```bash
strata ./app json get doc:42 '$' --as-of 12
strata ./app vector query chunks "@query.vec" -k 5 --as-of 12
strata ./app event list --as-of 12
strata ./app graph meta org --as-of 12
```

That gives one view of the database at commit `12`, across every shape.

## Reference

Use the primitive guides for behavior:
[KV](/docs/data/key-value), [JSON](/docs/data/json),
[Events](/docs/data/events), [Vectors](/docs/data/vectors), and
[Graph](/docs/data/graph). Use the generated [command reference](/docs/reference)
for exact parameters and return shapes.
