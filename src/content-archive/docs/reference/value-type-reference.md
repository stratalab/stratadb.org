---
title: "Value Type Reference"
section: "reference"
description: "How values are shaped across KV, JSON, events, vectors, graph, commits, and errors."
source: "strata-core@v1.1.1"
---

This page gives the mental map. Generated command pages own exact parameters and
response models.

## Data values

| Shape | What it stores | Start here | Generated reference |
|---|---|---|---|
| KV | opaque bytes by key | [Key-value](/docs/data/key-value) | [KV commands](/docs/reference/kv) |
| JSON | documents addressed by JSON path | [JSON](/docs/data/json) | [JSON commands](/docs/reference/json) |
| Events | append-only JSON payloads with sequence and hash linkage | [Events](/docs/data/events) | [Event commands](/docs/reference/event) |
| Vectors | dense embeddings with metadata | [Vectors](/docs/data/vectors) | [Vector commands](/docs/reference/vector) |
| Graph | nodes, typed edges, properties, and ontology | [Graph](/docs/data/graph) | [Graph commands](/docs/reference/graph) |

## Shared envelopes

Writes return commit facts and mutation effect. Reads return the visible value,
usually with version facts. Paginated reads return an opaque cursor when more
data is available.

In JSON mode, byte fields are base64. Do not parse cursors.

## Errors

Runtime failures use structured error envelopes. Use
[Error Reference](/docs/reference/error-reference) for the model and [`/e/`](/e/)
for generated per-code pages.

## Related

- [Concepts: value types](/docs/concepts/value-types)
- [Concepts: commits](/docs/concepts/commits)
- [Command Reference](/docs/reference/command-reference)
