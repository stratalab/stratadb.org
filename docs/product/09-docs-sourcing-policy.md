# 09 — Documentation Sourcing Policy (family-wide)

**Status:** Policy (2026-06-12). Unlike docs 00–08, this document governs the whole
Strata family, not just the website. It is the canonical answer to "where do docs
live and what keeps them true," and it is the template Ani applies to each SDK repo
and the CLI. This copy in stratadb.org is the master; repos link to it, they do not
fork it.

**Applies to:** `strata-core` (Rust crate + `strata` CLI) · the Python SDK
(`stratadb`) · the Node SDK (`@stratadb/core`) · `strata-foundry` · `strata-mcp` ·
`stratadb.org` (the docs site).

---

## 0. The one rule

> **Truth comes from verification, not from location.**

Arguments about which repo docs live in are mostly proxies for the real question:
*what physically breaks when code changes and the docs don't?* Co-location alone
solves nothing — a stale doc next to fresh code is still stale. The policy below
places each document type where it is cheapest to write, and then makes CI execute
it so it cannot silently rot.

Real incident that motivates this (2026-06-12): the landing-page quickstart was
written with `db.kv.history(...)` — plausible, unverified at the time of writing.
Under this policy that snippet runs in CI against the released package, and a wrong
method name fails the build instead of shipping.

## 1. The two document types

| Type | Examples | Lives in | Written by | Kept true by |
|---|---|---|---|---|
| **Reference** | API signatures, options, types, errors, CLI flags, config keys | **The code's repo — generated from source.** rustdoc for the crate, docstrings for Python, TSDoc/`.d.ts` for Node, `--help`/clap definitions for the CLI | Nobody (extracted) | Being the code |
| **Narrative** | Concepts, guides, cookbook, quickstarts, tutorials, FAQs | **stratadb.org** (`src/content/docs/`) | A human, in product voice | Executable snippets run in CI (§3) |

The decision test: **if it describes a signature, it belongs to the code; if it
teaches, it belongs to the site.**

Corollaries:

- Reference is **never hand-written twice**. If a hand-maintained API table exists
  anywhere, it is a bug against this policy.
- Narrative is **never duplicated into SDK repos**. An SDK repo's README carries
  exactly one narrative artifact: its quickstart (§4.1) — which is also an
  executable test.
- A separate consolidated "docs repo" is rejected: it adds a third place with
  neither co-location with code nor co-location with the product voice.

## 2. Versioning

- `stratadb.org/src/data/release.json` is the **single source of version strings**
  for everything user-facing (built today; fetched by `scripts/fetch-release.mjs`).
  No version literal appears in any doc body — version-drift CI enforces this.
- The site documents **released versions only**: reference artifacts and snippet
  runs pin to release tags, never to `main`. If it isn't tagged, it isn't
  documented.
- Every narrative docs page carries `source:` frontmatter naming the repo(s) and
  the version it documents, e.g. `source: strata-core@v0.6.1`. Version-drift CI
  compares these against release.json and fails on skew.

## 3. The truth contract (CI, per repo)

Every executable example, everywhere, runs in CI. The mechanisms by surface:

| Surface | Mechanism | Status |
|---|---|---|
| CLI transcripts (site + strata-core README) | `scripts/verify-transcripts.mjs` — runs the commands against the real `strata` binary, diffs output | Built (advisory now; blocking at site cutover) |
| Rust examples | `cargo test` doctests — free, native; every public item's example is a doctest | Adopt in strata-core |
| Python snippets (site docs + SDK README) | Snippet extractor: pull fenced `python` blocks tagged `verify`, run via pytest against `pip install stratadb==<release.json>` | To build with the docs pass |
| Node snippets | Same pattern: fenced `js`/`ts` blocks tagged `verify`, run via node test against the published `@stratadb/core` | To build with the docs pass |
| MCP config examples | Schema-validate against strata-mcp's declared config schema | Adopt in strata-mcp |
| Claims | Claims lint (forbidden marketing vocabulary) — already in site CI | Extend to SDK READMEs |
| Links | lychee link check — already in site CI | Extend to SDK READMEs |

Authoring rule that makes this work: **examples are real programs.** Write the
mem0-style complete quickstart (numbered steps, runnable top to bottom), not
floating fragments. A snippet that cannot run cannot be verified; if a fragment is
truly necessary, mark it `no-verify` with a one-line reason — CI counts and reports
`no-verify` blocks so they stay rare.

## 4. The per-repo contract

Each SDK repo (and the CLI within strata-core) provides exactly four things:

### 4.1 A quickstart README
One complete, runnable quickstart (install → open → first write → first read), in
product voice, ≤ 30 lines of code. This is the repo's ONLY narrative doc. It is
extracted and run by that repo's snippet CI on every PR and on every release tag.
It should tell the same seed-world story as the site where natural (the portfolio
example) — one world, every surface.

### 4.2 A generated reference artifact
Built in that repo's CI on every release tag:

- strata-core: `cargo doc` + `cargo rustdoc -- --output-format json` (and the CLI:
  generated command/flag reference from clap definitions)
- Python: docstring extraction (pdoc/sphinx-objects.inv → JSON)
- Node: typedoc → JSON

The artifact is attached to the release (or published to a known path). The site
consumes these at build, by tag, and renders them through site templates — the SDK
repos ship **data**, the site owns **presentation**.

### 4.3 The CI jobs
1. **doctest/snippet job** — §3's mechanism for that language; blocking.
2. **reference-artifact job** — builds and attaches the artifact on tags; blocking
   on tags.
3. **changelog gate** — a release PR without a CHANGELOG entry fails.

### 4.4 The PR checklist line
Every SDK repo's PR template includes:

> - [ ] Does this change any documented behavior? If yes: doctests updated here,
>   and a companion note filed against stratadb.org narrative docs.

This is the cheap human bridge until generated reference covers the surface; it is
discipline, not enforcement — the enforcement is §3.

## 5. The site's side of the contract

- `src/content/docs/` remains the narrative home; the agent surface (llms.txt,
  llms-full.txt, `<route>.md` mirrors, for-agents recipe) is generated from it and
  inherits its truth for free.
- The site build fetches reference artifacts by the tags named in release.json;
  a missing or unparseable artifact fails the build loudly (no silent stale
  reference).
- Site CI runs the snippet verifiers for every language present in narrative docs
  (CLI today; Python + Node land with the docs pass).
- The site never reaches into SDK repos for prose. If narrative is discovered
  living in an SDK repo (beyond the quickstart README), it migrates here.

## 6. Writing standards (summary; voice law is 02 §3)

- Quiet competence: facts stated flat, no marketing vocabulary (claims lint
  enforces the floor).
- Examples use the seed world where natural — `portfolio.value`, the deploy story —
  so every surface tells one coherent story.
- Comments inside examples state facts ("# every write keeps its past"), never
  hype.
- Code blocks are complete and copy-runnable; the copy button copies something
  that works.

## 7. Anti-patterns (each is a policy bug)

- A hand-written API table, anywhere.
- A version string in a doc body.
- A snippet that has never been executed.
- Narrative prose duplicated between a repo README and the site.
- Docs built from `main` instead of a release tag.
- A screenshot of code.
- A "docs repo" separate from both the code and the site.

## 8. Adoption checklist (copy into each repo as an issue)

```
Adopt the Strata docs-sourcing policy (stratadb.org/docs/product/09):
- [ ] README reduced to: quickstart (runnable, ≤30 lines) + layout + develop notes
- [ ] Quickstart told from the seed world where natural
- [ ] Snippet/doctest CI job (blocking) runs the quickstart + all tagged examples
- [ ] Reference artifact generated + attached on release tags
- [ ] Changelog gate on release PRs
- [ ] PR template: "documented behavior changed?" checklist line
- [ ] Claims lint + link check on README
- [ ] No hand-written API tables, no version literals, no untagged docs builds
```

## 9. Staging

1. **Now (with the site docs pass):** Python/Node snippet verifiers in site CI;
   `source:` frontmatter on narrative pages; this policy adopted in strata-core
   first (doctests + CLI reference generation), since it is the source of truth.
2. **At SDK stabilization:** reference artifacts wired into the site build by tag;
   reference pages switch from hand-written to generated and the hand-written
   versions are deleted.
3. **At cutover (site Phase 7):** transcript verifier flips to blocking — the
   first surface where the full contract is live end-to-end.
