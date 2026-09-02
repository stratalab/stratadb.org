---
title: "Graph"
section: "data"
description: "Create graphs, add nodes and edges, traverse neighbors, run analytics, and use an ontology when types matter."
source: "strata-core@v1.1.1"
---

Use graph when relationships are part of the data, not just fields on a record.
A graph contains nodes, typed directed edges, optional weights, and JSON
properties.

Use [JSON](/docs/data/json) for documents you mostly fetch by key or field. Use
graph when you need traversal, neighbors, connected components, PageRank, or a
typed relationship model.

Examples below assume you opened a database with `strata ./social` or
`strata ./org`, depending on the block.

## Create A Graph

```text
strata:default/default › graph create social
strata:default/default › graph list
strata:default/default › graph meta social
```

`graph meta` returns node count, edge count, and create/update commit facts.

## Add Nodes

```text
strata:default/default › graph add-node social alice --properties '{"name":"Alice","role":"eng"}'
strata:default/default › graph add-node social bob --properties '{"name":"Bob","role":"eng"}'
strata:default/default › graph get-node social alice
```

Nodes have string ids and optional JSON properties. Use `--properties-file` for
larger payloads.

## Add Edges

```text
strata:default/default › graph add-edge social alice follows bob --weight 1.0 --properties '{"since":2024}'
strata:default/default › graph get-edge social alice follows bob
```

Both endpoints must exist before the edge is written. A missing endpoint fails
with [`invalid_argument.engine.graph_edge_endpoint`](/e/invalid_argument.engine.graph_edge_endpoint).

## Traverse

```text
strata:default/default › graph neighbors social alice --direction outgoing
strata:default/default › graph bfs social alice --max-depth 2
```

`neighbors` returns adjacent nodes and the edge used to reach them. `bfs` returns
visited nodes, depths, and traversed edges. Both support branch and space
selection like other commands.

## Run Analytics

Built-in graph analytics read a consistent snapshot:

```text
strata:default/default › graph wcc social
strata:default/default › graph pagerank social
strata:default/default › graph sssp social alice
strata:default/default › graph lcc social
strata:default/default › graph cdlp social
```

Use the generated [Graph command reference](/docs/reference/graph) for algorithm
options such as direction, damping, max iterations, tolerance, and budgets.

## Use An Ontology

An ontology lets a graph declare object types and link types. While the ontology
is draft, you can change it. After freezing, writes are validated against it.

```text
strata:default/default › graph ontology define-object-type org Person \
  --properties '{"name":{"value_type":"string","required":true}}'
strata:default/default › graph ontology define-object-type org Team \
  --properties '{"name":{"value_type":"string","required":true}}'
strata:default/default › graph ontology define-link-type org member_of Person Team --cardinality many-to-one
strata:default/default › graph ontology freeze org
```

After the freeze, a node declaring an unknown type fails with
[`failed_precondition.engine.graph_ontology_node_type`](/e/failed_precondition.engine.graph_ontology_node_type).

## History And Branches

Graph data is versioned and branch-scoped. You can read metadata, nodes, edges,
and traversals as of an earlier commit:

```text
strata:default/default › graph meta social --as-of <timestamp-from-receipt>
```

In `v1.1.1`, branch diff includes graph changes, but branch merge does not merge
graph data.

## Reference

Exact parameters, return shapes, analytics options, ontology commands, and error
lists are generated in the [Graph command reference](/docs/reference/graph).
