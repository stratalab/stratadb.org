---
title: "Cookbook"
section: "cookbook"
description: "Task-oriented recipes for building agent systems on Strata, each verified end to end against the CLI."
source: "strata-core@v1.0.0"
---

Task-oriented recipes for building agent systems on Strata. Each one is a short
sequence of real commands with the exact output you should see. Follow the steps
in order and you land on the same results.

Every recipe writes to a durable database directory (for example `./ab.db`) that
each command reopens. The `--cache` flag is single-process only — separate
invocations do not share an in-memory database — so multi-step recipes keep the
database on disk.

- **[A/B Testing with Branches](/docs/cookbook/ab-testing-with-branches)** — fork one branch per variant, run each in isolation, compare the results.
- **[Agent State Management](/docs/cookbook/agent-state-management)** — hold config in KV, working memory in a JSON document, and an action log in events; inspect earlier state with versioned reads.
- **[Deterministic Replay](/docs/cookbook/deterministic-replay)** — record external inputs in the event log and reconstruct any past state with versioned reads and fork-at-version.
- **[Multi-Agent Coordination](/docs/cookbook/multi-agent-coordination)** — give each agent an isolated branch, share an append-only event journal, and separate runs with spaces.
- **[RAG with Vectors](/docs/cookbook/rag-with-vectors)** — store embeddings in a vector collection and source text in KV, then query and fetch the matching rows.
