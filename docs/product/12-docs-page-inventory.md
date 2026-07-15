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

### 1 · Why Strata `[N]`
| Page | Action | Source / notes |
|---|---|---|
| `why-strata/index` — what Strata is | new | pull the one-screen framing from the landing hero |
| `why-strata/when-to-use` | new | appropriate uses + honest boundaries (SQLite "Appropriate Uses") |
| `why-strata/comparisons` | new | vs SQLite / DuckDB / Redis / vector DBs (moved out of Resources) |

### 2 · Get Started `[N]`
| Page | Action | Source / notes |
|---|---|---|
| `getting-started/index` | keep | reframe: drop the "why" (now §1) |
| `getting-started/installation` | keep | |
| `getting-started/first-database` | keep | the one-flow first-success |
| `getting-started/quickstart-cli` | new | CLI first-success |
| `getting-started/quickstart-agents` | new | short; links into §7 (full surface there) |

### 3 · Concepts `[N]`
| Page | Action | Source / notes |
|---|---|---|
| `concepts/index` | keep | |
| `concepts/embedded-architecture` | new | in-process, cache vs durable, the SQLite/DuckDB analogy |
| `concepts/primitives` | keep | → "the multi-model data model" |
| `concepts/branches` | keep | |
| `concepts/time-travel` | new | split the read-history story out of branches/commits |
| `concepts/spaces` | move | the *concept* (how-to stays in §6); from `guides/spaces` |
| `concepts/commits` | keep | commits, versions & durability |
| `concepts/durability` | keep | |
| `concepts/value-types` | keep | |
| `concepts/hub-and-clone` | new | StrataHub & clone artifacts |
| `concepts/errors` | new | the `class.area.detail` contract |

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
| `inference/index` (the inference model) | move | from `guides/inference` |
| `inference/chat` · `embeddings` · `reranking` | new | split from the guide as it grows |
| `inference/local-models` | new | pull/cache/runtime; the `[cuda]` companion note |
| `inference/providers-and-keys` | new | BYOK; reuse `guides/*` key content |
| `inference/tools-structured-outputs` | new | |
| `inference/autoembedding` | new | bridges into §4 Combining |

### 6 · Guides `[N]` — cross-cutting only
| Page | Action | Source / notes |
|---|---|---|
| `guides/index` | keep | reframe: cross-cutting how-to only |
| `guides/branching-workflows` | keep | from `guides/branch-management` |
| `guides/time-travel` | new | historical-read patterns |
| `guides/cloning-datasets` | keep | |
| `guides/configuration` | keep | from `guides/database-configuration` |
| `guides/error-handling` | keep | |
| `guides/observability` | keep | |
| `guides/import-export` | keep | from `guides/arrow` |
| `guides/spaces` | keep | the how-to (concept → §3) |
| `guides/deploying` | new | in-app · edge · wasm/browser |
| `guides/migrating` | new | from SQLite / DuckDB / Redis |
| ~~`guides/kv-store` … `graph`, `inference`, `agents-and-mcp`~~ | move | → §4 / §5 / §7 |

### 7 · For AI Agents `[N]`
| Page | Action | Source / notes |
|---|---|---|
| `agents/index` — how agents use Strata | move | from `getting-started/for-agents` + `guides/agents-and-mcp` |
| `agents/mcp-server` | move | from `reference/mcp` + `guides/agents-and-mcp` |
| `agents/machine-docs` | new | llms.txt · llms-full.txt · `.md` mirrors · copy-as-markdown |
| `agents/command-index` | new | the published spec / IDL |
| `agents/agents-guide` | new | `stratadb.agents_guide()` + `strata agents guide` |

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

### 9 · Architecture `[N]` — **rebuild all for V1** (currently v0.12.5)
| Page | Action | Source / notes |
|---|---|---|
| `architecture/index` (layered stack) | rebuild | fix the "7 crates" claim → core→storage→engine→intelligence→inference |
| `storage-engine` · `durability-and-recovery` · `concurrency-model` | rebuild | |
| `storage-format-spec` | new | frozen at M3, golden vectors |
| `crate-structure` · `version-semantics` · `error-propagation` · `boundary-conditions` · `concurrency-invariants` · `durability-modes` | rebuild | consolidate as needed |
| `kv-` · `json-` · `event-` · `vector-` · `branch-primitive` | rebuild | per-primitive internals |
| `graph-primitive` | new | the fifth primitive was never documented |
| ~~`state-primitive`~~, ~~`session-transaction-completeness`~~ | retire | features removed in V1 |

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
