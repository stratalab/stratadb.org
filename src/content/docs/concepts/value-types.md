---
title: "Value Types"
section: "concepts"
description: "What a value is depends on the primitive: KV stores opaque bytes, JSON stores the full JSON model, and vectors, events, and graphs carry their own shapes."
source: "strata-core@v1.0.0"
---

StrataDB does not have one universal value type. What counts as a "value" depends on which [primitive](/docs/concepts/primitives) you are using. Knowing the value model of each one saves you from surprises — especially in KV, which is more literal than you might expect.

## KV values are opaque bytes

The KV store maps a byte key to a byte value. It does **not** interpret, parse, or type your values. If you put the text `42`, you get back the two bytes `4` and `2` — not an integer.

```text
$ strata ./db kv put n 42
created n applied=true
$ strata ./db kv get n
42
```

That last `42` is a string of bytes displayed as text, not a number. You can see this on the `--json` wire, where KV values are base64-encoded because they are raw bytes:

```text
$ strata --json ./db kv get n
{"data":{"timestamp":3,"value":"NDI=","version":3},"type":"kv_versioned_value"}
```

`NDI=` is base64 for the ASCII characters `42`. In the default human output, byte values are shown as text when they are valid UTF-8. Because values are just bytes, you can store anything — including binary — with `kv put <key> @file` or `--file`. If you want typed, structured data with a key, use the JSON store instead.

## JSON values use the JSON model

The JSON store carries the full JSON type model: objects, arrays, strings, numbers, booleans, and null. Types are preserved on read, and you can address any path within a document.

```text
$ strata ./db json set doc '$' '{"name":"alice","age":30,"score":3.14,"active":true,"tags":["a","b"],"meta":null}'
created doc applied=true
$ strata ./db json get doc '$.age'
30
$ strata ./db json get doc '$.score'
3.14
$ strata ./db json get doc '$.active'
true
$ strata ./db json get doc '$.name'
"alice"
$ strata ./db json get doc '$.meta'
null
```

Notice that `age` reads back as the number `30`, `score` as `3.14`, `active` as the boolean `true`, and `name` as the quoted string `"alice"`. The JSON store knows the difference between these; the KV store would treat all of them as bytes. You can also write to a path in place:

```text
$ strata ./db json set doc '$.age' 31
updated doc applied=true
```

## Vector values are embeddings plus metadata

A vector value has two parts: a fixed-length array of 32-bit floats (the embedding) and an optional JSON metadata object. The collection fixes the dimension and distance metric when you create it; every vector in it must match that dimension.

```text
$ strata ./db vector collection create docs 3 --metric cosine
$ strata ./db vector upsert docs a '[1,0,0]' --metadata '{"lang":"en"}'
$ strata ./db vector get docs a
{
  "data": {
    "embedding": [1.0, 0.0, 0.0],
    "metadata": { "lang": "en" }
  },
  "key": "a",
  "timestamp": 5,
  "vector_revision": 1,
  "version": 5
}
```

The metadata object uses the JSON model and is what you filter on at query time.

## Event payloads are JSON objects

An event carries a type label and a JSON payload. The payload is a JSON value — typically an object — and it is stored exactly as given, alongside a sequence number and a hash that links it to the previous event.

```text
$ strata ./db event append audit '{"action":"login","user":"alice"}'
created applied=true
```

## Graph values are nodes and edges

A graph node is an id with optional JSON properties. An edge connects two existing nodes, carries a type label and a numeric weight (default `1.0`), and may also hold properties. Endpoints must exist before an edge can be written.

```text
$ strata ./db graph add-node social alice
$ strata ./db graph add-edge social alice knows bob
```

## The through-line

The rule of thumb: **KV is bytes, everything else is structured.** Reach for KV when you want to store and return exact bytes without interpretation, and for JSON, vectors, events, or graphs when you want the database to understand the shape of your data. All of them are versioned and branch-scoped the same way — the difference is only in what a single value means.

## Next

- [Primitives](/docs/concepts/primitives) — the five capabilities in full
- [Value Type Reference](/docs/reference/value-type-reference) — the complete specification
- [KV Store](/docs/data/key-value) and [JSON Store](/docs/data/json) — the two value models in practice
