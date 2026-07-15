---
title: "Combining primitives"
section: "data"
description: "Use several primitives together — RAG, semantic search, knowledge graphs, event-sourced state, and one time-travel snapshot across all five."
source: "strata-core@v1.0.0"
---

Each of the five primitives — [KV](/docs/data/key-value),
[JSON](/docs/data/json), [Vectors](/docs/data/vectors),
[Events](/docs/data/events), and [Graph](/docs/data/graph) — is useful on its
own. The reason they live in **one database** is that most real workloads use
several at once, over the same data. A single Strata database holds all five
simultaneously; they share one branch-aware, versioned storage substrate, so a
branch, a commit, and an `--as-of` snapshot span every primitive together
rather than each keeping its own timeline.

This page covers the patterns that combine them. Two rules run through all of
them:

- **Source rows are authoritative.** A vector index or a JSON secondary index
  *accelerates* retrieval; it never *replaces* the row it points at. You resolve
  a search hit back to the KV, JSON, or graph row that owns the truth.
- **One snapshot spans everything.** Because every primitive rides the same
  commit clock, a single `--as-of <timestamp>` gives you a consistent view of
  the whole database — documents, embeddings, events, and graph as they were at
  that commit.

## Retrieval-augmented generation

RAG needs two stores that stay in sync: the **documents** you retrieve and
return, and the **embeddings** you search. Keep the documents in JSON (or KV for
opaque blobs) and the embeddings in a vector collection, keyed the same way so a
search hit resolves straight back to its source.

```bash
# Source of truth: the document, addressable by field.
strata ./kb.strata json set doc:42 '$' \
  '{"title":"Branching model","body":"Strata forks are copy-on-write…","tags":["branches"]}'

# Derived: an embedding for the same key, in a collection sized to your model.
strata ./kb.strata vector collection create chunks 384 --metric cosine
strata ./kb.strata vector upsert chunks doc:42 "@doc42.vec" --metadata '{"doc":"doc:42"}'
```

At query time you embed the question, search the collection, then read each hit's
document back:

```bash
strata ./kb.strata vector query chunks "@query.vec" -k 5
# → doc:42, doc:17, …  (keys + scores)
strata ./kb.strata json get doc:42 '$'
# → the authoritative document to feed the model
```

The vector primitive does not create embeddings — you supply the floats (or let
[autoembedding](#autoembedding) supply them). For the full worked flow, including
generating embeddings and calling a model, see
[RAG with vectors](/docs/cookbook/rag-with-vectors).

## Semantic search with structured filters

Similarity alone is often too broad. Attach structured metadata to each vector
and filter the search so it only considers rows that match — recency, language,
tenant, document type — while the authoritative fields still live in the JSON
document.

```bash
strata ./kb.strata vector upsert chunks doc:42 "@doc42.vec" \
  --metadata '{"lang":"en","year":2024,"doc":"doc:42"}'

strata ./kb.strata vector query chunks "@query.vec" -k 10 \
  --filter '{"conditions":[{"field":"lang","op":"eq","value":{"type":"string","value":"en"}}]}'
```

Conditions are AND-composed, so a filter narrows the candidate set before scoring.
Mirror only the fields you filter on into the vector metadata; keep the record of
record in JSON, where you can index and update fields independently
([secondary indexes](/docs/data/json#secondary-indexes)).

## Knowledge graphs with embeddings

A [graph](/docs/data/graph) node carries JSON properties directly, so entities and
their relationships live in one place. Combine that with a vector collection keyed
by node id and you get **hybrid retrieval**: find entry points by similarity, then
traverse the graph to expand context.

```bash
strata ./kg.strata graph create org
strata ./kg.strata graph add-node org alice --properties '{"name":"Alice","role":"eng"}'
strata ./kg.strata graph add-node org bob   --properties '{"name":"Bob","role":"eng"}'
strata ./kg.strata graph add-edge org alice reports_to bob

# Embeddings keyed by node id, so a similarity hit names a graph node.
strata ./kg.strata vector collection create people 384 --metric cosine
strata ./kg.strata vector upsert people alice "@alice.vec"
```

Search the collection to find the closest node, then walk its neighbourhood — or
run [analytics](/docs/data/graph#analytics) like PageRank or connected components
over the same branch-consistent snapshot:

```bash
strata ./kg.strata vector query people "@query.vec" -k 1     # → alice
strata ./kg.strata graph neighbors org alice --direction both
```

## Event-sourced state

Treat the [event log](/docs/data/events) as the ordered, hash-linked record of
*what happened*, and KV or JSON as the *current* materialised state you read
from. The log is append-only and tamper-evident; the state store is overwritten
in place. Because both are versioned on the same clock, you can always reconcile
the two — or rebuild state by replaying the log.

```bash
strata ./ledger.strata event append account.credited '{"acct":"A1","amount":100}'
strata ./ledger.strata json set account:A1 '$.balance' 100
```

If the materialised balance is ever in doubt, the events are the authority: read
them back in order (or by time window with `event range-time`) and recompute. See
[deterministic replay](/docs/cookbook/deterministic-replay) for the full pattern.

## One time-travel snapshot across all five

This is the payoff of a shared substrate. Every write advances one commit clock,
and every read verb accepts `--as-of <timestamp>` — the small logical
`commit.timestamp` from a write receipt, not a wall-clock time. Passing the same
`--as-of` to different primitives gives you a **single consistent view of the
entire database** at that commit:

```bash
# Whatever the timestamp of an earlier commit was — say 12:
strata ./app.strata --as-of 12 json get user:1 '$'
strata ./app.strata --as-of 12 vector query chunks "@q.vec" -k 5
strata ./app.strata --as-of 12 event range 0
strata ./app.strata --as-of 12 graph meta org
```

Each command reads the document, the embeddings, the events, and the graph as
they existed at commit 12 — no per-primitive snapshotting, no drift between them.
[Branches](/docs/concepts/branches) extend the same idea across space instead of
time: fork a branch, change documents, embeddings, and graph independently, and
the parent keeps its own consistent timeline. [Commits](/docs/concepts/commits)
explains the clock in detail.

## Producing embeddings

The RAG and semantic-search patterns above have you produce embeddings yourself:
call [`inference embed`](/docs/inference#the-operations) (or your own model) and
`vector upsert` the result under the same key as the source row. That explicit
embed-then-upsert flow is the supported path in this release, and it keeps the
boundary clear — the source row is authoritative; the vector only accelerates
retrieval.

Strata's architecture reserves **autoembedding** — engine-owned derived vectors
kept in sync as you write text, so retrieval stays fresh without a manual embed
step, with the source row still authoritative. That capability is not yet exposed
in this release. See [Inference](/docs/inference) for the model surface today.

## Where next

- Each primitive's how-to: [KV](/docs/data/key-value), [JSON](/docs/data/json),
  [Vectors](/docs/data/vectors), [Events](/docs/data/events),
  [Graph](/docs/data/graph).
- The isolation and time-travel model:
  [Branches](/docs/concepts/branches), [Commits](/docs/concepts/commits).
- Worked, end-to-end recipes:
  [RAG with vectors](/docs/cookbook/rag-with-vectors),
  [agent state management](/docs/cookbook/agent-state-management),
  [deterministic replay](/docs/cookbook/deterministic-replay).
- Per-command details for any primitive are in the generated
  [command reference](/docs/reference/kv).
