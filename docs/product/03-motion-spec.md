# Motion Spec — stratadb.org

| | |
|---|---|
| Status | **Signed off** (2026-06-11) |
| Owner | Ani (product) · Claude (drafting) |
| Last updated | 2026-06-11 |
| Upstream | 02-design-language.md §8 (brand motion principles), 00-prd.md R8 (executor) |
| Downstream | 04-experience (storyboards must conform), 05-components, 06-engineering |

This is the site's motion *system* — the vocabulary, budgets, and gates every animation
obeys. Doc 04's storyboards choreograph *with* this system; they may not extend it.
Foundry and the Hub apply the five brand principles (02 §8) directly and ignore Tier 2.

**The prime directive, inherited from 02 §8: motion shows what the system did.** Forks
split. Merges join. History scrubs. Versions accrete. Anything that animates without
depicting a data operation or guiding attention gets cut in review.

---

## 1. Motion tokens

### Durations (CSS custom properties)
```
--dur-1: 120ms   instant feedback (press, focus-adjacent)
--dur-2: 200ms   hover, color/border state
--dur-3: 320ms   panel state changes, small reveals
--dur-4: 480ms   entrance reveals
--dur-5: 800ms   set-piece beats — the ceiling for any non-scrubbed animation
```

### Easings
```
--ease-out:    cubic-bezier(0.16, 1, 0.3, 1)    entrances, reveals (fast arrival, soft landing)
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1)   A→B movement within the canvas
linear                                           scrub interpolation only
```

### Springs (motion/react, JS islands only)
```
spring-snap:   { stiffness: 500, damping: 30 }            presses, toggles, chips
spring-settle: { stiffness: 260, damping: 26 }            panels splitting/joining (the terminal fork)
spring-scrub:  { stiffness: 120, damping: 28, mass: 1.1 } smoothing scroll-linked values
```

Rule: CSS animations use duration+easing tokens; islands use springs. Never both on the
same property. No values outside this table without a spec amendment.

## 2. Tier 1 — Ambient (CSS-only)

- **Entrance reveal** (the only scroll-triggered Tier-1 effect): 16px rise + fade,
  `--dur-4` `--ease-out`; stagger 60ms within a group, max 6 staggered items (7+ animate
  as one); triggers at 20% visibility via one shared IntersectionObserver; plays **once**.
- **Micro-interactions:** hover = color/border only at `--dur-2`; press = 1px translateY
  at `--dur-1`; focus rings appear instantly (never animated — a11y).
- **Terminal typing:** 24–40ms jittered per keystroke for *commands*; a 300ms beat; then
  *output* prints line-by-line at 40ms stagger with no per-character animation (commands
  are typed, output is printed — the distinction reads as real).
- **Cursor blink:** 1.06s `steps(2)` — the **only infinite animation on the site**.
- Hover may never move layout. Reveals may never re-trigger.

## 3. Tier 2 — Scroll-driven

**The covenant: never hijack scroll.** The page always scrolls 1:1 with the user's
input — no scroll-jacking, no synthetic smoothing, no momentum overrides. Scroll position
*drives values*; it is never driven.

### 3.1 Parallax (depth, exactly two sites)
- **Hero:** horizon glow at 0.85×, set-piece at 1.0×, stat strip at 1.04×. Max relative
  drift 48px across the hero's scroll range.
- **Section seams:** decorative layers may drift ±24px max as sections enter.
- Nowhere else. Parallax is depth, not garnish (DESIGN.md inheritance, now binding).
- Touch devices: parallax off entirely (jank risk + no hover-class hardware).

### 3.2 Scrub set-pieces (max two per page)
The **branch story** (fork → modify → diff → merge; added 2026-06-12 — the slot freed
when the Foundry scrub was cut in the seven-section restructure) and the **time-travel
strip**. At the cap. Mechanics:

- Sticky container; scroll ownership ≤ 2.5 viewport-heights per piece.
- Scenes occupy progress bands; transitions crossfade/transform over a 12% progress
  window — *soft* boundaries, no magnetic snapping (snapping is scroll-hijacking).
- Scrubbed values pass through `spring-scrub` for smoothing; interpolation itself is
  linear.
- A caption rail advances with scenes; captions are real DOM text (selectable,
  screen-reader visible), never canvas.
- **Mobile (<768px):** scrub pieces become swipeable scene carousels — no pinning, same
  scenes, same captions.

### 3.3 Implementation constraints
- `motion/react` `useScroll` + motion values; values bypass React re-render (no
  setState-per-frame).
- One passive scroll sampler per page, shared.
- Animated properties: `transform` and `opacity` **only**. Glow/shadow transitions
  animate a pre-rendered pseudo-element's opacity, never `box-shadow`/`filter`.
- `will-change` applied when a set-piece pins, removed when it unpins; ≤3 composited
  layers per set-piece.

## 4. The executor timing contract (PRD R8)

Terminal set-pieces consume an ordered event stream from an executor:

```
ScriptEvent = { type: cmd | output | pause | split | merge, payload, beat? }
ScriptedExecutor — replays authored events on the Tier-1 typing clock (v2 launch)
WasmExecutor   — same events, outputs produced live by the engine (when R8 lands)
```

Motion-layer rules that make the swap invisible:
- Command typing always uses Tier-1 cadence regardless of executor.
- Output waits a minimum 300ms beat (real wasm may be faster — hold the beat) and a
  maximum 1.2s; beyond that, show a dim `…` in the output position (no spinners inside
  terminals, ever).
- `split`/`merge` events drive panel choreography on `spring-settle` (the hero fork).
- Set-piece lifecycle: idle (static first frame) → playing (≥50% in view) → paused (out
  of view) → complete (hold 4s minimum, then fade-restart). A visible, keyboard-reachable
  pause/play control on every autoplaying piece.

**Live-hero engine states (2026-06-11 amendment; scoped to the hero terminal only —
2026-06-11 later decision):** the page boots on ScriptedExecutor; the wasm engine is
progressive enhancement, fetched on first terminal interaction or post-LCP idle
(whichever first; `Save-Data`/constrained connections suppress prefetch). The executor
swap happens only **between loop cycles, never mid-beat**; on swap the live instance is
seeded with the shared demo dataset plus a replay of beats already shown, so visible
state never lies. Terminal chrome carries a truthful status indicator:
`engine: scripted replay` → `engine: live — in your tab`. In live mode, click/focus is
**interactive takeover**: the script yields the prompt (a `reset demo` affordance
restores the loop). A **fullscreen expand** (⛶ in the chrome) opens a full-viewport
overlay — same engine instance, state carries over, focus-trapped, Escape/✕ closes,
no route change; reduced-motion = instant swap, otherwise `--dur-3` scale-fade.
All other sections are choreographed permanently; their components never subscribe to
the engine.

## 5. Choreography budgets

- **One signature moment per viewport.** While a set-piece is mid-beat, ambient reveals
  in the same viewport defer until it completes its beat.
- Total entrance choreography for any group ≤ 800ms end-to-end.
- Nothing runs longer than `--dur-5` except user-scrubbed interpolation and the
  executor-driven set-piece sequences (which are beat-by-beat, each beat ≤ `--dur-5`).
- No looping decorative animation. Set-piece loops complete a full cycle + ≥4s hold.
- Max 2 scrub pieces, max 2 parallax sites, **3 infinite animations** — the cursor;
  (amendment 2026-06-12, Ani: "the hero shouldn't be static") the hero's breathing
  backdrop: three light fields, transform-only, 22–36s periods, off under reduced
  motion; and (amendment 2026-06-12, Ani: the branch section "needs more color and
  liveliness — maybe a smaller version of the animation from the hero") the branch
  pin's river: three strands echoing the hero's, slower (9–14s), desktop pin only,
  never rendered under reduced motion. These caps are review gates, not guidelines.

## 6. Reduced motion — full parity

`prefers-reduced-motion` is honored via one source of truth (`data-motion="reduced"` on
`<html>`, set pre-paint). Parity map:

| Effect | Reduced behavior |
|---|---|
| Entrance reveals | Opacity-only, 200ms |
| Parallax | Off |
| Scrub set-pieces | Static scenes with visible Prev/Next steppers — same content, user-controlled |
| Terminal typing | Completed transcript rendered immediately |
| Split/merge choreography | Final state shown; before/after as static panels |
| Cursor blink | Steady block |
| Micro-interactions | Color/border changes keep `--dur-2`; transforms drop |

Reduced motion is never less content, navigation, or meaning — only less movement.

## 7. Performance gates (checkpoint-blocking)

- 60fps during full-page scroll on a mid-tier laptop; under 4× CPU throttle, no frame
  > 33ms during scrub interaction.
- Zero CLS from animation (transforms only; space always reserved).
- **LCP guard:** every set-piece's first frame is server-rendered static HTML — the page
  is complete and meaningful before any island hydrates (`client:visible` + idle
  hydration). Motion enhances; it never gates first paint.
- JS weight: motion library + hero island ≤ 60KB gz; all islands ≤ 140KB gz total
  (PRD §8); exact split reconciled in 06.

## 8. Storyboard authoring checklist (binding on Doc 04)

Every animation a storyboard specifies must declare: trigger · tier · duration/spring
token · properties animated (transform/opacity only) · stagger plan · reduced-motion
behavior · mobile behavior · exit/interrupt behavior · executor events consumed (if a
terminal piece). A storyboard entry missing any field bounces back in review.

## 9. Motion QA protocol (every build checkpoint)

1. DevTools performance trace over a full-page scroll — no long frames (>50ms).
2. 4× CPU throttle scrub test on both scrub pieces.
3. `prefers-reduced-motion` pass — content parity per §6 table.
4. Touch-device pass — carousels work, parallax absent.
5. Keyboard-only pass — set-piece controls reachable and operable.
6. Island JS size report against §7 budgets.

## Open questions (need Ani)

None — this spec operationalizes already-signed decisions (02 §8, PRD R8, the parallax
scope from the original direction conversation). Review is for taste-level objections:
if any budget feels too strict or too loose, this is the moment to say so, because Doc 04
storyboards will be written against these exact numbers.
