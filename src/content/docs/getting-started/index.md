---
title: "Getting Started"
section: "getting-started"
description: "Install the CLI, create a database, fork a branch, and hand StrataDB to an agent."
source: "strata-core@v1.1.0"
---

Start here if you want to run StrataDB, not read around it.

1. [Install the CLI](/docs/getting-started/installation).
2. [Create your first database](/docs/getting-started/first-database).
3. Use the generated [command reference](/docs/reference) when you need exact
   syntax.

StrataDB is embedded. You point the binary at a local directory and the database
opens in-process. Use `--cache` only for a throwaway single-process run; separate
CLI invocations do not share an in-memory database.

The first tutorial opens a REPL with `strata ./mydb`. From there, examples use
the prompt form so you can focus on the operation instead of repeating the path.

## What You Will Do

The first tutorial uses one durable database:

- write a key-value record;
- write a JSON document;
- fork `default` to `risky`;
- change the fork without touching `default`;
- preview and merge the fork;
- read an earlier value with `--as-of`.

That path is the core product model. The rest of the docs expand it.

## After The First Run

- Pick a data shape in [Working with data](/docs/data).
- Learn the model in [Concepts](/docs/concepts).
- Use [Inference](/docs/inference) for generation, embeddings, ranking, and
  tokenization.
- Use [For AI agents](/docs/agents) for MCP and the self-describing binary.

Still deciding whether the product fits? Read [Why Strata](/docs/why-strata)
before installing.
