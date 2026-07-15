---
title: "Reference"
section: "reference"
description: "Exact specifications for the strata CLI, its command surface, configuration, errors, value types, and MCP server."
source: "strata-core@v1.0.0"
---

Precise, verified specifications for the `strata` binary and the database it opens. These pages describe exactly what the shipping CLI does.

## Pages

- **[CLI](/docs/reference/cli)** — invoking `strata`: targeting a database, global options, output formats, and the interactive REPL.
- **[Command Reference](/docs/reference/command-reference)** — every command in every family, with its syntax and a one-line description.
- **[API Quick Reference](/docs/reference/api-quick-reference)** — a one-page cheat sheet of the most common operation per capability.
- **[Configuration Reference](/docs/reference/configuration-reference)** — database options, durability, and the resolved hub configuration.
- **[Error Reference](/docs/reference/error-reference)** — the error model and the public error-code registry.
- **[Value Type Reference](/docs/reference/value-type-reference)** — the value types stored and returned across capabilities.

The Model Context Protocol server now lives in [For AI agents](/docs/agents/mcp-server).

The Node and Python SDKs are in progress; their references will be generated from the same command index that will eventually generate these pages.
