---
title: "RAG with Vectors"
section: "cookbook"
description: "Store embeddings in a vector collection and source text in KV, then query for the nearest rows and fetch their text."
source: "strata-core@v1.0.0"
---

Goal: build the retrieval half of a RAG pipeline — index document embeddings
alongside their source text, then find the nearest documents to a query and pull
back the text to feed a model.

Prerequisites: the `strata` binary on your PATH, and `jq` to read match metadata.
Commands write to a durable directory (`./rag`) that each invocation reopens.
The vectors below are tiny and explicit so the recipe is self-contained; see the
note at the end on generating real embeddings.

## 1. Create a collection

Fix the embedding dimension and distance metric up front.

```bash
strata ./rag vector collection create notes 4 --metric cosine
```

```text
{"count":0,"dimension":4,"metric":"cosine","name":"notes"}
```

## 2. Index documents

Upsert one vector per document, tagging each with a `text_key` in metadata that
points at the KV row holding its full text. Store that text in KV.

```bash
strata ./rag vector upsert notes note-1 '[1,0,0,0]' --metadata '{"text_key":"src:note-1"}'
strata ./rag vector upsert notes note-2 '[0,1,0,0]' --metadata '{"text_key":"src:note-2"}'
strata ./rag vector upsert notes note-3 '[0,0,1,0]' --metadata '{"text_key":"src:note-3"}'
strata ./rag kv put src:note-1 "Branches fork cheaply and isolate writes."
strata ./rag kv put src:note-2 "The event log is an append-only journal."
strata ./rag kv put src:note-3 "Vectors support cosine, euclidean, and dot-product."
```

```text
created note-1 applied=true
created note-2 applied=true
created note-3 applied=true
created src:note-1 applied=true
created src:note-2 applied=true
created src:note-3 applied=true
```

## 3. Query with an embedding

Search returns the nearest keys with similarity scores, best first.

```bash
strata ./rag vector query notes '[0.9,0.2,0.1,0]' -k 2
```

```text
note-1	0.9704949259757996
note-2	0.2156655490398407
```

## 4. Fetch the source text

Read each match's `text_key` from its metadata, then pull the row from KV. This is
the context you hand to your generation step.

```bash
strata ./rag --json vector query notes '[0.9,0.2,0.1,0]' -k 2 \
  | jq -r '.data[].metadata.text_key' \
  | while read -r tk; do printf '%s\t%s\n' "$tk" "$(strata ./rag --raw kv get "$tk")"; done
```

```text
src:note-1	Branches fork cheaply and isolate writes.
src:note-2	The event log is an append-only journal.
```

## Generating real embeddings

In production you replace the hand-written vectors with model output. The
`strata inference embed <model> <text>` command is the slot for this — its result
becomes the vector you pass to `vector upsert` (indexing) and `vector query`
(search). Embedding runs where the model does: on a build compiled with the local
inference feature, or against a configured cloud provider. A build without local
inference refuses with a coded error:

```text
inference.unsupported_operation: not supported: local embedding requires the local feature
  hint: Inspect inference configuration and retry with supported settings.
  ref: https://stratadb.org/e/inference.unsupported_operation
```

Recover by code and class, never by message text — the bracketed reference id in
the full output changes every run. See [/e/inference.unsupported_operation](/e/inference.unsupported_operation).

## Why this works

The vector collection and KV store are two [primitives](/docs/concepts/primitives)
over one substrate, so an embedding and its source text commit to the same
database and stay consistent. Keeping the authoritative text in
[KV](/docs/data/key-value) and only the embedding in the
[vector store](/docs/data/vectors) means search accelerates retrieval
without becoming the system of record. When you add local or cloud inference, the
[inference guide](/docs/inference) shows how `embed` output feeds the same
upsert and query commands used here.
