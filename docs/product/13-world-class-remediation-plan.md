# World-Class Remediation Plan - stratadb.org

|              |                                                              |
| ------------ | ------------------------------------------------------------ |
| Status       | **Draft - Phase 6 implemented**                              |
| Owner        | Ani (product) / Codex (implementation planning)              |
| Last updated | 2026-08-30                                                   |
| Upstream     | Current repo audit, Docs 09/11/12, live `v1.1.0` release     |
| Downstream   | Quality gates, landing rebuild, docs rewrite, deploy cleanup |

---

## 1. Purpose

The current site builds, but it does not yet earn trust at the level the product
needs. The failures are not mostly framework problems. They are truth,
craftsmanship, and maintenance problems:

- Public pages link to routes that no longer exist.
- The homepage demo shows commands and outputs that do not match the shipped CLI.
- Product docs, implementation, and release metadata disagree.
- CI catches syntax, but it does not block link rot, doc drift, stale examples, or
  old product decisions.
- The docs sound more generated than edited: correct in many places, but too
  abstract, repetitive, and self-referential.

This plan brings the repo to a release-grade baseline first, then raises the
site and docs to a world-class product standard.

---

## 2. What To Learn From The Best

This is not about copying Apple, Stripe, or Linear visually. It is about adopting
the operating standards behind their public surfaces.

### Apple: restraint, hierarchy, and product-first clarity

Reference: https://developer.apple.com/design/human-interface-guidelines

For Strata:

- The product state should be the visual hero, not decoration around it.
- Motion should clarify the model: fork, change, compare, merge, rewind.
- Copy should be plain, compressed, and confident.
- Every interface element should have a job. Remove ornamental cards, labels,
  badges, and animated flourishes that do not explain the product.

### Stripe: developer trust through executable specificity

References:

- https://docs.stripe.com/
- https://docs.stripe.com/api

For Strata:

- Documentation is part of the product, not support material.
- Examples must be runnable, current, and directly tied to the shipped binary.
- Generated reference should be authoritative. Hand-written reference pages can
  orient users, but must not duplicate facts that belong to generated artifacts.
- The docs front door should get a developer to first success quickly, while the
  reference lets an expert scan, search, and verify details without narrative.

### Linear: quality as a visible operating system

References:

- https://linear.app/
- https://linear.app/method
- https://linear.app/now
- https://linear.app/quality

For Strata:

- The site should show product momentum: changelog, current version, docs, and
  examples should all agree.
- The public surface should feel edited by one sharp product mind.
- Product decisions should not live forever as stale signed-off docs. Signed
  specs need an amendment path when the implementation or product changes.
- Small defects matter because they compound into mistrust: stale links, wrong
  command output, obsolete positioning, and generic prose all lower the bar.

---

## 3. Target State

`stratadb.org` should feel like a product artifact from the same engineering
culture as Strata itself:

- A human understands the core promise in one screen.
- A developer can install, run, and verify Strata from the docs without guessing.
- An agent can consume `llms.txt`, markdown mirrors, command metadata, and error
  pages without route drift.
- The homepage demo is truthful. It is either driven by real fixtures generated
  from `strata v1.1.0`, or it clearly identifies itself as an illustrative UI.
- Generated data wins over hand-maintained summaries for commands, errors, and
  release facts.
- CI blocks regressions in public truth, not just TypeScript errors.
- Product docs are current enough to guide work, or marked retired.

---

## 4. Phase 0 Lock - 2026-08-30

This section is the current controlling product truth for remediation work. It
overrides older signed-off planning notes where they conflict.

### Product Baseline

- Current release baseline: `strata-core v1.1.0`.
- Current website baseline: Astro static site deployed by the existing GitHub
  Pages workflow.
- Current documentation baseline: generated command reference from the release
  bundle plus narrative docs in this repo.

### Positioning

- Canonical homepage H1: Strata is the embedded database for the AI era.
- The supporting proof still needs to make the concrete product behavior clear:
  StrataDB is embedded, local, branchable, versioned, multi-model, and has a
  shipped inference surface.
- "AI era" is allowed as the homepage stance. Narrative docs should remain
  concrete and task-led instead of repeating broad era language.
- Do not lead with "for agents" as positioning. Agent support is a real surface,
  but not the identity.
- Do not use vague "git-like powers" without immediately showing the concrete
  verbs.
- Working homepage proof chain: create data, fork a branch, change data, compare
  branches, merge or preview merge, read history, run model work over the stored
  context, then install or open docs.

### Homepage H1

- Current H1: "Strata is the embedded database for the AI era".
- The page must still prove the claim through concrete shipped behavior: fork,
  change, compare, preview, merge, rewind, data primitives, inference, install,
  docs, and playground.

### Playground

- `/playground` is live.
- It remains a real product surface, not a retired URL.
- It should be discoverable from the homepage and docs, but it should not
  compete with install/docs as the primary adoption path.
- Older notes saying `/playground` is permanently retired are historical.

### Deployment

- Keep the current deployment mode for now.
- GitHub Pages remains the active deployment path.
- Cloudflare migration notes are future/historical planning until explicitly
  reopened.
- Do not spend remediation effort on hosting migration before correctness,
  docs, and landing flow are repaired.

### Foundry

- Foundry is frozen.
- Foundry is not a current acquisition surface.
- Do not add Foundry CTAs to the main landing flow during this remediation.
- Existing Foundry design notes remain future product input, not current website
  requirements.

### Shipped Claims

- Five data primitives are current: key-value, JSON, vector, event, and graph.
- Branch commands that ship in `v1.1.0`: create, fork, diff, merge, preview,
  delete, get, and list.
- Do not claim public cherry-pick until it appears in the generated command
  catalog and docs.
- Be precise about merge: current generated docs say merge applies key-value,
  JSON, and vector changes; events and graphs are compared but not merged.
- Inference ships as a real CLI family: generate, embed, rank, tokenize,
  detokenize, local model management, capability, unload, and cache status.
- MCP ships as `strata mcp serve` plus generated tool metadata. Treat it as an
  agent integration surface, not the product identity.
- Avoid broad "search" claims unless the copy specifies vector similarity search,
  docs search, or another shipped search path.

### Controlling Docs

- Doc 13 controls remediation sequencing and product locks.
- Docs 11 and 12 control the docs IA and generated-reference model.
- Doc 09 controls docs-sourcing intent, but enforcement is not yet implemented.
- `DESIGN.md` is historical until rewritten or replaced by a current contributor
  brief.
- Older PRD, landing, motion, and engineering notes are useful background, but
  not controlling where they conflict with this lock.

Phase 0 is complete when these decisions are reflected in the product-doc index
and downstream implementation work uses this section as the source of truth.

---

## 5. Experience Architecture Diagnosis

The clunky feel is structural, not visual. The current site has polished pieces,
but it does not yet behave like a tightly edited product website.

Problems:

- The first screen does not create a clean decision path. It mixes positioning,
  scripted proof, GitHub acquisition, docs, and playground without making the
  next best action obvious.
- The landing page reads as a feature tour, not a product argument. Branching,
  primitives, time travel, and inference are separate set pieces, but the user is
  not guided through a single increasing model of the product.
- The homepage handoff should be direct. A separate Resources junction adds
  another decision layer after the capability story; the page should close on
  install and let nav/footer carry docs, architecture, changelog, and agent
  surfaces.
- Navigation is underpowered. Desktop nav exposes only Docs, while Architecture,
  Changelog, Playground, and agent surfaces are discoverable only indirectly.
- Important objects move between modes without a stable mental model. The user
  sees terminal demos, Foundry-like panels, diagrams, and copy blocks, but the
  same database state is not carried through them in a way that feels inevitable.
- The docs front door is dense but not calm. It offers many section cards before
  it has established the shortest path to install, first write, branch, and
  understand what changed.
- Interaction affordances feel locally invented. Search, tabs, terminal replay,
  scrubbers, cards, and CTA chips work, but they do not yet form one coherent
  interaction language.
- The site asks for trust before it has earned it. Statements like "Everything
  was run against the shipped binary" or scripted terminal proofs must be
  mechanically true, or they create the exact "vibecoded" feeling we need to
  remove.

Diagnosis:

The site currently has components. It needs choreography. A best-in-class
surface does not merely show capabilities; it controls sequence, consequence,
and handoff. Each page should know what question it answers, what proof it gives,
and where the user should go next.

---

## 6. Experience Principles

These principles apply before visual styling decisions.

- One page, one job. Each top-level page must have a primary user question and a
  primary next action.
- The homepage is a product argument. It should move from claim to proof to
  consequence to adoption without detours.
- Reuse the same example state. If the hero creates a branch, later sections
  should compare, merge, rewind, query, or inspect that same story.
- Show consequence, not animation. Interactions should reveal what changed in
  the database.
- Progressive disclosure beats grid density. A first-time visitor should never
  have to choose among ten equally weighted cards before understanding the main
  path.
- Navigation should expose the real product shape. Docs, Architecture,
  Changelog, and the chosen acquisition surface should be visible if they matter.
- Every CTA must answer "why now?" A GitHub star, install command, docs link,
  playground link, and agent link are different jobs and should not compete.
- Pages need endings. Every major page should close with the next best action,
  not simply stop after the last section.
- The machine surface should be discoverable but quiet. `llms.txt`, markdown
  mirrors, command metadata, and `/e/` are trust infrastructure, not homepage
  clutter.
- Fewer primitives on screen at once. Compress choice until the reader has enough
  context to choose.

---

## 7. Quality Gates

These gates should become blocking before major copy or design work continues.

| Gate           | Required outcome                                                                                                        |
| -------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Build          | `npm run build` passes cleanly.                                                                                         |
| Internal links | Every rendered internal `href` resolves to a generated route or valid asset.                                            |
| External links | Known public external links return a valid status, with allowlisted auth-gated exceptions.                              |
| Version drift  | Docs frontmatter and visible release strings match `src/data/release.json` unless explicitly archived.                  |
| Command paths  | Every command-index `docs` URL resolves to a rendered page.                                                             |
| Error registry | Error count, class counts, and `/e/<code>` routes are generated from `error-registry.json`.                             |
| Transcripts    | Homepage and docs command transcripts are generated from or verified against the shipped binary.                        |
| Sitemap        | No `noindex` surface appears in `sitemap-index.xml` or child sitemaps.                                                  |
| Security       | No unresolved high-severity production/build-chain audit findings without a written exception.                          |
| Visual QA      | Desktop and mobile screenshots are checked for overlap, blank canvases, broken assets, and poor first viewport framing. |

---

## 8. Phase 0 - Product Truth Lock

Goal: stop building on contradictory assumptions.

Status: **locked on 2026-08-30**. Future implementation should use Section 4 as
the controlling source.

Tasks:

- Record the canonical homepage stance and the homepage-only AI-era exception.
- Record `/playground` as live.
- Record GitHub Pages as the active deployment path for now.
- Record Foundry as frozen and out of the current acquisition flow.
- Confirm the primitive set, branch verb claims, inference claims, MCP claims,
  and unsupported cherry-pick/search claims against `strata-core v1.1.0`.
- Mark older signed-off product docs as background when they conflict with the
  Phase 0 lock.

Acceptance criteria:

- `docs/product/README.md` identifies the current controlling docs.
- `DESIGN.md` is either removed, renamed as historical, or rewritten as a short
  current contributor brief.
- Every open strategic contradiction from the audit has a decision log entry.

---

## 9. Phase 1 - Public Correctness Repair

Goal: remove every known trust break that a user or crawler can hit today.

Status: **implemented on 2026-08-30**.

Tasks:

- Done: fixed footer routes for the agent docs and MCP docs.
- Done: replaced stale primitive guide links with the current `data/*` routes.
- Done: removed the external `stratahub` GitHub link.
- Done: fixed broken `/e/<code>` links found in rendered docs.
- Done: rewrote fetched command-index docs paths to
  `/docs/reference/<family>/<command>`.
- Done: excluded `/internals` from the sitemap while it remains `noindex`.
- Done: removed unused old layout components.
- Deferred: redirect behavior for retired docs routes. GitHub Pages does not
  provide first-class server redirects; revisit if hosting changes or if static
  redirect pages become worth the maintenance cost.
- Added: rendered internal-link verification across HTML, markdown mirrors,
  text surfaces, and sitemap noindex leaks.

Acceptance criteria:

- Internal link check returns zero broken rendered links.
- External link check returns zero unexpected failures.
- Sitemap contains only indexable public routes.
- No public page links to old docs IA paths.

---

## 10. Phase 2 - Truth Infrastructure

Goal: make truth mechanical instead of editorial.

Status: **implemented on 2026-08-30**.

Tasks:

- Done: added `verify:links`, `verify:versions`, `verify:commands`, `verify:errors`,
  and `verify:demos` scripts.
- Done: made source, link, and transcript checks blocking in the normal build.
- Done: made CI install the shipped `strata` CLI before running the build.
- Done: made the transcript verifier fail when `strata` is unavailable unless
  `STRATA_TRANSCRIPTS_OFFLINE=1` is explicitly selected.
- Done: replaced homepage demo commands and outputs with `strata 1.1.0`
  transcripts verified by the CLI runner.
- Done: made error-reference counts verifiable against `error-registry.json`.
- Done: made generated command-index paths verifiable against generated docs.
- Done: made docs source frontmatter verifiable against `src/data/release.json`.
- Done: made GitHub release fetching use `GITHUB_TOKEN` in CI when available.
- Deferred: generating the rendered homepage transcript directly from the runner.
  Phase 2 verifies the source literals against real CLI behavior, and Phase 3
  keeps the visible transcript on that verified path. A future pass can remove
  the remaining duplication if the runner becomes cheap enough to own render data.
- Deferred: replacing every hand-written command/error total in narrative docs.
  Phase 2 blocks the known drift surfaces; Phase 5 should finish the reference
  IA reset so generated data owns all counts.

Acceptance criteria:

- CI fails on route drift, command path drift, error count drift, version drift,
  and homepage transcript drift.
- `npm run build` can still run locally without secrets, but release-data fallback
  is explicit in output and rendered metadata.
- The changelog page renders real release notes when release data is available.

---

## 11. Phase 3 - Landing Rebuild

Goal: make the landing page feel inevitable, not merely adequate.

Status: **implemented on 2026-08-30**.

Principles:

- Lead with the product, not the category.
- Use one clear story arc: create, fork, change, compare, merge, rewind.
- Show breadth only after the core model lands.
- Keep motion quiet and purposeful.
- Make every visible command truthful.

Tasks:

- Done: defined the homepage as a single decision journey: understand the model, see a
  real fork, inspect changed data, learn where it fits, then install or read
  docs.
- Done: replaced the stale hero transcript with a verified `v1.1.0` transcript.
- Done: replaced `branch diff experiment` and other invalid examples with actual CLI
  forms and outputs.
- Done: fixed the time-travel section to frame `--as-of` as a version clock.
- Done: connected sections through one portfolio scenario instead of isolated demos.
- Done: rebuilt Native Inference from a command transcript into a database
  workbench: capability check, records in the embedded file, embedding, ranking,
  and generation.
- Done: kept the install close as the final handoff and cut the standalone
  Resources junction so the page does not drift after the capability story.
- Done: promoted current navigation surfaces: Docs, Architecture, Changelog, and
  Playground only if Playground remains part of the product.
- Done: rationalized CTAs so each page has one primary action and a small number of
  secondary actions.
- Done: removed stale structured-data claims such as public cherry-pick or unsupported
  search claims unless they are real and documented.
- Done: used desktop/mobile screenshots and browser smoke checks as release blockers
  for the landing page.
- Done: repaired section-entry choreography after monitor testing. Branch pins
  below the nav/rule stack, Primitives keeps its title rail inside the centered
  pinned viewport, Time Travel and Native Inference now stop in their own centered
  pinned frames, and primitive links select in place instead of triggering a second
  scroll jump.
- Done: sharpened Section 3 from vague "rest lives beside it" language to the
  plain multi-modal data promise: store every kind of app data in one embedded
  database. Branching stays in Section 2; the primitive section should not
  re-sell it. The demo now uses a VS Code-style extension surface with familiar
  dark editor structure and blue status color.

Acceptance criteria:

- The first viewport states the product clearly and shows a true product proof.
- Every homepage demo command is verified by CI.
- No text overlaps or layout shifts at common mobile and desktop widths.
- The page has a clear close: install, docs, changelog, and agent surface.

---

## 12. Phase 4 - Docs Rewrite

Goal: turn the docs from generated-feeling prose into edited developer writing.

Status: **implemented on 2026-08-30 for the priority narrative docs.**

Rewrite order:

1. `/docs`
2. `/docs/why-strata`
3. `/docs/getting-started`
4. `/docs/getting-started/first-database`
5. `/docs/agents`
6. `/docs/data`
7. `/docs/data/*`
8. `/docs/inference`
9. `/docs/reference`
10. `/architecture`

Page model:

- Start with the job the reader came to do.
- Show the shortest real command or code path.
- Explain what happened after the example, not before it.
- State when not to use the feature.
- Link to generated reference for exhaustive details.
- End with the next best page for the reader's current task.

Voice rules:

- Prefer concrete nouns and commands over abstractions.
- Avoid product-mantra phrasing such as "capability surface", "source of truth",
  "same substrate", and "machine-readable" unless the page is specifically about
  those mechanics.
- Keep "AI era" out of narrative docs unless a future docs page explicitly
  argues the term. The homepage H1 is the current exception.
- Do not say every command was run unless CI proves it.
- Remove repetitive "one/every/same/exact" cadence where it is not earning its
  keep.
- Keep architecture language in architecture pages. Task pages should be direct.

Tasks:

- Done: rewrote the docs front door and website docs landing around install,
  first database, data shapes, agents, reference, and architecture.
- Done: rewrote the priority Why Strata, Getting Started, first database,
  agents, data, inference, reference, and architecture pages in a direct
  developer voice.
- Done: added `/docs/data` as the Working with Data index and placed it first in
  the data sidebar.
- Done: removed broad "every command was run" proof claims from narrative docs
  unless a verifier owns them.
- Done: marked long docs-landing receipts as abridged instead of presenting them
  as exact CLI JSON.
- Done: replaced public "Whitepapers" framing with "Architecture" across the
  architecture front door and machine-doc surfaces.
- Done: added `verify:docs-copy` to block retired Phase 4 copy patterns such as
  AI-era positioning, frozen Foundry acquisition copy, cherry-pick claims,
  old six-capability language, broad unverified example guarantees, and
  whitepaper labels.
- Deferred: a formal per-code-block status component or linter for every
  executable snippet in the full docs corpus. The priority pages now avoid broad
  guarantees and call out abridged output where relevant; Phase 5 should turn
  snippet status into a site-wide primitive.

Acceptance criteria:

- Top 25 docs pages receive a human rewrite pass.
- All executable examples are tagged as verified, illustrative, or intentionally
  unverified.
- No narrative page carries stale release-source frontmatter.
- The docs index gets a developer to first success without requiring product
  context from the landing page.

---

## 13. Phase 5 - Reference And IA Reset

Goal: make generated reference the authority and narrative docs the guide.

Status: **implemented on 2026-08-30**.

Tasks:

- Done: rewrote the hand-maintained reference pages as orientation pages instead
  of second command specs: CLI, command reference, API quick reference,
  configuration, errors, and value types.
- Done: kept `/docs/reference` as a map into generated family indexes and
  binary-emitted catalogs.
- Done: removed manual command tables, command totals, error totals, and stale
  "interim page" reference disclaimers from narrative reference pages.
- Done: changed error verification so `/e/` and `error-registry.json` own error
  counts instead of a hand-written markdown table.
- Done: added `verify:reference-ia` to block old docs IA paths, direct generated
  command-page URLs in narrative docs, manual command/error/MCP counts, missing
  generated family indexes, and missing generated command docs.
- Done: extended `verify:links` so rendered `.md` mirrors, `llms.txt`, and
  `llms-full.txt` are explicit machine-doc artifacts in link verification.
- Done: tightened docs navigation so generated reference families remain grouped
  and section-root pages do not leak into the "More" bucket.
- Deferred: server-side redirects for old docs paths. GitHub Pages remains the
  active deployment mode, so Phase 5 keeps old paths absent from public copy
  instead of adding a server redirect table. Revisit if hosting changes or if
  static redirect pages become worth maintaining.

Acceptance criteria:

- No command total, error total, or command URL is manually counted in narrative
  docs.
- All machine docs and markdown mirrors link only to valid public URLs.
- Old IA paths either redirect or are intentionally absent from all public copy.

---

## 14. Phase 6 - Repo Hygiene And Tooling

Goal: create a contributor baseline worthy of the product.

Status: **implemented on 2026-08-30**.

Tasks:

- Done: added a top-level `README.md` with local setup, Node/npm/Rust/browser
  requirements, build/check commands, release-data fetching, docs-generation,
  transcript verification, and GitHub Pages deployment notes.
- Done: set the contributor runtime baseline with `.nvmrc`, `engines`, and
  `packageManager` metadata.
- Done: upgraded the site stack to the current Astro 7, Vite 8, Tailwind 4.3,
  and TypeScript line, then migrated content collections to Astro's content
  layer API.
- Done: added Prettier, ESLint, formatting scripts, lint scripts, and a single
  `npm run check` gate that composes formatting, linting, build verification,
  Playwright smoke, and runtime audit.
- Done: removed unused npm dependencies and the stale Tailwind config so CSS
  tokens are the design-token source of truth.
- Done: consolidated live-source raw color usage through `tokens.css` and shared
  RGB channel helpers, with `verify:source-hygiene` blocking regressions.
- Done: marked `DESIGN.md` historical and removed the remaining old layout
  components from live source.
- Done: added a Playwright visual smoke test for the homepage, docs front door,
  reference front door, and playground across desktop and mobile viewports.
- Done: reran dependency audit and kept `npm audit --omit=dev` clean.
- Deferred: pixel-diff visual regression testing. The Phase 6 gate checks
  route health, H1 semantics, visible text, horizontal overflow, nonblank
  viewport samples, and browser errors; image-baseline review belongs in a
  later launch-system pass.

Acceptance criteria:

- A new contributor can build, verify, and understand the repo from the README.
- `npm audit --omit=dev` has no high-severity unresolved findings.
- `npm run check` or equivalent runs type, lint, link, docs, transcript, and
  visual smoke checks.
- Dead design/spec artifacts are either deleted or clearly labeled historical.

---

## 15. Phase 7 - Launch System

Goal: make future quality visible and sustainable.

Tasks:

- Rebuild changelog fetching so release notes are real, complete, and stable.
- Decide whether `Now`, `Changelog`, or `Architecture` should be first-class nav.
- Add a public quality checklist to release work.
- Publish a short "what changed" note after the remediation work lands.
- Capture performance, link integrity, dependency, and transcript status in CI.

Acceptance criteria:

- The public changelog proves active development.
- Every release updates docs/source metadata or explicitly records why it did not.
- Deployment cannot publish a site with broken internal links or stale homepage
  transcripts.

---

## 16. Work Sequence

Recommended order:

1. Product truth lock.
2. Public link and route repair.
3. Blocking truth infrastructure.
4. Homepage transcript and landing correctness.
5. Top-docs rewrite.
6. Reference IA cleanup.
7. Repo hygiene and dependency upgrades.
8. Visual polish pass.
9. Launch-system cleanup.

Do not begin major visual redesign before phases 0-2 are complete. A world-class
surface cannot compensate for stale routes, false transcripts, or contradictory
product decisions.

---

## 17. Definition Of Done

The remediation is complete when:

- The site builds from a clean checkout.
- Public routes, markdown mirrors, `llms.txt`, and `llms-full.txt` have no broken
  internal links.
- Homepage demos are verified against the current release.
- Docs source versions match the current release or are marked historical.
- Reference counts and URLs are generated, not hand-counted.
- The landing page has a true first-screen product proof and a complete close.
- The top docs pages read like edited developer documentation.
- CI blocks the regressions found in the 2026-08-30 audit.
- Product docs, implementation, and deployment agree on the current strategy.
