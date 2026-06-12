# StrataDB.org Redesign — Design Brief (v2)

Phase 0 deliverable. Nothing in `src/` changes until this brief is signed off.

**Direction (locked with Ani, 2026-06-11):** refined dark · terracotta + strata identity ·
landing page first · Astro stack. Plus: parallax/scroll-driven motion, and Strata Foundry
(the desktop studio) featured as a first-class product on the page.

---

## 1. North star

**A precision instrument, photographed in the dark.**

The site should feel like the product claims to be: fast, exact, quietly confident. Every
pixel either says something true about StrataDB or gets deleted. The one thing a visitor
remembers: **they watched a database fork in front of them.**

Three tests every section must pass before it ships:

1. **The squint test** — blur your eyes; the page should still have an obvious focal point
   and rhythm. If everything glows, nothing does.
2. **The screenshot test** — any full-bleed crop of the page could be posted as-is and look
   deliberate.
3. **The claim test** — every visual is backed by a real product behavior. No decorative
   diagrams of things the product doesn't do.

Craft bar: Linear (discipline), Vercel (typography), Stripe (product-as-photography),
Apple (scroll storytelling). We are not copying any of them; we're stealing their standards.

---

## 2. Identity

### Voice

Assert, show, shut up. Headlines are claims, not descriptions. Body copy max ~2 sentences
per block on the landing page. No exclamation points. No "blazingly." Numbers do the
bragging: `<1 ms fork` says more than "incredibly fast."

### Terracotta, disciplined

Terracotta `#E07A5F` stays the signature — it's warm in a genre full of cold blue/violet,
and it's ours. But it goes from "everywhere" to **surgical**:

- Allowed: the wordmark layer glyph, primary CTA, the prompt glyph in terminals, active/hover
  accents, the horizon glow (one per page region, see §6), inline links.
- Forbidden: large terracotta surfaces, terracotta headlines, terracotta borders on idle
  cards, more than one terracotta-accented element competing in a viewport.

### The strata motif, executed once

The geological metaphor (data laid down in layers, history you can dig through) is the
brand's best idea and currently its most diluted. New rule: the motif appears in exactly
**two** places, both load-bearing:

1. **The horizon** — a thin, 1px-sharp gradient line with a soft terracotta dawn-glow rising
   behind the hero set-piece. Dark sediment below, void above. This is the site's single
   signature lighting effect.
2. **The strata column** — the six-primitives section IS a geological cross-section (§9D).

Everywhere else: flat dark panels, 1px borders, honest shadows. Deleted from the old site:
blur orbs, grid-pattern background, noise overlay, shimmer sweeps, gradient borders,
`animate-pulse` badges, per-section radial glows.

---

## 3. Typography

The single biggest upgrade. Two families, self-hosted variable woff2, subset, preloaded.

| Role | Face | Notes |
|---|---|---|
| Display + UI + body | **General Sans** (Fontshare, free, variable) | Characterful grotesk — confident at 96px, neutral at 16px. Distinctive without being a costume. |
| Code, data, terminals, stats | **Commit Mono** (SIL OFL, free) | Calm, even-color mono. Terminals are our product photography; the mono must read as "instrument," not "IDE theme." Tabular figures for all stats. |

Inter is retired (today's site), and we deliberately avoid the Geist/JetBrains defaults the
genre converges on. Eyebrows/labels are General Sans 13px, 500, uppercase, +6% tracking —
not mono — so terminals keep exclusive rights to the mono voice.

### Scale (desktop → mobile)

| Token | Size/Line | Weight | Tracking | Use |
|---|---|---|---|---|
| `display-xl` | 92/0.98 → 44/1.04 | 600 | -3.5% | Hero headline only |
| `display` | 64/1.02 → 36/1.08 | 600 | -2.5% | One per major section |
| `title` | 40/1.1 → 28/1.15 | 600 | -1.5% | Subsection heads |
| `heading` | 24/1.25 | 600 | -1% | Card heads |
| `body-lg` | 19/1.55 | 400 | 0 | Hero sub, section intros |
| `body` | 16/1.6 | 400 | 0 | Default |
| `small` | 14/1.5 | 400/500 | 0 | Captions, meta |
| `eyebrow` | 13/1 | 500 | +6%, caps | Section labels |
| `mono` / `mono-sm` | 15/1.7 · 13/1.7 | 400 | 0 | Terminal body, code, data |
| `stat` | 56/1 | 500 | -2%, tabular | Numbers (Commit Mono) |

Weights used: 400, 500, 600. Nothing else. No 700+, no thin display weights.

---

## 4. Color tokens

Neutrals are warm-tinted (toward terracotta), never pure gray — this is what makes the dark
feel "sedimentary" instead of default-Tailwind-zinc.

```
/* canvas */
--bg-void:      #0A0908   /* page base — warm near-black */
--bg-panel:     #121110   /* cards, terminals */
--bg-raised:    #1A1817   /* hover states, overlays, chrome bars */
--bg-inset:     #060605   /* terminal bodies, wells */

/* lines */
--border:       rgba(245, 240, 235, 0.08)
--border-hover: rgba(245, 240, 235, 0.14)
--border-focus: #E07A5F

/* ink */
--text-hi:      #F5F0EB   /* warm white — headlines, primary */
--text-mid:     #A8A29B   /* body */
--text-low:     #6B665F   /* captions, idle meta */

/* signature */
--terracotta:        #E07A5F
--terracotta-bright: #F2967B   /* hover, on-dark links */
--terracotta-deep:   #B05138   /* pressed */
--horizon-glow:      rgba(224, 122, 95, 0.13)  /* the ONE glow */

/* strata (six primitives — recalibrated to sit evenly on #0A0908) */
--strata-kv:     #6B9FFF
--strata-event:  #4FC596
--strata-state:  #A88BFA
--strata-json:   #E5B566
--strata-vector: #E87BB4
--strata-branch: #E07A5F   /* branch IS terracotta — the brand primitive */

/* semantic */
--ok: #4FC596  --warn: #E5B566  --err: #E5635C
```

Primitive colors appear only inside the strata column, terminal syntax, and diff/data
visuals — never as section decoration.

Contrast gates: body pairs ≥ 7:1 (`text-mid` on `bg-void` passes), all interactive text
≥ 4.5:1, terracotta-on-void used at ≥ 19px or weight ≥ 500 (it's 4.6:1).

---

## 5. Space & layout

- **Base unit 4px.** Spacing steps: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128 / 160.
- **One container: 1120px** + 24px gutters (16px < 480px). Marketing prose column: 680px.
- **Section rhythm is fixed:** 128px vertical padding desktop / 80px mobile, every section,
  no exceptions. Rhythm is the thing you feel before you see.
- 12-col grid, 24px gap. Asymmetry is allowed (7/5, 8/4 splits for text-beside-product) —
  centered-everything is the current site's tell.
- Radii: 6px (controls) / 10px (cards) / 14px (terminals & product frames). Nothing else.
- Hairlines everywhere: 1px `--border`. Borders brighten on hover, never thicken.

---

## 6. Surface, depth, light

- Panels are flat `--bg-panel` + hairline. **No gradient fills on surfaces.**
- Shadow exists only under floating set-pieces (terminal, Foundry frame):
  `0 1px 0 rgba(245,240,235,0.06) inset, 0 24px 64px -32px rgba(0,0,0,0.7)`.
- **The horizon glow** (§2) renders exactly twice per page: behind the hero set-piece, and
  faintly behind the final CTA. It is a positioned radial + 1px gradient line, not a blur orb.
- Terminal chrome: 40px header, three **monochrome** 10px dots (`--text-low`), title in
  `mono-sm`, body on `--bg-inset` at `mono` 15/1.7. Prompt: `strata:main ›` with only the
  `›` in terracotta. This chrome is a component; every terminal on the site is pixel-identical.

---

## 7. Motion system

Motion is choreography, not decoration. Two tiers:

### Tier 1 — ambient (CSS only)
- **Entrance reveals:** 16px rise + fade, 480ms, `cubic-bezier(0.16, 1, 0.3, 1)`, stagger
  60ms within a group, trigger at 20% visibility, **play once**.
- **Micro-interactions:** 150ms hovers (border, color), 250ms transforms. Buttons compress
  1px on press. Links underline-slide.
- **Terminal typing:** keystroke cadence 24–40ms jittered, 300ms beat between command and
  output. Cursor blink is the only infinite animation on the site.

### Tier 2 — scroll-driven (the parallax budget)
Powered by `motion/react` (`useScroll` + transforms) inside Astro islands — reliable across
browsers, springs for free. Rules:

- **Parallax is depth, not garnish.** Only true depth layers move at different rates, and
  only in two places: the hero (horizon glow at 0.85×, set-piece at 1×, foreground stats at
  1.04×) and section seams (±24px max drift on decorative layers).
- **Scroll-scrub set-pieces** (sticky container, scroll position = timeline): exactly two —
  the Foundry showcase (§9C) and the time-travel strip (§9B). Scrub mappings are eased and
  clamped; a set-piece never exceeds 2.5 viewport-heights of scroll ownership.
- Transforms and opacity only — nothing that triggers layout. `will-change` applied while
  pinned, removed after.
- 60fps on a mid-tier laptop is a gate. If a piece can't hold it, it loses parallax, not FPS.

### Reduced motion
`prefers-reduced-motion`: reveals become opacity-only, parallax fully off, scrub pieces
render their best single frame, typing renders completed. Full content parity.

---

## 8. Strata Foundry on the page

Foundry today is a light-themed utilitarian Tauri app (white, `#4F6BED` indigo, SF Mono).
Real screenshots would clash with the site and undersell the product.

**Decision: product photography, not screenshots.** We rebuild idealized Foundry frames in
HTML/CSS (sidebar, tab bar, branch switcher, diff view, vector search), restyled in the
site's dark palette with terracotta accents and curated data — exactly how Linear and Stripe
render their UIs. Honest about capability (only real features: branch switch, fork, diff,
vector search, KV tree), idealized in styling.

> ⚠ Flag: this previews a "Foundry dark mode" that doesn't ship yet. If that bothers you,
> alternatives are (a) restyle frames in Foundry's real light theme floating on the dark
> page, or (b) ship Foundry dark mode someday and call it a preview. Default is the dark
> restyle — say so if you want (a).

Frames are built from a shared `<ProductFrame>` component so all Foundry moments share
chrome, exactly like the terminal component.

---

## 9. The landing page — narrative & set-pieces

Section order tells one story: *fearless change → perfect memory → see it → one box of
parts → ask it anything → numbers → install*.

**0 · Nav** — 64px, `bg-void/85` + blur + hairline. Wordmark (layer glyph + "StrataDB"),
Docs, Architecture, Playground, Changelog, GitHub (live star count, quiet), `Get Started`
primary. Collapses to sheet menu < 768px.

**1 · Hero + Set-piece A: "The Forking Terminal"** — the page's signature moment.
- Eyebrow: `THE EMBEDDED DATABASE FOR AI AGENTS`
- H1 (`display-xl`, candidates, pick one):
  1. **"Branch your data like code."**
  2. "Git semantics. Database guarantees."
  3. "The database with an undo for everything."
- Sub (`body-lg`, 1 sentence): "StrataDB is a Rust-native embedded database — fork,
  time-travel, merge, and search six data primitives, from one file in your process."
- CTAs: `Get Started` · `curl -fsSL stratadb.org/install.sh | sh` in a copyable mono chip.
- **Set-piece A storyboard:** one terminal on the horizon glow types
  `strata branch create experiment` → the window **physically splits in two** — panels
  slide apart on a spring, a 1px branch-line arcs between them, the right terminal's title
  bar reads `experiment` — writes diverge in the fork (`kv put config.theme "midnight"`),
  then `strata branch merge experiment` slides them back together with a one-beat diff
  flash (green `+1 key`). Loops with a long, calm pause. Autoplays muted by scroll position;
  the visual IS the pitch.
- Below: quiet stat strip in Commit Mono, hairline-separated:
  `250K ops/s · <1 ms fork · 6 primitives · 0 deps · Apache-2.0`

**2 · Branching ("Experiment without fear.")** — 7/5 split: claim + 2 lines left; right, a
compact static terminal showing fork → risky writes → `branch delete` — main untouched.
The safety argument in 6 lines of mono.

**3 · Time travel ("Yesterday is a query.") — Set-piece B (light scrub):** a horizontal
version-history strip (sticky ~1.5 viewport-heights); scrolling scrubs a playhead across
timestamped versions of one key while a code panel updates: `db.at(yesterday)` →
`snapshot.kv.get("config")`. Versions accrete left-to-right like sediment — motif echo
without saying so.

**4 · Six primitives ("Six primitives. One file.") — Set-piece C: The Strata Column.**
The motif, executed once, properly: a full-width geological cross-section of six thin
layers (kv blue → branch terracotta at bedrock). Hover/tap a layer: it thickens ~8px,
label brightens, and a one-line API signature surfaces in mono
(`db.kv.put(key, value) → version`). Subtle ±12px parallax drift between layers while
scrolling past. No grid of six cards — one object you read like core sample.

**5 · Foundry ("Meet Strata Foundry.") — Set-piece D (main scrub):** sticky product frame,
~2.5 viewport-heights. Scroll scrubs three scenes with eased snaps: ① KV tree + JSON
detail → ② branch switcher flips `main → experiment`, rows visibly diverge → ③ diff view:
green/red/amber entries, then merge. Caption rail advances alongside. Closes with:
"Free desktop studio for macOS, Windows, Linux." `Download Foundry` secondary CTA.

**6 · Search ("Ask your data a question.")** — 5/7 split. Static-but-typed demo: query
`"what changed before the deploy failed?"` types into a search field; ranked results
surface from *different primitives* (an event, a kv version, a vector hit) with primitive-
colored left-edge ticks. Footnote: `auto_embed=True` · any OpenAI-compatible endpoint ·
hybrid + rerank.

**7 · Performance ("Fast by default. Durable on demand.")** — three `stat` numbers
(250K ops/s · <10 µs p99 read · <1 ms fork), then the three durability modes as a clean
hairline table (Cache / Standard / Always — exact fsync semantics). Trust row beneath:
fuzzing-tested · crash-recovery verified · 100% safe Rust · Apache-2.0.

**8 · Install ("Thirty seconds to first write.")** — tabbed mono chips: pip / npm / cargo /
brew / curl. One shared terminal beneath the tabs shows the 4-line first-write session.
Quick-links row: Tutorial · Python SDK · Node SDK · MCP server · Playground.

**9 · CTA + Footer** — faint horizon glow returns (second and last use). "Start where your
code already is." `Get Started` + `Star on GitHub`. Footer: 4 columns, all links real —
dead Discord/Twitter/`#` links and nonexistent /privacy /terms pages are dropped.

Deleted relative to today: the red/green "Without/With Strata" comparison cards (replaced
by sections 2–3 showing instead of telling), duplicated GitHub CTAs, the scroll-indicator
mouse, all unused components.

---

## 10. Quality gates (every checkpoint)

- **Performance:** Lighthouse ≥ 95 / LCP < 1.5s / CLS < 0.02. Hero set-piece JS ≤ ~60KB gz;
  total island JS ≤ 140KB gz. Fonts: 2 variable woff2, subset, preloaded, `font-display: swap`.
- **A11y:** AA contrast per §4, full keyboard nav, visible focus (`--border-focus` 2px offset
  ring), reduced-motion parity, semantic landmarks, all set-pieces have text equivalents.
- **Responsive:** 360 / 768 / 1024 / 1440 / 1920 all deliberate. Set-pieces have explicit
  mobile behaviors (hero terminal: vertical split; Foundry scrub: swipeable scenes;
  strata column: tap-to-expand) — never "same thing, smaller."
- **No dead UI:** every link resolves; org links point at `stratalab/*`.

## 11. Build plan

Stack: Astro 5 + Tailwind **v4** (CSS-first `@theme` tokens mirroring §3–§6) +
`motion/react` islands. Old `src/` rebuilt clean on this branch; docs/content collections
untouched until Phase 4.

| Phase | Deliverable | Checkpoint |
|---|---|---|
| 1 · Foundation | Tokens, fonts, Nav, Footer, section shell, terminal + ProductFrame chrome, type specimen page | Browser review: specimen + empty shell |
| 2 · Set-piece A + Hero | Forking terminal, horizon, stat strip | The make-or-break review; iterate until great |
| 3 · Sections 2–4 | Branching, time-travel scrub, strata column | Browser review |
| 4 · Sections 5–8 | Foundry scrub, search, performance, install | Browser review |
| 5 · CTA/footer + polish | Responsive sweep, a11y pass, perf audit, OG images, copy pass | Full-page review vs §10 gates |
| 6 · Cutover | PR `redesign/v2 → main`, old components deleted, docs pages get tokens only | Ship |

Each checkpoint: dev server + screenshots; nothing advances unreviewed.

## 12. Open questions for Ani

1. **Hero headline** — pick from §9.1 (default: "Branch your data like code.")
2. **Foundry dark restyle** — OK as specced in §8? (default: yes)
3. **Fonts** — General Sans + Commit Mono get a specimen page at Phase 1 checkpoint;
   veto there if they don't sing.
4. **Foundry download CTA** — does a real download/install path exist yet, or should §9.5
   link to the GitHub repo for now?
