# stratadb.org — Product Documentation Suite

The website is a product. This suite constructs the entire experience in documents before
any of it is built. Each document is a **gate**: downstream documents and all build work
are blocked until their upstream is signed off by Ani.

## Documents

| # | Document | Answers | Status |
|---|---|---|---|
| 00 | [PRD](00-prd.md) | Why the site exists, for whom, what it must achieve, what we may claim | **Signed off** (2026-06-11) |
| 01 | [IA & content strategy](01-ia-content-strategy.md) | Sitemap, domains, nav model, each page's job, messaging hierarchy, SEO + agent-surface posture | **Signed off** (2026-06-11) |
| 02 | [Strata brand foundations + site expression](02-design-language.md) | Tier 1: cross-product brand (palette ramps light+dark, five primitive colors/icons, wordmark, voice, motion principles) consumed by site, Foundry, and StrataHub. Tier 2: the site's bespoke dark expression. Includes Primer theme mapping for Hub and a Foundry token-adoption path | **Signed off** (2026-06-11) |
| 03 | [Motion spec](03-motion-spec.md) | Animation tiers, parallax rules, scrub mechanics, executor timing, reduced-motion parity, perf gates | **Signed off** (2026-06-11) |
| 04 | [Landing experience spec + copy deck](04-experience-landing.md) | Section-level specs, set-piece storyboards, responsive/state behavior, full copy deck | **Signed off** (2026-06-11) |
| 05 | [Component spec](05-component-spec.md) | Design-system inventory: anatomy, states, tokens per component; the EngineProvider contract | **Signed off** (2026-06-12) |
| 06 | [Engineering spec](06-engineering-spec.md) | Stack, data pipelines, truth-verification CI, agent surface, analytics, Cloudflare migration, wasm plan | **Signed off** (2026-06-12) |
| 07 | [Build plan](07-build-plan.md) | Sequencing + done-criteria + checkpoint protocol per phase; no design content | **In review** (skim-and-go gate) |
| 08 | [Iteration backlog](08-iteration-backlog.md) | v1 → world-class: ranked craft-density gaps (hero stage, claim artifacts, lighting system, icons, micro-interactions, live hero), method, references studied | **Living** |
| 09+ | Docs / changelog experience specs | Deeper specs for the rest of the site, if needed | Later |

## Workflow

- Statuses: `Draft` → `In review` → `Signed off`. Only Ani moves a doc to Signed off.
- A change to a signed-off document reopens it and re-gates its downstream.
- Decisions live in documents, not in chat. If we decide something in conversation, it gets
  written into the owning doc before we act on it.
- `DESIGN.md` (repo root) is the Phase-0 seed brief; its content is being absorbed into
  docs 02–04 and it retires when they're signed off.

## Decision log

| Date | Decision | Where |
|---|---|---|
| 2026-06-11 | Refined-dark direction; terracotta + strata identity; landing first; Astro stack | DESIGN.md → 02 |
| 2026-06-11 | Parallax/scroll-driven motion in scope; Foundry featured as product | DESIGN.md → 03/04 |
| 2026-06-11 | Primary audience: AI-agent builders | 00-prd.md §3 |
| 2026-06-11 | North-star action: Foundry download | superseded same day |
| 2026-06-11 | **Dual-loop model**: north star = StrataDB integrated in a project (package downloads); human loop (landing, Foundry as signature demo) + agent loop (llms.txt, markdown docs, MCP recipe); no page fork | 00-prd.md §4 |
| 2026-06-11 | **One brand, two expressions**: shared Tier-1 brand foundations across site/Foundry/Hub; site stays bespoke, Hub keeps Primer themed with brand tokens, Foundry adopts tokens (incl. future dark theme). Reconciles with stratahub's 2026-05-20 Primer decision | 02 (scope) |
| 2026-06-11 | Playground page retired | revised same day (see below) |
| 2026-06-11 | Foundry CTA → GitHub repo until release artifacts exist | 00 §6 |
| 2026-06-11 | Domain strategy **finalized**: stratadb.org family root; stratadb.ai (owned) 301s; stratahub.io (owned) stays API host; strata.dev (NOT owned) scrubbed from all family docs | 01 §2 |
| 2026-06-11 | Analytics: **Cloudflare** fronting GitHub Pages (closes PRD R7 measurement gap) | 00 §11, 06 |
| 2026-06-11 | "Research preview" wording confirmed · Foundry releases macOS-first · `/foundry` fast-follow pre-approved · strata-core = docs source of truth | 00 §11, 01 §10 |
| 2026-06-11 | Docs 00 + 01 signed off (all open questions resolved by Ani) | — |
| 2026-06-11 | **Hosting moves to Cloudflare** (Workers static assets / Pages — picked in 06) at v2 cutover; GH Actions still builds via wrangler; GH Pages retires. Enables real 301s, custom headers, per-PR previews; family consolidates on CF (R2 for Hub, analytics, DNS) | 06; PRD R5/R7; 01 §2/§3/§9 |
| 2026-06-11 | Claim posture: research preview | 00-prd.md §5 |
| 2026-06-11 | No deadline; quality-gated releases | 00-prd.md §10 |
| 2026-06-11 | **Playground decision revised** (Ani correction): fake REPL still retires (302 → /#foundry, URL reserved), but a REAL wasm32 playground (engine in-browser, Cache mode) is reinstated as trigger-gated fast-follow — grounded in storage-next charter P2 "wasm32 first-class for the browser/cache substrate." Landing set-pieces built live-capable via a command-executor interface. Docs 00/01 amended under the approver's instruction; remain signed off | 00 §6/R8, 01 §3/§4/§9, 04 |
| 2026-06-11 | Doc 02 approvals: fonts (General Sans + Commit Mono) approved pending Phase-1 specimen veto · **Foundry accent swap indigo → terracotta approved** (Appendix B2) | 02 |
| 2026-06-11 | **Six primitive icons: designed in-house, ship in v2**; optional designer pass later. Supersedes Hub design doc's "not AI-generated" rule (amend that doc when icons land — cross-repo follow-up). Doc 02 signed off | 02 §6, App C |
| 2026-06-11 | **Quiet competence** (Ani): Strata is a personal project, not a company — the site is proof of work. Copy turns definitional, never promotional; no flashy taglines; demos and engineering legibility persuade. Docs 00/02 amended under approver's instruction | 00 §2, 02 §3, 04 copy |
| 2026-06-11 | **"AI agents" dropped as positioning language** (Ani: incumbents claim it; zero signal). Targeting unchanged (P1 primary); agent use cases stay in cookbook/docs; agent surface (llms.txt/MCP/recipe) stays as infrastructure. Identity strings rewritten definitional; hero eyebrow deleted; CTA close = the install command itself. Docs 00/01/04 amended | 00 §2, 01 §5/§8, 04 |
| 2026-06-11 | **Five primitives** (Ani: `state` removed from strata-core) — full sweep of suite; state hue retired; icon set is five. Cross-repo: strata-core README still says "six… Built in Rust" — needs the same fix; Hub docs say "up to six" — amend | 00/01/02/04 |
| 2026-06-11 | **Quiet magic register** (Ani: "difference between flash and magic"): identity lines use the deadpan-impossible pattern — calm sentences with impossible content, proven by the demo. H1 → "A database you can fork."; search H2 → the demo query itself; "Built in Rust" cut from the sub (trust-row fact, not identity) | 02 §3, 04 |
| 2026-06-11 | **The living homepage** (Ani): when the wasm artifact lands, ONE real StrataDB instance powers every homepage demo — interactive hero takeover, time-travel strip scrubs real history incl. visitor writes, live search/counts, truthful engine status dot, state continuity on executor swap. **`/playground` permanently retired (301 → `/`)** — no nav slot, no separate destination, ever. Progressive enhancement; perf budgets bind required JS only. Doc 03 amended (§4) under approver's instruction | 00 §6/R8, 01 §3/§4/§9, 03 §4, 04 §0 |
| 2026-06-11 | **Branching is not the hat** (Ani: fork-only branching commoditized — Neon/PlanetScale/Dolt). Differentiation = the COMPLETE verb set (diff, merge, cherry-pick) + O(1) zero-copy mechanics + breadth beyond branching. Verb set moves to section 2; hero set-piece gains a diff beat (7 beats) | 00 §2, 01 §5, 04 §2/§3 |
| 2026-06-11 | **Hero goes simple** (Ani: no capability description in hero/H1). H1 → **"An embedded database."** — maximal understatement over the impossible demo; the gap is the effect. Hero sub deleted (badge → H1 → CTAs → terminal → stats). Capability enumeration stays in meta/llms.txt/repo strings and sections 2–8 | 01 §5, 04 §2 |
| 2026-06-11 | **H1 CONFIRMED: "An embedded database."** "For the AI era" considered and rejected (incumbent-saturated, unverifiable, collapses the understatement). Ani: "so unbothered by marketing that we literally call ourselves an embedded database" — recorded as the brand stance in 02 §3. Optional future: an argued "Why Strata" docs page for the era reasoning | 02 §3, 04 §2 |
| 2026-06-11 | **Seven-section restructure** (Ani): hero + branching + multi-primitive + time-travel + **native inference** (first-class, bigger than search) + resources (docs/examples/whitepapers) + install-close with **five surfaces: Python · CLI · Node · Foundry · MCP**. Foundry section cut (install surface only; R2 → Low); performance section cut (stats in hero strip, durability/trust to docs); MCP tab absorbs the For-your-agent block; time-travel = the only scrub piece | 00 §4/§6/R2, 01 §5, 04 |
| 2026-06-11 | **Section-head register** (Ani, ref. claude.com/product/overview): heads go verb-led, second-person, invitational — "Try anything. Keep what works." · "Every kind of data. One file." · "Go back to any moment." · "Just ask." · "Go deeper." · "Start in thirty seconds." Identity stays definitional; conceptual anchors ("a branch is a complete database") move into bodies. Old heads held as alternates in 04 | 02 §3, 04 |
| 2026-06-11 | **Doc 04 signed off.** Head slate approved (all six) · no brew tap (dropped) · seed dataset = curated fictional · 404 wit kept · MCP count omitted · Resources before Install | 04 |
| 2026-06-11 | **The architecture deep-dives ARE the whitepapers** (Ani): the Resources card says "Whitepapers" → `/architecture` from day one; future standalone papers join the same collection; Phase-4 re-skin may adopt paper-style presentation | 04 §7, 01 §3 |
| 2026-06-11 | **Live engine scoped to the hero** (Ani; Claude concurred): the wasm engine powers the hero terminal + a fullscreen overlay (⛶, in-page state, not a route) only. Sections 2–5 choreographed permanently — scripted demos always land their beat; live views can't be art-directed. StrataColumn → CSS-only; EngineProvider multi-view surface marked reserved; "page remembers" beat recorded as future option | 00 §6, 03 §4, 04 §0, 05, 06 §8 |
| 2026-06-12 | **Docs 05 + 06 signed off — documentation phase complete.** Thin build plan (07) created: sequencing/gates only, no design content; resolves the phase-numbering gap (docs + agent surface = Phase 5; polish = 6; cutover = 7); deploy scaffolding moved into Phase 1 so checkpoints get preview URLs | 05, 06, 07 |
| 2026-06-12 | **Branch is not a primitive; the fifth primitive is GRAPH** (Ani correction; verified: GraphCreate/AddNode/AddEdge/Bfs + typed ontology in executor). Five primitives = kv, event, json, vector, graph. Graph takes the violet (ex-state); branch UI wears terracotta as *brand* — the model, not a layer. Strata column bedrock = graph; branch verbs stay in section 2. Ani reservation logged: five hues may read rainbow-y — judged at Phase-3 checkpoint, fallback monochrome+icons | 02 §4.3, 04 §5, tokens.css, specimen |
| 2026-06-12 | **`/specimen` is permanent** (Ani): the shared-foundation reference for site↔Foundry consistency; survives all cutover deletions. tokens.css switched to `@theme static` so every token emits for non-Tailwind consumers (also fixed pruned primitive vars) | 02 App C, 07 Phase 7, specimen |
