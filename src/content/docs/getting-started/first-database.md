---
title: "Your First Database"
section: "getting-started"
description: "Create a durable database, fork a branch, merge it, and read an earlier version."
source: "strata-core@v1.1.0"
---

This page uses a durable database at `./mydb`. StrataDB creates the directory on
the first write. There is no server and no separate create step.

Open the database once:

```bash
strata ./mydb
```

The rest of this page runs inside that REPL session.

## Write A Value

```text
strata:default/default › kv put portfolio.value 98400
strata:default/default › kv get portfolio.value
```

```text
created portfolio.value applied=true
98400
```

That write created a local database directory and committed the first value.

## Add A Document

Use JSON when the value has fields you want to update directly.

```text
strata:default/default › json set portfolio '$' '{"strategy":"balanced","stocks":60,"bonds":30,"cash":10}'
strata:default/default › json get portfolio '$'
```

```text
created portfolio applied=true
{"bonds":30,"cash":10,"stocks":60,"strategy":"balanced"}
```

`$` means the document root. Later, paths like `$.stocks` update one field.

## Fork The Database

Fork `default` into a branch named `risky`:

```text
strata:default/default › branch fork default risky
```

The output includes the new branch and the parent commit it forked from:

```text
{
  "name": "risky",
  "parent": {
    "name": "default",
    "fork_version": 4
  },
  "status": "active"
}
```

The numeric version in your output may differ. The important part is that the
branch starts from `default` without copying the whole database.

## Change The Fork

Write the aggressive allocation on `risky`:

```text
strata:default/default › use risky
strata:risky/default › json set portfolio '$.strategy' '"aggressive"'
strata:risky/default › json set portfolio '$.stocks' 80
strata:risky/default › json set portfolio '$.bonds' 15
strata:risky/default › json set portfolio '$.cash' 5
```

```text
updated portfolio applied=true
updated portfolio applied=true
updated portfolio applied=true
updated portfolio applied=true
```

`default` is still balanced. `risky` now has the aggressive allocation.

## Compare And Preview

Diff is read-only:

```text
strata:risky/default › use default
strata:default/default › branch diff default risky
```

Output is grouped by capability and space. This run reports one modified JSON
document:

```text
{
  "branch_a": "default",
  "branch_b": "risky",
  "spaces": [
    {
      "capability": "json",
      "modified": [
        { "identity": "cG9ydGZvbGlv", "version": 11 }
      ],
      "space": "default"
    }
  ]
}
```

Preview the promotion before mutating either branch:

```text
strata:default/default › branch preview risky default
```

```text
{
  "source": "risky",
  "target": "default",
  "strategy": "strict",
  "conflicts": []
}
```

No conflicts means the merge can apply cleanly under the default strict strategy.

## Merge Back

```text
strata:default/default › branch merge risky default
strata:default/default › json get portfolio '$'
```

The merge output is a structured receipt. The final read shows the result:

```text
{
  "source": "risky",
  "target": "default",
  "conflicts": []
}
{"bonds":15,"cash":5,"stocks":80,"strategy":"aggressive"}
```

In `v1.1.0`, branch merge applies key-value, JSON, and vector changes. Events
and graphs are compared but not merged.

## Read The Past

Every write has a commit timestamp. Ask for the JSON receipt when you need it:

```bash
strata --json ./mydb kv put note first
```

```text
{"data":{"commit":{"timestamp":16,"version":16},"effect":{"kind":"created","applied":true},"key":"bm90ZQ=="},"type":"write_result"}
```

Your timestamp may differ. Use the timestamp from your own receipt:

```text
strata:default/default › kv put note second
strata:default/default › kv get note
strata:default/default › kv get note --as-of 16
```

```text
updated note applied=true
second
first
```

The live value is `second`. The `--as-of` read returns the value at the earlier
commit.

## Inspect The Database

```text
strata:default/default › describe
```

`describe` returns the active branch, available capabilities, spaces, and
per-primitive counts. Use it when you want to confirm what a database contains.

## Next

- [Working with data](/docs/data) to choose the right primitive.
- [Branches](/docs/concepts/branches) for fork, preview, and merge behavior.
- [Time travel](/docs/concepts/time-travel) for `--as-of` reads and historical
  forks.
- [For AI agents](/docs/agents) to expose the same database over MCP.
