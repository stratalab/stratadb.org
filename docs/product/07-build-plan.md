# Build Plan — stratadb.org

| | |
|---|---|
| Status | **Signed off** (2026-06-12 — "Lets build Phase 1") |
| Owner | Ani (approver) · Claude (builder) |
| Last updated | 2026-06-12 |
| Rule | **This document contains no design decisions** — only sequencing, done-criteria, and checkpoint protocol. Any conflict resolves in favor of Docs 02–06. |

Seven phases, each ending in a browser checkpoint. Nothing advances unreviewed.
(This plan resolves a numbering conflict: docs re-skin + agent surface, previously
unassigned, become Phase 5; polish and cutover shift to 6 and 7.)

## Standing checkpoint protocol (every phase)

Preview URL (per-phase deploy, §Phase 1.6) + screenshots · the relevant 03 §9 motion-QA
items · claims audit against PRD §5 · phase done-criteria below checked off explicitly.

---

## Phase 1 — Foundation

Order matters here; everything else builds on 1–3.

1. **Toolchain**: Tailwind v4 via `@tailwindcss/vite`; remove `@astrojs/tailwind` + old
   `tailwind.config.mjs`; TS strict. Old landing components stay untouched until Phase 7
   (content collections keep working throughout).
2. **`src/styles/tokens.css`** — the 02 §13 contract, names exactly as written; CI check
   added: zero hex/duration literals outside this file.
3. **Fonts**: General Sans + Commit Mono — subset, self-host, preload, metric-matched
   fallbacks; gstatic hotlinks removed.
4. **Foundation components** (05 §2): SectionShell → Eyebrow/Heading/Badge → Button/
   CopyChip/StatStrip/Card → HorizonGlow/Footnote.
5. **Chrome**: TerminalFrame (`transcript` mode only) · Nav · Footer.
6. **Deploy scaffolding now, not at cutover**: GH Actions builds + `wrangler` preview
   deploys (checkpoint links come from this); truth-check CI skeleton (link check +
   literal-drift check). Prod stays on GH Pages until Phase 7. *(Needs from Ani: CF API
   token in repo secrets — Doc 06 §11.)*
7. **`/specimen`** page: full type scale, every token, every foundation component, one
   TerminalFrame — the font-veto artifact.

**Done when:** specimen renders everything from tokens only · fonts subset + preloaded,
CLS ≈ 0 · shell Lighthouse ≥ 95 · nav/footer ship real links (stratalab org) · CI
skeleton green · preview URL works.
**Checkpoint:** Ani reviews specimen in browser; **font veto exercised here**.

## Phase 2 — Hero (the make-or-break)

1. `EngineProvider` + `ScriptedExecutor` + the beat-script data model (05 §4).
2. TerminalFrame `scripted` mode — typing clock per 03 §2.
3. **Seed dataset v1** (`src/data/seed.ts`) — the curated fictional world, authored so
   every demo beat across the whole page has a true answer in the data.
4. `ForkingTerminal`: split/merge on `spring-settle`, branch-line SVG, pause/play,
   lifecycle states.
5. Hero assembly: badge → H1 → CTAs → set-piece → stat strip; horizon glow; parallax
   site #1. Minimal `release.json` + `benchmarks.json` pipelines feed badge + strip.
6. Reduced-motion (completed transcript) + mobile (vertical fork) paths.

**Done when:** all 7 beats land per 04 §2 storyboard · 60fps (and 4× throttle ≥ 30fps) ·
JS-off renders the completed-transcript first frame · hero island ≤ 60KB gz · no string
in the hero is hardcoded that the truth rules say must be data.
**Checkpoint:** expect multiple iteration rounds; this phase is done when it's *great*,
not when it's complete.

## Phase 3 — Sections 2–4

`VerbTranscript` (zero-JS) → `StrataColumn` (CSS-only: transforms, `<details>` mobile,
keyboard traversal, bottom-up reveal + seam drift) → `VersionStrip` (the only scrub:
3 authored scenes, steppers under reduced motion, mobile carousel).

**Done when:** every 04 conformance field is observable · scrub passes the 4×-throttle
test · keyboard-only pass clean · zero new JS for sections 2–3.

## Phase 4 — Sections 5–7 + pipeline hardening

`InferenceDemo` (typed query, staggered results) → Resources cards → `InstallTabs`
(five surfaces; MCP tab = config + llms.txt pointer + recipe link) → `CommandClose` +
second horizon glow. Harden pipelines: release/benchmarks fetch with cached fallback;
**transcript-verifier CI goes live** (the real CLI runs every demo string).

**Done when:** the full landing page exists end-to-end · transcript verifier green ·
install tabs render only working paths · page ends on the command.

## Phase 5 — Docs & agent surface

Docs + architecture layouts re-skinned with tokens (content untouched — strata-core owns
prose) · `/docs/getting-started/for-agents` recipe page · `llms.txt` + `llms-full.txt` +
markdown mirrors (one source, 06 §6) · changelog generation from release data (kills the
stale-fallback bug) · 404 page · reference-collection config cleanup (01 §6).

**Done when:** every docs URL serves HTML + `.md` twin · llms-full regenerates from the
same collections · changelog shows real releases · sidebar/footer carry no dead links.

## Phase 6 — Polish sweep

Responsive 360–1920 with designed set-piece behaviors · full a11y pass (axe + manual
keyboard + reduced-motion parity per 03 §6) · perf audit vs every 03 §7 / PRD §8 number ·
OG image generation · sitemap + JSON-LD · final copy + claims audit against PRD §5.

**Done when:** every gate number is met and screenshotted, not asserted.

## Phase 7 — Cutover

Cloudflare prod migration (DNS flip — *needs Ani*, Doc 06 §11) · redirect rules
(`/playground` 301, `stratadb.ai` 301) · GH Pages retirement (CNAME/.nojekyll/workflow) ·
delete all old landing components + the 7 dead ones + DESIGN.md (suite supersedes it) —
**but never `/specimen`**: it is the permanent shared-foundation reference for Foundry
consistency (2026-06-12) ·
PR `redesign/v2 → main` with the claims-audit checklist in the description · verify
prod + `repository_dispatch` rebuild still works.

**Done when:** stratadb.org serves v2 from Cloudflare; the old site exists only in git
history.

---

## Out of band (any time, not gated)

Cross-repo follow-ups (owner: Ani, I can draft PRs on request): scrub `strata.dev` from
the Hub README (unowned domain) · strata-core README fix ("six primitives… Built in
Rust" → five: kv/event/json/vector/graph) · Hub design-doc amendments (icons rule,
"up to six" badge row → five with graph, stratadb.ai → hub.stratadb.org).
