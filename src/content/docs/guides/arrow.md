---
title: "Arrow Import and Export"
section: "guides"
description: "Move data in and out of a database as Parquet, CSV, or JSON lines using the arrow import and export commands."
source: "strata-core@v1.0.0"
---

The `arrow` commands move data between a database and columnar files. Export snapshots a capability to Parquet, CSV, or JSON lines; import loads a file back into a primitive. Use them for backups, bulk loading, and handing data to analytics tools that read Arrow-compatible formats.

## Exporting

`arrow export` takes a `--primitive`, a `--format`, and an output path:

```bash
strata ./users.strata arrow export --primitive kv --format csv ./users.csv
```

```text
{
  "format": "csv",
  "paths": [ "/path/to/users.csv" ],
  "primitive": "kv",
  "row_count": 3,
  "size_bytes": 135
}
```

`--primitive` accepts `kv`, `json`, `event`, `vector`, and `graph`; `--format` accepts `parquet`, `csv`, and `jsonl`. The file carries the row values plus their commit coordinates. The CSV above looks like this:

```text
key,key_encoding,value,value_encoding,version,timestamp
user:1,utf8,alice,utf8,3,3
user:2,utf8,bob,utf8,4,4
user:3,utf8,carol,utf8,5,5
```

Narrow an export with the optional flags: `--prefix` restricts by key, document, vector, or node prefix; `--limit` caps rows; `--collection <name>` selects the vector collection; `--graph <name>` selects the graph; and `--event-type <type>` filters an event export.

### Graph exports

A graph has two row shapes, so a graph export treats the path as a stem and writes a nodes file and an edges file:

```bash
strata ./social.strata arrow export --primitive graph --graph social --format csv ./social
```

```text
{
  "format": "csv",
  "paths": [ "/path/to/social_nodes.csv", "/path/to/social_edges.csv" ],
  "primitive": "graph",
  "row_count": 10,
  "size_bytes": 526
}
```

## Importing

`arrow import` takes a `--target` primitive and an input file:

```bash
strata ./restored.strata arrow import --target kv ./users.csv
```

```text
{
  "batches_processed": 1,
  "file_path": "/path/to/users.csv",
  "rows_imported": 3,
  "rows_skipped": 0,
  "target": "kv"
}
```

`--target` accepts `kv`, `json`, and `vector`. The format is inferred from the file, or state it explicitly with `--format <parquet|csv|jsonl>`. The round trip is faithful — the keys and values written above read straight back:

```bash
strata ./restored.strata kv get user:2
```

```text
bob
```

### Column mapping

By default the importer expects the same column layout that export produces. When you load a file from elsewhere, point it at the right columns:

- `--key-column <name>` — the column to use as the key.
- `--value-column <name>` — the column holding the value, document, or embedding.
- `--collection <name>` — the destination collection for a vector import.

For example, importing exported JSON-lines documents by naming the key and document columns explicitly:

```bash
strata ./docs.strata arrow import --target json --key-column key --value-column document ./docs.jsonl
```

```text
{
  "batches_processed": 1,
  "file_path": "/path/to/docs.jsonl",
  "rows_imported": 2,
  "rows_skipped": 0,
  "target": "json"
}
```

`rows_skipped` counts rows that could not be mapped, so a nonzero value is worth inspecting.

## Related

- [KV Store](/docs/guides/kv-store), [JSON Store](/docs/guides/json-store), and [Vector Store](/docs/guides/vector-store) — the import targets
- [Graph](/docs/guides/graph) — the node and edge model behind a graph export
- [Cloning Datasets](/docs/guides/cloning-datasets) — pulling a whole prepared database instead of a file
- [Command Reference](/docs/reference/command-reference) — every verb and flag
