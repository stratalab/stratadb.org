---
title: "Machine-readable docs"
section: "agents"
description: "Consume the documentation itself programmatically — llms.txt, a markdown mirror of every page, and the browsable error registry."
source: "strata-core@v1.0.0"
---

The binary describes itself; the **documentation** is machine-readable too. An
agent evaluating or using Strata can load these docs the same way it loads any
other structured source — no scraping of rendered HTML required.

## `llms.txt` — the front door

[`stratadb.org/llms.txt`](https://stratadb.org/llms.txt) is a short, curated index
of the most useful pages, in the [llms.txt](https://llmstxt.org) convention: a
one-paragraph description of what Strata is, then a linked list of the pages an
agent should read first. It is generated alongside the docs, so its links cannot
drift from what exists.

For the whole corpus in one file, [`stratadb.org/llms-full.txt`](https://stratadb.org/llms-full.txt)
concatenates the documentation into a single plain-text document.

## `.md` mirror of every page

Append `.md` to any documentation URL to get that page as clean CommonMark
instead of HTML:

```text
https://stratadb.org/docs/data/vectors        → the HTML page
https://stratadb.org/docs/data/vectors.md      → the same page as markdown
```

The markdown is generated from the same content collection as the HTML, so the
two front doors cannot disagree. This is the fastest way to feed a specific page
into a model's context: fetch the `.md` URL directly.

## The error registry

Every public error code has a page at
[`stratadb.org/e/<code>`](/e/), and the index at [`/e/`](/e/) lists them all. The
same registry is available as JSON straight from the binary
(`strata agents errors --json`; see
[the command index](/docs/agents/command-index)), and each runtime error carries
its `https://stratadb.org/e/<code>` URL in the envelope. An agent that hits an
error can resolve the code to a stable explanation without a web search.

## Putting it together

A typical agent onboarding flow uses all three surfaces:

1. Read [`llms.txt`](https://stratadb.org/llms.txt) to learn what Strata is and
   which pages matter.
2. Fetch the `.md` mirror of the pages it needs.
3. When a call fails, resolve the `/e/<code>` URL from the error envelope.

And from the binary itself: [`strata agents guide`](/docs/agents/agents-guide) for
the prose guide, and [`strata agents commands --json`](/docs/agents/command-index)
for the structured catalog.

## Related

- [For AI agents](/docs/agents) — the section overview.
- [The command index](/docs/agents/command-index) — the binary's structured catalogs.
- [Error reference](/docs/reference/error-reference) — the human-readable error model.
