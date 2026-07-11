# 10 — V1 Docs Rebuild: Audit and IDL-Driven Plan

**Status:** Audit complete (2026-07-10); **Phase 0 shipped 2026-07-10** — 42 pages
rewritten/added, 7 deleted, `/e/<code>` live (204 codes), `source:` frontmatter on
every page. Phases 1–3 (IDL completion, generation pipeline, snippet CI) open.
Companion to
[09 — Documentation Sourcing Policy](09-docs-sourcing-policy.md); this document
applies that policy to the concrete V1 rebuild of `src/content/docs/`.

---

## 1. Audit verdict

All 43 pages under `src/content/docs/` (~24k words) describe the **pre-V1
product** (v0.6 era). Audited 2026-07-10 against the shipping `strata 1.0.0`
binary and the executor command surface (120 commands, 10 families).

Systemic findings, worst first:

1. **Live 404s from the shipping binary.** The runtime emits per-error doc
   refs of the form `https://stratadb.org/e/<code>`
   (`crates/executor/src/error.rs`, `DEFAULT_DOCS_BASE_URL`); the CLI agents
   surface prints the same refs. The site has **no `/e/` route**. Every error
   a V1 user hits links to a 404 today.
2. **Documented features that no longer exist.** Branch bundles (replaced by
   clone artifacts), manual transaction sessions (`begin/commit/rollback`),
   the state cell primitive, `compact`/`checkpoint`, and `search` (deferred
   post-V1) all have pages or sections presenting them as current.
3. **The reference section is hand-written and wrong.** Command reference,
   CLI reference, error reference, API quick reference — all authored by hand
   against v0.6. The error reference contains zero V1
   `<class>.<area>.<detail>` codes. This is exactly the drift the IDL exists
   to kill (sourcing policy §0: a hand-maintained API table anywhere is a bug
   against the policy).
4. **Sourcing policy unimplemented on the ground.** Zero pages carry the
   `source:` frontmatter required by §2; there is no snippet-runner CI (§3);
   `llms.txt` / `llms-full.txt` are generated from this stale content, so the
   agent-facing exports are poisoned too.
5. **Wrong outputs everywhere sampled.** `PONG` vs actual `pong <version>`,
   `(version) 1` vs `created <key> applied=true`, `cargo install strata-cli`
   (unpublished), old org names.

## 2. Page-by-page disposition

### Delete (feature removed in V1)

| Page | Why | Replacement |
|---|---|---|
| `guides/branch-bundles.md` | Bundles replaced by clone artifacts | New "Cloning datasets" guide (`strata clone`, `remote`) |
| `guides/sessions-and-transactions.md` | Public manual transactions removed | Atomicity story folds into new "Commits" concept page |
| `concepts/transactions.md` | Same | New `concepts/commits.md`: auto-commit, batch itemwise/shared-commit semantics, versions |
| `guides/state-cell.md` | State cell is not a V1 capability (V1: kv, json, event, vector, graph) | — |
| `guides/search.md` | `search`/`recipe` deferred post-V1 (CLI refuses with "not available in the V1 CLI surface yet") | Optional single "roadmap" note on the guides index |

### Rewrite (concept valid, content stale)

- **Landing + getting-started:** `index.md`, `getting-started/{index,first-database,for-agents}.md` — rewrite against the real binary (`installation.md` already done 2026-07-10).
- **Concepts:** `branches`, `durability` (V1 durable vs cache mode; WAL halt/resume), `primitives` (five capabilities over one MVCC KV substrate), `value-types`.
- **Guides:** `kv-store`, `json-store`, `vector-store`, `event-log`, `branch-management`, `spaces`, `database-configuration` (the `strata config` verbs + hub URL layers), `error-handling` (class/code model, `/e/<code>` refs), `observability` (`info/health/metrics/describe/doctor`).
- **Cookbook (all five):** recipes remain conceptually right (branch A/B, replay, agent state, RAG, coordination); every snippet re-authored against V1 CLI and verified per §3.
- **FAQ, troubleshooting:** rewrite.

### New pages (V1 features with no docs)

- **Graph guide** — largest gap: 30 commands including ontology (define/freeze), analytics (wcc/lcc/sssp/pagerank/cdlp/bfs), bulk insert, delete policies.
- **Inference guide** — local GGUF + cloud providers: models pull/list, generate, embed, rank.
- **Arrow import/export guide.**
- **Cloning datasets** (hub) — `strata clone`, `strata remote`, hub URL resolution.
- **Agents surface** — `strata agents guide/commands`, `strata mcp serve`, the self-describing contract.
- **First-run** — `strata init`, `strata doctor`, bare-`strata` REPL behavior.

### Generate from the IDL (never hand-write again)

| Page | Source artifact |
|---|---|
| `reference/command-reference` (per-family pages) | resolved `command-index.json` |
| `reference/cli` | `cli-command-index.json` (clap-derived) |
| `reference/error-reference` + **`/e/<code>` routes** | executor error registry export (`error_registry.rs` is truth; `docs/errors/registry.md` in strata-core is the authored narrative anchor) |
| `reference/api-quick-reference` | index summary view |
| `reference/value-type-reference` | schemars schemas (IDL decision #1, once built) |
| `reference/configuration-reference` | config-key catalog — **gap: no machine-readable config index exists yet; needs an IDL-adjacent export** |
| `reference/mcp` | MCP tool catalog once the MCP surface consumes the resolved index |
| `reference/{node-sdk,python-sdk}` | **unpublish until M9 SDKs ship**, then generated-core docs from the same index |

## 3. The IDL-docs pipeline (fleshing out decision #5)

The accepted IDL strategy (strata-core
`docs/architecture/v1-idl-overlay-strategy.md`, 2026-07-06) already names the
site as a publishing target: resolved index + schemas ship in the binary, at
`stratadb.org/idl/v1/`, and inside SDK packages. Concretely for this site:

1. **Generation lives in strata-core** (policy §1: reference belongs to the
   code). `strata-idl` grows a `generate-docs` emitter producing markdown
   per command family plus the error-registry JSON export. Generated docs are
   committed in strata-core and gated by the existing freshness check, same
   as `cli-command-index.json`.
2. **The site consumes released artifacts only** (policy §2). At build time,
   fetch the docs bundle + `command-index.json` from the release tag named in
   `src/data/release.json` — never from `main`. Serve the raw index at
   `/idl/v1/command-index.json`.
3. **`/e/<code>` routes** are generated from the error export: one anchor
   page per code (or per-code sections with redirect stubs). This is the
   single highest-priority item — the shipped binary already emits these URLs.
4. **Drift guards on the site** (mirrors of strata-core's four): (a) build
   fails if a `src/content/docs/reference/` page was hand-edited (checksum
   against the fetched artifact); (b) `source:` frontmatter required on every
   narrative page, version-drift CI compares against `release.json`;
   (c) snippet-runner CI executes fenced `bash` snippets against the released
   binary and compares outputs (§3 of the policy — the landing-page
   `db.kv.history()` incident is the motivating case).

**Coverage reality:** the IDL covers 32 of 120 commands (kv + vector). The
accepted roadmap order (schemas → guards → remaining 8 families → CLI
consumption → agent/MCP → lifecycle/publishing → M9 SDK codegen) makes
family authoring the long pole. Interim rule so docs don't wait: generated
pages for covered families now, hand-written stubs for uncovered families
carrying a visible "pending IDL coverage" banner and listed in a shrink-only
allowlist that mirrors `uncovered-commands.yaml`. The banner list must only
shrink.

## 4. Sequencing

| Phase | Where | What | Unblocks |
|---|---|---|---|
| **0 — stop the bleeding** | site | Delete dead pages; rewrite narrative set against the 1.0.0 binary; `/e/<code>` interim route generated from strata-core's tracked `docs/errors/registry.md`; fix `llms.txt` inputs; add `source:` frontmatter | Users stop reading lies; binary error refs stop 404ing |
| **1 — IDL completion** | strata-core | Author remaining 8 families (json, event, graph, branch/space, admin, arrow, inference, hub); land the four drift guards; error-registry + config-key exports | All generation sources exist |
| **2 — pipeline** | both | `strata-idl generate-docs`; site fetch-from-release build step; `/idl/v1/` live; checksum + version-drift CI | Reference section becomes ungoverned-drift-proof |
| **3 — snippet CI** | site | Snippet-runner against released binary for every narrative page | Policy §3 fully real |

Phase 0 is pure site work and can start immediately. Phase 1 is strata-core
M-series work and the long pole. Phases 0 and 1 run in parallel.

## 5. Fix-forward notes

- strata-core `docs/errors/registry.md` prose says runtime URLs use
  `https://strata.dev/...` — stale; the code emits `stratadb.org`. Fix the
  doc line when the error export lands.
- The docs sidebar/section taxonomy survives the rebuild: getting-started /
  concepts / guides / cookbook / reference. Only membership changes.
