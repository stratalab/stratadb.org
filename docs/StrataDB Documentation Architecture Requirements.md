# StrataDB Documentation Architecture Requirements

## 1. Objective

Redesign the StrataDB documentation experience so that developers can reliably find the information they need without understanding the internal organization of the documentation site.

The new documentation architecture should optimize for four outcomes:

1. A new user can get started quickly.
2. An existing user can find a task-oriented guide without searching through unrelated material.
3. A developer using a specific interface such as Python, CLI, or MCP can navigate directly to the relevant documentation.
4. A developer looking for exact syntax, parameters, errors, or return behavior can find authoritative reference documentation immediately.

The documentation should feel predictable, current, searchable, and technically trustworthy.

---

# 2. Core Documentation Principles

The documentation architecture must follow these principles.

## 2.1 Organize Around User Intent

Users should not need to understand the documentation team's taxonomy before finding information.

The primary documentation structure should answer these user intents:

- Teach me how to start.
- Help me understand how Strata works.
- Help me accomplish a task.
- Help me use Strata through my preferred interface.
- Tell me exactly how an API, command, option, or error behaves.

## 2.2 One Obvious Home Per Document

Every page should have one clear primary location.

If a document could reasonably belong in several top-level categories, either:

- the taxonomy needs adjustment, or
- the page is combining multiple documentation purposes and should be split.

## 2.3 Separate Explanation From Reference

Conceptual explanation and API reference should not be mixed.

For example:

- "How branches work" belongs in Learn.
- "How to merge an experimental branch" belongs in Guides.
- "`strata branch merge` parameters" belongs in Reference.

## 2.4 Prefer Progressive Disclosure

The sidebar should expose categories first, not hundreds of operations.

Users should drill from:

**Reference → CLI → Branches → Merge**

rather than seeing every CLI command simultaneously.

## 2.5 Documentation Must Represent Current Product Behavior

The current documentation must contain one canonical view of the shipping product.

Deprecated, unreleased, or previous-generation functionality must not appear alongside current documentation without explicit version labeling.

## 2.6 One Source of Truth Per Fact

Product facts that can be generated from code or schemas should not be manually duplicated.

Examples include:

- commands
- parameters
- return values
- error codes
- retry semantics
- supported capabilities
- interface availability
- version availability

Reference documentation should be generated from authoritative machine-readable definitions wherever possible.

---

# 3. Top-Level Documentation Architecture

The main documentation navigation should contain five top-level areas:

```text
Get Started
Learn
Guides
SDKs & Tools
Reference
```

`Internals` should remain separate from the normal documentation hierarchy.

Recommended top navigation:

```text
Docs
Internals
Examples
GitHub
```

The exact visual implementation may vary, but Internals should not compete with task-oriented documentation in the primary sidebar.

---

# 4. Get Started

## Purpose

Help a developer experience Strata successfully for the first time.

This section should remain intentionally small.

## Required Structure

```text
Get Started
├── Overview
├── Installation
├── Quickstart
├── Python Quickstart
└── AI Agent Quickstart
```

## 4.1 Overview

The Overview page should answer:

- What is StrataDB?
- What problems does it solve?
- What are the core capabilities?
- What are the five primary data models?
- What are branches?
- Which interface should I use?
- Where should I go next?

It should remain concise.

## 4.2 Installation

There should be one canonical installation page.

Supported methods should be represented as sections or tabs, for example:

```text
Install Script
Homebrew
Python
Build From Source
```

Installation instructions should not be independently maintained across multiple documentation pages.

## 4.3 Quickstart

The main Quickstart should guide the user through one complete Strata workflow:

```text
Install
→ Open database
→ Write data
→ Fork branch
→ Modify branch
→ Compare
→ Merge or discard
```

Target completion time should be approximately five minutes.

## 4.4 Python Quickstart

Provide the same conceptual journey using the Python SDK.

## 4.5 AI Agent Quickstart

Explain how to configure supported coding agents or agent frameworks to understand and operate Strata.

This should include currently supported mechanisms such as:

- agent skills
- machine-readable command descriptions
- MCP, where applicable
- version-matched documentation

Only currently shipped functionality should be shown.

---

# 5. Learn

## Purpose

Teach the mental model and architecture of StrataDB.

This section replaces the current broad "Concepts" category.

## Required Structure

```text
Learn
│
├── How Strata Works
│   ├── Embedded Databases
│   ├── Databases and Storage
│   ├── Branches
│   ├── Commits and Versions
│   ├── Time Travel
│   ├── Spaces
│   └── Durability
│
├── Working With Data
│   ├── Overview
│   ├── Key-Value
│   ├── JSON
│   ├── Events
│   ├── Vectors
│   └── Graphs
│
├── Inference
│   ├── Overview
│   ├── Models
│   ├── Generation
│   ├── Embeddings
│   └── Reranking
│
└── Distribution
    ├── Strata Hub
    └── Cloning Databases
```

## Requirements

Each Learn page should primarily explain:

- what the capability is
- why it exists
- its mental model
- important semantics
- tradeoffs
- relationships to other Strata capabilities

Learn pages should not become exhaustive method or command references.

---

# 6. Working With Data Landing Page

The `Working With Data` section should have a decision-oriented landing page.

It should help users choose the right capability.

Example:

| Need | Capability |
|---|---|
| Store simple values by key | Key-Value |
| Store structured documents | JSON |
| Record immutable activity | Events |
| Search embeddings | Vectors |
| Model relationships | Graph |

The page should explain that these capabilities share the same underlying versioning, branching, and storage semantics.

---

# 7. Guides

## Purpose

Help users accomplish specific outcomes.

Guides should be written as actions rather than product nouns.

For example:

Preferred:

**Merge an Experimental Branch**

Avoid:

**Branch Merge**

## Required Structure

```text
Guides
│
├── Branching Workflows
│   ├── Isolate an Experiment
│   ├── Compare Two Branches
│   ├── Preview a Merge
│   ├── Merge Changes
│   ├── Resolve Merge Conflicts
│   └── Fork From Historical State
│
├── AI & Retrieval
│   ├── Build Semantic Search
│   ├── Build RAG
│   ├── Embed and Store Documents
│   ├── Rerank Search Results
│   └── Use Local Models
│
├── Agent Applications
│   ├── Give Each Agent Run a Branch
│   ├── Persist Agent Memory
│   ├── Record Tool Activity
│   └── Replay an Agent Run
│
├── Data
│   ├── Import Data
│   ├── Export Data
│   ├── Migrate From SQLite
│   └── Combine Data Models
│
├── Operations
│   ├── Configure Strata
│   ├── Inspect Database Health
│   ├── Back Up a Database
│   ├── Recover From Errors
│   └── Debug Performance
│
└── Deployment
    ├── Embed Strata in an Application
    ├── Package Strata With an Application
    └── Run Strata on Edge Devices
```

The final categories should reflect actual product capability.

## Requirement

The existing Cookbook category should be removed.

Recipe-style content should be incorporated into Guides.

---

# 8. SDKs & Tools

## Purpose

Provide interface-specific documentation for developers who already know how they intend to use Strata.

## Required Structure

```text
SDKs & Tools
│
├── Python
│   ├── Overview
│   ├── Installation
│   ├── Opening Databases
│   ├── Key-Value
│   ├── JSON
│   ├── Events
│   ├── Vectors
│   ├── Graphs
│   ├── Branches
│   ├── Time Travel
│   ├── Inference
│   └── Error Handling
│
├── CLI
│   ├── Overview
│   ├── Targeting Databases
│   ├── Interactive Shell
│   ├── Output Formats
│   └── Scripting
│
├── AI Agents
│   ├── Overview
│   ├── Agent Skills
│   ├── Machine-Readable Documentation
│   ├── Command Discovery
│   └── Error Handling
│
├── MCP
│   ├── Overview
│   ├── Setup
│   ├── Clients
│   └── Tool Model
│
└── Foundry
    └── Relevant Foundry Documentation
```

Only shipped interfaces should appear.

Unreleased SDKs or integrations should not appear in the current documentation hierarchy.

---

# 9. Reference

## Purpose

Provide authoritative, exhaustive, predictable product behavior.

Reference documentation should prioritize precision over teaching.

## Required Structure

```text
Reference
│
├── CLI
│   ├── Global Options
│   ├── Database
│   ├── Branch
│   ├── Space
│   ├── Key-Value
│   ├── JSON
│   ├── Events
│   ├── Vector
│   ├── Graph
│   ├── Inference
│   ├── Hub / Clone
│   └── Agents
│
├── Python API
│   ├── Database
│   ├── Key-Value
│   ├── JSON
│   ├── Events
│   ├── Vector
│   ├── Graph
│   ├── Branches
│   └── Inference
│
├── MCP Tools
├── Configuration
├── Error Codes
├── Data Types
├── Storage Format
└── Compatibility & Versioning
```

## Progressive Disclosure Requirement

Individual operations should not appear in the sidebar until their parent category is expanded.

Example:

Default:

```text
CLI
  Branch
```

Expanded:

```text
Branch
  Create
  Diff
  Fork
  List
  Merge
  Preview
  Delete
```

The exact operation list should be generated from the current product schema.

---

# 10. Reference Page Requirements

Each reference operation page should contain, where applicable:

1. Operation name
2. Short description
3. Syntax
4. Parameters
5. Parameter types
6. Required vs optional status
7. Default values
8. Return value
9. Example
10. Error conditions
11. Retry behavior
12. Commit behavior
13. Version introduced
14. Related operations

These fields should be generated from machine-readable product definitions whenever possible.

---

# 11. Internals

## Purpose

Explain how the database engine works.

Internals should answer:

**How is Strata implemented and why should I trust the architecture?**

It should not be part of the primary task-oriented sidebar.

Topics may include:

- MVCC
- storage architecture
- log-structured storage
- copy-on-write branching
- WAL
- recovery
- crash guarantees
- storage layout
- compaction
- indexing
- vector architecture
- concurrency
- fault injection
- fuzzing
- deterministic replay
- benchmark methodology

Internals should link into relevant user documentation where useful, but should remain its own technical depth layer.

---

# 12. Documentation Search

Search should be treated as a first-class navigation mechanism.

## Required Search Metadata

Every page should contain structured metadata such as:

```text
title
description
documentation_type
product_area
interface
version
status
keywords
```

Example:

```yaml
title: Merge Branches
documentation_type: reference
product_area: branching
interface: cli
version: 1.1
status: current
```

## Search Result Grouping

When possible, search results should distinguish between:

- Learn
- Guides
- SDKs & Tools
- Reference

A search for:

`branch merge`

should ideally show:

```text
REFERENCE
strata branch merge

GUIDE
Merge an Experimental Branch

LEARN
How Branch Merging Works
```

rather than returning an undifferentiated list of similarly named pages.

---

# 13. Versioning

Current documentation must never silently mix multiple generations of the product.

## Requirements

If previous-version documentation is retained, it must live under explicit version namespaces such as:

```text
/docs/v1.0/
/docs/v1.1/
```

Older documentation must display a prominent notice:

> You are viewing StrataDB 1.0 documentation. Current version: 1.1.

Current documentation search should prioritize or exclusively search the current release unless the user explicitly requests another version.

Deprecated documentation must not appear as if it describes current behavior.

---

# 14. Content Governance

Before migration to the new documentation architecture, every existing page should be classified.

Required classifications:

### KEEP

Current, correct, and useful.

### REWRITE

Relevant subject, but implementation details or terminology are outdated.

### MERGE

Duplicates or overlaps substantially with another document.

### GENERATE

Should be produced automatically from product schemas or code.

### ARCHIVE

Valid only for an older Strata version.

### DELETE

No longer valuable.

No existing page should be migrated automatically without review.

---

# 15. Canonicalization

The documentation system must enforce one canonical source for each product fact.

## Generated From Product Definitions

Where technically possible, generate:

- commands
- parameters
- valid values
- return shapes
- error codes
- retry rules
- commit outcomes
- capabilities
- supported interfaces
- version availability

## Human-Written Content

Humans should primarily own:

- conceptual explanations
- tutorials
- task-based guides
- migration guidance
- examples
- architectural explanations

This separation should reduce documentation drift.

---

# 16. Documentation Validation

Documentation correctness should become part of CI.

Where practical, CI should validate:

- CLI commands used in examples
- Python examples
- parameter names
- command flags
- supported functionality
- code snippets
- internal links
- version metadata

Documentation examples that depend on the shipping product should be executed against the relevant Strata version when feasible.

A product release should not ship with examples that reference nonexistent commands or APIs.

---

# 17. Navigation Requirements

The sidebar must:

- remain visually compact
- use no more than five primary documentation groups
- retain expansion state where useful
- progressively disclose operation-level pages
- clearly distinguish conceptual, task-oriented, interface, and reference material
- make the user's current location obvious
- expose related pages at the bottom of each document

Users should be able to infer where an answer probably lives before using search.

---

# 18. Page-Level Navigation

Every page should provide appropriate contextual navigation.

Where relevant, include:

**Previous / Next**

and:

**Related documentation**

Example for a branching guide:

```text
Learn: How Branches Work
Reference: strata branch merge
Guide: Resolve Merge Conflicts
```

This allows users to move between explanation, task guidance, and reference without using the sidebar.

---

# 19. Terminology

Product terminology must be canonical and centrally governed.

Terms such as:

- database
- branch
- commit
- space
- snapshot
- KV
- JSON
- events
- vectors
- graph
- inference

must have one current definition.

Removed or deprecated concepts must not remain in current conceptual documentation.

Where terminology changes between releases, old terminology should be documented only in versioned or migration documentation.

---

# 20. Documentation Homepage

The documentation homepage should not simply mirror the sidebar.

It should help users choose a path.

Recommended structure:

### New to Strata?

**Start the Quickstart**

### Learn the Core Model

**Branches · Data Models · Time Travel · Inference**

### Build Something

**Agent Applications · Semantic Search · RAG · Local AI**

### Choose Your Interface

**Python · CLI · MCP · AI Agents**

### Look Something Up

**CLI Reference · Python API · Errors · Configuration**

### Go Deeper

**Internals**

---

# 21. Success Criteria

The documentation redesign should be considered successful if users can reliably answer:

### "How do I install Strata?"

Get Started → Installation.

### "How do branches work?"

Learn → How Strata Works → Branches.

### "How do I merge a branch?"

Guides → Branching Workflows → Merge Changes.

### "What arguments does `strata branch merge` accept?"

Reference → CLI → Branch → Merge.

### "How do I use vectors from Python?"

SDKs & Tools → Python → Vectors.

### "What does this error code mean?"

Reference → Error Codes.

### "How does Strata survive a torn write?"

Internals → Recovery / Storage.

The correct destination should feel obvious without requiring search.

---

# 22. Migration Priorities

## Phase 1: Establish Truth

Before redesigning the navigation:

1. Identify all stale documentation.
2. Remove conflicting current-state documentation.
3. Establish current product terminology.
4. Establish authoritative generated reference sources.
5. Version or archive previous product behavior.

## Phase 2: Rebuild Information Architecture

Implement:

- new top-level hierarchy
- new sidebar
- progressive disclosure
- section landing pages
- URL structure
- redirect mappings

## Phase 3: Reorganize Existing Content

Classify and migrate current pages into:

- Get Started
- Learn
- Guides
- SDKs & Tools
- Reference
- Internals

## Phase 4: Improve Discoverability

Implement:

- structured metadata
- improved search
- related-content navigation
- interface-aware search results
- content-type-aware search results

## Phase 5: Automate Correctness

Generate reference material from authoritative schemas and add documentation validation to CI.

---

# 23. Final Design Principle

The documentation system should make the following contract with the user:

**Get Started** teaches me my first workflow.

**Learn** explains how Strata works.

**Guides** help me accomplish something.

**SDKs & Tools** show me how to use Strata through my chosen interface.

**Reference** tells me exactly what the product accepts and returns.

**Internals** explains how the database engine itself works.

Every new document should fit naturally into one of these categories.

If it does not, the document or the architecture should be reconsidered rather than introducing another top-level documentation category.