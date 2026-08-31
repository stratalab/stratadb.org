---
title: "Machine-readable docs"
section: "agents"
description: "How agents can consume the website: llms.txt, markdown mirrors, and the error registry."
source: "strata-core@v1.1.0"
---

The docs have machine-friendly entry points. Use them when an agent needs
product context but should not scrape rendered HTML.

## Indexes

[`/llms.txt`](/llms.txt) is the short index: what Strata is, then the pages an
agent should read first.

[`/llms-full.txt`](/llms-full.txt) is the full documentation corpus in one text
file.

## Markdown mirrors

Append `.md` to a docs URL to get CommonMark:

```text
https://stratadb.org/docs/data/vectors
https://stratadb.org/docs/data/vectors.md
```

Use the page mirror when you already know which topic you need. Use
`llms-full.txt` when you are building a larger offline context pack.

## Error registry

[`/e/`](/e/) lists public runtime error codes. A runtime error envelope also
carries its reference URL, so agents can go from a failed command to the right
recovery page without a search query.

The same registry is available from the binary:

```bash
strata agents errors --json
```

## Related

- [For AI agents](/docs/agents)
- [The command index](/docs/agents/command-index)
- [Error Reference](/docs/reference/error-reference)
