# PRD — stratadb.org

| | |
|---|---|
| Status | **In review** (gate: Ani sign-off) |
| Owner | Ani (product) · Claude (drafting) |
| Last updated | 2026-06-11 |
| Downstream | 01-IA, 02-design-language, 03-motion, 04-experience, 05-components, 06-engineering |

---

## 1. Why this document

stratadb.org is treated as a product in its own right — not a brochure for one. This PRD
defines what that product must do, for whom, and within what truthfulness constraints.
Every downstream document (IA, design, motion, experience, engineering) inherits from it.

## 2. Vision & positioning

**The website is the product's first demo, not its description.**

A visitor should *feel* versioned data — watch a database branch, see history scrubbed,
see a diff merge — within the first screenful, and leave with the product on their machine.

**Context (added 2026-06-11):** Strata is a personal project, not a company. Among the
site's jobs is **proof of work** — it signals its maker's product and engineering
competence. The voice consequence is *quiet competence*: definitional copy over
promotional copy, no flash, no category warfare; the demos, the numbers, and the
engineering legibility (architecture docs, truth rules, honest claims) do the persuading.

Positioning statement:

> For **developers building stateful, experiment-heavy software** — AI-agent builders
> foremost among them — whose application state is opaque, fragile, and irreversible,
> **StrataDB** is an embedded database — currently a **research preview** — that gives
> data **the whole git model**: O(1) zero-copy branches, diff, merge, cherry-pick,
> time-travel, and search across five primitives — completeness of the verb set, not the
> mere existence of branches, is the differentiation (branching alone commoditized by
> 2026). Unlike a duct-taped Redis + Postgres + vector-store stack, every write is
> versioned and every experiment is reversible — and **Strata Foundry**, the desktop
> studio, lets you *see* it.

**Copy rule (2026-06-11):** "AI agents" is **not used as positioning language** — every
incumbent from Snowflake to Oracle claims it; the label carries no signal. The targeting
is unchanged (P1 remains primary and the capability choices serve them); agent use cases
remain first-class in docs/cookbook; the agent surface (llms.txt, MCP, for-agents recipe)
remains — it is infrastructure, not positioning. Only the label is gone from identity
strings.

The site serves two audiences through **one page and two front doors**: a cinematic
landing experience for humans, and a machine-native surface (llms.txt, markdown docs, MCP
quickstart) for the coding agents that increasingly perform integration on humans' behalf.
No detection, no forked pages — the human page is itself fully parseable semantic HTML.

The human narrative spine, in order: *fearless change → perfect memory → see it (Foundry)
→ take it home.*

## 3. Audiences

### P1 — The agent builder (primary; the hero speaks to them)
Builds agents in **Python or TypeScript**. Comfortable in a terminal, not a Rust person.

- **Jobs:** persist agent memory/state; replay and debug agent runs; experiment with
  prompts/configs without corrupting good state; coordinate multi-agent state; RAG.
- **Pains today:** state scattered across Redis/SQLite/JSON files/vector DBs; no history
  ("what did the agent know at 3pm?"); experiments pollute real data; heavyweight infra
  for what is one process's memory.
- **Objections to overcome:** "another database?" → it's embedded, zero infra. "Is it
  real?" → live demos of real behavior + honest preview framing. "Will it eat my data?" →
  durability modes, crash-recovery evidence, and the preview label doing honest work.
- **Conversion:** Download Foundry to *see* state (north star) → SDK install to build.

### P2 — The systems evaluator (secondary)
Rust/backend developer assessing embedded stores. Reads architecture docs first, distrusts
marketing. Served by: the architecture section, durability/OCC specifics, measured
benchmarks with stated conditions. Converts via docs depth and source code, not the hero.

### P3 — The MCP integrator (secondary)
Wires agents/IDEs/Claude via MCP. Wants: the MCP server reference, a config snippet, the
tool count. Served by one clear path from nav/footer to the MCP reference page.

### P4 — The visiting agent (secondary; not a human)
A coding agent (Claude Code, Cursor, etc.) sent to evaluate or integrate StrataDB on a
human's behalf. By 2026 a meaningful share of library adoption is agent-mediated; the
agent is a **distribution channel**, and it cites its sources back to its human.

- **Jobs:** parse what StrataDB is and how mature it is; fetch exact install/config
  commands; write a working integration; report back with citations.
- **Served by:** the agent loop surface (§4, §6) — never by user-agent detection or a
  forked landing page (unreliable, SEO-cloaking risk, impossible on static hosting).
- **Conversion:** SDK installed / MCP configured in the project — the north-star event
  itself, without a human ever seeing the hero.

## 4. North star & metrics — the dual-loop model

**North-star outcome: StrataDB integrated into a project.** The durable adoption event is
a write happening in someone's codebase — whether a human put it there or their coding
agent did. Operationalized as **package-registry downloads** (PyPI `stratadb`, npm
`@stratadb/core`, crates.io `strata-cli`) trending week over week — externally measurable
today, unlike anything requiring a backend.

Two acquisition loops feed that outcome:

### Human loop — the landing page

| Stage | Visitor state | Served by |
|---|---|---|
| Feel | "whoa — data that branches" | Hero set-piece (≤5s to payoff) |
| Believe | "these are real behaviors" | Capability sections demoing real API/CLI |
| See | "I want to poke at this" | The living demos themselves (the live instance, once R8 lands); Foundry via its install tab |
| Act | install / configure | Install section — five surfaces: Python · CLI · Node · Foundry · MCP |
| Deepen | "how do I build with it" | Docs, cookbook |

Human-loop metrics: Foundry CTA click-throughs (downloads once artifacts exist, §9 R1),
install-command copy events, GitHub stars, docs sessions ≥ 2 pages, return visits.

### Agent loop — the machine surface

Coding agents discover StrataDB by search or by instruction ("add memory to my agent"),
parse the docs, integrate it on a human's behalf, and cite the site back to that human.

| Stage | Agent behavior | Served by |
|---|---|---|
| Discover | searches / is told to add memory | SEO, `llms.txt`, package metadata |
| Evaluate | parses capability + maturity | `llms-full.txt`, markdown docs, §5 honesty |
| Integrate | writes code / wires MCP | exact-command quickstarts, agent recipe |
| Report | cites source to its human | quotable claims, stable URLs |

Agent-loop metrics: package downloads (shared with north star); MCP installs where
measurable. `llms.txt` fetch counts are not measurable on GitHub Pages (no server logs) —
accepted gap for now, options in 06-engineering (§9 R7).

### Guardrails (must not regress)
Landing LCP < 1.5s · scroll-depth past the Foundry section ≥ 50% of engaged visitors ·
zero claim-integrity violations (§5) · zero dead links.

Measurement specifics (tool choice, event names) belong to 06-engineering. The metric
definitions above are owned here.

## 5. Claim posture: research preview

StrataDB is v0.12.x and Foundry is v0.1.x. The site says so — with confidence, not apology.
Honesty is the brand's trust strategy with P1 and a hard filter for P2.

**Identity rules**
- The hero region carries a quiet `Research Preview` marker; version numbers shown are
  real and build-time sourced (§7).
- Maturity is stated plainly where evaluation happens (FAQ, docs, install page) — framed
  as an invitation ("early, moving fast, come play"), never as a disclaimer wall.

**Allowed claims**
- Measured numbers **with conditions** (e.g., "250K ops/s — single-thread, Cache mode").
- Verifiable engineering facts: crash-recovery tests, fuzzing, 100% safe Rust, Apache-2.0,
  zero runtime dependencies.
- Any capability that is *demonstrated on screen* by a set-piece or code sample.

**Forbidden**
- "Production-ready," "battle-tested," "enterprise-grade," or SLA/uptime implications.
- Unqualified superlatives ("fastest," "blazingly").
- Manufactured social proof: no "Growing Community" badges, no dead Discord/Twitter links,
  no logo walls we haven't earned. (The current site violates this; v2 must not.)
- Placeholder anything: links to `#`, pages that don't exist, versions that drift (§7).

**Voice consequence:** CTAs are invitational — "Download Foundry," "Try the preview,"
"Read the internals" — not enterprise-speak ("Get Started" is acceptable for docs entry).

## 6. Scope

### In scope (v2 of the site)

| Surface | Job | Build phase |
|---|---|---|
| Landing page | The demo-funnel of §4; flagship craft surface | 1–3 (build) |
| Foundry presence | An install surface (the Foundry tab) + footer link — no landing section (2026-06-11 restructure). Dedicated `/foundry` page is a fast-follow **once a release artifact exists** (§9 R1) | 3–4 |
| Docs (`/docs/*`) | Deepen-stage for P1/P2; re-skinned with v2 design system, IA reviewed in 01 | 4+ |
| Architecture (`/architecture/*`) | P2's front door; re-skinned, content kept | 4+ |
| Changelog | Truthful release history, **generated from real release data** (§7) | 5 |
| `install.sh` | Maintained, branded installer (exists; stays) | — |
| 404 page | Exists, on-brand (currently missing) | 5 |
| **Live hero engine** | When the wasm artifact lands (R8), the real engine powers **the hero terminal only**, with a fullscreen expand (in-page overlay state, not a route). Sections 2–5 stay choreographed permanently — scripted demos always land their beat; live views can't be art-directed (scoped 2026-06-11). Cross-section liveness remains a recorded future option via the unchanged EngineProvider contract. `/playground` stays retired (301 → `/`) | fast-follow upgrade |
| **Agent surface** | `llms.txt` + `llms-full.txt`; docs published as markdown mirrors alongside HTML — all generated from the same content source as the human docs (§7.6) | 4+ |
| **Agent integration recipe** | Exact-sequence guide for coding agents (SDK + MCP paths); linked from `llms.txt`, footer, and package READMEs | 4+ |
| **"For your agent" moment** | Landing block: copyable MCP config + "point your agent at stratadb.org/llms.txt." Demonstrates the product thesis on the page itself; placement decided in 01/04 | 2–4 |

### Out of scope (v2)
Blog · pricing · accounts/auth · newsletter capture · cloud/waitlist · i18n · on-site
search · CMS · community platform (until a real one exists).

### Resolved scope decisions (2026-06-11, playground revised same day)
- **Playground: permanently retired — the homepage IS the playground (living-page model,
  final form 2026-06-11).** The simulated REPL is deleted at cutover and `/playground`
  301s to `/`, forever. When a packaged wasm artifact exists (R8), **one real StrataDB
  instance boots in-tab and powers every homepage demo**: the hero terminal becomes
  interactive, the time-travel strip scrubs real history (including the visitor's own
  writes), search queries real data, the strata column's counts are live. Grounding:
  storage-next charter P2, *"wasm32 first-class for the browser/cache substrate."* The
  strongest possible §5 claim: the front door runs the product.
- **Foundry CTA target until release artifacts exist: the GitHub repo**, with
  "star/watch — releases coming" framing. Upgrades to the releases page when R1 resolves.

## 7. Content-integrity requirements

These are product requirements, not engineering niceties — each one failed on the current
site and each failure undermines §5:

1. **Single-source versions.** All version strings (hero badge, install tabs, changelog)
   resolve from one build-time source (GitHub Releases API / synced release data). Today
   "v0.12.5" is hardcoded in two components while the changelog shows v0.6.0 fallback
   content — that class of drift must be impossible, not just fixed.
2. **Changelog is generated**, never a sibling-path read with a stale hardcoded fallback.
   The existing `repository_dispatch: docs-update` hook is the rebuild trigger.
3. **Zero dead links**, CI-enforced (link check in the deploy workflow). All GitHub links
   point at the `stratalab` org.
4. **Social links exist or don't render.** No `#` placeholders, no implied community.
5. **Claims audit** is part of every phase checkpoint: each on-screen claim maps to a §5
   allowed category.
6. **The agent surface cannot drift from the human surface.** `llms.txt`, `llms-full.txt`,
   and markdown mirrors are build-time generated from the same content collections that
   render the human docs — one source, two front doors.

## 8. Non-functional requirements

Inherited as gates by every build phase (details in 06-engineering):

- **Performance:** Lighthouse ≥ 95; LCP < 1.5s; CLS < 0.02; island JS ≤ 140KB gz total.
- **Accessibility:** WCAG AA contrast; full keyboard nav; visible focus; reduced-motion
  parity with full content equivalence; semantic landmarks.
- **Responsive:** 360–1920 all deliberate; set-pieces have designed mobile behaviors.
- **SEO/meta:** real per-page titles/descriptions, OG images, restored sitemap, canonical
  URLs. (Sitemap is currently disabled while robots.txt advertises it.)
- **Privacy:** analytics must be privacy-light and cookie-banner-free (tool chosen in 06).

## 9. Dependencies & risks

| # | Risk / dependency | Severity | Mitigation |
|---|---|---|---|
| R1 | **No public Foundry build exists.** Repo has no tags, no release CI, no published releases. Under the dual-loop model this no longer gates the north star (package downloads are measurable today) — but it does gate the human loop's "See → download" step. | High | Foundry release pipeline (Tauri bundles; **macOS first** per Ani 2026-06-11; signing TBD) is an external dependency owned outside this repo. Site ships regardless: Foundry CTA points at the GitHub repo with "star/watch — releases coming" framing, upgrading to releases page → installer page as each materializes; CTA click-through is the metric until artifacts exist. |
| R2 | Foundry is light-themed; the site is dark. Frames styled dark would preview a theme that doesn't ship. | Low | **Largely mooted by the 2026-06-11 restructure**: no Foundry showcase section remains — at most a small static frame in the install tab (real capabilities only; target dark identity, which is now approved via Doc 02 Appendix B2/B3). The full question returns only with the `/foundry` page. |
| R3 | Research-preview honesty weakens the pitch vs. competitors who oversell. | Low | §5 is the strategy, not a constraint: specificity + live demos out-credential adjectives for this audience. |
| R4 | Scroll-driven set-pieces jank on low-end hardware. | Medium | Motion spec (03) carries a 60fps gate; pieces lose parallax before they lose framerate. |
| R5 | Static hosting: no application server, no A/B. | Low | **Hosting decision (2026-06-11): Cloudflare replaces GitHub Pages at v2 cutover** — edge 301s, custom headers, and per-PR previews become available; dynamic data (versions, stars, download counts) stays build-time fetched or client-side; rebuilds via `repository_dispatch` → Actions → wrangler. |
| R6 | Single maintainer; doc suite could rot after launch. | Low | Suite lives in-repo; README decision log; docs reopened by any decision change. |
| R7 | Agent-loop traffic is partially unmeasurable on static hosting without edge logs (`llms.txt` fetches invisible to JS analytics). | Low | **Resolved (2026-06-11): the site hosts on Cloudflare** — edge analytics cover `llms.txt` and markdown-mirror fetches natively, closing the gap. Implementation in 06-engineering. |
| R8 | **No packaged wasm artifact exists yet.** storage-next is chartered wasm32-first-class (cache substrate), and `wasm32-unknown-unknown` dependency splits exist — but JS bindings + npm packaging are unbuilt, and readiness tracks the storage-next milestone outside this repo. | Medium | The engine upgrade is fast-follow, never a v2 launch gate (same pattern as R1). Set-pieces are spec'd against a command-executor interface — scripted timeline at launch, the live engine **on the homepage itself** when it lands (living-page model) — a swap, not a redesign. The engine is progressive enhancement: never load-blocking, fetched on interaction/idle, Save-Data respected; perf budgets (§8) bind the *required* JS only. Browser scope is honest: Cache mode only; live search = keyword/hybrid over precomputed seed embeddings. |

## 10. Release plan

Quality-gated, no calendar deadline. Two tracks:

1. **Document track (current):** 00 → 01 → 02 → 03 → 04 → 05/06, each gated on sign-off.
2. **Build track:** existing Phases 1–6 (tracked as tasks), re-scoped by docs 04–06 when
   those are signed off; each phase gated on a browser review against doc specs.

A build phase may not start while any document it depends on is un-signed.

## 11. Open questions

**None.** All resolved 2026-06-11 (recorded in the README decision log):

- Foundry CTA → GitHub repo until artifacts exist; **macOS-first** release builds (R1).
- Playground: fake REPL retires; real wasm experience reinstated, then settled in final
  form — **the live hero** (the engine powers the hero terminal + a fullscreen overlay;
  other sections stay choreographed; scoped 2026-06-11); `/playground` permanently
  retired, 301 → `/`.
- Cross-product design model = one brand, two expressions (scoped in Doc 02).
- Domains: `stratadb.ai` and `stratahub.io` are owned; `strata.dev` is **not** —
  stratadb.org confirmed as family root (01 §2); strata.dev references get scrubbed.
- Analytics: **Cloudflare** in front of GitHub Pages (also resolves R7).
- Wording: **"research preview"** confirmed.
- Foundry fast-follow pre-approved: `/foundry` page + nav slot ship when an artifact exists.
- Docs prose source of truth: **strata-core** (existing sync pipeline stays).
