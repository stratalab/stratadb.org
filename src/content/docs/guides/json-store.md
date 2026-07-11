---
title: "JSON Document Store"
section: "guides"
description: "Store JSON documents, read and update them by path, and index fields."
source: "strata-core@v1.0.0"
---

The JSON store keeps a JSON document under a string key and lets you read or
write individual values inside it by path. Use it when your data has structure
you want to address directly — a user record, a config object, an agent's
working state — rather than an opaque blob. Like every
[primitive](/docs/concepts/primitives), documents are branch-aware and
versioned.

Examples below were run against the shipped binary. Use a directory path for a
durable database or `--cache` for a throwaway run.

## Set and get by path

`json set <key> <path> <value>` writes a value at a path. The path `$` is the
whole document; `$.field` addresses a top-level field, and paths nest with dots.
The value is parsed as JSON — text that is not valid JSON is stored as a string;
use `@path` or `-f <file>` to read the value from a file.

```bash
strata ./mydb json set user:1 '$' '{"name":"Ada","age":36,"tags":["math","logic"]}'
strata ./mydb json get user:1 '$'
strata ./mydb json get user:1 '$.name'
```

```text
created user:1 applied=true
{"age":36,"name":"Ada","tags":["math","logic"]}
"Ada"
```

Update one field without rewriting the document, and add a new field the same
way:

```bash
strata ./mydb json set user:1 '$.age' 37
strata ./mydb json set user:1 '$.email' '"ada@example.com"'
strata ./mydb json get user:1 '$'
```

```text
updated user:1 applied=true
updated user:1 applied=true
{"age":37,"email":"ada@example.com","name":"Ada","tags":["math","logic"]}
```

Writing `$` again replaces the entire document — JSON merge in this release is
document-level, not field-level, so a full-document set overwrites fields you
omit. To change one field, target its path.

## Delete a path

`json delete <key> <path>` removes a value. Deleting `$` removes the whole
document; deleting `$.email` removes just that field.

```bash
strata ./mydb json delete user:1 '$.email'
```

```text
deleted user:1 applied=true
```

Reading a missing path or a missing document is not an error — it reports that
nothing was found:

```bash
strata --json ./mydb json get user:1 '$.nope'
```

```text
{"data":{"found":false,"value":null},"type":"json_versioned_value"}
```

## List, count, exists, sample

These operate on document keys, mirroring the KV verbs:

```bash
strata ./mydb json list
strata ./mydb json count
strata ./mydb json exists user:2
```

```text
user:1
user:2
user:3
3
true
```

`json list --prefix <p>` filters by key prefix and pages via `--cursor`;
`json sample --count <n>` returns an arbitrary handful of documents.

## History and time travel

Each write retains prior document versions. `json history` lists them
newest-first, and every read verb accepts `--as-of <timestamp>` (the
`commit.timestamp` from a write receipt) to read an earlier snapshot.

```bash
strata ./mydb json history user:1
```

```text
{"document_version":4,"timestamp":6,"tombstone":false,"value":{"age":37,"name":"Ada","tags":["math","logic"]},"version":6}
{"document_version":3,"timestamp":5,"tombstone":false,"value":{"age":37,"email":"ada@example.com","name":"Ada","tags":["math","logic"]},"version":5}
```

Documents are branch-scoped. Fork a branch, write there, and the parent branch
keeps its own version. See [Branches](/docs/concepts/branches).

## Secondary indexes

Index a field to accelerate retrieval over it. `json index create <name>
<field-path>` supports three index types — `tag` (default, string equality),
`numeric`, and `text` (lowercased).

```bash
strata ./mydb json index create by_age '$.age' --index-type numeric
strata ./mydb json index list
```

```text
{
  "created_timestamp": 9,
  "created_version": 9,
  "field_path": "age",
  "index_type": "numeric",
  "name": "by_age",
  "space": "default"
}
{"created_timestamp":9,"created_version":9,"field_path":"age","index_type":"numeric","name":"by_age","space":"default"}
```

`json index drop <name>` removes it. Creating an index whose name already exists
fails:

```bash
strata --json ./mydb json index create by_age '$.age' --index-type numeric
```

```text
{"error":{"class":"already_exists","code":"already_exists.engine.json_index","retry_policy":"never","retryable":false,"commit_outcome":"not_started","message":"JSON index already exists","suggested_fix":"Reload the current state and retry the operation against the latest version.","docs_url":"https://stratadb.org/e/already_exists.engine.json_index","reference_id":"err_local_009f7060_000001"}}
```

## Error cases worth knowing

Writing into a path whose parent is the wrong type is rejected — here, setting
`$.name.first` when `name` is a string:

```bash
strata --json ./mydb json set user:1 '$.name.first' '"x"'
```

```text
{"error":{"class":"invalid_argument","code":"invalid_argument.engine.json_path_type","retry_policy":"never","retryable":false,"commit_outcome":"not_started","message":"JSON path expected object","suggested_fix":"Correct the request input and retry the operation.","docs_url":"https://stratadb.org/e/invalid_argument.engine.json_path_type","reference_id":"err_local_0e8cc4e8_000001"}}
```

Related codes include
[/e/invalid_argument.engine.json_document](/e/invalid_argument.engine.json_document)
for an invalid document id and
[/e/already_exists.engine.json_index](/e/already_exists.engine.json_index).
Match on the code, not the message — see
[error handling](/docs/guides/error-handling).

## When to use JSON vs other primitives

- Use **JSON** when you address fields inside a document by path or index by
  field.
- Use [KV](/docs/guides/kv-store) for opaque values with no structure to query.
- Use [Vectors](/docs/guides/vector-store) for similarity search.
- Use the [Event Log](/docs/guides/event-log) for an append-only, ordered
  history.

See the [CLI reference](/docs/reference/cli) for the full verb list and
[value types](/docs/concepts/value-types) for how JSON values are represented.
