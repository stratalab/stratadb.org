# Engineering Spec — stratadb.org

| | |
|---|---|
| Status | **Signed off** (2026-06-12) |
| Owner | Ani (product) · Claude (drafting) |
| Last updated | 2026-06-11 |
| Upstream | 00 (PRD §7/§8, R1/R5/R7/R8), 01 (§2 domains, §7 agent surface), 02 §13, 03 §7, 04, 05 |
| Downstream | Build Phases 1–6 |

## 1. Stack

Astro 5 (static output) · Tailwind **v4** via `@tailwindcss/vite` (CSS-first `@theme`
tokens — the 02 §13 contract lives in `src/styles/tokens.css`) · React 18 islands ·
`motion/react` · TypeScript strict. The old `@astrojs/tailwind` (v3-era) integration is
removed. `src/` is rebuilt clean on `redesign/v2`; content collections for docs are
untouched until Phase 4 of the build.

## 2. Fonts

Self-hosted variable woff2, latin subset: **General Sans** (Fontshare license, display +
body) and **Commit Mono** (SIL OFL, mono). Preloaded in `<head>`, `font-display: swap`,
metric-compatible fallback stacks to keep CLS ≈ 0. The gstatic hotlinks die.

## 3. Rendering & hydration

- Pure static output; zero server runtime required for v2.
- Islands hydrate `client:visible` (set-pieces) or `client:idle` (nav). Every island's
  first frame is SSR HTML (03 §7 LCP guard; 05 §1.4).
- The reduced-motion attribute (`data-motion`) is set by an inline pre-paint script.

## 4. Data pipelines (PRD §7 — drift must be impossible)

| Data | Source | Mechanism |
|---|---|---|
| Version strings | GitHub Releases API (`stratalab/strata-core`) | Build-time fetch → `src/data/release.json`; committed cache as fallback so builds never fail offline; **CI fails if any semver literal appears in `src/` outside this file** |
| Changelog page | `CHANGELOG.md` fetched raw from strata-core at build | Replaces the sibling-path read + stale fallback; rebuilds via the existing `repository_dispatch: docs-update` |
| Benchmarks (stat strip, conditions) | `src/data/benchmarks.json` with a `source`+`measured_at` provenance field per number | Synced from strata-benchmarks (manual import acceptable for v2; provenance is mandatory) |
| Docs prose | strata-core sync pipeline (01 §6 — source of truth confirmed) | unchanged |
| Seed dataset | `src/data/seed.ts` (curated fictional, Doc 04) | hand-authored, typed |

## 5. Truth-verification CI (the claims policy, mechanized)

Run on every PR; cutover-gating items marked ⛔:

1. ⛔ **Link check** (lychee): zero dead links, internal + external.
2. ⛔ **Transcript verification**: a script installs the strata CLI (release binary) in
   CI, executes every command string from the copy deck's demos, and diffs real output
   against the spec'd strings. Demos that lie fail the build.
3. ⛔ **Version-drift check** (§4).
4. **Bundle budget check**: island JS vs 03 §7 / 05 §6 budgets; fails over 140KB gz.
5. **Lighthouse CI**: perf ≥ 95, LCP < 1.5s, CLS < 0.02 on the landing page.
6. **Axe smoke** + reduced-motion render check on both executor paths.

## 6. Agent surface generation (01 §7)

- `/llms.txt`: template with build-injected canonical links + one-liner (the Doc 04 §9
  string — single-sourced).
- `/llms-full.txt`: build-time concatenation of docs markdown, section-delimited with
  stable source URLs.
- Markdown mirrors: an Astro endpoint per docs route emits `<route>.md` (frontmatter
  stripped, pure CommonMark) from the same content collections — one source, two doors
  (PRD §7.6).

## 7. Analytics & metrics (PRD §4)

- **Cloudflare Web Analytics** (beacon, cookie-free) for pageviews; **edge request
  analytics** for `llms.txt`/mirror fetches (closes R7).
- Install-copy events: a minimal beacon (`navigator.sendBeacon`) to a tiny Worker
  endpoint — no cookies, no identifiers, counts only. If we'd rather not run any
  endpoint for v2, the fallback is CF analytics custom events; flagged in §11.
- External (no site work): PyPI/npm/crates download trends (north star), GitHub stars,
  Foundry release download counts when artifacts exist.

## 8. The wasm plan (R8, predetermined upgrade path)

When `@stratadb/wasm` (or equivalent) exists: dynamic-imported loader, engine in a Web
Worker, instantiated per 03 §4 fetch policy (interaction/idle, Save-Data aware).
`WasmExecutor` implements the 05 §4 contract, **consumed by the hero terminal and its
fullscreen overlay only** (scoped 2026-06-11 — sections 2–5 are choreographed
permanently). The wasm payload lives **outside** the 140KB island budget — an optional
enhancement, size-guarded separately (target < 3MB compressed; brotli via Cloudflare).
Nothing on the page ever waits for it.

## 9. Hosting & deploy (the Cloudflare migration, PRD R5)

- **Cloudflare Workers static assets** (the go-forward platform; "Pages" only if some
  constraint surfaces during Phase 1 spike). Deploy via `wrangler deploy` from GitHub
  Actions; the workflow keeps `push: main` + `repository_dispatch: docs-update` triggers.
- **PR previews**: workers preview URLs posted as PR comments — these are the build
  checkpoints' review links.
- **DNS** (one work package; requires Ani — §11): stratadb.org zone to Cloudflare;
  `stratadb.ai` 301 → stratadb.org; `hub.stratadb.org` reserved; apex + www canonical.
- **Redirect rules** (edge): `/playground` → `/` (301) · URL-permanence 301s as needed.
- **GH Pages retirement at cutover**: disable Pages, delete `CNAME`/`.nojekyll`, remove
  `deploy-pages` workflow steps.

## 10. SEO & meta

Per-page title/description from frontmatter (01 §8 patterns) · sitemap restored (Astro 5
compatible generation — the old disabled integration is replaced, robots.txt finally
tells the truth) · canonical URLs · JSON-LD (`SoftwareApplication`, `FAQPage`,
`BreadcrumbList`) · OG images generated at build (satori → resvg; dark canvas template
per Doc 04 §9).

## 11. Dependencies on Ani (not blockers to starting Phase 1)

1. **Cloudflare zone access** — move stratadb.org DNS when convenient; everything else
   in §9 is automatable after that. GH Pages keeps serving until cutover regardless.
2. **Copy-event endpoint** — OK running a tiny counting Worker, or prefer zero custom
   endpoints for v2? (Default if silent: zero — CF analytics only, copy-events deferred.)
3. **GitHub Actions secret** — a Cloudflare API token in repo secrets when we wire deploy.

## Open questions

None beyond §11's logistics. This spec consolidates signed decisions; review is for
implementation-shape objections.
