---
title: "Cookbook"
section: "cookbook"
description: "Task-oriented recipes for building agent systems on Strata."
source: "strata-core@v1.1.0"
---

Cookbook pages are small workflows built from ordinary Strata commands. They are
useful when you already know the model and want a pattern to adapt.

The recipes use durable database directories so each command can reopen the same
state. `--cache` is single-process and in-memory, so it is not the right target
for a multi-step shell recipe.

- [A/B Testing with Branches](/docs/cookbook/ab-testing-with-branches)
- [Agent State Management](/docs/cookbook/agent-state-management)
- [Deterministic Replay](/docs/cookbook/deterministic-replay)
- [Multi-Agent Coordination](/docs/cookbook/multi-agent-coordination)
- [RAG with Vectors](/docs/cookbook/rag-with-vectors)

Use [Working with Data](/docs/data) for primitive selection and
[Reference](/docs/reference) for exact command syntax.
