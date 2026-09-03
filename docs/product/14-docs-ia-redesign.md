# 14 - Docs IA Redesign: the five-section rebuild

| | |
|---|---|
| Status | **Draft for sign-off** (2026-09-03) |
| Owner | Ani (product) · Claude (drafting) |
| Upstream | `docs/StrataDB Documentation Architecture Requirements.md` (the brief), 09-docs-sourcing-policy.md, 13-world-class-remediation-plan.md (control lock) |
| Downstream | `src/lib/docsNav.ts`, `src/content.config.ts`, `src/content/docs/**`, `astro.config.mjs` redirects, `scripts/verify-*.mjs`, the docs homepage |
| Supersedes | **11** (the eleven-section tree) and **12** (page membership). 09 (sourcing) and 13 (product truth lock) stand. |

---

## 1. What this document owns

The plan of action that takes `/docs` from today's ten-section tree to the
five-section architecture in the brief: the gaps found, the target tree
reconciled to the shipped product, the disposition of every existing page, the
URL and redirect map, the navigation and search mechanics, and the build order.

It does not own page prose. Every page listed below is authored or moved in the
waves of §14, each gated by `npm run check`.

Per the brief §14: **no page is migrated without review**. This document is the
review. Sign-off on it authorizes Waves 1 and 2 (§14); each content wave after
that is a shippable slice.

## 2. Ground truth (audited 2026-09-03)

What the plan rests on. Everything below was checked against the repo, the
`v1.1.1` release assets, the installed `strata 1.1.1` binary, and `stratadb
1.1.1` from PyPI.

**The site today**

| Surface | Count | Notes |
|---|---|---|
| Hand-written docs pages | 66 | ten sidebar sections plus two singles (FAQ, Troubleshooting) |
| Generated command pages | 135 ops + 11 family indexes | staged by `scripts/fetch-docs.mjs` from the release bundle |
| Error pages | 219 | `/e/<code>` from `error-registry.json`; the binary links here |
| Architecture (internals) pages | 8 | separate collection at `/architecture`, not in the docs sidebar |
| Hard-coded narrative `/docs/` links outside content | 6 files | Hero, InstallTabs, docs index, `/e/` pages, playground, plus `llms.txt` (8 links) and `resources/documentation.astro` (7) |

**What the release bundle supplies that the site does not use yet**

- `generated/cli-command-index.json`: the same 135 IDL commands with their
  clap paths (`branch fork-at-version`), no global options, none of the
  shell-only lifecycle commands.
- `generated/schemas/<command>.json`: 135 per-command JSON schemas. Whether
  they carry shared `$defs` (MutationAck, HistoryItem, PromotionStrategy) is
  checked in Wave 1; it decides how much of Reference → Data Types generates.
- `generated/docs/llms.txt`: an agent index we ignore in favor of our own.

**What only the binary knows**

- Shell-only commands with no IDL entry: `init`, `doctor`, `agents
  {guide,commands,errors,init,skill}`, `mcp serve`, `start`, `stop`, `ipc`,
  `remote`, `uninstall`, `command`. Global options: `--db`, `--cache`,
  `--durability standard|always`, `--ipc host|client|off`, `--read-only`,
  `--branch`, `--space`, `--json`, `--raw`.
- The MCP server exposes **20 tools** (18 curated operations plus
  `strata_guide` and `strata_command`). The command index carries an
  `mcp.name` for all 135 commands, so the index alone cannot tell which are
  promoted; `tools/list` is the only truth.
- CI already installs the release binary before building, so build-time
  capture from the binary is a legitimate generator (§12).

**What the Python SDK actually ships** (`stratadb 1.1.1`, introspected)

- `db.branches`: `create, delete, diff, fork, fork_at_timestamp,
  fork_at_version, get, list, merge, preview`. The current
  `python/namespaces` page lists only `list, create, fork, delete`.
- Module-level: `open, from_env, clone, init, agents_guide, agents_skill,
  command_index, mcp_config, filters, PromotionStrategy`, plus a `db.hub`
  namespace. None of `clone`, `init`, `agents_skill`, `hub` is documented.
- Consequence: the Python Quickstart can follow the brief's full journey
  (open → write → fork → change → compare → merge), and SDKs → Python →
  Branches has a real surface to document.

**Machine-readable facts available per command** (from `command-index.json`)

`access` (read/write), `commit` (`none`, `commits_on_success`,
`itemwise_shared_commit`, `chunked_commits`), `wire_status`
(stable/transitional), `pagination`, `batch`, `errors[]` with codes, MCP name,
CLI path, input/output types, fixtures. Per error (`error-registry.json`):
`class`, `retry_policy`, `commit_outcome`, `hint`. **Missing:** a
version-introduced field, a config-key catalog, and a Python API artifact.

## 3. The gaps and issues this plan repairs

Ordered by user impact.

1. **Docs are a click too deep.** The top nav has no `Docs` item; documentation
   sits under Resources → Documentation. The brief's first nav item is Docs.
2. **Ten sections where the brief wants five.** Why Strata, Concepts, Working
   with Data, Inference, Guides, Python SDK, Cookbook, Reference, For AI
   Agents, plus two singles. Intent-based routing (start / learn / do /
   interface / look up) is not expressed by the sidebar.
3. **Explanation and how-to are mixed on the same page.** `concepts/branches`
   walks commands; `data/*` pages are verb walkthroughs titled as concepts;
   `reference/cli` is narrative (it is the SDKs → CLI section, mislabeled).
4. **No per-interface home.** Python has a section, but CLI usage lives in
   Reference, MCP lives under For AI Agents, and agent skills live in Getting
   Started. A developer who has already chosen an interface has nowhere to go.
5. **Reference is flat below the family.** 31 graph operations render as one
   list; sub-families (`graph/ontology`, `vector/collection`, `json/index`)
   exist in the URL but not in the sidebar. Prev/next walks out of Guides
   straight into the Python SDK.
6. **Generated sources are under-used.** The bundle's CLI index and schemas
   are not consumed; MCP tools and CLI global options are hand-described;
   compatibility (`wire_status`) is not surfaced anywhere.
7. **Stale facts.** `python/namespaces` omits merge/diff/preview and the hub
   namespace. `reference/command-reference` and `api-quick-reference` were
   marked "retire" in Doc 12 and still ship. `llms.txt` links the quick
   reference.
8. **No search metadata.** Pagefind indexes title and body only; results
   cannot be grouped by Learn / Guide / SDK / Reference or filtered by
   interface. The brief's `branch merge` example returns an undifferentiated
   list today.
9. **No related-content navigation.** Pages end with hand-written "Next"
   lists of uneven quality; nothing links explanation ↔ task ↔ reference
   systematically.
10. **Terminology drifts.** "primitive", "data shape", "capability", and
    "data model" are used interchangeably; "merge" (CLI verb, homepage) and
    "promote" (generated titles, receipts) name the same operation.
11. **`/internals` is taken by a private pitch page** (sitemap-excluded, with
    placeholder benchmark figures) while the public internals live at
    `/architecture`. The brief and the website IA both name the public layer
    Internals.
12. **Bundle-native links have no redirect.** Generated pages link
    `/docs/<family>/<op>`; the site rewrites them at staging time, but the
    same shape reaches users through `strata agents commands --json` and
    has no route.

The page-level register behind gaps 7 and 11, and the Internals claims that
turned out to be false, is §3.1.

### 3.1 Stale-content register (audited 2026-09-03)

What "establish truth" concretely means. Each item was verified against the
`v1.1.1` workspace on GitHub, the installed binary, the error registry, or
`stratadb 1.1.1`. Lines are current file positions.

**A. Retired concepts explained inside current pages.** The brief §19 allows
old terminology only in versioned or migration documentation. These are
correct statements in the wrong place; they move to Reference →
Compatibility (one "What changed in the 1.x line" section) in Wave 3, and the
host pages lose them.

| Where | What |
|---|---|
| `concepts/commits.md` 33–42 | "No manual transactions": the old `begin`/`commit`/`rollback` verbs, with a transcript of `begin` being refused |
| `concepts/primitives.md` 53 | "There is no general-purpose state cell primitive" |
| `concepts/hub-and-clone.md` 32–37 | "Clone artifacts, not bundles": the retired branch-bundle export |
| `faq.md` 74–95 | "What changed": state cell, sessions/transactions, bundles, search |
| `cookbook/agent-state-management.md` 77 | "rollback-style inspection with no rollback" (reword) |
| `architecture/commits-and-versioning.md` 7, 18–22, 53–65 | "no begin/commit/rollback", "why no manual transactions", "if a future decision introduces a public transaction". Keep the design rationale, drop the removal framing |
| `architecture/data-capabilities.md` 43, 110–118 | "not public transaction sessions", "Commits, not sessions" |

**B. Unshipped or removed architecture presented as current.** These are
false claims about the engine and are fixed in Wave 1, before any move.

| Where | What | Truth |
|---|---|---|
| `architecture/index.md` 10, 25 · `layered-stack.md` 11, 37–41, 52, 55 · `storage-substrate.md` 7 | An `intelligence` crate and layer that "owns retrieval orchestration: query expansion, reranking, RAG, and provenance"; the stack drawn as core → storage → engine → intelligence → inference | The `v1.1.1` workspace has no `intelligence` crate. Members: `core, storage, engine, executor, inference, cli, wasm, gpu-cache, stratadb, hub`. Executor, hub, wasm, gpu-cache, and the Python crate are not mentioned at all. Redraw the stack from the real workspace. |
| `architecture/data-capabilities.md` 39–41, 150–165, 168–175 | Derived state listed as "search indexes … shadow vectors, and recipe outputs"; "the shadow-vector mechanism exists"; retrieval as "BM25 indexing, recipe resolution … engine services" over "the control plane's recipes" | `search` and `recipe` are deferred past this line (Doc 10) and the CLI refuses `search`; `crates/engine/src` at `v1.1.1` has no search, recipe, retrieval, or shadow module. Cut to what ships: vector ANN indexes, JSON indexes, graph projections. |
| `architecture/runtime-modes.md` 39 · `data-capabilities.md` 48 | "a Strata AI assistant" as the IPC peer; "Strata AI" as an upper layer | No such surface. Use "an agent process or the MCP server". |

**C. Error-code facts.** Docs and binary agree; the registry does not.

| Where | What | Action |
|---|---|---|
| `agents/index.md`, `agents/command-index.md`, `agents/mcp-server.md`, `guides/error-handling.md`, `troubleshooting.md` | Quote `invalid_argument.cli.no_database` | The binary emits it (verified). It is absent from the 219-code registry, so `/e/invalid_argument.cli.no_database` returns 404. Upstream: export CLI-area codes. Site: `verify-codes-inline` (§12). |
| `inference/*.md`, `python/inference.md` | Quote `inference.missing_api_key` and 17 other two-part codes | They are in the registry in that shape, while `concepts/errors.md` and `guides/error-handling.md` promise `class.area.detail` for every code. Upstream: normalize. Site: Compatibility notes the exception until then. |
| Python SDK | `db.state` raises `unsupported.sdk.state_removed` | Not in the registry; its `/e/` link 404s. Upstream: export SDK-area codes. |

**D. Version literals in page bodies** (policy 09 §2 forbids them; `verify-versions` checks only frontmatter).

| Where | What | Action |
|---|---|---|
| `concepts/branches.md` 67 · `data/json.md` 96 · `data/events.md` 86 · `data/graph.md` 102 · `data/combining-primitives.md` 82 · `getting-started/first-database.md` 157 | "In `v1.1.1`, merge applies key-value, JSON, and vector changes …" repeated six times | State the merge scope once in Compatibility and in the Learn Branches page as "in this line"; `verify-version-literals` bans `x.y.z` in prose. |
| `python/index.md` 15 | "`stratadb` `1.1.0` is the V1 line … wheels are rolling out to PyPI" | Stale on two counts (1.1.1 is on PyPI). Rewrite. |
| `why-strata/when-to-use.md` 42 · `index.md` 54 | "not part of `v1.1.1`", "generated from the `strata-core v1.1.1` release bundle" | Reword; the release badge in the layout carries the version. |
| `getting-started/installation.md` 23, 53 · `guides/observability.md` 27, 35, 57, 148, 164 · `guides/deploying.md` 45 | Real transcript output (`pong 1.1.1`, `"version": "1.1.1"`) and a `STRATA_VERSION=1.1.1` pin | Legitimate only while verified: extend `verify-transcripts` to every fenced transcript in docs (today it covers the homepage only), or template the version at build. |

**E. Stale install and contributor facts.**

| Where | What | Truth |
|---|---|---|
| `README.md` 60 · `scripts/verify-transcripts.mjs` 4 | "`cargo install strata-cli`" as the way to get the binary; "Rust/Cargo" listed as a requirement | `strata-cli` is not on crates.io (404, verified). CI installs through `install.sh` with `STRATA_VERSION`; the README should say so. |
| `src/pages/specimen.astro` 157 | Badge "Research preview · v0.12" | Design specimen, sitemap-excluded. Delete the badge. |
| `src/pages/internals/index.astro` | "five crates", illustrative benchmark figures, "AI era" H1 | Private today. Audit before any of it seeds public Internals (Decision 1). |
| `python/namespaces.md` 17–22 | Branch namespace listed as `list, create, fork, delete`; no `hub` namespace | SDK ships `diff, preview, merge, fork_at_*, get` and `db.hub`, plus module-level `clone`, `init`, `agents_skill`. |

**F. Verified clean**, so the sweep is not repeated: every `db.<ns>.<method>`
and `stratadb.<fn>` in fenced Python (docs and site source) resolves against
`stratadb 1.1.1`; all 16 documented exception classes exist and none are
missing; every `strata <family> <verb>` path in docs and site source resolves
against the binary, including `config show/set/unset/path` and `event by-type`
which the IDL index lacks; no Node SDK or other unshipped-interface snippets
exist; the homepage sections carry no cherry-pick, search, or "six" claims.
The state cell survives only as the negative mentions in A and the SDK's own
removal error in C.

## 4. The decision in one screen

```
Today (10 + 2)                          Target (5) + Internals
──────────────────────────────          ─────────────────────────────────────
Why Strata                              Get Started
Getting Started                           Overview · Installation · Quickstart
Concepts                                  Python Quickstart · AI Agent Quickstart
Working with Data                       Learn
Inference                                 How Strata Works · Working With Data
Guides                                    Inference · Distribution
Python SDK                              Guides
Cookbook                                  Branching & History · AI & Retrieval
Reference                                 Agent Applications · Data
For AI Agents                             Operations · Deployment
FAQ · Troubleshooting                   SDKs & Tools
                                          Python · CLI · AI Agents · MCP
/architecture (8 pages)                 Reference
/internals (private pitch)                CLI · Commands · MCP Tools · Configuration
                                          Error Codes · Data Types · Compatibility
                                        ─────────────────────────────────────
                                        /internals (public, 8 pages, grows)
```

Directory keys and URL prefixes: `get-started/`, `learn/`, `guides/`,
`sdks/`, `reference/`. Groups are directories too, so the URL states the
location (`/docs/learn/how-it-works/branches`) and the sidebar is generated
from the tree with no hand-kept ordering lists beyond `order:` frontmatter.

Items marked ⁺ below are additions to the brief's tree, each justified by a
shipped capability with no other home. Items marked ⏸ are deferred with the
reason stated. The brief's own rule applies: "the final categories should
reflect actual product capability."

## 5. Target tree, page by page

Legend for **Source**: `KEEP` reuse with light edits · `REWRITE` same subject,
reshaped · `SPLIT` one page becomes several · `MERGE` several become one ·
`NEW` authored · `GEN` generated. Old paths are relative to `src/content/docs/`.

### 5.1 Get Started (`get-started/`)

| Page | Title | Source |
|---|---|---|
| `index` | Overview | MERGE `getting-started/index` + `why-strata/index` + the good-fit summary of `why-strata/when-to-use`. Answers the brief §4.1 list in one screen. |
| `installation` | Installation | KEEP `getting-started/installation`; add a **Python** tab (`pip install stratadb`) so it is the one canonical install page. SDK-specific matters (wheels, GPU extra, typing) stay on `sdks/python/installation`. |
| `quickstart` | Quickstart | KEEP `getting-started/first-database`, retitled. Already runs open → write → fork → change → compare → preview → merge → read the past. Trim "Inspect the database" to a pointer. |
| `python-quickstart` | Python Quickstart | REWRITE from `python/index` §Quickstart to follow the same journey with `db.branches.fork/diff/preview/merge` (verified). |
| `agent-quickstart` | AI Agent Quickstart | KEEP `getting-started/quickstart-agents`. Skill install, rules, MCP handoff, Python entry points. |

### 5.2 Learn (`learn/`)

`learn/index` is the section landing (REWRITE from `concepts/index`).

**How Strata Works** (`learn/how-it-works/`)

| Page | Title | Source |
|---|---|---|
| `embedded-databases` | Embedded Databases | KEEP `concepts/embedded-architecture` §In-process; the SQLite/DuckDB pattern. |
| `databases-and-storage` | Databases and Storage | SPLIT `concepts/embedded-architecture` (§Two modes, §Where your data lives) + `concepts/primitives` §One substrate + a summary of `architecture/runtime-modes` (durable / cache / read-only / IPC). |
| `branches` | Branches | REWRITE `concepts/branches`: keep the model and safety rules, drop the command steps (they move to Guides). |
| `commits-and-versions` | Commits and Versions | KEEP `concepts/commits`. |
| `time-travel` | Time Travel | KEEP `concepts/time-travel`. |
| `spaces` | Spaces | KEEP `concepts/spaces`. |
| `durability` | Durability | KEEP `concepts/durability`. |
| `errors` ⁺ | Errors and Retries | KEEP `concepts/errors`. The coded-error contract is a core capability; the lookup lives in Reference → Error Codes. |

**Working With Data** (`learn/data/`)

| Page | Title | Source |
|---|---|---|
| `index` | Overview | MERGE `data/index` + `concepts/primitives` (§five, §choosing) + `concepts/value-types` §The through-line. The decision table from the brief §6, then "what carries across". |
| `key-value` | Key-Value | REWRITE `data/key-value` into Learn shape (what, why, model, semantics, tradeoffs) with one representative example per operation class; absorbs its `value-types` section. Exhaustive verbs point to Reference. |
| `json` | JSON | REWRITE `data/json`, same treatment. |
| `events` | Events | REWRITE `data/events`. |
| `vectors` | Vectors | REWRITE `data/vectors`. |
| `graph` | Graph | REWRITE `data/graph`. |

**Inference** (`learn/inference/`)

| Page | Title | Source |
|---|---|---|
| `index` | Overview | REWRITE `inference/index`: the capability model (compute over your data; local and cloud routes). |
| `models` | Models | NEW from `inference/index` §Model specs + §Inspect before running and `inference/local-models` §Model cache: identifiers, capability inspection, local vs cloud, cache. |
| `generation` | Generation | NEW, short. What `generate` does, model requirements, where the facts live. |
| `embeddings` | Embeddings | NEW, short. Dimensions, model pairing with vector collections. |
| `reranking` | Reranking | NEW, short. `rank` over candidates; when it beats a bigger `k`. |

**Distribution** (`learn/distribution/`)

| Page | Title | Source |
|---|---|---|
| `strata-hub` | Strata Hub | SPLIT `concepts/hub-and-clone` §What a hub is + §Clone artifacts. |
| `cloning-databases` | Cloning Databases | SPLIT `concepts/hub-and-clone` §Cloning + §Provenance + §How it composes. |

### 5.3 Guides (`guides/`)

`guides/index` is the landing (REWRITE from `guides/index` + `cookbook/index`).
Titles are actions. The Cookbook is removed; all five recipes have homes below.

**Branching & History** (`guides/branching/`) - the brief's "Branching
Workflows", renamed ⁺ to hold the two history guides that had no other home.

| Page | Title | Source |
|---|---|---|
| `isolate-an-experiment` | Isolate an Experiment | SPLIT `guides/branching-workflows` (§Fork, §Isolation, §Delete) + MERGE `cookbook/ab-testing-with-branches`. |
| `compare-two-branches` | Compare Two Branches | SPLIT `guides/branching-workflows` §Compare (`branch diff`). |
| `preview-a-merge` | Preview a Merge | SPLIT §preview. |
| `merge-changes` | Merge Changes | SPLIT §promote + `concepts/branches` §Compare before you promote. Strategies `strict` and `source_wins`; KV/JSON/vector merge, events and graph never do. |
| `resolve-merge-conflicts` | Resolve Merge Conflicts | NEW. `conflict.engine.promotion` → diff → fix on the fork or `--strategy source_wins`; what each overwrites. |
| `fork-from-historical-state` | Fork From Historical State | SPLIT `guides/time-travel` §Reproduce + `concepts/time-travel` §Forking at a point in time; `fork-at-version`, `fork-at-timestamp`. |
| `read-historical-state` ⁺ | Read Historical State | MOVE the rest of `guides/time-travel` (§Capture, §Read as of, §History, §Audit, §When history runs out). |

`guides/branching-workflows` §List / §Read one / §Create empty / §Refusals go
to the Learn Branches page and the generated `branch` family index.

**AI & Retrieval** (`guides/ai-retrieval/`)

| Page | Title | Source |
|---|---|---|
| `build-semantic-search` | Build Semantic Search | NEW from `data/vectors` §Query/§Filter + `cookbook/rag-with-vectors` §1–3: embed the query with `inference embed`, `vector query` with filters. |
| `build-rag` | Build RAG | REWRITE `cookbook/rag-with-vectors`; add the `inference generate` step it stops short of. |
| `embed-and-store-documents` | Embed and Store Documents | NEW from `data/combining-primitives` §Documents plus vectors + `cookbook/rag-with-vectors` §2 and §Generating real embeddings. |
| `rerank-search-results` | Rerank Search Results | NEW from `inference/index` (rank) + `python/inference` §Reranking. |
| `use-local-models` | Use Local Models | MOVE `inference/local-models`. |
| `use-cloud-providers` ⁺ | Use Cloud Providers | MOVE `inference/providers-and-keys`. A distinct task ("use OpenAI embeddings through Strata"), not configuration. |

**Agent Applications** (`guides/agents/`)

| Page | Title | Source |
|---|---|---|
| `give-each-run-a-branch` | Give Each Agent Run a Branch | REWRITE `cookbook/multi-agent-coordination`: branch per agent or run, spaces per whole run, shared journal. |
| `persist-agent-memory` | Persist Agent Memory | MOVE `cookbook/agent-state-management`. |
| `record-tool-activity` | Record Tool Activity | NEW from `cookbook/deterministic-replay` §1 + `cookbook/multi-agent-coordination` §4: events as the tool journal, `event verify-chain`. |
| `replay-an-agent-run` | Replay an Agent Run | MOVE `cookbook/deterministic-replay` §2–4. |

**Data** (`guides/data/`)

| Page | Title | Source |
|---|---|---|
| `import-data` | Import Data | SPLIT `guides/import-export` §Importing. |
| `export-data` | Export Data | SPLIT `guides/import-export` §Exporting. |
| `migrate-from-sqlite` | Migrate From SQLite | REWRITE `guides/migrating`: SQLite first-class, DuckDB and Redis as a closing section. |
| `combine-data-models` | Combine Data Models | MOVE `data/combining-primitives`. |
| `clone-a-dataset` ⁺ | Clone a Dataset From Strata Hub | MOVE `guides/cloning-datasets`. The brief's tree has no clone task; the product does. |
| `organize-with-spaces` ⁺ | Organize Data With Spaces | MOVE `guides/spaces`. |

**Operations** (`guides/operations/`)

| Page | Title | Source |
|---|---|---|
| `configure-strata` | Configure Strata | MOVE `guides/configuration`. |
| `inspect-database-health` | Inspect Database Health | MOVE `guides/observability`. |
| `back-up-a-database` | Back Up a Database | NEW from `guides/deploying` §Copy the directory as a unit + export as a portable backup. Facts to verify in Wave 1: copy only with no owner process; WAL state. |
| `recover-from-errors` | Recover From Errors | MOVE `guides/error-handling`. |
| `troubleshoot-failures` ⁺ | Troubleshoot Common Failures | MOVE `troubleshooting` (doctor, install, open, pre-V1, recovery). Different job from the coded-error guide. |
| `debug-performance` ⏸ | Debug Performance | NEW, gated. Material exists (`--durability standard/always`, cache mode, batch verbs with `itemwise_shared_commit` / `chunked_commits`, `metrics`) but ships only with verified transcripts. |

**Deployment** (`guides/deployment/`)

| Page | Title | Source |
|---|---|---|
| `embed-in-an-application` | Embed Strata in an Application | SPLIT `guides/deploying` §Seed in your release build + §Expose it to an agent + in-process use via the SDK. |
| `package-with-an-application` | Package Strata With an Application | SPLIT `guides/deploying` §Copy as a unit + §Container + §Clone at first run. |
| `run-in-the-browser` ⁺ | Run Strata in the Browser | SPLIT `guides/deploying` §In the browser (wasm, cache mode, the playground). |
| ⏸ Run Strata on Edge Devices | | Deferred. The current page says small-footprint tuning is "an active direction rather than a turnkey recipe." No page until a verified target exists. |

### 5.4 SDKs & Tools (`sdks/`)

`sdks/index` is the landing (NEW: choose your interface; absorbs `faq` §SDKs
and MCP). **Foundry is omitted**: frozen per Doc 13's control lock, and the
brief admits only shipped interfaces.

**Python** (`sdks/python/`)

| Page | Title | Source |
|---|---|---|
| `index` | Overview | REWRITE `python/index` (overview + how it is built + the namespace table from `python/namespaces`); the quickstart moves to Get Started. |
| `installation` | Installation | KEEP `python/installation`. |
| `opening-databases` | Opening Databases | SPLIT `python/index` (open, `from_env`, `cache=True`, context manager, close) + `python/namespaces` §db.at(). |
| `key-value` | Key-Value | SPLIT `python/namespaces` (§Values are bytes, §Misses, §Pagination) + NEW verified snippets. |
| `json` | JSON | SPLIT + NEW. |
| `events` | Events | NEW. |
| `vectors` | Vectors | SPLIT `python/namespaces` §Filters + NEW. |
| `graph` | Graph | NEW. |
| `branches` | Branches | NEW: fork, diff, preview, merge, `fork_at_*`, `PromotionStrategy`, `db.at()` views. |
| `time-travel` | Time Travel | SPLIT `python/namespaces` §as_of + history. |
| `inference` | Inference | KEEP `python/inference`. |
| `error-handling` | Error Handling | KEEP `python/errors`. |

`python/agents` merges into `sdks/agents/command-discovery`.

**CLI** (`sdks/cli/`)

| Page | Title | Source |
|---|---|---|
| `index` | Overview | SPLIT `reference/cli` intro (one binary, one-shot vs REPL). |
| `targeting-databases` | Targeting Databases | SPLIT `reference/cli` §Targeting + the global options from `strata --help` (`--branch`, `--space`, `--read-only`, `--ipc`, `--durability`). |
| `interactive-shell` | Interactive Shell | SPLIT `reference/cli` §REPL + `use`. |
| `output-formats` | Output Formats | SPLIT `reference/cli` §Output modes. |
| `scripting` | Scripting | NEW: `--json`/`--raw` in pipelines, exit codes (from `guides/error-handling` §Exit codes), `STRATA_DB`, `strata command` raw wire. |

**AI Agents** (`sdks/agents/`)

| Page | Title | Source |
|---|---|---|
| `index` | Overview | KEEP `agents/index`. |
| `agent-skills` | Agent Skills | NEW from `getting-started/quickstart-agents` §Install the playbook + `strata agents skill` / `agents init` help. |
| `machine-readable-docs` | Machine-Readable Documentation | MERGE `agents/machine-docs` + `agents/agents-guide`. |
| `command-discovery` | Command Discovery | MERGE `agents/command-index` + `python/agents`. |
| `error-handling` | Error Handling | NEW, short: recover by code, the JSON envelope, `strata agents errors --json`; points to the guide and the registry. |

**MCP** (`sdks/mcp/`)

| Page | Title | Source |
|---|---|---|
| `index` | Overview | SPLIT `agents/mcp-server`: what it is, same operation model, when to prefer it over the skill or CLI. |
| `setup` | Setup | SPLIT §Start it + §Handshake. |
| `clients` | Clients | SPLIT §Client config + NEW per-client blocks (Claude Code, Cursor, Codex); each config verified against the client's documented format. |
| `tool-model` | Tool Model | SPLIT §Tools + §Errors: the 20 tools, `strata_command`, `inputSchema` as the authority, wire vs flag spelling. |

### 5.5 Reference (`reference/`)

`reference/index` is the landing (REWRITE). Precision over teaching.

| Node | Source |
|---|---|
| **CLI** → `reference/cli/index` (Global Options) and one page per shell-only command (`init`, `doctor`, `agents`, `mcp`, `start`, `stop`, `ipc`, `remote`, `uninstall`, `command`) | GEN, new: `scripts/fetch-cli-help.mjs` captures `strata --help` and each shell-only `<cmd> --help` from the release binary into `src/data/cli-help.json`; a template renders them. Interim until strata-core ships a full clap index (upstream ask, §12). |
| **Commands** → `reference/<family>/<op>` (135 ops, 11 families, sub-families nested) | GEN, exists. URLs unchanged. Sidebar: Commands → Family → Sub-family → Op. |
| **Python API** ⏸ | Gap. No generated artifact from strata-python and 09 §1 forbids hand-written API tables. Upstream ask: docstring-extracted JSON attached to the strata-python release; the site renders it under `reference/python/<namespace>/<method>`. Until then `sdks/python/*` and Commands serve. |
| **MCP Tools** → `reference/mcp-tools` | GEN, new: `scripts/fetch-mcp-tools.mjs` performs the stdio handshake against `strata --cache mcp serve` and captures `tools/list` into `src/data/mcp-tools.json` (20 tools today). |
| **Configuration** → `reference/configuration` | KEEP `reference/configuration-reference`. No config-key catalog exists (gap since Doc 10); stays hand-written and short. |
| **Error Codes** → `reference/errors` | REWRITE `reference/error-reference` as the landing that renders the registry index in-docs (219 codes, grouped by class, with retry policy and commit outcome). `/e/<code>` stays canonical because the binary emits it. |
| **Data Types** → `reference/data-types` | REWRITE `reference/value-type-reference` as orientation + GEN shared shapes from the bundle's schemas if `$defs` are present (Wave 1 check). |
| **Storage Format** ⏸ | Not a reference page this release; Internals → Durability and recovery owns the frozen-format statement. Added when a format spec ships. |
| **Compatibility & Versioning** → `reference/compatibility` | NEW: release line, platforms (from release assets), pre-V1 databases (from `troubleshooting` §Opening a pre-V1 database + `faq` §What changed), CLI/SDK version pairing, and a GEN table of `wire_status: transitional` commands from `command-index.json`. |
| DELETE | `reference/command-reference`, `reference/api-quick-reference` (Doc 12 retire list, still shipping). |

**Reference page template** (brief §10): the generated op page already carries
name, description, syntax (CLI + wire), parameters with types and required
status, returns, example, errors, and invocation. Add from the index without
new upstream work: **commit behavior** (`commit`), **retry behavior** (join
each error to `retry_policy` in the registry), **access** (read/write),
**wire status**, **MCP tool name**, and **related operations** (same family).
**Version introduced** is missing from the index; upstream ask.

### 5.6 Internals (`/internals`)

The eight `architecture` pages KEEP their content and move to `/internals`
(Decision 1). Two public candidates can be rewritten from the private pitch
page's real material: **Vector architecture** and **Testing methodology**.
**Benchmarks** are not published until the harness output replaces the
placeholder figures. Internals stays out of the docs sidebar; the docs
homepage and Learn pages link into it.

## 6. Disposition of every existing page

All 66 hand-written pages. Generated command pages (146) are GENERATE and
unchanged. Destinations are relative to `/docs/`.

| Current page | Class | Destination |
|---|---|---|
| `index` | REWRITE | the docs homepage (§10); `.md` mirror stays at `/docs/index.md` |
| `faq` | MERGE | §What it is → `get-started`; §Storage → `learn/how-it-works/durability`; §What changed → `reference/compatibility`; §SDKs and MCP → `sdks` |
| `troubleshooting` | KEEP (move) | `guides/operations/troubleshoot-failures` |
| `why-strata/index` | MERGE | `get-started` (Overview) |
| `why-strata/when-to-use` | MERGE | summary → `get-started`; full text → site page `/why-strata` (Decision 6) |
| `why-strata/comparisons` | MERGE | site page `/why-strata` (Decision 6) |
| `getting-started/index` | MERGE | `get-started` |
| `getting-started/installation` | KEEP | `get-started/installation` |
| `getting-started/first-database` | KEEP | `get-started/quickstart` |
| `getting-started/quickstart-agents` | KEEP | `get-started/agent-quickstart` |
| `concepts/index` | REWRITE | `learn` |
| `concepts/embedded-architecture` | SPLIT | `learn/how-it-works/embedded-databases` + `…/databases-and-storage` |
| `concepts/primitives` | MERGE | `learn/data` (Overview) + `…/databases-and-storage` |
| `concepts/value-types` | MERGE | the five `learn/data/*` pages + `reference/data-types` |
| `concepts/branches` | REWRITE | `learn/how-it-works/branches` |
| `concepts/commits` | KEEP | `learn/how-it-works/commits-and-versions` |
| `concepts/time-travel` | KEEP | `learn/how-it-works/time-travel` |
| `concepts/durability` | KEEP | `learn/how-it-works/durability` |
| `concepts/spaces` | KEEP | `learn/how-it-works/spaces` |
| `concepts/hub-and-clone` | SPLIT | `learn/distribution/strata-hub` + `…/cloning-databases` |
| `concepts/errors` | KEEP | `learn/how-it-works/errors` |
| `data/index` | MERGE | `learn/data` |
| `data/key-value` | REWRITE | `learn/data/key-value` |
| `data/json` | REWRITE | `learn/data/json` |
| `data/events` | REWRITE | `learn/data/events` |
| `data/vectors` | REWRITE | `learn/data/vectors` |
| `data/graph` | REWRITE | `learn/data/graph` |
| `data/combining-primitives` | KEEP (move) | `guides/data/combine-data-models` |
| `inference/index` | SPLIT | `learn/inference` + `learn/inference/models` (+ generation/embeddings/reranking) |
| `inference/local-models` | KEEP (move) | `guides/ai-retrieval/use-local-models` |
| `inference/providers-and-keys` | KEEP (move) | `guides/ai-retrieval/use-cloud-providers` |
| `guides/index` | REWRITE | `guides` |
| `guides/branching-workflows` | SPLIT | `guides/branching/{isolate-an-experiment, compare-two-branches, preview-a-merge, merge-changes}` |
| `guides/time-travel` | SPLIT | `guides/branching/{read-historical-state, fork-from-historical-state}` |
| `guides/spaces` | KEEP (move) | `guides/data/organize-with-spaces` |
| `guides/configuration` | KEEP (move) | `guides/operations/configure-strata` |
| `guides/error-handling` | KEEP (move) | `guides/operations/recover-from-errors` |
| `guides/observability` | KEEP (move) | `guides/operations/inspect-database-health` |
| `guides/import-export` | SPLIT | `guides/data/{import-data, export-data}` |
| `guides/cloning-datasets` | KEEP (move) | `guides/data/clone-a-dataset` |
| `guides/migrating` | REWRITE | `guides/data/migrate-from-sqlite` |
| `guides/deploying` | SPLIT | `guides/deployment/{embed-in-an-application, package-with-an-application, run-in-the-browser}` + `guides/operations/back-up-a-database` |
| `cookbook/index` | MERGE | `guides` |
| `cookbook/ab-testing-with-branches` | MERGE | `guides/branching/isolate-an-experiment` |
| `cookbook/agent-state-management` | KEEP (move) | `guides/agents/persist-agent-memory` |
| `cookbook/deterministic-replay` | SPLIT | `guides/agents/{record-tool-activity, replay-an-agent-run}` |
| `cookbook/multi-agent-coordination` | REWRITE | `guides/agents/give-each-run-a-branch` |
| `cookbook/rag-with-vectors` | REWRITE | `guides/ai-retrieval/build-rag` (+ seeds `build-semantic-search`, `embed-and-store-documents`) |
| `python/index` | SPLIT | `sdks/python` + `get-started/python-quickstart` + `sdks/python/opening-databases` |
| `python/installation` | KEEP | `sdks/python/installation` |
| `python/namespaces` | SPLIT + REWRITE (stale) | `sdks/python/{key-value, json, vectors, time-travel, opening-databases}`; table → `sdks/python` |
| `python/inference` | KEEP | `sdks/python/inference` |
| `python/errors` | KEEP | `sdks/python/error-handling` |
| `python/agents` | MERGE | `sdks/agents/command-discovery` |
| `agents/index` | KEEP | `sdks/agents` |
| `agents/agents-guide` | MERGE | `sdks/agents/machine-readable-docs` |
| `agents/command-index` | MERGE | `sdks/agents/command-discovery` |
| `agents/machine-docs` | MERGE | `sdks/agents/machine-readable-docs` |
| `agents/mcp-server` | SPLIT | `sdks/mcp/{index, setup, clients, tool-model}` |
| `reference/index` | REWRITE | `reference` |
| `reference/cli` | SPLIT | `sdks/cli/{index, targeting-databases, interactive-shell, output-formats}`; global options → GEN `reference/cli` |
| `reference/command-reference` | DELETE | redirect → `reference` |
| `reference/api-quick-reference` | DELETE | redirect → `reference` |
| `reference/configuration-reference` | KEEP | `reference/configuration` |
| `reference/error-reference` | REWRITE | `reference/errors` |
| `reference/value-type-reference` | REWRITE | `reference/data-types` |
| `architecture/*` (8) | KEEP | `/internals/*` (Decision 1) |

Totals (74 pages: 66 docs + 8 architecture): KEEP 31 · REWRITE 15 · SPLIT 12
· MERGE 14 · DELETE 2 · ARCHIVE 0 (no prior-version pages exist; Doc 10
deleted them) · GENERATE 146 existing + 4 new sources. New pages to author:
18 (plus one gated), about half of them short Learn or SDK pages seeded from
existing material.

## 7. URLs and redirects

- Section and group directories map 1:1 to URL segments. `index.md` renders at
  the directory URL (Astro already collapses it).
- **Every old URL redirects** via `redirects` in `astro.config.mjs` (static
  meta-refresh pages with canonical links). Entries are explicit, never
  pattern-based, so static output needs no dynamic-route matching. The map is
  the destination column of §6 (hand-listed in `src/data/redirects.json`)
  plus two lists the config computes at build time:
  - one entry per command from `command-index.json`: `/docs/<family>/<op>` →
    `/docs/reference/<family>/<op>` (135 entries; the bundle-native link
    shape, fixes gap 12);
  - one entry per architecture page: `/architecture/<slug>` →
    `/internals/<slug>`, plus `/architecture` → `/internals`.
  - `/docs/cookbook` → `/docs/guides`; `/docs/concepts` → `/docs/learn`;
    `/docs/data` → `/docs/learn/data`; `/docs/inference` →
    `/docs/learn/inference`; `/docs/python` → `/docs/sdks/python`;
    `/docs/agents` → `/docs/sdks/agents`; `/docs/why-strata` →
    `/why-strata`; `/docs/getting-started` → `/docs/get-started`.
- `.md` mirrors and `llms-full.txt` follow the collection automatically.
  `llms.txt` (hand-curated) and `resources/documentation.astro` are repointed
  by hand; the six hard-coded links in `src/` likewise.
- Generated `reference/<family>/<op>` URLs do not change, so nothing the
  binary or an agent has cached breaks.
- `scripts/verify-redirects.mjs` (new) asserts every old path in the map
  resolves to a page that exists in `dist/`, and that no source file links to
  an old path (the redirect map doubles as the stale-path list in
  `verify-reference-ia`).

## 8. Sidebar and navigation mechanics

**Generator** (`src/lib/docsNav.ts`, rewritten). Build a tree from collection
IDs: `section/group/page` for the four narrative sections; `reference/cli/*`,
`reference/<family>/<sub>/<op>` for Reference. Titles come from frontmatter;
order from `order:` frontmatter (a group's `index.md` orders the group).
Section and group titles live in one small config table. No `PREFERRED`
arrays; a page appears where its file is.

**Progressive disclosure** (brief §2.4, §9). Every level is a `<details>`.
Default state: only the ancestors of the current page are open. Reference
opens Commands → the active family → the active sub-family only. A
collapsed family shows its name and count, never its operations.

**State retention** (brief §17). The existing `localStorage` pattern extends
from sections to every node, keyed by path (`reference/graph/ontology`).
The active path always wins over saved state.

**Current location.** Breadcrumb above the title (`Reference › Commands ›
Branch › Merge`) plus the highlighted sidebar leaf; the URL matches the
breadcrumb.

**Prev / Next.** Scoped to the group (a Guides group, a Learn group, a
reference family). No walking from Guides into Python.

**Related documentation** (brief §18). Two sources: `related:` frontmatter
(explicit hrefs) and automatic matches on `area` (§9) across types, at most
one per type. Rendered as `Learn: How Branches Work · Guide: Resolve Merge
Conflicts · Reference: strata branch merge`, labels derived from the target's
section. Replaces hand-written "Next" lists.

**Mobile nav** mirrors the tree (same component contract).

## 9. Search metadata and grouping

Frontmatter schema (`src/content.config.ts`) gains:

```yaml
area: branching        # required on narrative pages; enum below
interface: all         # cli | python | mcp | agents | all   (default all)
status: current        # current | deprecated                (default current)
keywords: [promote]    # optional synonyms for search
related: [/docs/reference/branch/merge]   # optional
```

`documentation_type` and `version` are **derived**, not written:
type from the top-level directory (`get-started | learn | guide | sdk |
reference | internals`), version from `source:` (already enforced against
`release.json` by `verify-versions`). One source of truth per fact.

`area` enum: `core, branching, time-travel, spaces, durability, kv, json,
events, vectors, graph, inference, hub, agents, mcp, operations, deployment,
errors, python, cli`.

Pagefind: `DocsLayout` emits `data-pagefind-filter="type:<type>"`,
`data-pagefind-filter="interface:<interface>"`, and
`data-pagefind-meta="area:<area>"`. `DocsSearch` groups results under fixed
headings in the order **Reference · Guides · Learn · SDKs & Tools · Get
Started**, shows an interface chip on SDK and Reference hits, and offers a
one-click interface filter. `branch merge` then yields the brief's §12 shape.
Internals is indexed under its own heading; archived versions (§13) are not
indexed.

`scripts/verify-docs-meta.mjs` (new) fails the build on a missing `area`, an
unknown enum value, a `related:` target that does not exist, or a page
outside the five directories.

## 10. The docs homepage (`src/pages/docs/index.astro`)

Keep the search-first hero and the live fork transcript. Replace the
sidebar-mirroring card grid with the brief §20 path chooser:

| Block | Links |
|---|---|
| New to Strata? | Quickstart (primary), Installation, Python Quickstart, AI Agent Quickstart |
| Learn the core model | Branches · Working With Data · Time Travel · Inference |
| Build something | Agent Applications · Semantic Search · RAG · Local Models |
| Choose your interface | Python · CLI · MCP · AI Agents |
| Look something up | CLI · Commands · Error Codes · Configuration |
| Go deeper | Internals |

The machine strip (`llms.txt`, `.md` mirrors, `/e/`) stays at the foot.

## 11. Terminology (brief §19)

One current definition each; deprecated forms appear only in Compatibility.

| Term | Canonical meaning | Retired forms |
|---|---|---|
| database | one directory (durable) or one in-process cache; the unit you open, copy, clone | store, instance |
| branch · fork · `default` | an isolated line of the whole database; fork creates one from another at head or at a point in history | - |
| **merge** | apply a branch's changes to another as one commit (`branch merge`) | *promote / promotion* stays only when quoting receipts and error codes (`conflict.engine.promotion`) - Decision 3 |
| commit · version · timestamp | every write commits; a version and a commit timestamp identify it; `--as-of` reads at one | transaction, session |
| space | a named partition inside a branch | product space (CLI help wording; not prose) |
| historical read | a read at an earlier commit | snapshot (not a product noun this release) |
| **data model** | one of the five: Key-Value, JSON, Events, Vectors, Graph | primitive (Internals only), data shape, capability - Decision 4 |
| inference · generation · embeddings · reranking · model | the compute capability and its three operations; a model is local (GGUF) or a cloud provider route | chat (SDK method name only) |
| Strata Hub · hub · clone · clone artifact | the catalog product; any hub; the pull; the artifact a clone unpacks | bundle |
| durable · cache | the two database modes | in-memory database |
| error code · retry policy · commit outcome | `class.area.detail`; the registry's per-code facts | error string |
| agent skill · agents guide · command index · MCP server · tool | the four agent surfaces | playbook (quickstart wording; keep as a gloss) |
| the 1.x line | the current product generation, named by version | V1, pre-V1 (used on ~20 pages as a product name; define once in Compatibility, then say "this line" or the version) |

Applied by a one-time sweep in Wave 3 and held by `verify-docs-copy`
(extend its forbidden list with `data shape`, `six`, `bundle`, `state cell`,
`begin/commit/rollback`, `recipe`, `intelligence crate`, `Strata AI`).

## 12. Generated sources and validation

**New generators (site-side, build time, from released artifacts only)**

| Script | Source | Output | Feeds |
|---|---|---|---|
| `fetch-cli-help.mjs` | `strata --help`, shell-only `<cmd> --help` (release binary, installed in CI) | `src/data/cli-help.json` | Reference → CLI |
| `fetch-mcp-tools.mjs` | stdio handshake + `tools/list` against `strata --cache mcp serve` | `src/data/mcp-tools.json` | Reference → MCP Tools; the SDKs → MCP tool count |
| `fetch-docs.mjs` (extend) | bundle `cli-command-index.json`, `schemas/` | `src/data/cli-command-index.json`, `src/data/schemas/` | op-page CLI path column; Data Types |
| build-time join | `command-index.json` × `error-registry.json` | rendered on op pages | retry policy, commit outcome per error |

Each keeps the committed floor on fetch failure (existing pattern) and each
fact rendered from them is banned from prose by `verify-reference-ia`.

**Upstream asks** (strata-core / strata-python; tracked, not blocking)

1. A full clap index in the bundle (global options + shell-only commands),
   retiring `fetch-cli-help.mjs`.
2. `since:` on every IDL command (brief §10 item 13).
3. A machine-readable config-key catalog (open since Doc 10).
4. A docstring-extracted Python API artifact on the strata-python release.
5. A promoted-tool flag in the command index, retiring the MCP capture.
6. Registry completeness: export the CLI-area codes the binary emits
   (`invalid_argument.cli.no_database`) and the SDK-area codes the Python
   package emits (`unsupported.sdk.state_removed`), so their `/e/` pages exist.
7. Normalize the 18 two-part `inference.*` codes to `class.area.detail`.

**Validation additions to `npm run check`**

- `verify-docs-meta` (§9), `verify-redirects` (§7).
- `verify-codes-inline`: every backticked `class.area.detail` code in prose
  must exist in the registry (`verify-errors` checks only `/e/` links today).
- `verify-version-literals`: no `x.y.z` version string in page bodies outside
  fenced transcripts (policy 09 §2; `verify-versions` checks frontmatter only).
- `verify-transcripts` extended from the homepage to every fenced transcript in
  narrative docs, so real outputs such as `pong 1.1.1` stay legitimate.
- `verify-reference-ia`: replace `TOP_LEVEL_REFERENCE` with the new list;
  stale-path list = the redirect map's keys.
- `verify-links`: `REQUIRED_MACHINE_FILES` → `docs/index.md`,
  `docs/reference.md`, `internals/index.md`.
- Python snippet runner (policy 09 §3, still unbuilt): fenced `python` blocks
  tagged `verify` run under `pip install stratadb==<release.json>`. Required
  before the twelve `sdks/python/*` pages ship.
- `verify-transcripts` stays blocking for every CLI transcript moved or
  written here.

## 13. Versioning (brief §13)

The site documents one line, `release.json`, and no prior-version pages
exist. Policy from here: when a second supported line ships, the previous
`dist/docs` is snapshotted at tag time to `/docs/v<major.minor>/` with the
banner *"You are viewing StrataDB 1.1 documentation. Current version: X.Y."*,
excluded from the Pagefind index and the sitemap, and linked from
Compatibility. Nothing deprecated appears in current pages unlabeled; the
`status:` field exists for the one case (a transitional wire type) where a
current page must say so.

## 14. Build plan

Branch `docs/ia-v3`, one PR per wave, `npm run check` green at each. Waves 1
and 2 are structure and can land in days; Waves 3–5 are content and land per
section.

| Wave | Brief phase | Work | Exit |
|---|---|---|---|
| **0** | - | This document signed off; Decisions 1–8 resolved. | Ani sign-off |
| **1 Establish truth** | 1 | Fix the false Internals claims (§3.1 B: no `intelligence` crate, no search/recipes/shadow vectors, no "Strata AI"); remove version literals from prose (§3.1 D); fix the README install path and the specimen badge (§3.1 E); fix `python/namespaces` (merge/diff/preview/hub); delete the two retired reference pages; file upstream asks 6–7; check bundle `$defs`; land `fetch-cli-help`, `fetch-mcp-tools`, `verify-codes-inline`, `verify-version-literals`; verify the back-up and durability facts; write the terminology sweep list. §3.1 A relocations wait for Compatibility in Wave 3. | No false claim ships; every quoted code has an `/e/` page or a filed ask; nothing depends on an unverified fact. |
| **2 Rebuild the IA** | 2 | Schema (§9), nav generator + sidebar + mobile (§8), redirects (§7), section and group landings, docs homepage (§10), `git mv` of every KEEP/MOVE page into the tree, `/architecture` → `/internals`, top-nav Docs item, verify-script updates, `llms.txt` and hard-coded links repointed. | Five sections live; every old URL redirects; build green. |
| **3 Reorganize content** | 3 | The REWRITE/SPLIT/MERGE/NEW work of §5, in order: Get Started → Learn → Guides → SDKs & Tools → Reference landings. Terminology sweep rides with each section. | Each section complete; no "coming soon" pages (no empty shelves). |
| **4 Discoverability** | 4 | `area`/`interface` on every page, grouped search, related blocks, breadcrumbs, `verify-docs-meta` blocking. | `branch merge` search returns grouped results; every page has a related block. |
| **5 Automate correctness** | 5 | Op-page fields from the index join (commit, retry, access, wire status, related ops); Python snippet runner blocking; Compatibility table generated; upstream asks filed. | No fact in §12's table is hand-written anywhere. |

Estimated authoring load after Wave 2: 18 new pages (about half short) and
27 rewrites or splits, most seeded from existing verified material.

## 15. Decisions for Ani

1. **Internals URL.** Move `/architecture/*` to `/internals/*` (public) and
   relocate the private pitch page to `/pitch/engine` (still
   sitemap-excluded). Recommended: yes; the brief and the website IA both
   name the public layer Internals.
2. **Reference group name.** One generated op page per command, grouped as
   **Commands** (CLI + wire + MCP today, Python tab when the artifact
   ships), instead of the brief's literal parallel CLI and Python API trees
   with duplicated facts. Recommended: Commands; it is the only shape that
   satisfies §2.6 one-source-of-truth.
3. **Canonical verb: merge.** "Promotion" survives only in quoted receipts
   and codes. Requires no upstream change; the CLI verb is already `merge`.
4. **Canonical noun: data model** for the five; "primitive" restricted to
   Internals.
5. **Top nav.** Add `Docs` as a first-class item; keep the Resources menu;
   no `Examples` item until an examples surface exists; GitHub stays in
   footer and Resources. Recommended as stated.
6. **Why Strata.** Fold `when-to-use` and `comparisons` into a site-level
   `/why-strata` page (the website IA's §2) built in Wave 2, with the good-fit
   summary in the Overview. Alternative: keep both as Overview sections
   (longer Overview, no new page).
7. **Tree additions and deferrals.** Additions ⁺: Learn → Errors; Branching
   & History (Read Historical State); Use Cloud Providers; Clone a Dataset;
   Organize With Spaces; Troubleshoot Common Failures; Run in the Browser.
   Deferrals ⏸: Edge Devices, Debug Performance (gated), Foundry, Python API
   reference, Storage Format.
8. **Cookbook removal** confirmed: all five recipes have Guides homes (§6).

## 16. Success criteria (brief §21), answered by the target tree

| Question | Destination |
|---|---|
| How do I install Strata? | Get Started → Installation |
| How do branches work? | Learn → How Strata Works → Branches |
| How do I merge a branch? | Guides → Branching & History → Merge Changes |
| What arguments does `strata branch merge` accept? | Reference → Commands → Branch → Merge (`/docs/reference/branch/merge`, unchanged) |
| How do I use vectors from Python? | SDKs & Tools → Python → Vectors |
| What does this error code mean? | Reference → Error Codes (and `/e/<code>` from the binary) |
| How does Strata survive a torn write? | Internals → Durability and recovery |
