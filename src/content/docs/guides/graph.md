---
title: "Graph Guide"
section: "guides"
description: "Create graphs, manage nodes and edges, declare an ontology, and run built-in graph analytics from the CLI."
source: "strata-core@v1.0.0"
---

The graph capability stores directed, typed, optionally weighted edges between property-bearing nodes. It sits on the same branch-aware storage as every other capability, so graphs fork, time-travel, and isolate per branch and [space](/docs/guides/spaces) like the rest. This guide walks the full command surface — structure, traversal, bulk loading, analytics, and the ontology — against one worked example.

The examples target a durable database at `./social.strata`. Graph commands emit JSON by default; add `--raw` for one-object-per-line output that is easier to pipe.

## Graphs

A database holds many named graphs. Create one, list them, read its metadata, and delete it:

```bash
strata ./social.strata graph create social
strata ./social.strata graph list
strata ./social.strata graph meta social
```

```text
{
  "created_timestamp": 3,
  "created_version": 3,
  "edge_count": 0,
  "graph": "social",
  "node_count": 0,
  "updated_timestamp": 3,
  "updated_version": 3
}
```

`graph list` prints one name per line. `graph meta` returns live node and edge counts plus the create/update commit coordinates. Reading metadata for a graph that does not exist returns `(nil)`, not an error. Creating a graph that already exists fails with [`already_exists.engine.graph`](/e/already_exists.engine.graph).

## Nodes

A node has an id and optional JSON properties. `add-node` inserts or replaces:

```bash
strata ./social.strata graph add-node social alice --properties '{"name":"Alice","role":"eng"}'
strata ./social.strata graph get-node social alice
```

```text
{
  "graph": "social",
  "node_id": "alice",
  "properties": {
    "name": "Alice",
    "role": "eng"
  },
  "timestamp": 4,
  "version": 4
}
```

Pass `--properties-file <path>` to read the JSON from a file instead of the command line, and `--type <name>` to declare the node's object type (validated once you freeze an ontology — see below). List nodes with `graph list-nodes <graph>` (accepts `--prefix`, `--limit`, `--cursor`), and remove one with `graph remove-node <graph> <id>`. A removed or never-written node reads back as `(nil)`.

## Edges

An edge connects two existing nodes under an edge type, with an optional weight and properties:

```bash
strata ./social.strata graph add-edge social alice follows bob --weight 1.0 --properties '{"since":2021}'
strata ./social.strata graph get-edge social alice follows bob
```

```text
{
  "dst": "bob",
  "edge_type": "follows",
  "graph": "social",
  "properties": {
    "since": 2021
  },
  "src": "alice",
  "timestamp": 10,
  "version": 10,
  "weight": 1.0
}
```

Both endpoints must already exist; writing an edge to a missing node fails with [`invalid_argument.engine.graph_edge_endpoint`](/e/invalid_argument.engine.graph_edge_endpoint). Remove an edge with `graph remove-edge <graph> <src> <edge_type> <dst>`.

### Neighbors

`graph neighbors` walks a node's edges. `--direction` is `outgoing` (default), `incoming`, or `both`; `--edge-type` filters by type, and `--limit`/`--cursor` paginate:

```bash
strata ./social.strata --raw graph neighbors social alice --direction outgoing
```

```text
{"direction":"outgoing","dst":"bob","edge":{"dst":"bob","edge_type":"follows","graph":"social","properties":{"since":2021},"src":"alice","timestamp":10,"version":10,"weight":1.0},"edge_type":"follows","graph":"social","node":{"graph":"social","node_id":"bob","properties":{"name":"Bob","role":"eng"},"timestamp":5,"version":5},"node_id":"bob","src":"alice"}
```

Each row carries the traversed edge and the neighbor node in full, so you rarely need a follow-up read.

## Bulk insert

For loading many nodes and edges, `bulk-insert` ingests a JSON payload in chunked commits. Nodes use the key `node_id`; edges use `src`, `edge_type`, `dst`, and optional `weight`/`properties`:

```bash
strata ./social.strata graph bulk-insert loaded \
  --data '{"nodes":[{"node_id":"n1","properties":{"kind":"a"}},{"node_id":"n2"},{"node_id":"n3"}],"edges":[{"src":"n1","edge_type":"link","dst":"n2","weight":1.0},{"src":"n2","edge_type":"link","dst":"n3"}]}'
```

```text
{
  "commit": { "delete_count": 0, "durable": true, "put_count": 2, "timestamp": 31, "version": 31 },
  "commits": 2,
  "edges_inserted": 2,
  "graph": "loaded",
  "nodes_inserted": 3,
  "timestamp": 31,
  "version": 31
}
```

Use `--file <path>` instead of `--data` for large payloads, and `--chunk-size <n>` to bound items per commit.

## Analytics

The example graph below has two components — a follow cycle among `alice`, `bob`, `carol` (plus `frank` following `alice`) and a mutual pair `dave`/`erin`. Every algorithm reads a consistent snapshot and accepts `--as-of <micros>` for time travel.

Weakly connected components (`wcc`) label each node with its component representative:

```bash
strata ./social.strata graph wcc social
```

```text
{
  "component_count": 2,
  "components": { "alice": "alice", "bob": "alice", "carol": "alice", "dave": "dave", "erin": "dave", "frank": "alice" },
  "graph": "social"
}
```

Local clustering coefficients (`lcc`), shortest-path distances from a source (`sssp`, with `--direction`), and PageRank (`pagerank`, with `--damping`, `--max-iterations`, `--tolerance`, and `--personalization` seed weights) all return per-node maps:

```bash
strata ./social.strata graph pagerank social
```

```text
{
  "graph": "social",
  "iterations": 20,
  "personalized": false,
  "ranks": { "alice": 0.2579646389410527, "bob": 0.13463229043004, "carol": 0.249069737295574, "dave": 0.16666666666666666, "erin": 0.16666666666666666, "frank": 0.025 }
}
```

Community detection by label propagation (`cdlp`, with `--max-iterations` and `--direction`) returns a label per node. A bounded breadth-first traversal (`bfs`) returns visited nodes, per-node depths, and the traversed edges:

```bash
strata ./social.strata graph bfs social alice
```

```text
{
  "depths": { "alice": 0, "bob": 1, "carol": 1 },
  "edges": [ { "dst": "bob", "edge_type": "follows", "src": "alice", "weight": 1.0 }, { "dst": "carol", "edge_type": "follows", "src": "alice", "weight": 1.0 } ],
  "graph": "social",
  "start": "alice",
  "visited": [ "alice", "bob", "carol" ]
}
```

`bfs` bounds itself with `--max-depth` (default 100), `--max-nodes` (default 10000), `--direction`, and a repeatable `--edge-type` restriction. Running an algorithm from a node that does not exist fails with [`not_found.engine.graph_node`](/e/not_found.engine.graph_node).

## Ontology

A graph can carry an ontology: declared object types and link types. While the ontology is a **draft**, you add and redraft types freely; nothing is enforced. When you **freeze** it, subsequent writes validate against it.

```bash
strata ./org.strata graph ontology define-object-type org Person \
  --properties '{"name":{"value_type":"string","required":true},"level":{"value_type":"integer","required":false}}'
strata ./org.strata graph ontology define-object-type org Team \
  --properties '{"name":{"value_type":"string","required":true}}'
strata ./org.strata graph ontology define-link-type org member_of Person Team --cardinality many-to-one
```

A link type names its source and target object types; `--cardinality` is an optional hint. `graph ontology get <graph>` prints the status and every declared type; `graph ontology delete-object-type` / `delete-link-type` remove draft types. Add typed nodes with `--type`, then freeze:

```bash
strata ./org.strata graph add-node org p1 --type Person --properties '{"name":"Alice","level":5}'
strata ./org.strata graph add-node org t1 --type Team --properties '{"name":"Platform"}'
strata ./org.strata graph ontology freeze org
```

```text
{
  "commit": { "delete_count": 0, "durable": true, "put_count": 1, "timestamp": 23, "version": 23 },
  "graph": "org",
  "link_types": 1,
  "object_types": 2,
  "timestamp": 23,
  "version": 23
}
```

After freezing, a node declaring an undeclared type is rejected:

```bash
strata ./org.strata graph add-node org x1 --type Robot --properties '{"name":"R2"}'
```

```text
failed_precondition.engine.graph_ontology_node_type: node object type `Robot` is not declared in the frozen ontology (err_local_21ffcbc2_000001)
  hint: Reload the current state and retry the operation against the latest version.
  ref: https://stratadb.org/e/failed_precondition.engine.graph_ontology_node_type
```

`graph ontology summary <graph>` adds per-type usage counts (nodes per object type, edges per link type), and `graph nodes-by-type <graph> <ObjectType>` lists the nodes declaring a given type:

```bash
strata ./org.strata graph nodes-by-type org Person
```

```text
{"graph":"org","node_id":"p1","object_type":"Person","properties":{"level":5,"name":"Alice"},"timestamp":21,"version":21}
```

## Related

- [Primitives](/docs/concepts/primitives) — how graphs sit alongside the other capabilities
- [Branches](/docs/concepts/branches) and [Commits](/docs/concepts/commits) — the isolation and time-travel model
- [Arrow](/docs/guides/arrow) — export a graph's nodes and edges to Parquet, CSV, or JSON lines
- [Error Handling](/docs/guides/error-handling) — reading structured error codes
- [Command Reference](/docs/reference/command-reference) — every verb and flag
