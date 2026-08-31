---
title: "Vectors"
section: "data"
description: "Create vector collections, upsert embeddings with metadata, and query by similarity."
source: "strata-core@v1.1.0"
---

Use vectors when you already have embeddings and need nearest-neighbor search.
A vector collection fixes the dimension and metric; each row stores one
embedding plus optional metadata.

The vector primitive does not write source text for you. Keep the source in
[JSON](/docs/data/json) or [KV](/docs/data/key-value), then store the embedding
under the same key. Use [Inference](/docs/inference) when you want StrataDB to
run an embedding model.

## Create A Collection

```bash
strata ./mydb vector collection create docs 4 --metric cosine
strata ./mydb vector collection list
```

```text
{"count":0,"dimension":4,"metric":"cosine","name":"docs"}
{"count":0,"dimension":4,"metric":"cosine","name":"docs"}
```

Every vector inserted into `docs` must have four dimensions. Metrics are
`cosine`, `euclidean`, and `dot-product`.

## Upsert

```bash
strata ./mydb vector upsert docs a "[1,0,0,0]" --metadata '{"lang":"en","year":2024}'
strata ./mydb vector upsert docs b "[0.9,0.1,0,0]" --metadata '{"lang":"en","year":2025}'
strata ./mydb vector count docs
```

```text
created a applied=true
created b applied=true
2
```

Vectors can be inline JSON arrays, comma-separated floats, or `@path`.

## Query

```bash
strata ./mydb vector query docs "[1,0,0,0]" -k 2
```

```text
a	1.0
b	0.9938837289810181
```

For cosine, higher scores are closer.

## Filter

Attach metadata when you upsert, then restrict search with an AND-composed
filter:

```bash
strata ./mydb vector query docs "[1,0,0,0]" -k 5 \
  --filter '{"conditions":[{"field":"lang","op":"eq","value":{"type":"string","value":"en"}}]}'
```

Mirror only fields you actually filter on into vector metadata. Keep the
authoritative record in JSON or KV.

## Update Metadata And Delete

```bash
strata ./mydb vector update-metadata docs a '{"reviewed":true}'
strata ./mydb vector delete docs b
strata ./mydb vector delete-by-filter docs \
  --filter '{"conditions":[{"field":"reviewed","op":"eq","value":{"type":"bool","value":true}}]}'
```

`delete-all` clears a collection without deleting the collection itself.

## History And Branches

```bash
strata ./mydb vector history docs a
strata ./mydb vector get docs a --as-of <timestamp-from-receipt>
```

Vector collections and records are branch-scoped. Fork a branch to test a new
embedding set without changing the parent, then merge the vector changes if the
experiment wins.

## Errors To Handle

A vector with the wrong dimension fails with
[`invalid_argument.engine.vector_dimension`](/e/invalid_argument.engine.vector_dimension).
A missing collection returns
[`not_found.engine.vector_collection`](/e/not_found.engine.vector_collection).

Recover by code. See [Error handling](/docs/guides/error-handling).

## Reference

Exact parameters, return shapes, batch commands, metadata filters, and error
lists are generated in the [Vector command reference](/docs/reference/vector).
