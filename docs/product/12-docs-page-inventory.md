# Docs Page Inventory & Build Map — stratadb.org

| | |
|---|---|
| Status | **Signed off** (2026-07-14) |
| Owner | Ani (product) · Claude (drafting) |
| Last updated | 2026-07-14 |
| Upstream | 11-docs-information-architecture.md (the 11 sections), 09-docs-sourcing-policy.md (N vs G), 10-docs-v1-rebuild-plan.md (current pages) |
| Downstream | narrative authoring; the fetch/render pipeline (already built) |
| Supersedes | **10's page membership** (the concrete page list; 10's phase mechanics stand) |

---

## 1. What this document owns

Every page in the `/docs` tree, slotted into Doc 11's eleven sections, marked by
**source** and **action** — the concrete work list that unlocks section-by-section
authoring. It does not own prose or nav mechanics (built).

**Source:** `[N]` narrative (hand-written here, `source:` frontmatter) · `[G]`
generated from the strata-core IDL (staged by the fetch-from-release pipeline).

**Action:** `keep` (reuse, light edit) · `move` (relocate from today's tree) ·
`new` (author) · `retire` (delete) · `rebuild` (V1 rewrite of stale content).

Today: 39 narrative pages, 17 stale architecture pages, 125 generated command
pages (10 families). Nothing about the generated families is authored here — they
render from the release bundle (`Doc 11 §7.2`).

## 2. Per-section map

### 1 · Why Strata `[N]` — **done** (wave 5)
| Page | Action | Source / notes |
|---|---|---|
| `why-strata/index` — what Strata is | **done** | one-screen framing from the FAQ (NOT the landing hero — hero overpromises diff/merge/cherry-pick/search, none of which ship) |
| `why-strata/when-to-use` | **done** | good fits + poor fits + honest boundaries, from the FAQ |
| `why-strata/comparisons` | **done** | vs SQLite / DuckDB / Redis / Postgres / vector DBs, at-a-glance table + prose |

### 2 · Get Started `[N]`
| Page | Action | Source / notes |
|---|---|---|
| `getting-started/index` | keep | reframe: drop the "why" (now §1) |
| `getting-started/installation` | keep | |
| `getting-started/first-database` | keep | the one-flow first-success |
| `getting-started/quickstart-cli` | new | CLI first-success |
| `getting-started/quickstart-agents` | new | short; links into §7 (full surface there) |

### 3 · Concepts `[N]` — gaps closed (wave 5)
| Page | Action | Source / notes |
|---|---|---|
| `concepts/index` | **updated** | regrouped into model / history+isolation / organizing / contract; lists all 10 |
| `concepts/embedded-architecture` | **done** | in-process, no-server, one-writer, durable vs cache, the directory-as-a-unit |
| `concepts/primitives` | keep | trimmed the inline Spaces section to a pointer (concepts/spaces is the authority) |
| `concepts/branches` | keep | |
| `concepts/time-travel` | **done** | commit clock, `--as-of` across all five, fork-at-time, retention boundary, commit-vs-event-time |
| `concepts/spaces` | **done** | the *concept* (how-to stays in `guides/spaces`); the two-dimensions model |
| `concepts/commits` | keep | |
| `concepts/durability` | keep | |
| `concepts/value-types` | keep | |
| `concepts/hub-and-clone` | **done** | hub, clone artifacts (replace bundles), provenance via `remote` |
| `concepts/errors` | **done** | the `class.area.detail` contract, recover-by-code, fixed taxonomy, redaction |

**Landing-hero drift flagged:** `src/pages/index.astro` hero tagline claims
"diff, merge, cherry-pick … and search" — none ship in V1. Why-Strata sourced
from the FAQ instead. Hero copy is a marketing-page fix, out of this wave's scope.

### 4 · Working with Data `[N]` — uniform per-primitive; each links to `[G]` §8 reference
| Page | Action | Source / notes |
|---|---|---|
| `data/key-value` (overview + how-to) | move | from `guides/kv-store` |
| `data/json` | move | from `guides/json-store` |
| `data/vectors` | move | from `guides/vector-store` |
| `data/events` | move | from `guides/event-log` |
| `data/graph` | move | from `guides/graph` |
| `data/combining-primitives` | new | RAG · semantic search · knowledge graphs · time-travel across · autoembed |

### 5 · Inference `[N]` — its own section; links to `[G]` §8 `reference/inference`
| Page | Action | Source / notes |
|---|---|---|
| `inference/index` (the inference model) | **done** | moved from `guides/inference`; reframed as capability + catalog + operations + section map |
| `inference/providers-and-keys` | **done** | BYOK; 3 providers, env vars + `strata config set <p>.api_key`, resolution order, acquisition URLs |
| `inference/local-models` | **done** | pull/cache/runtime + local build feature + CPU/`[cuda]` note |
| `inference/chat` · `embeddings` · `reranking` | new | deferred — "split from the guide as it grows"; operations live in `inference/index` for now |
| `inference/tools-structured-outputs` | new | deferred — needs a live-model transcript; the G-series surface (tools/tool_choice/json_schema/logprobs) exists in the CLI |
| ~~`inference/autoembedding`~~ | **deferred** | the feature is **not implemented in V1** (0 refs to autoembed/shadow-vector in engine/intelligence); CLAUDE.md invariants 24–26 reserve the architecture only. Ship the page with the feature. §4 Combining reframed to the explicit embed-then-upsert flow. |

### 6 · Guides `[N]` — cross-cutting only — **done** (wave 6)
| Page | Action | Source / notes |
|---|---|---|
| `guides/index` | **done** | reframed to cross-cutting only; grouped history / operating / moving data / shipping; per-primitive pointer → §4 |
| `guides/branching-workflows` | **done** | renamed from `guides/branch-management` |
| `guides/time-travel` | **done** | historical-read patterns (how-to counterpart to `concepts/time-travel`) |
| `guides/cloning-datasets` | keep | |
| `guides/configuration` | **done** | renamed from `guides/database-configuration` |
| `guides/error-handling` | keep | |
| `guides/observability` | keep | |
| `guides/import-export` | **done** | renamed from `guides/arrow` |
| `guides/spaces` | keep | the how-to (concept now in §3) |
| `guides/deploying` | **done** | embedded model, bundle/clone, wasm/browser (playground is real); edge as an honest direction, not a turnkey recipe |
| `guides/migrating` | **done** | SQLite / DuckDB / Redis via `arrow import` (real path — targets kv/json/vector); no auto schema translation, stated plainly |

All three renames repointed site-wide. `guides/kv-store … graph`, `inference`,
`agents-and-mcp` already moved in waves 2/3/4.

### 7 · For AI Agents `[N]` — **done** (wave 4)
| Page | Action | Source / notes |
|---|---|---|
| `agents/index` — how agents use Strata | **done** | moved from `getting-started/for-agents`; absorbed the guide's overview + onboarding; DB-targeting front and centre |
| `agents/mcp-server` | **done** | moved from `reference/mcp`; merged the guide's MCP walkthrough (handshake + 20-tool table + wire-vs-flag gotcha) |
| `agents/agents-guide` | **done** | `strata agents guide` + `stratadb.agents_guide()` + the `strata_guide` tool — one guide, three front doors |
| `agents/command-index` | **done** | `strata agents commands --json` + `strata agents errors --json` — the machine catalogs = the IDL behind the reference |
| `agents/machine-docs` | **done** | llms.txt · llms-full.txt · `.md` mirrors (append `.md`) · `/e/` registry. NB: **no copy-as-markdown button exists** — the `.md` mirror is the mechanism |

`guides/agents-and-mcp` retired (content split into `agents/index` + `agents/mcp-server`). All 3 old paths (`getting-started/for-agents`, `guides/agents-and-mcp`, `reference/mcp`) repointed site-wide + in `llms.txt`; Reference and Guides landings de-listed MCP/agents.

### 8 · Reference `[G]` (generated — the pipeline renders these)
| Family | Pages | Source |
|---|---|---|
| kv · json · vector · event · graph · branch · space · admin · arrow · inference | **125 commands + 10 family indexes** | `[G]` — from the release bundle |
| `reference/cli` | keep→`[G]` | hand-written until a CLI catalog generates it |
| `reference/error-reference` | keep→`[G]` | pairs with the live `/e/<code>` routes |
| `reference/configuration-reference` | keep | **no generator source yet** (10 §2 gap) |
| `reference/value-type-reference` | keep→`[G]` | from schemars schemas |
| ~~`reference/command-reference`~~, ~~`reference/api-quick-reference`~~ | retire | replaced by the generated family indexes |
| `reference/mcp` | move | → §7 `agents/mcp-server` |
| `reference/index` | keep | Reference landing |

### 9 · Architecture `[N]` — **done** (wave 7): consolidated 17 v0.12.5 pages → 8 V1 whitepapers
| Page (V1) | Action | Source / notes |
|---|---|---|
| `architecture/index` (overview) | **done** | rebuilt to the five-layer stack + "engine owns meaning, storage owns mechanics" + a map |
| `layered-stack` | **done** | the 5 crates, responsibilities, CI-enforced dependency rules (absorbs `crate-structure`) |
| `storage-substrate` | **done** | generic rows, the single MVCC branch-aware primitive, the L1–L9 stack, backend portability (from `storage-architecture.md`; replaces `storage-engine`) |
| `durability-and-recovery` | **done** | StorageMode × DurabilityPolicy (cache/standard/always), WAL halt-on-fsync, deterministic recovery, frozen format (absorbs `durability-modes` + `storage-format-spec`) |
| `commits-and-versioning` | **done** | auto-commit, commit units, per-branch version→timestamp timeline, itemwise batches, no public transactions (absorbs `concurrency-model` + `concurrency-invariants` + `version-semantics`) |
| `data-capabilities` | **done** | one row → six capabilities, the capability contract, graph's dual role, derived state (from `engine-architecture.md`; absorbs the 5 per-primitive pages + the new graph internals) |
| `runtime-modes` | **done** | durable/cache/read-only/IPC + the resource-profile model (absorbs `boundary-conditions`) |
| `errors-and-diagnostics` | **done** | storage mechanics → engine public errors; observability; redaction (replaces `error-propagation`) |
| ~~`state-primitive`~~, ~~`session-transaction-completeness`~~, + 13 other v0.12.5 pages | **retired** | removed features / stale internals; DashMap "ShardedStore", OCC/CAS, bundles all gone |

Consolidated per Doc 12's "consolidate as needed": 17 stale pages → 8 V1 whitepapers,
organized by the five-layer stack rather than the old per-primitive layout. Two
deepest pages (storage-substrate, data-capabilities) written by source-grounded
subagents against `storage-architecture.md` / `engine-architecture.md`; merge/
cherry-pick framing softened to V1's strict-refusal reality (no merge command).

### 10/11 · Resources `[N]`
| Page | Action | Source / notes |
|---|---|---|
| `faq` | keep | |
| `troubleshooting` | keep | |
| `resources/changelog` | new | (or link the site-level `/changelog`) |
| `resources/roadmap` | new | |
| `docs/index` (the `/docs` landing) | keep | reframe to the 11-section overview |

## 3. Summary

| | Count |
|---|---|
| Generated `[G]` (families) | 125 commands + 10 indexes + up to 3 cross-cutting (cli/errors/types) |
| Narrative kept/moved | ~24 existing pages reused (edited or relocated) |
| Narrative new | ~26 pages to author |
| Retire | 4 (`command-reference`, `api-quick-reference`, `state-primitive`, `session-transaction-completeness`) |
| Rebuild | 15 architecture pages |

Net: the generated reference is **done** (renders from the pipeline); the human
work is ~26 new narrative pages + ~15 architecture rewrites + ~24 relocations.

## 4. Build order (authoring sequence)

Sequenced so each wave ships a coherent, linkable slice:

1. **Reference is live already** — merge strata-core #2602, delete the retired
   hand-written pages, done.
2. **Working with Data** (§4) — relocate the 5 primitive guides + author Combining.
   Highest value: pairs narrative with the freshly-live generated reference.
3. **Inference** (§5) — relocate + split the inference guide.
4. **For AI Agents** (§7) — consolidate the agent pages; a differentiator.
5. **Why Strata** (§1) + **Concepts** gaps (§3) — the evaluate/understand front.
6. **Guides** (§6) reframe + the 2 new cross-cutting guides.
7. **Architecture** (§8) rebuild — last; it serves evaluators/contributors, not first-run.
8. **Resources** (§9) — changelog/roadmap.

## 5. Status & next

Sign-off gate: Ani. On sign-off, this is the authoring backlog; each wave is a
shippable slice. `SECTION_ORDER` in `docsNav.ts` extends to the 11 sections as
their first page lands ("no empty shelves", 01 §4).
