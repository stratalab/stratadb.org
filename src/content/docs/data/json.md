---
title: "JSON documents"
section: "data"
description: "Store JSON documents, update fields by path, and index fields when lookup matters."
source: "strata-core@v1.1.1"
---

Use JSON when the value has structure you want to address directly: user records,
configuration, agent working memory, portfolio state, or any document where a
single field may change without replacing the whole thing.

Use [KV](/docs/data/key-value) for opaque values. Use [events](/docs/data/events)
when changes should be append-only.

Examples below assume you opened a database with `strata ./mydb`.

## Set And Get

`$` is the document root. Paths like `$.score` address fields.

```text
strata:default/default › json set user:1 '$' '{"name":"Ada","score":95}'
strata:default/default › json get user:1 '$'
strata:default/default › json get user:1 '$.score'
```

```text
created user:1 applied=true
{"name":"Ada","score":95}
95
```

Update one field:

```text
strata:default/default › json set user:1 '$.score' 99
```

```text
updated user:1 applied=true
```

Setting `$` again replaces the whole document. To change one field, target that
field's path.

## Delete

```text
strata:default/default › json delete user:1 '$.score'
```

Deleting `$` removes the document. Deleting a nested path removes that field.

A missing document or path is represented as not found. It is not the same as an
invalid request.

## Find Documents

These commands operate on document keys:

```text
strata:default/default › json list --prefix user:
strata:default/default › json count
strata:default/default › json exists user:1
strata:default/default › json sample --count 5
```

Create a secondary index when a field becomes a common lookup dimension:

```text
strata:default/default › json index create by_score '$.score' --index-type numeric
strata:default/default › json index list
```

Index types are `tag`, `numeric`, and `text`.

## History And Branches

JSON writes are versioned and branch-scoped.

```text
strata:default/default › json history user:1
strata:default/default › json get user:1 '$' --as-of <timestamp-from-receipt>
```

Fork a branch to try document changes in isolation:

```text
strata:default/default › branch fork default experiment
strata:default/default › use experiment
strata:experiment/default › json set user:1 '$.score' 100
strata:experiment/default › use default
strata:default/default › json get user:1 '$.score'
```

`branch merge` can promote JSON changes back to the target branch. In `v1.1.1`,
JSON merge is whole-document granularity.

## Errors To Handle

Writing through the wrong parent type fails with
[`invalid_argument.engine.json_path_type`](/e/invalid_argument.engine.json_path_type).
Creating an index with a taken name fails with
[`already_exists.engine.json_index`](/e/already_exists.engine.json_index).

Recover by code. See [Error handling](/docs/guides/error-handling).

## Reference

Exact parameters, return shapes, indexes, batch commands, and error lists are
generated in the [JSON command reference](/docs/reference/json).
