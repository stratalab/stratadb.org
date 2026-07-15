---
title: "Vectors"
section: "data"
description: "Create collections, upsert embeddings with metadata, and run similarity search."
source: "strata-core@v1.0.0"
---

The vector store holds embeddings — fixed-length float arrays — grouped into
named collections, and searches them by similarity. Use it for semantic
retrieval: find the stored vectors closest to a query vector, optionally
filtered by metadata. Like every [primitive](/docs/concepts/primitives),
collections and vectors are branch-aware and versioned.

Examples below were run against the shipped binary. Use a directory path for a
durable database or `--cache` for a throwaway run. The vectors here are 4
dimensions so the output is readable; real embeddings are hundreds or thousands
of dimensions.

## Create a collection

A collection fixes a dimension and a distance metric up front. Every vector you
upsert into it must match that dimension. The metric is one of `cosine`
(default), `euclidean`, or `dot-product`.

```bash
strata ./mydb vector collection create docs 4 --metric cosine
strata ./mydb vector collection list
```

```text
{"count":0,"dimension":4,"metric":"cosine","name":"docs"}
{"count":0,"dimension":4,"metric":"cosine","name":"docs"}
```

Both commands print the same collection record — the first line is `create`
echoing the new collection, the second is `list` showing it.

`vector collection stats <name>` reports the same facts for one collection, and
`vector collection delete <name>` removes it.

## Upsert vectors with metadata

`vector upsert <collection> <key> <vector>` inserts or replaces one vector. The
vector is a JSON array, comma-separated floats, or `@path`. Attach a metadata
JSON object with `--metadata` (or `--metadata-file`) to filter on later.

```bash
strata ./mydb vector upsert docs a "[1,0,0,0]" --metadata '{"lang":"en","year":2020}'
strata ./mydb vector upsert docs b "[0.9,0.1,0,0]" --metadata '{"lang":"en","year":2021}'
strata ./mydb vector upsert docs c "[0,1,0,0]" --metadata '{"lang":"fr","year":2020}'
strata ./mydb vector count docs
```

```text
created a applied=true
created b applied=true
created c applied=true
3
```

Read one vector back with `vector get`, list keys with `vector keys`, and check
existence with `vector exists`.

## Query by similarity

`vector query <collection> <vector>` returns the `-k` nearest keys with their
scores. For cosine, higher is closer.

```bash
strata ./mydb vector query docs "[1,0,0,0]" -k 3
```

```text
a	1.0
b	0.9938837289810181
c	0.0
```

The `--json` form includes each match's metadata; add `--diagnostics` to include
vector index diagnostics with the results.

## Filter by metadata

Restrict a query — or a bulk delete — to vectors whose metadata matches. The
filter is a JSON object with a `conditions` array; each condition names a
`field`, an `op` of `eq`, and a typed `value` (`{"type":"string","value":...}`,
or `type` of `number`, `bool`, or `null`). Conditions are AND-composed.

```bash
strata ./mydb vector query docs "[1,0,0,0]" -k 5 \
  --filter '{"conditions":[{"field":"lang","op":"eq","value":{"type":"string","value":"en"}}]}'
```

```text
a	1.0
b	0.9938837289810181
```

The French document is excluded. Use `--filter-file` to read the filter from a
file.

## Metadata patch and deletes

`vector update-metadata <collection> <key> <patch>` merges a top-level patch
into a vector's metadata, leaving the embedding untouched:

```bash
strata ./mydb vector update-metadata docs a '{"year":2022,"reviewed":true}'
```

```text
updated a applied=true
```

Delete one vector with `vector delete <collection> <key>`, every vector with
`vector delete-all <collection>`, or a matching subset with
`vector delete-by-filter` (same filter shape as query):

```bash
strata ./mydb vector delete-by-filter docs \
  --filter '{"conditions":[{"field":"lang","op":"eq","value":{"type":"string","value":"fr"}}]}'
strata ./mydb vector count docs
```

```text
deleted docs applied=true
2
```

## History, branches, time travel

`vector history <collection> <key>` lists a vector's prior revisions
newest-first. Reads accept `--as-of <timestamp>` for a historical snapshot, and
everything is branch-scoped — fork a branch to try a different set of embeddings
without touching the parent. See [Branches](/docs/concepts/branches).

## Error cases worth knowing

Upserting a vector whose length does not match the collection dimension is
rejected:

```bash
strata --json ./mydb vector upsert docs z "[1,2,3]"
```

```text
{"error":{"class":"invalid_argument","code":"invalid_argument.engine.vector_dimension","retry_policy":"never","retryable":false,"commit_outcome":"not_started","message":"vector dimension mismatch: expected 4, got 3","suggested_fix":"Correct the request input and retry the operation.","docs_url":"https://stratadb.org/e/invalid_argument.engine.vector_dimension","reference_id":"err_local_1bff3bcc_000001"}}
```

Querying a collection that does not exist returns
[/e/not_found.engine.vector_collection](/e/not_found.engine.vector_collection),
and creating a collection whose name is taken returns
[/e/already_exists.engine.vector_collection](/e/already_exists.engine.vector_collection).
Recover by code — see [error handling](/docs/guides/error-handling).

## When to use vectors vs other primitives

- Use **vectors** for similarity search over embeddings.
- Use [JSON](/docs/data/json) for structured records you query by field.
- Use [KV](/docs/data/key-value) for opaque keyed values.
- Use the [Event Log](/docs/data/events) for ordered, append-only history.

Strata does not generate embeddings inside the vector primitive — you supply the
floats. For end-to-end retrieval that embeds text for you, see
[RAG with vectors](/docs/cookbook/rag-with-vectors). The full verb list is in the
[CLI reference](/docs/reference/cli).

## From Python

The same surface, from the [Python SDK](/docs/python):

```python
import stratadb

db = stratadb.Strata("./mydb")
db.vectors.create_collection("docs", dimension=4)
db.vectors.upsert("docs", "a", [1.0, 0.0, 0.0, 0.0], metadata={"tag": "x"})
db.vectors.query("docs", [1.0, 0.0, 0.0, 0.0], k=1)
# [VectorMatch(key='a', score=1.0, metadata={'tag': 'x'})]
db.close()
```

See [namespaces](/docs/python/namespaces) for metadata filters and patches.

## Reference

Every vector command — parameters, returns, errors, and runnable CLI/wire/Python
examples — is in the generated [Vector command reference](/docs/reference/vector).
