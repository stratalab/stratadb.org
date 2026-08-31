---
title: "Command Reference"
section: "reference"
description: "How to use the generated command reference and the live command catalog."
source: "strata-core@v1.1.0"
---

Use this page as a map. The command facts live in two generated places:

- the generated family pages under `/docs/reference/<family>`
- the live catalog from `strata agents commands --json`

If you are writing code or driving Strata from an agent, prefer the live catalog
from the binary in your environment.

## Generated families

- [Key-value](/docs/reference/kv)
- [JSON](/docs/reference/json)
- [Events](/docs/reference/event)
- [Vectors](/docs/reference/vector)
- [Graph](/docs/reference/graph)
- [Branches](/docs/reference/branch)
- [Spaces](/docs/reference/space)
- [Admin](/docs/reference/admin)
- [Arrow import/export](/docs/reference/arrow)
- [Inference](/docs/reference/inference)

Each family page lists the commands in that family. Each command page records
the summary, examples, parameters, return model, possible errors, and invocation
shape generated from the released command index.

## Live catalog

```bash
strata agents commands --json
```

Use the JSON catalog for automation. It includes command IDs, families, path
displays, access class, commit behavior, pagination shape, docs routes, input
and output models, and possible error codes.

## Related

- [Reference](/docs/reference)
- [The command index](/docs/agents/command-index)
- [The agents guide](/docs/agents/agents-guide)
