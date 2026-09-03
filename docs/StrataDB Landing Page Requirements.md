# StrataDB Landing Page Requirements

## 1. Objective

The StrataDB landing page should explain, within seconds, why StrataDB exists, what makes it different, and why a developer should try it.

The page should not primarily communicate a list of features. It should communicate a coherent product thesis:

**StrataDB is the embedded database for AI applications, differentiated by cheap database branching, versioned state, heterogeneous data primitives, and agent-native interfaces.**

The page should establish three ideas in this order:

1. AI applications create a new kind of application state.
2. StrataDB is designed specifically for that state.
3. The defining capability is that the entire database can be forked, changed independently, inspected, and merged or discarded.

The desired user reaction is:

> “I understand why this exists, I understand what makes it different, and I want to try it.”

---

# 2. Primary Positioning

The landing page should use two layers of positioning.

## Category Positioning

**The embedded database for AI applications.**

This explains what category StrataDB intends to occupy.

## Differentiating Hook

**An embedded database you can fork.**

This should be the most memorable concept on the page.

Branching should be presented as a fundamental property of the database rather than an isolated feature.

The page should make clear that StrataDB is not simply:

- SQLite with vectors
- another vector database
- an agent memory service
- a collection of unrelated database engines
- a hosted database service
- a database with an LLM bolted onto it

Instead, StrataDB provides one versioned storage substrate over which KV, JSON, events, vectors, graph relationships, and agent state can coexist and branch together.

---

# 3. Target Audience

The primary audience is developers building AI-native software.

Priority audiences include:

### Agentic application developers

Developers building autonomous or semi-autonomous agents that maintain state, use tools, generate intermediate work, experiment with possible actions, and require replay or inspection.

### AI application developers

Developers building applications that combine traditional application state with embeddings, events, documents, relationships, model outputs, and inference.

### Local-first and embedded developers

Developers who want a database that lives inside the application rather than requiring a separate database server.

### Developer-tool builders

Developers building coding agents, AI IDEs, autonomous development environments, orchestration systems, experimentation frameworks, or other tools where isolated state and replay are useful.

---

# 4. Core User Journey

The landing page should follow a deliberate narrative.

The visitor should move through these questions:

1. What is StrataDB?
2. Why would an AI application need a different database?
3. What makes StrataDB fundamentally different?
4. What can I store in it?
5. Why is it especially useful for agents?
6. Is it technically credible?
7. Can I try it immediately?

The page should therefore follow this approximate structure:

1. Hero
2. Why AI applications need different state
3. Database branching demonstration
4. Core use cases
5. Five data models on one substrate
6. Versioning and time travel
7. Agent-native interfaces
8. Embedded architecture
9. Inference
10. Technical credibility
11. Strata Hub
12. Installation / final CTA

---

# 5. Hero Section

## Purpose

Communicate what StrataDB is and establish its differentiating concept within approximately five seconds.

## Required Content

Primary headline:

**An embedded database you can fork.**

Supporting text should explain the broader category:

> StrataDB is an embedded database for AI applications. Give agents, experiments, and risky changes their own database branch. Inspect what changed, keep what worked, and discard the rest.

The exact copy can evolve, but the hero must communicate:

- embedded database
- designed for AI applications
- database-level branching
- isolated changes
- merge or discard workflow

## Primary CTA

**Try Strata**

This should launch the browser-based Playground.

The Playground should be the dominant CTA because it has effectively zero adoption friction.

## Secondary CTA

**Install Strata**

## Tertiary CTA

GitHub or Documentation.

## Supporting Proof Points

A compact row may communicate:

- One file
- No server
- Git-style branches
- Time travel
- KV + JSON + Events + Vector + Graph
- Apache 2.0

Avoid overwhelming the hero with detailed feature explanations.

---

# 6. Why AI Applications Need a Different Database

## Purpose

Explain the underlying product thesis before introducing more capabilities.

The section should establish that AI applications generate more complex and exploratory state than traditional applications.

Examples may include:

- agent memory
- tool outputs
- intermediate reasoning state
- events
- embeddings
- relationships
- experiments
- model outputs
- alternate possible actions

The key conceptual distinction should be:

**Traditional applications usually assume one canonical state. AI agents frequently explore multiple possible states.**

StrataDB should be positioned as infrastructure for these possible worlds.

Example concept:

> An agent should be able to try something without mutating the canonical world.

This naturally introduces branching.

---

# 7. Branching Demonstration

## Priority

This is the most important product demonstration on the page.

## Purpose

Create the primary “aha” moment.

The visitor should visually understand:

1. A database exists on the default branch.
2. A branch is created.
3. An agent or application modifies the branch.
4. The original database remains unchanged.
5. The changes can be inspected.
6. The branch can be merged or discarded.

## Required Technical Proof

The page should explicitly communicate:

**Forking is O(metadata), not O(data).**

Creating a branch does not duplicate the database.

Branches should be described as using copy-on-write inheritance.

## Visual Requirement

Prefer an interactive or animated demonstration over static explanatory text.

Conceptual example:

```text
main
 │
 ├── agent-run-42
 │     + 23 events
 │     + 4 vectors
 │     ~ 2 JSON documents
 │
 └── main unchanged

[View Diff]   [Merge]   [Discard]
```

The animation should emphasize that the whole database branches, not merely individual tables or objects.

---

# 8. Core Use Cases

The landing page should translate architecture into recognizable developer problems.

Four recommended use cases:

## Agent Runs

Give every agent run isolated persistent state.

Successful work can be merged. Failed paths can be discarded.

## Experiments

Fork the entire database before trying a new model, workflow, transformation, or application behavior.

Compare results without copying the database.

## Replay and Debugging

Inspect exactly what application state looked like before an error or unexpected agent action.

## Local AI Applications

Keep structured data, embeddings, events, relationships, and application state together without operating multiple services.

The page should prioritize jobs-to-be-done rather than abstract persona names.

---

# 9. Five Data Models, One Storage Substrate

## Purpose

Explain StrataDB's multi-model capability without making it look like five databases bundled together.

The section should feature:

- KV
- JSON
- Events
- Vector
- Graph

The key message should be:

**Five data models. One history.**

Supporting message:

> These primitives do not merely share a process or a file. They share the same branch model, snapshots, commits, durability, and history.

Important concepts to communicate:

- one branch can contain all five data shapes
- one snapshot can observe them consistently
- they version together
- they branch together
- they travel through history together

Avoid presenting the section as a generic feature checklist.

---

# 10. Versioning and Time Travel

## Purpose

Explain that database history is fundamental rather than an optional auditing feature.

The section should communicate:

- writes create versioned state
- previous database states remain addressable
- developers can inspect historical state
- agent activity can be replayed
- failures can be investigated against the state that actually existed at the time

Example message:

**See the database exactly as your agent saw it.**

Potential visual:

```text
Commit 143
Commit 144
Commit 145  ← agent starts
Commit 146
Commit 147  ← unexpected result

[Open database at commit 145]
```

---

# 11. Agent-Native Interfaces

## Priority

High.

This section should make the phrase “built for AI agents” technically concrete.

## Core Message

**StrataDB is designed to be operated by both humans and software agents.**

The page should explain that the same operation definitions drive:

- CLI
- REPL
- SDKs
- MCP
- OpenAPI
- reference documentation

This creates consistent behavior across interfaces.

## Machine-Readable Errors

This should be highlighted.

Errors should be described as carrying structured information such as:

- stable error code
- retry policy
- commit outcome

Example:

```text
E_STORAGE_BUSY

retry: same_request
commit: definitely_not_committed
```

The conceptual message:

> Agents should not have to parse human prose to determine what happened.

This is a highly differentiated part of the product and should appear prominently.

---

# 12. Coding Agent Integration

Show that StrataDB can teach supported coding agents how to use the installed version of the product.

Potential example:

```bash
strata agents skill --write --for all
```

Supported surfaces may include, when actually available:

- Claude Code
- Cursor
- Codex
- MCP-compatible tools

The site must reflect only currently shipped integrations.

Do not advertise SDKs or integrations that have not shipped.

---

# 13. Embedded Architecture

## Purpose

Clarify the operational model.

Key messages:

- no database server required
- runs inside the application
- no network hop for local operations
- suitable for laptops, servers, and edge environments
- application owns the lifecycle of the database

Possible headline:

**The database ships with your application.**

Potential proof strip:

**No daemon · No database server · No account · No network required**

Avoid implying StrataDB cannot later participate in distributed or hosted architectures. This section should describe the embedded deployment model rather than constrain the long-term product.

---

# 14. Inference

Inference should be presented as complementary to the database rather than the reason the database exists.

Avoid the generic claim:

**AI is built in.**

Prefer language such as:

**Inference beside your data.**

or

**One inference interface, local or hosted.**

The section can communicate support for:

- embeddings
- ranking
- generation
- local models
- hosted providers

The message should be that applications can invoke inference through a consistent interface close to their data.

Do not let this section overshadow branching, state, or storage architecture.

---

# 15. Technical Credibility

## Purpose

Answer the skeptical systems developer's question:

**Can I trust this with my data?**

The landing page should expose concrete engineering practices rather than generic reliability claims.

Recommended headline:

**Built like infrastructure.**

or

**Built to survive the ugly stuff.**

Potential proof points:

- crash recovery testing
- fault injection
- torn-write simulation
- reordered writes
- disk-full testing
- interrupted or non-atomic filesystem operations
- randomized concurrency interleavings
- deterministic replay
- fuzz testing
- mutation testing
- sanitizers / Miri
- checksummed releases

Do not expose the entire internal testing matrix on the homepage.

Show several representative examples and provide:

**Explore Strata internals →**

linking to `/internals`.

---

# 16. Recovery Guarantee

Where appropriate, expose a concrete recovery invariant rather than vague statements such as “enterprise-grade reliability.”

The core invariant should be expressed in accessible terms:

> After a crash, recovered state must represent a valid prefix of acknowledged commits.

A developer-friendly explanation can follow:

> StrataDB will never recover a later acknowledged commit while silently dropping an earlier acknowledged commit.

This should link to deeper technical documentation.

---

# 17. Architecture Proof

A lightweight architecture visualization should show:

```text
Application / Agent
        │
        ▼
 CLI · SDK · MCP · OpenAPI
        │
        ▼
   Strata Operations
        │
        ▼
 KV · JSON · Event · Vector · Graph
        │
        ▼
Branch-aware versioned storage engine
        │
        ▼
      Local storage
```

The goal is not to expose implementation detail.

The goal is to visually communicate that the different data primitives sit on one common storage and versioning substrate.

---

# 18. Vector Search Messaging

Vector search should appear as part of the multi-model story.

Do not position StrataDB primarily as a vector database.

A useful technical proof point may be:

**Indexes are acceleration, not truth.**

Explain that exact vector data remains authoritative and derived indexes can be rebuilt.

Detailed HNSW, L0, memtable, compaction, and reranking architecture should remain in `/internals`.

---

# 19. Benchmark Messaging

Do not make performance benchmarks a primary homepage claim until StrataDB has a performance profile the project wants to defend broadly.

Instead communicate transparency:

### Performance you can inspect.

> Our benchmark methodology and current results are published openly.

CTA:

**View benchmarks**

The homepage should avoid selective benchmark claims that could imply universal superiority over established database engines.

---

# 20. Strata Playground

## Priority

Critical.

The Playground should evolve from a command sandbox into the primary interactive onboarding experience.

## Required Experience

A new visitor should be guided through a short workflow.

Recommended progression:

### Step 1 of 4
Write data.

### Step 2 of 4
Fork the database.

### Step 3 of 4
Modify the branch.

### Step 4 of 4
Compare and merge.

The final state should explicitly reinforce the product's differentiation:

> **You just forked an entire database without copying it.**

CTA:

**Install StrataDB**

The visitor should not need prior knowledge of Strata commands to experience the core product concept.

Advanced users should still be able to enter arbitrary commands.

---

# 21. Strata Hub

Strata Hub should be positioned as a supporting capability, not as a competing product concept.

Recommended definition:

**Strata Hub is a catalog of ready-to-use Strata databases.**

Core message:

> Start with useful state instead of an empty database.

Example categories may include:

- agent memory examples
- MovieLens
- GitHub event data
- benchmark datasets
- reference datasets

The homepage should avoid introducing unnecessary brand complexity.

Do not prominently show low download counts while adoption is early.

---

# 22. Product Naming and Architecture

The website should maintain a clear hierarchy.

## StrataDB

The database product.

## Strata

The CLI command and acceptable shorthand for the product.

## Strata Hub

Catalog of cloneable Strata databases.

## Strata Foundry

Visual exploration or development interface, if retained as a distinct product surface.

Each product name should have one consistently stated role.

Avoid forcing new visitors to understand the entire Strata ecosystem before they understand StrataDB.

---

# 23. Documentation Entry Points

The landing page should link to documentation based on user intent.

Recommended entry points:

- Quickstart
- Why StrataDB
- Branching
- Agent integration
- Architecture
- Internals
- API Reference

Avoid sending most new users directly into a large API reference tree.

---

# 24. Documentation Navigation Requirement

The API reference should use progressive disclosure.

Top-level navigation should contain categories such as:

- CLI
- Python
- KV
- JSON
- Events
- Vectors
- Graph
- Branches
- Inference
- Errors

Individual methods or operations should appear after selecting a category.

Search should be the primary mechanism for locating individual API operations.

Do not expose hundreds of individual operation names simultaneously in the primary navigation.

---

# 25. Consistency Requirement

All product surfaces must agree on currently available capabilities.

This includes:

- homepage
- documentation
- GitHub README
- installation instructions
- Playground
- Hub
- package manager pages
- coding-agent instructions

A capability must not be advertised as available on one surface while documented as unreleased elsewhere.

Examples include:

- Node.js SDK
- supported coding agents
- package installation commands
- MCP functionality
- model providers

Ideally, availability information should originate from a shared release manifest or structured product metadata source.

---

# 26. GitHub Requirements

The GitHub repository description should communicate the same product thesis as the website.

Avoid descriptions such as:

**In-memory database built for agents.**

Preferred direction:

> **Forkable embedded database for AI applications. Branches, time travel, KV, JSON, events, vectors, and graphs in one versioned store.**

The repository README should reinforce:

1. what StrataDB is
2. why branching matters
3. how to install it
4. how to experience the branching model quickly

Do not use GitHub stars as a major social proof element while the community is small.

---

# 27. Visual Hierarchy

The page should prioritize conceptual understanding over decorative complexity.

The strongest visual emphasis should appear on:

1. hero proposition
2. branching demonstration
3. primary CTA
4. significant technical differentiators

Feature sections should be clearly grouped.

Related information should remain visually connected.

Elements that behave similarly should look similar.

Advanced technical detail should be progressively disclosed rather than placed directly in the main reading path.

---

# 28. Interaction Principles

The landing page should follow these UX principles.

## Hick's Law

Avoid presenting excessive competing actions.

At most one primary CTA should dominate each section.

## Fitts's Law

Place contextual actions near the objects they affect.

For example, Merge and Discard should appear adjacent to the branch visualization.

## Jakob's Law

Use familiar developer-site conventions for:

- documentation
- copyable commands
- code blocks
- GitHub links
- installation tabs

Novelty should be concentrated in explaining the product, not reinventing common website interactions.

## Proximity and Similarity

Use visual grouping to make architecture and feature relationships obvious.

## Von Restorff Effect

Reserve highly distinctive visual treatment for the most important concept or action.

Do not visually emphasize everything.

## Progressive Disclosure

Deep architectural detail should remain available without overwhelming first-time visitors.

## Goal Gradient

Use visible progression in interactive onboarding experiences.

## Peak-End Rule

Interactive demonstrations should end with an explicit explanation of what the user just accomplished and a strong next action.

---

# 29. Tone

The site should feel:

- technically serious
- ambitious
- developer-native
- concise
- confident
- transparent

Avoid excessive AI marketing language.

Avoid statements such as:

- revolutionary
- next-generation
- enterprise-grade
- AI-powered
- production-ready

unless accompanied by specific evidence.

Prefer precise statements such as:

- forks are O(metadata)
- one snapshot spans all five data models
- errors expose retry and commit semantics
- releases are checksum verified
- crash behavior is fault tested

Technical specificity should create credibility.

---

# 30. Recommended Landing Page Structure

## Section 1: Hero

**An embedded database you can fork.**

Short explanation.

Try Strata / Install / GitHub.

---

## Section 2: Why StrataDB

Explain why agentic applications create branching, heterogeneous, replayable state.

---

## Section 3: Fork the Database

Interactive branch demonstration.

Highlight:

**O(metadata), not O(data).**

---

## Section 4: What This Enables

Agent runs.

Experiments.

Replay/debugging.

Local AI applications.

---

## Section 5: Five Data Models. One History.

KV.

JSON.

Events.

Vector.

Graph.

Explain shared versioning and branch semantics.

---

## Section 6: Time Travel

Show historical state inspection and replay.

---

## Section 7: Built for Agents

Generated interfaces.

Machine-readable errors.

MCP.

Agent skills.

---

## Section 8: Embedded Everywhere

No server.

No network dependency.

Runs with the application.

---

## Section 9: Inference Beside Your Data

Local and hosted model access.

---

## Section 10: Built Like Infrastructure

Crash recovery.

Fault injection.

Deterministic replay.

Fuzzing.

Checksum verification.

CTA to `/internals`.

---

## Section 11: Strata Hub

Clone useful databases and examples.

---

## Section 12: Get Started

Installation tabs for currently supported environments.

Primary CTA:

**Try Strata**

Secondary:

**Install Strata**

Final line should reinforce the central concept:

### Fork your first database.

---

# 31. Success Criteria

The landing page should succeed if a technically sophisticated visitor can answer these questions after approximately 30 to 60 seconds:

**What is StrataDB?**

An embedded database for AI applications.

**What makes it different?**

The entire database can be cheaply forked, independently modified, inspected, merged, or discarded.

**What can it store?**

KV, JSON, events, vectors, and graph relationships over one versioned substrate.

**Why does that matter for AI?**

Agents and experiments frequently need isolated possible states, replayable history, heterogeneous data, and machine-operable interfaces.

**Why should I trust it?**

The engine exposes clear durability semantics and is tested against crashes, filesystem failures, concurrency failures, and corrupted writes.

**How do I try it?**

Immediately in the browser, without creating an account or operating a server.

If the page does not make those answers obvious, additional visual polish should not be considered a substitute for fixing the information architecture.