# Docs Information Architecture — stratadb.org

| | |
|---|---|
| Status | **Draft** (gate: Ani sign-off) |
| Owner | Ani (product) · Claude (drafting) |
| Last updated | 2026-07-14 |
| Upstream | 00-prd.md (personas, dual-loop), 01-ia-content-strategy.md (site nav, agent posture), 09-docs-sourcing-policy.md (reference-vs-narrative), 10-docs-v1-rebuild-plan.md (generation pipeline) |
| Downstream | 10-docs-v1-rebuild-plan.md (page membership re-gated), the docs build |
| Supersedes | **01 §6 "Docs information architecture"** (the five-section `/docs` tree). 01's site-wide IA (domain, primary nav, landing, SEO, agent surface §7) is unchanged. |

---

## 1. What this document owns

The structure of the `/docs` tree only: its top-level sections, the shape within each
section, and the rules that keep it coherent. It does **not** own page prose (authored per
09), reference generation mechanics (owned by strata-core per 09/10), visuals (02), or the
whole-site nav/landing/SEO (01). **No pages are specified here — sections and topics only.**

This document reopens **01 §6** and re-gates **10** (10's page membership must be re-slotted
into the sections below). It is grounded in a two-stream research pass (documentation-IA
frameworks + the live nav trees of SQLite, DuckDB, Redis, PostgreSQL, MongoDB, Turso,
Prisma, Supabase, Stripe, Anthropic, and vector/AI-DB peers) — see §8.

## 2. The decision: evolve, do not restart

The prompt was "everything is stale, start from scratch." The research falsified half of
that premise and it is worth recording why:

- The existing five-section spine — **Get Started → Concepts → Guides → Cookbook →
  Reference** — *is* the recurring "world-class spine." Every exemplar studied reduces to
  some ordering of Get Started → Guides → (per-capability) → Reference, Concepts woven in.
  Throwing it out to reinvent the same shape would be novelty for its own sake.
- The narrative content is **not stale**: it was rebuilt against the 1.0.0 binary (10 Phase
  0, 2026-07-10) and every page carries `source: strata-core@v1.0.0`.
- What *is* stale is narrow and already known: the **hand-written `reference/` pages** (the
  IDL generator now replaces them — strata-core PR #2600, merged) and the **v0.12.5-era
  `/architecture` whitepapers** (they still document the removed `state` primitive and
  public transactions, and omit `graph`).

**Decision (Ani, 2026-07-14): evolve the spine.** Keep the proven progression; make four
high-leverage structural moves the research demands (§4). Do not clean-sheet.

## 3. Top-level sections

The `/docs` tree has nine sections. Order is the reader's journey — quick success, then
understanding, then depth, then lookup — with the agent surface and internals as first-class
destinations rather than footnotes.

```
1  Get Started          install → a real result in <60s
2  Concepts             the mental model + the differentiators, taught
3  Working with Data    one uniform section per primitive + how they combine   ← the restructure
4  Guides               cross-cutting, operational how-to
5  Cookbook             end-to-end, agent-forward recipes
6  Reference            generated from the IDL — a distinct, drift-guarded surface
7  For AI Agents        the machine surface as a destination                    ← new, first-class
8  Architecture         rebuilt V1 internals (the "whitepapers")
9  Resources            FAQ · troubleshooting · comparisons · changelog · roadmap
```

`SECTION_ORDER` (in `src/lib/docsNav.ts`) becomes:
`getting-started → concepts → data → guides → cookbook → reference → agents → architecture
→ resources`.

## 4. The four structural moves (vs. today)

1. **Split per-capability from cross-cutting** (→ §3 "Working with Data"). Today the
   primitives (`kv-store`, `vector-store`, …) are flat guide pages intermixed with
   operational guides (`branch-management`, `spaces`). The research's primary
   anti-fragmentation weapon is a **uniform per-capability template** so all six primitives
   read identically. Per-primitive how-tos move under their primitive; operational how-tos
   stay in Guides.
2. **Add the "Combining primitives" spine** (→ §3). The page a multi-model database lives or
   dies on: without it, Strata reads like six bolted-on databases. Absent today.
3. **Promote the agent surface to a first-class section** (→ §7 "For AI Agents"). Strata's
   primary audience includes coding agents (00 §3). The best agent-facing docs (Cloudflare,
   Pinecone, Stripe) enumerate every machine surface — MCP, llms.txt, `.md` mirrors, the
   spec — in one destination. Strata already ships most of these; they just are not a place
   you can go. This deepens, not contradicts, 01 §7 (which specs the surfaces themselves).
4. **Regenerate Reference from the IDL and rebuild Architecture** (→ §6, §8). Retire the
   seven hand-written reference pages (09 anti-pattern #1); rewrite the whitepapers for V1.

## 5. Section-by-section structure

Topics, not pages. `[G]` = generated from strata-core (09 §1); everything else is narrative
authored here with `source:` frontmatter.

### 5.1 Get Started
Why Strata (one screen) · Installation · Your first database (one flow: open → KV put →
JSON set → vector upsert + query → read) · Quickstart: Python SDK · Quickstart: CLI ·
Quickstart: AI agents. Metric: time-to-first-successful-query. The first page carries a
copy-paste install and a runnable snippet; nothing is gated behind Concepts.

### 5.2 Concepts (Explanation)
Embedded architecture (in-process, no server; cache vs durable; the SQLite/DuckDB analogy) ·
The multi-model data model (five primitives over one branch-aware MVCC store; when to use
which) · Branches · Time travel · Spaces · Commits, versions & durability · The inference
model (local + cloud; autoembedding; derived/shadow state) · StrataHub & clone artifacts ·
Errors & diagnostics (the `class.area.detail` contract).

### 5.3 Working with Data
**Per-primitive template — identical shape for all six:** Overview → How-to guides →
Reference (link to §6). Sections: **Key-Value · JSON documents · Vectors · Events · Graph
· Inference**. Plus **▸ Combining primitives**: RAG · semantic search · knowledge graphs ·
time-travel across primitives · autoembedding pipelines.

### 5.4 Guides (cross-cutting how-to)
Branching workflows (fork · A/B · merge) · Time-travel patterns · Cloning datasets from a
hub · Configuration & tuning (memory budget, buffers, compaction; cache vs durable) · Error
handling · Observability (metrics/health/describe) · Bulk import/export (Arrow/Parquet) ·
Embedding & deploying (in-app, edge, wasm/browser) · Migrating from SQLite / DuckDB / Redis.

### 5.5 Cookbook (end-to-end recipes)
Agent memory across sessions · Multi-agent coordination · RAG over your documents · A/B
testing with branches · Deterministic replay · (grows with real use cases). Agent-forward,
per 00's dual-loop.

### 5.6 Reference `[G]`
Commands, by family (kv · json · vector · event · graph · branch · space · admin · arrow ·
inference) — the 117 generated pages with CLI/wire/Python tabs · CLI reference · Python SDK
reference · Errors (`/e/<code>`, 204 codes) · Configuration keys · Value types / schemas.
All generated; a distinct surface; narrative points in, reference links back out. Never
inlined into a guide or tutorial.

### 5.7 For AI Agents
How agents use Strata (an embedded DB driven via SDK/CLI/MCP) · MCP server (`strata mcp
serve`, the tools, client config) · Machine-readable docs (`llms.txt`, `llms-full.txt`,
per-page `.md` mirrors, "copy as markdown") · The command index & IDL (the published spec)
· `agents_guide` (`stratadb.agents_guide()` + `strata agents guide`) · Building agents on
Strata (patterns; links into §5).

### 5.8 Architecture (rebuilt for V1)
The layered stack (core → storage → engine → intelligence → inference) · Storage engine
(L1–L9, the MVCC KV substrate, segments, compaction) · Durability & recovery · Concurrency
model · Storage format spec · Per-primitive internals (how vectors/graph/etc. layer over
the KV substrate). **Delete** `state-primitive`, `session-transaction-completeness`; **add**
`graph`; fix the "7 crates" claim. SQLite's "Technical & Design" pattern: honest internals,
cleanly separated from reference and advocacy.

### 5.9 Resources
FAQ · Troubleshooting · Comparisons (vs SQLite / DuckDB / Redis / vector DBs — honest
advocacy, cleanly separated per SQLite) · Changelog · Roadmap.

## 6. Rules that keep it coherent

- **Routing rule.** Primitive-specific how-to → under that primitive in §5.3; cross-primitive
  or operational how-to → §5.4 Guides. (Task-based entry, topic-based lookup, layered.)
- **Reference is generated and separate.** One source of truth (the IDL) so it cannot drift;
  narrative cross-links into it, never duplicates it (09 anti-pattern #1).
- **One page, one job** (Diátaxis). No tutorial/how-to/reference/explanation mixing on a page.
- **No empty shelves** (01 §4). The sidebar generator points only at pages that exist; a
  section appears when its first page lands.
- **Consistent per-capability template.** The six primitives are predictable precisely
  because their internal shape is identical.

## 7. Mechanics & open gaps

1. **Sidebar generator needs two-level nesting.** `src/lib/docsNav.ts` groups by top
   directory only; §5.3 needs sub-sections per primitive (`data/vectors/…`). Small change to
   the generator + `SECTION_ORDER`/`SECTION_TITLES`/`PREFERRED`.
2. **Reference comes from the fetch-from-release pipeline** (10 §3, *not yet built*): pull the
   strata-core docs bundle + `command-index.json` from the release tag in `release.json`,
   never from `main`. This is the largest net-new plumbing; strata-core's generator side
   shipped in PR #2600 (117 commands covered, drift-guarded).
3. **Known source gaps:** `configuration-reference` has no machine-readable config-key catalog
   in strata-core yet (flagged in 10 §2); the Python SDK reference waits on the SDK's own
   release + generation.
4. **`/architecture` is a retained collection** (01 §3) that gets rebuilt content, not a new
   collection.

## 8. Research basis (why this shape)

- **Framework:** Diátaxis (tutorials / how-to / reference / explanation) governs *page
  shape*, not site IA — it is "a compass, not a cage." Applied *within* sections here; the
  top level is capability/lifecycle-based, which is how every multi-capability exemplar is
  actually built.
- **The recurring world-class spine:** Get Started → Guides → (per-capability) → Reference →
  SDKs → Operate, Concepts woven in, agent surfaces published alongside — observed across
  SQLite, DuckDB, Redis, MongoDB, Turso, Prisma, Supabase, Stripe, Anthropic, Chroma,
  Pinecone.
- **Patterns adopted:** copy-paste first-success on page one (DuckDB/embedded); uniform
  per-capability template + a "combine capabilities" spine (Redis/Supabase/Chroma —
  anti-fragmentation); generated reference as a distinct, drift-proof surface woven by links
  (Stripe/Prisma); agent surface as an enumerated destination (Cloudflare "Docs for agents").
- **Pitfalls avoided:** reference-as-tutorial; Diátaxis-as-rigid-nav; capability
  fragmentation; generated/narrative drift; orphaned pages; advocacy bleeding into reference;
  no machine surface for agents.

## 9. Status & next steps

1. Sign-off gate: Ani. On sign-off this supersedes 01 §6 and re-gates 10.
2. Then (still structure, not prose): a **per-section page inventory** mapping every page to
   `[G]` generated vs. narrative, and slotting 10's existing pages into these sections.
3. Then: the sidebar-generator change (§7.1), the reference fetch pipeline (§7.2), and
   narrative authoring.

## 10. Open questions

- **Naming.** "Working with Data" vs "Data" vs "Capabilities"; "Concepts" vs "Learn";
  "Cookbook" vs "Recipes." (Recommendation: keep "Concepts"/"Cookbook" — established and
  scannable; "Working with Data" for the umbrella.)
- **Primitive vs. capability framing for Inference.** Inference sits in §5.3 alongside the
  five data primitives, but it is a capability, not a stored primitive. Keep it there for
  discoverability, or split a "Capabilities" umbrella from a "Primitives" umbrella?
- **Comparisons placement.** §5.9 Resources vs. a Get-Started "Why Strata" sub-page vs. both.
