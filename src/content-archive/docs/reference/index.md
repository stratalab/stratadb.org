---
title: "Reference"
section: "reference"
description: "Generated command facts, CLI rules, configuration, errors, and value types for the Strata binary."
source: "strata-core@v1.1.1"
---

# Reference

Use the reference when you need exact syntax or machine-shaped facts. The
narrative docs explain how to think about Strata; these pages stay close to the
binary surface.

## Core pages

- [CLI](/docs/reference/cli): database targeting, global flags, output formats,
  and REPL behavior.
- [Command Reference](/docs/reference/command-reference): command families and
  verbs generated from the command catalog.
- [API Quick Reference](/docs/reference/api-quick-reference): the most common
  operation in each capability.
- [Configuration Reference](/docs/reference/configuration-reference): local
  config and hub URL resolution.
- [Error Reference](/docs/reference/error-reference): the public error model and
  error-code registry.
- [Value Type Reference](/docs/reference/value-type-reference): values stored
  and returned across capabilities.

## Command families

- [Key-value](/docs/reference/kv)
- [JSON](/docs/reference/json)
- [Events](/docs/reference/event)
- [Vectors](/docs/reference/vector)
- [Graph](/docs/reference/graph)
- [Branches](/docs/reference/branch)
- [Spaces](/docs/reference/space)
- [Inference](/docs/reference/inference)
- [Admin](/docs/reference/admin)
- [Arrow import/export](/docs/reference/arrow)

For agent-driven discovery, use `strata agents commands --json` and
`strata agents errors --json`. The MCP server is documented in
[For AI agents](/docs/agents/mcp-server).
