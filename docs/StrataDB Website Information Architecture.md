# StrataDB Website Information Architecture

## 1. Product Landing Page

### Goal

A developer should understand what StrataDB is, why it is interesting, and how to try it within 20–30 seconds.

The landing page should optimize for:

**Understand → Believe → Try**

It should not attempt to teach the entire Strata architecture.

Target length: approximately **5–6 major sections**.

---

## Section 1: Hero

### Primary message

**An embedded database you can fork.**

Supporting message:

StrataDB is an embedded database for AI applications. Give agents, experiments, and risky changes isolated database branches, then inspect, merge, or discard the result.

### CTAs

Primary:

**Try Strata**

Secondary:

**Install Strata**

Tertiary:

**GitHub**

### Supporting proof strip

Keep this concise:

**Embedded · Branchable · Versioned · Multi-model · Open source**

The hero should communicate the product rather than explain the architecture.

---

# Section 2: Show the Breakthrough

This should be the centerpiece of the landing page.

### Headline

**Fork the whole database. Not the data.**

Show a simple visual or interactive demonstration:

```text
main
 │
 ├── agent-run
 │     + new events
 │     + vectors
 │     ~ changed state
 │
 └── main remains untouched
```

Then:

**Compare → Merge → Discard**

Technical proof can appear as one short line:

**Branches are O(metadata), not O(data).**

The purpose of this section is to make the visitor understand that Strata branching is fundamentally different from copying a database.

---

# Section 3: Show What Branching Enables

Do not introduce many architectural concepts here.

Instead show four recognizable jobs:

### Agent Runs

Give every run its own persistent state.

### Experiments

Try changes without touching canonical state.

### Replay & Debugging

Return to exactly what the application or agent saw.

### Local AI Applications

Keep application state, events, embeddings, and relationships together.

End with:

**Why does AI application state need a different database? →**

This links to the deeper positioning page.

---

# Section 4: Five Data Models. One History.

Show the five primitives visually:

**KV · JSON · Events · Vector · Graph**

Then one concise statement:

> They share the same branches, commits, snapshots, durability, and history.

The important message is not that Strata supports five APIs.

The important message is:

**Your application state branches together.**

Avoid detailed descriptions of every primitive.

Those belong in documentation.

---

# Section 5: Built for AI-Native Development

Combine several related capabilities rather than creating individual homepage sections for each.

### Message

**Built for humans and agents.**

Show representative capabilities:

**CLI · Python · MCP · OpenAPI · Agent Skills**

Potential supporting statement:

> One operation model across every interface, with structured errors agents can understand and act on.

Then a small second message:

**Runs with your application. No database server required.**

This communicates both agent-native interfaces and embedded deployment without requiring two separate sections.

Inference may be mentioned here as a capability but should not receive its own homepage section.

---

# Section 6: Proof + Conversion

The final section should establish credibility without forcing the reader through a systems engineering lecture.

### Headline

**A real database engine, built in the open.**

Show a small number of concrete proof points:

- Apache 2.0
- crash and fault-injection testing
- stable storage and error contracts
- checksum-verified releases
- published benchmarks
- documented internals

Provide two exploration paths:

**Why Strata →**

**Explore the Internals →**

Then finish with the primary conversion:

### Fork your first database.

**Try Strata**

**Install Strata**

---

# 2. Why Strata Page

Recommended URL:

`stratadb.org/why-strata`

This page should make the **strategic and architectural argument for the product**.

Someone reading this page is saying:

> “Interesting. Convince me this is actually a new database category and not SQLite plus vectors.”

The page can therefore be longer and more opinionated.

---

## Section 1: The Thesis

### AI applications create a different kind of state.

Traditional applications generally operate against one canonical world.

Agents frequently:

- explore alternatives
- perform speculative actions
- create intermediate state
- use tools
- generate events
- maintain memory
- retrieve embeddings
- build relationships
- abandon unsuccessful paths

The database model should reflect this behavior.

---

# Section 2: The Embedded Database Pattern

Explain the historical pattern:

Server databases and embedded counterparts have repeatedly emerged.

Examples can illustrate the idea:

Relational systems → SQLite

Analytical systems → DuckDB

Then introduce the thesis:

### AI applications need an embedded database designed around their state model.

StrataDB is intended to occupy that role.

Avoid overstating that "agent state" is already a universally accepted database category.

Present it as the thesis Strata is pursuing.

---

# Section 3: Possible Worlds

This should provide the conceptual explanation behind database branching.

An agent should be able to create:

**World A**

**World B**

**World C**

without mutating canonical application state.

Each world may include:

- KV state
- JSON documents
- events
- vectors
- graph relationships

Then one can be merged into canonical state.

This is the deeper explanation of why database-level branching matters.

---

# Section 4: Why One Storage Substrate Matters

Explain that Strata is not five databases.

All five data models operate over the same:

- branch model
- MVCC semantics
- commits
- snapshots
- history
- durability system

The key statement:

### Five data models. One state model.

This section can go deeper than the homepage.

---

# Section 5: Why Embedded Matters

Explain why agentic and AI applications often benefit from embedded infrastructure:

- zero database server deployment
- low-latency local access
- local-first applications
- edge deployment
- portable application environments
- easy developer onboarding
- isolated execution environments

Position this as another architectural property rather than merely convenience.

---

# Section 6: Why Agent-Native Matters

Explain that AI software increasingly acts as an operator of infrastructure.

Traditional database interfaces assume humans interpret:

- documentation
- error strings
- retry semantics
- partial failures

Strata instead aims to make those contracts machine-readable.

Discuss:

- generated interfaces
- stable error codes
- explicit retry behavior
- explicit commit outcomes
- MCP
- machine-readable documentation
- version-matched agent skills

This is where "built for agents" becomes a technical claim rather than marketing language.

---

# Section 7: When Strata Is the Wrong Database

This should remain prominent.

Examples:

Use PostgreSQL or SQLite when relational semantics and SQL are the primary need.

Use specialized analytical systems for large-scale OLAP.

Use dedicated vector infrastructure when massive vector search is the dominant workload.

Use Redis when networked shared cache semantics are the primary requirement.

This section builds credibility.

The positioning should be:

### Strata is valuable when branching and history apply across heterogeneous application state.

---

# Section 8: Explore Further

Provide clear paths based on visitor intent:

**Try Strata**

For someone ready to experience it.

**Read the Quickstart**

For someone ready to build.

**Explore Internals**

For someone who wants to understand the engine.

---

# 3. Internals Page

`/internals` should remain the technical credibility layer.

Its job is different from `/why-strata`.

### Why Strata

answers:

**Why should this database exist?**

### Internals

answers:

**How did you actually build it?**

Internals should retain deep subjects such as:

- MVCC
- log-structured storage
- branching implementation
- copy-on-write inheritance
- WAL and recovery
- crash invariants
- storage layout
- compaction
- vector indexing
- fault injection
- fuzz testing
- deterministic replay
- benchmarking methodology
- API generation

The homepage should selectively borrow proof points from this page but should not reproduce its content.

---

# Overall User Journey

The website should support three levels of curiosity.

### Level 1: "What is this?"

**Homepage**

An embedded database you can fork.

↓

### Level 2: "Why would I want that?"

**Why Strata**

AI applications create branching, heterogeneous, replayable state.

↓

### Level 3: "Okay, but is this real?"

**Internals**

Here is exactly how the storage engine, recovery model, branching architecture, testing methodology, and performance work.

↓

### Level 4: "I want to use it."

**Playground / Quickstart / Docs**

The user begins building.

---

# Guiding Principle

The homepage should create **curiosity**, not resolve every question.

The Why Strata page should create **conviction**.

The Internals page should create **technical trust**.

The documentation should create **competence**.