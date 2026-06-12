# Component Spec — stratadb.org

| | |
|---|---|
| Status | **Signed off** (2026-06-12) |
| Owner | Ani (product) · Claude (drafting) |
| Last updated | 2026-06-11 |
| Upstream | 02 (tokens), 03 (motion), 04 (experience, seven-section shape) |
| Downstream | Build Phases 1–5 |

## 1. Principles

1. **Static by default.** Astro components render everything; React islands exist only
   where interaction demands them. Every island is justified in §6's budget table.
2. **Tokens only.** No component contains a raw color/size/duration — everything resolves
   to the 02 §13 token sheet. A hex literal in a component is a review failure.
3. **One engine, one live view (scoped 2026-06-11).** The hero terminal (and its
   fullscreen overlay) is the only engine consumer; sections 2–5 are choreographed
   permanently. The `EngineProvider` contract (§4) keeps the multi-view surface as
   *reserved* so future cross-section liveness stays a swap, not a rewrite.
4. **SSR-complete first frames.** Every island's initial appearance is server-rendered
   HTML (03 §7); hydration enhances, never reveals.

## 2. Foundation components (Astro, static)

| Component | Anatomy & rules | States |
|---|---|---|
| `SectionShell` | Enforces the 128/80 rhythm + 1120px container; props: `eyebrow`, `id`. The ONLY place section spacing exists | — |
| `Eyebrow` | 13px/500/+6% caps, `--text-low` | — |
| `Heading` | Maps `display-xl`/`display`/`title` to the 02 §11 scale; tracking baked in | — |
| `Badge` | Pill, hairline, `mono-sm`; the hero's research-preview marker | hover (border-hover) |
| `Button` | `primary` (terracotta, 1px press-compress) / `quiet` (hairline) | hover · focus ring (2px terracotta, 2px offset) · active |
| `CopyChip` | Mono command + copy affordance; used for curl chip, config blocks, the close | hover · copied (`✓ copied`, 2s, ok-green) |
| `CommandClose` | The `pip install stratadb` closing statement: `stat`-scale Commit Mono + CopyChip behavior + trust line slot | as CopyChip |
| `StatStrip` | Hairline-separated Commit Mono row; footnote markers; values from data file only | — |
| `Card` | `--bg-panel`, 10px radius, hairline; hover border-bright. Resources cards | hover · focus-within |
| `HorizonGlow` | The 1px gradient line + radial glow. **Hard cap: two instances per page** (hero, install close at 60%); the component throws in dev if mounted a third time | — |
| `Footnote` | Superscript marker → tooltip/anchor with the stat's condition line | focus/hover |

## 3. Chrome components

### `TerminalFrame` (Astro shell + optional island core)
The product-photography primitive — pixel-identical everywhere (02 §12).

- **Anatomy:** 40px header — three 10px monochrome dots (`--text-low`), `mono-sm` title,
  right-aligned **status slot** (`engine: scripted replay` / `engine: live — in your
  tab`, per 03 §4) — body on `--bg-inset`, `mono` 15/1.7, prompt `strata:{branch} ›`
  with only `›` terracotta.
- **Modes:** `transcript` (static SSR text, no JS — section 2) · `scripted` (executor
  replay — hero) · `live` (wasm executor — R8).
- **A11y:** body is real text (selectable, SR-readable); `role="log"` +
  `aria-live="polite"` for appended output; pause/play button keyboard-reachable.

### `ProductFrame`
Foundry chrome for the install tab's optional static thumbnail only (R2-Low). Sidebar +
tab bar + content slot, dark target identity, real capabilities only.

### `InstallTabs` (island)
Five surfaces (Python · CLI · Node · Foundry · MCP). Tabs are `tablist`/`tab`/`tabpanel`
with arrow-key navigation; selected tab persists in `sessionStorage`; panel content is
SSR'd for all five (no fetch on switch). Panels compose `CopyChip` + snippet blocks.

## 4. The engine layer (the living-page contract, PRD R8 / 03 §4)

```ts
// One per page. Astro renders views SSR; this orchestrates them after hydration.
interface EngineProvider {
  state: 'scripted' | 'loading' | 'live'
  execute(cmd: string): AsyncIterable<ScriptEvent>   // typing layer consumes events
  seed(dataset: SeedDataset): void
  takeover(): void                                    // live only: script yields prompt
  reset(): void                                       // restore seed + loop
  expand(): void / collapse(): void                   // fullscreen overlay (03 §4)

  // RESERVED (scoped out 2026-06-11; kept so cross-section liveness is a future
  // swap, not a rewrite — no v2 component may call these):
  // subscribe(view, fn) · history(key?) · counts()
}

type ScriptEvent =
  | { type: 'cmd'; text: string }
  | { type: 'output'; text: string; tone?: 'ok' | 'nil' | 'err' }
  | { type: 'pause'; ms: number }
  | { type: 'split' } | { type: 'merge' }             // panel choreography (03 §4)
```

- `ScriptedExecutor` replays the authored beat scripts (04 storyboards) on the Tier-1
  typing clock. `WasmExecutor` produces real outputs; both emit the same stream.
- Engine fetch/swap policy, state continuity, and the status indicator are owned by
  03 §4 — this contract just implements them.
- Views are dumb: they render snapshots/events and never touch storage directly.

## 5. Set-piece components (islands)

| Component | Section | Notes | States beyond default |
|---|---|---|---|
| `ForkingTerminal` | Hero | Two `TerminalFrame`s + branch-line SVG; beats 1–7; `spring-settle` split/merge; pause/play; live: takeover + **fullscreen overlay** (⛶, focus-trapped, Esc, same instance) | idle · playing · paused · complete · takeover · fullscreen |
| `VerbTranscript` | Branching | `TerminalFrame mode=transcript` — **zero JS, permanently** (scoped 2026-06-11) | — |
| `StrataColumn` | Multi-primitive | **CSS-only, not an island** (no live counts): hover/focus thicken via transform; mobile accordion via `<details>`; arrow-key traversal via tabindex | hover · focus · expanded |
| `VersionStrip` | Time travel | The only scrub (03 §3.2): sticky 1.5vh, 3 authored scenes, `spring-scrub`; reduced-motion = static + steppers. Choreographed permanently | scenes 1–3 · stepper mode |
| `InferenceDemo` | Inference | Search field types the query (Tier-1); results stagger with primitive ticks. Choreographed permanently; authored against the seed dataset | idle · typing · results |
| `NavMenu` | Nav | Mobile sheet; focus-trapped; closes on route/Escape | open/closed |

All six conform to 03 §8 (their full storyboard fields live in Doc 04).

## 6. Island budget (vs 03 §7: hero ≤60KB gz, total ≤140KB gz)

| Island | Est. gz | Notes |
|---|---|---|
| motion/react (shared) | ~32KB | one copy, shared chunk |
| ForkingTerminal + ScriptedExecutor + beats + fullscreen overlay | ~20KB | hero allowance 60KB incl. shared motion |
| VersionStrip | ~8KB | useScroll + authored scenes |
| InferenceDemo | ~6KB | |
| InstallTabs | ~4KB | |
| NavMenu | ~2KB | |
| **Total** | **~72KB** | ~68KB headroom; `WasmExecutor` loader is OUTSIDE this budget (R8 progressive payload, 06 §8) |

`VerbTranscript` and `StrataColumn` ship zero-JS, permanently (scoped 2026-06-11).

## 7. Conventions

- `src/components/{foundation,chrome,engine,sections}/`; Astro files for static,
  `.tsx` only for islands; one component per file; props typed.
- Tokens imported from `src/styles/tokens.css` (the 02 §13 contract) — Tailwind v4
  `@theme` names used directly in class form.
- Seed dataset lives at `src/data/seed.ts` (typed, single source for demos + frames +
  future live instance).
- Every island exports a `reducedMotion` render path; CI smoke checks both.

## Open questions

None — this consolidates signed decisions. Review is for shape objections (e.g., if you
want `StrataColumn` CSS-only at launch and island-ified later, say so).
