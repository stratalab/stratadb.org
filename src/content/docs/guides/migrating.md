---
title: "Migrating"
section: "guides"
description: "Bring data over from SQLite, DuckDB, or Redis by exporting to a columnar file and importing it into a primitive."
source: "strata-core@v1.0.0"
---

Strata is not a relational database, so migrating into it is a **mapping**
exercise, not a schema copy: you decide which [primitive](/docs/concepts/primitives)
each source table or keyspace becomes, then move the rows. The mechanism is the
same in every case — export the source to Parquet, CSV, or JSON lines, then load
it with [`arrow import`](/docs/guides/import-export). This guide shows the path
from three common sources.

## The general shape

1. **Choose the target primitive.** A flat key→value table maps to
   [KV](/docs/data/key-value); a table of structured records maps to
   [JSON](/docs/data/json); embeddings map to a [vector](/docs/data/vectors)
   collection.
2. **Export the source** to CSV, Parquet, or JSON lines.
3. **Import** with `strata <db> arrow import --target <primitive>`, naming the key
   and value columns. Import targets are `kv`, `json`, and `vector`; the format is
   inferred from the file or set with `--format`.

## From SQLite

Export a table to CSV with the `sqlite3` shell, then import it. A two-column
`settings(key, value)` table maps cleanly to KV:

```bash
sqlite3 app.db -cmd '.mode csv' -cmd '.headers on' \
  '.once settings.csv' 'SELECT key, value FROM settings;'

strata ./mydb arrow import --target kv --key-column key --value-column value ./settings.csv
```

For a table of structured rows, serialize each row to JSON and import into the
JSON primitive instead — pick a column as the document key and a JSON column as
the value, matching the column names with `--key-column` / `--value-column`.

## From DuckDB

DuckDB writes Parquet directly, which imports without a format flag:

```sql
COPY (SELECT id AS key, to_json(t) AS value FROM records t) TO 'records.parquet' (FORMAT parquet);
```

```bash
strata ./mydb arrow import --target json --key-column key --value-column value ./records.parquet
```

Parquet preserves types and is the most faithful round-trip format. Use it when
moving large tables.

## From Redis

Dump the keyspace to JSON lines — one `{"key":…,"value":…}` object per line — and
import into KV:

```bash
redis-cli --scan | while read k; do
  printf '{"key":%s,"value":%s}\n' "$(jq -Rn --arg v "$k" '$v')" "$(redis-cli GET "$k" | jq -Rs .)"
done > redis.jsonl

strata ./mydb arrow import --target kv --key-column key --value-column value ./redis.jsonl
```

Structured Redis values (hashes, JSON stored as strings) are a better fit for the
JSON primitive — serialize each value to a JSON document and import with
`--target json`.

## Embeddings

To migrate vectors, create the destination collection first (its dimension and
metric are fixed at creation), then import into it with `--target vector
--collection <name>`. The exact column mapping for vector imports is in
[Import & export](/docs/guides/import-export#column-mapping).

## After the import

The import reports `rows_imported`, and the data is immediately branch-aware and
versioned like anything else — fork it, read it [`--as-of`](/docs/guides/time-travel),
and partition it with [spaces](/docs/guides/spaces). Verify with a `count` on the
target primitive, and spot-check a few keys before pointing your application at
the new database.

## What does not carry over

Strata has no SQL, joins, or foreign keys, so relational structure does not
migrate — you re-model it across primitives (a join table might become graph
edges, for instance). There is no automated schema translation and no migration
tool that runs the source system for you; the export step is yours to run with the
source's own tools.

## Related

- [Import & export](/docs/guides/import-export) — the full `arrow import`/`export`
  surface and column mapping.
- [Primitives](/docs/concepts/primitives) — choosing the target shape.
- [Cloning datasets](/docs/guides/cloning-datasets) — the other way data arrives,
  for already-prepared Strata datasets.
