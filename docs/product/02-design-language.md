# Strata Design Language — Brand Foundations & Site Expression

| | |
|---|---|
| Status | **Signed off** (2026-06-11) |
| Owner | Ani (product) · Claude (drafting) |
| Last updated | 2026-06-11 |
| Upstream | 00-prd.md (claims policy), 01-ia-content-strategy.md |
| Downstream | 03-motion, 04-experience, 05-components, 06-engineering |
| Also consumed by | `strata-foundry` (Appendix B), `stratahub` discovery UI (Appendix A) |

**Decision this implements:** one brand, two expressions (2026-06-11). Part I is Tier 1 —
brand foundations shared by stratadb.org, Strata Foundry, and StrataHub. Part II is
Tier 2 — the website's own expression. The appendices are adoption contracts for the
other two surfaces; they extend StrataHub's 2026-05-20 design direction rather than
replacing it.

---

# PART I — BRAND FOUNDATIONS (Tier 1, cross-product)

## 1. The brand idea

**A precision instrument for data with a memory.**

Strata's metaphor is geological: data laid down in layers, history you can core-sample,
nothing erased. The personality that follows: *precise, warm, unhurried, confident
without swagger.* Every surface — site, studio, hub — should feel like an instrument
that knows exactly what it recorded and when.

## 2. Naming

| Name | Refers to | Rules |
|---|---|---|
| **StrataDB** | The database (engine + SDKs) | One word, capital S + DB. Never "Strata DB," "StrataDb" |
| **Strata Foundry** | The desktop studio | Two words. "Foundry" alone is fine after first mention |
| **StrataHub** | The dataset hub (protocol + service) | One word, capital S + H |
| `strata` | The CLI binary | Lowercase, monospace, only in code contexts |
| "Strata" (family) | The product family collectively | Sparingly; products by name where possible |

## 3. Voice & tone

Register: **research preview + quiet competence** (PRD §2/§5, 2026-06-11) — confidence
through specificity, invitation over persuasion. Strata is a personal project; copy is
*definitional*, never promotional — describe precisely, then let the demo persuade. A
small grammar of it: "the" claims a category, "an" describes a thing — prefer "an."
The stance, in the approver's words: *"so unbothered by marketing that we literally call
ourselves an embedded database and that's it"* — understatement is the brand's loudest
signal. **Two registers, by altitude (2026-06-11, ref. claude.com/product/overview):**
identity strings are *definitional* ("An embedded database."); section heads are
*verb-led, second person, invitational* ("Try anything. Keep what works." · "Go back to
any moment.") — what the reader does, not what the system is. Bodies carry the
conceptual anchors ("A branch is a complete database"). Cross-product: this governs
Foundry UI copy and Hub dataset pages, not just marketing.

| Principle | Do | Don't |
|---|---|---|
| Assert, show, shut up | "Branch your data like code." → demo | "StrataDB allows users to easily…" |
| Numbers brag, words don't | "250K ops/s — single thread, Cache mode" | "Blazingly fast" |
| Honesty is the pitch | "v0.12 research preview. Fuzzed, crash-tested, moving fast." | "Production-ready" · "battle-tested" |
| Invite, don't sell | "Download Foundry" · "Try the preview" | "Unlock the power of…" |
| Nothing fake | Render only channels/claims that exist | "Growing community!" over dead links |
| Calm in errors | "Branch not found: `experiment`" | "Oops! Something went wrong 😱" |
| Define, don't position | "An embedded database with git semantics" | "The next-generation data platform" |

No exclamation points. No emoji in product surfaces (Hub's doc already rules this; now
family-wide). Second person, present tense. Jargon is fine — the reader is a developer —
but every term used must be the term the API uses.

## 4. Color foundations

Two workhorse ramps + five primitive hues + functional colors. All surfaces draw from
these; each surface decides light/dark placement. (Values are anchors; AA contrast
verification per pairing is an implementation gate, not re-litigation.)

### 4.1 Terracotta — the signature

```
50 #FFF1EC · 100 #FFE0D4 · 200 #FFC4AE · 300 #FFB191 · 400 #FF9670
500 #FF7A52   ← the brand anchor (EMBER, 2026-06-12)
600 #E85F3A · 700 #C44A28 · 800 #9C3A1F · 900 #7D2F1A · 950 #431711

**Ember recalibration (2026-06-12, Ani):** the original clay anchor (#E07A5F) read
muted-somber — "too serious." Same hue family, shifted luminous: the palette *emits*
light. Clay is the material; ember is the material alive. Every contrast pairing
improved (500-on-void: 6.74 → 7.73). Primitive and functional hues brightened to match
(§4.3/§4.4); the horizon glow gained presence (0.13 → 0.24).
```

**Usage discipline (cross-product):** terracotta marks *identity*, never *function*. It
may appear on: wordmark, primary brand CTAs, active/selected identity states, the site's
horizon glow, the `branch` primitive. It may not be used for: success/error semantics,
large surface fills, body text. One terracotta-accented element per view wins; ties mean
you've used too many.

### 4.2 Sediment — the neutral ramp (warm, never blue-gray)

```
50 #FAF8F6 · 100 #F1EEEA · 200 #E2DDD6 · 300 #C9C2B9 · 400 #A8A29B
500 #8A847C · 600 #6B665F · 700 #4F4B45 · 800 #33302C · 900 #1A1817 · 950 #0A0908
```

Light surfaces (Foundry, Hub light mode) live in 50–300 with 800–950 ink.

**Amendment (2026-06-12, the moonlight + ember theme):** dark surfaces no longer draw
from sediment — the site's canvas is the **MIDNIGHT family** (§10): saturated sapphire
night, moonlight inks, ember accents. Ani's directive: *no greyish colors anywhere* —
every neutral is either moonlight (cool, chromatic) or ember (warm, chromatic). The
original "warm neutrals" rule was written for the clay era; with ember emitting light,
the canvas became the night it glows against. Sediment remains the brand's light-surface
ramp — nothing is ever default-gray, in either direction.

### 4.3 The five primitives — shared family asset

Each primitive has one hue with an on-light and on-dark anchor. These appear **only**
where primitives are actually meant: badges, syntax/data coloring, the site's strata
column, Foundry's view accents, Hub's primitive filter chips. Never as decoration.

| Primitive | On light | On dark (ember-luminous, 2026-06-12) | Mnemonic |
|---|---|---|---|
| `kv` | #2563EB | #7CAAFF | deep-ocean sediment |
| `event` | #0F9D6B | #4FE0A6 | ancient forest |
| `json` | #B97E18 | #FFC66E | sandstone |
| `vector` | #D6479B | #FF8CC6 | rare mineral |
| `graph` | #7C5CE0 | #B89CFF | volcanic rock |

**Branch is not a primitive (corrected 2026-06-12).** The five primitives are kv, event,
json, vector, graph. Branching is the *model* the primitives live inside — every branch
contains all five — so branch UI (prompts, diff chips, branch pickers) wears
**terracotta, the brand color**, on every surface: the structure of the product is
colored as the identity of the product. (History: `state` was removed 2026-06-11 and its
violet briefly retired; it is reassigned to `graph`, which held the GraphCanvas/BFS/
ontology feature set all along.)

> ⚠ Ani's standing reservation (2026-06-12): five distinct primitive hues may read
> rainbow-y. Judged at the Phase-3 checkpoint with the strata column live; the fallback
> is monochrome layers + icons with hue only on hover/focus.
>
> **VERDICT (2026-06-12, the lit-stage iteration): the reservation was right.** Ani:
> "the 5 primitives with 5 colors is a bit jarring." Hue-coding is RETIRED from the
> landing page's primitive surfaces — the strata-column rail, demo cards, and the
> inference ticks now wear monochrome + ember (the page's one temperature, cool slate
> as the lone counterpoint). The five hue tokens stay in tokens.css and this table as
> the shared family asset — the specimen page, Foundry view accents, Hub filter chips,
> and data-viz contexts may still use them. Syntax amber (`json` keys in terminal
> cards) survives as syntax coloring, not primitive coding.

### 4.4 Functional colors

ok `#0F9D6B / #4FC596` · warn `#B97E18 / #E5B566` · err `#D14D43 / #E5635C`
(deliberately adjacent to event/json hues — one family, calibrated apart by context).

**Hub exception, by design:** the Hub UI keeps Primer's functional CTA semantics
(green = clone/pull, blue = UI state, red = destructive) per its 2026-05-20 decision —
GitHub muscle memory is a feature there. Brand color enters the Hub through identity
moments only (Appendix A).

## 5. Typography foundations

| Context | Face | Rationale |
|---|---|---|
| Marketing display + body (site) | **General Sans** (Fontshare, variable) | Characterful grotesk; the brand's public voice |
| Marketing/docs code + data (site) | **Commit Mono** (SIL OFL) | Calm, even-color; terminals are product photography |
| Product app UI (Foundry, Hub) | **System stack** | Hub's economics decision stands family-wide: app UIs ship system fonts — fast, native, zero FOUT |
| Product app code/data (Foundry, Hub) | System mono (SF Mono / Consolas / etc.) | Same |

The deliberate asymmetry: *the brand speaks General Sans in public and lets the products
speak the platform's language at work.* The wordmark is the one place a brand face may
appear inside the apps.

## 6. Iconography

- **The five primitive icons** — the family's most-shared visual asset. Spec: 16px and
  24px grids, 1.5px stroke, octicon-compatible geometry so they sit beside Octicons in
  the Hub, Lucide on the site, and native chrome in Foundry. Delivered as a versioned SVG
  set; each icon pairs with its primitive color (§4.3). **Decided 2026-06-11: designed
  in-house (Claude) and shipped in v2**; an optional designer refinement pass may replace
  them later. This supersedes the Hub design doc's 2026-05-20 "hand-drawn by a designer,
  not AI-generated" rule — amend that doc when the icon set lands (cross-repo follow-up).
- General icons remain per-surface: Lucide (site), Octicons (Hub), platform/Lucide
  (Foundry). Style gate: 1.5px stroke, no filled glyphs, monochrome by default.

## 7. The wordmark & layer glyph

The mark is the **layer glyph**: three stacked strata strokes (the current site logo's
geometry, refined). Rules: glyph + "StrataDB" in General Sans 600; glyph renders in
terracotta-500 on dark, terracotta-600 on light, or monochrome ink; never gradiented,
never animated except the site hero's single entrance. Foundry and Hub use the same glyph
with their product name set beside it ("⏚ Strata Foundry") — one mark, three lockups.
Asset deliverables in Appendix C.

## 8. Motion principles (cross-product)

Five principles; the site's full motion system lives in Doc 03, Foundry/Hub apply these
directly:

1. **Motion shows what the system did** — forks split, merges join, history scrubs.
   If an animation doesn't depict a data operation or guide attention, cut it.
2. **Fast by default** — UI feedback ≤ 250ms; only marketing set-pieces may be cinematic.
3. **One signature moment per view** — everything else is ambient.
4. **Reduced motion is full parity** — never less content, only less movement.
5. **Never block input on animation.**

## 9. The strata motif

The geological cross-section (layers, depth, accretion) may appear **once per surface**,
load-bearing: the site's strata column + horizon glow (Doc 04), a future Foundry
about/welcome treatment, Hub's dataset "layers" iconography if ever. It is never
wallpaper, never a background texture.

---

# PART II — STRATADB.ORG EXPRESSION (Tier 2)

The site is the brand's cinematic surface: **dark-only, typographic, one light source.**
(Absorbs DESIGN.md §2–6; DESIGN.md retires when Docs 03–04 land.)

## 10. Canvas tokens — THE NEUTRAL STAGE (Neon-macro, 2026-06-12 final)

**Final canvas decision after the full same-day tour** (clay → ember → sapphire night →
midnight → daylight → aurora → Neon-macro test, all decided in pixels): the macro layer
is **strictly neutral** — true black `#000000`, pure white ink `#FFFFFF`, crisp neutral
grays (`#9A9CA3` / `#7E8189`, ≥4.56:1 everywhere), neutral hairlines. **Ember is the only
temperature on the page** — tinted canvases made the accent compete with ambient tint;
the neutral stage makes it electric. The hero gains a living backdrop (three breathing
light fields — ember ×2 + one cool counterpoint; 03 §5 amendment). This honestly
reverses the same-day "no greyish colors" rule: *crisp neutral is a stage, not mud* —
and supersedes both the warm-sediment and MIDNIGHT canvases below (kept for history).

Superseded: ## MIDNIGHT (moonlight + ember, 2026-06-12)

The canvas is the night sky the ember glows against — sapphire-saturated, zero grey.
Replaced the sediment-derived warm darks (decision log: Ani, "remove any greyish
colors"). Values:

```
--color-void:   #0A1021   (the night)      --color-ink-hi:  #F5F0EB (candle cream — warm)
--color-panel:  #111A33                    --color-ink-mid: #A9BBEA (moonlight, ≥7.7:1)
--color-raised: #1B2747                    --color-ink-low: #7E95D6 (moonlight, ≥5.0:1)
--color-inset:  #070C1A   (terminal wells)
--color-line:        rgba(146,172,255,0.14)   (silvered moonbeams)
--color-line-hover:  rgba(146,172,255,0.24)
--moon-glow:  rgba(106,136,215,0.32)  +  --ember-bleed: rgba(255,122,82,0.07)
   → the page's atmosphere: two fixed radials at the top of the body. Canvas
     treatment, NOT an effect — the horizon-glow two-instance rule is separate.
```

The composition law: **moonlight is the light of information** (secondary text, lines,
chrome); **ember is the light of identity and action** (brand, CTAs, prompts, branch);
**candle-cream is the light of the headline**. Nothing on the dark canvas is grey.

Superseded section follows for history:

Derived from sediment-900/950 with two intermediate surfaces:

```
--bg-void:    #0A0908  (page)          --text-hi:  #F5F0EB  (sediment-50, warmed)
--bg-panel:   #121110  (cards)         --text-mid: #A8A29B  (sediment-400)
--bg-raised:  #1A1817  (chrome/hover)  --text-low: #8A847C  (= sediment-500; a11y
                                       correction 2026-06-12 — sediment-600 measured
                                       3.50:1 on void, AA fail; sediment-500 clears
                                       ≥4.78:1 on every surface incl. raised)
--bg-inset:   #060605  (terminal wells)
--border:        rgba(245,240,235,0.08)
--border-hover:  rgba(245,240,235,0.14)
--border-focus:  #FF7A52 (terracotta-500, ember)
--horizon-glow:  rgba(224,122,95,0.13)   ← the ONE glow (two uses/page: hero, final CTA)
```

Primitive colors use the **on-dark** column of §4.3. Banned on this surface: gradient
surface fills, blur orbs, noise overlays, shimmer sweeps, pure grays.

## 11. Type scale

General Sans (display/UI/body) + Commit Mono (code/data/stats, tabular figures). Weights
400/500/600 only.

| Token | Desktop → Mobile | Weight | Tracking | Use |
|---|---|---|---|---|
| `display-xl` | 92/0.98 → 44/1.04 | 600 | −3.5% | Hero only |
| `display` | 64/1.02 → 36/1.08 | 600 | −2.5% | One per section |
| `title` | 40/1.1 → 28/1.15 | 600 | −1.5% | Subsections |
| `heading` | 24/1.25 | 600 | −1% | Cards |
| `body-lg` | 19/1.55 | 400 | 0 | Section intros |
| `body` | 16/1.6 | 400 | 0 | Default |
| `small` | 14/1.5 | 400/500 | 0 | Meta |
| `eyebrow` | 13/1 | 500 | +6% caps | Section labels (General Sans, **not** mono) |
| `mono` / `mono-sm` | 15/1.7 · 13/1.7 | 400 | 0 | Terminals, code |
| `stat` | 56/1 | 500 | −2% tabular | Numbers (Commit Mono) |

Mono is reserved for things that are *actually* code, data, or measurements — that
exclusivity is what makes terminals read as product photography.

## 12. Space, layout, surface

- Base unit 4px; spacing steps 4–160. **Section rhythm fixed: 128px desktop / 80px
  mobile, no exceptions.**
- One container: 1120px + 24px gutters (16px < 480px); prose column 680px; 12-col grid,
  24px gap. Asymmetric splits (7/5, 8/4) encouraged for text-beside-product.
- Radii: 6 (controls) / 10 (cards) / 14 (terminals, product frames). Borders: 1px,
  brighten on hover, never thicken.
- Shadow only under floating set-pieces:
  `0 1px 0 rgba(245,240,235,0.06) inset, 0 24px 64px -32px rgba(0,0,0,0.7)`.
- **Terminal chrome** (component, pixel-identical everywhere): 40px header, three
  monochrome 10px dots (`--text-low`), `mono-sm` title, body on `--bg-inset`, prompt
  `strata:main ›` with only `›` in terracotta.
- Focus: 2px terracotta ring, 2px offset, every interactive element.

## 13. Implementation contract

Tokens ship as Tailwind v4 `@theme` CSS variables named exactly as in this doc
(`--color-strata-kv`, `--text-display-xl`, …). The token file is the single source for
Docs 05/06 and is the seed of a future shared `@strata/tokens` package (Appendix C).
Contrast gates: body pairs ≥ 7:1, interactive ≥ 4.5:1, terracotta-on-void only at ≥ 19px
or ≥ 500 weight.

---

# PART III — ADOPTION APPENDICES

## Appendix A — StrataHub discovery UI (extends the 2026-05-20 Primer decision)

Primer chrome stays. The brand enters through exactly five doors:

| Door | Treatment |
|---|---|
| Wordmark | Layer glyph + "StrataHub" lockup in the Primer `Header` |
| Primitive badges | §4.3 colors + §6 icons for the multi-primitive badge row (the differentiator) |
| "Official" badge | Terracotta-600 (light) / 500 (dark) |
| Neutrals | Where Primer theming permits, warm grays from the sediment ramp replace blue-grays |
| Voice | §3 governs all UI copy and empty states |

Explicitly unchanged: Primer's green/blue/red functional CTA semantics, system fonts,
Octicons, all component behavior. The Hub should read as "GitHub-family tool, Strata
brand" — not as the marketing site.

## Appendix B — Strata Foundry adoption path

Foundry's `App.css` already uses CSS variables — adoption is a token swap, in three
phases, each shippable alone:

| Phase | Change | Today → Target |
|---|---|---|
| B1. Neutrals + primitives | Warm the grays; adopt §4.3 for view accents/badges | `--bg-alt #f6f7f9` → sediment-100 `#F1EEEA` · `--text #1a1d23` → sediment-950-ink · `--text-dim #6b7280` → sediment-500 `#8A847C` · `--bg-sidebar #1e2129` → sediment-900 `#1A1817` |
| B2. Accent swap | Indigo → brand | `--accent #4f6bed` → terracotta-600 `#E85F3A` (ember) · `--accent-soft #eaeefc` → terracotta-100 `#FFE0D4` · `--green/--error` → §4.4 functional |
| B3. **Dark theme** | Second `:root` set from Part II's canvas tokens | Makes the site's dark "product photography" (Doc 04) an honest preview |

System fonts stay (§5). The wordmark lockup (§7) replaces the plain-text brand string.

**ESCALATED (2026-06-12, Ani): "We definitely want to redo Foundry with this new
visual language. The current one is a v0.1."** The adoption path upgrades from a
token swap to a REDESIGN: the B1–B3 phases remain the mechanical floor, but the
target is the full shared language — neutral stage canvases, ember as the one
temperature, the drafting voice (mono microtype, hairline structure), General Sans +
Commit Mono. **The landing page's section-3 Foundry window (04 §4 v5) is the
canonical mock of the redesign** — sidebar, titlebar chips (database tab, branch ⎇,
space), master–detail views, ember selection language. Foundry work happens in the
strata-foundry repo; this site's /specimen page remains the verification reference.

**Project decisions (2026-06-12, Ani, at kickoff):** (1) **Typography = General Sans
+ Commit Mono** — supersedes this doc's earlier "system fonts stay (§5)" line for
Foundry; the woff2 assets ship from the site's `public/fonts` to Foundry's bundle;
one product, one face. (2) **Dark only** — the redesign ships the neutral-stage dark
theme exclusively; the light theme retires (pre-release, no users to migrate) and
may return later as a theme built on the same tokens. B3 ("dark theme" as an
addition) is thereby inverted: dark IS the theme. (3) Primitive hues remain
sanctioned in Foundry as functional view accents (§4.3) — data-type coloring in the
JSON tree, graph node fills — distinct from the landing's one-temperature rule.
(4) The redesign plan lives in strata-foundry/docs/redesign-spec.md; this appendix
stays the brand law it builds against.

## Appendix C — Shared asset deliverables

| Asset | Format | Consumed by | Status |
|---|---|---|---|
| Token sheet (ramps, primitives, functional) | CSS vars + JSON (future `@strata/tokens`) | all three | **built**: `src/styles/tokens.css` (`@theme static` — emits unconditionally so non-Tailwind consumers like Foundry's App.css can read every var) |
| **`/specimen` page** | Live page (noindex, permanent) | site + Foundry | **the canonical visual reference (2026-06-12)**: Foundry's B1–B3 adoption is verified against it — the two surfaces must read as one product |
| Five primitive icons | SVG set, 16/24px | all three | designed in-house, ship in v2 (decided 2026-06-11); optional designer pass later |
| Layer glyph + three lockups | SVG | all three | refine from current site logo |
| Voice quick-reference | §3 table | all three | done (this doc) |

## Open questions

Resolved 2026-06-11:
- **Fonts approved** (General Sans + Commit Mono), with the live specimen page at site
  Phase 1 remaining the final veto point — judged in the browser, not on paper.
- **Foundry B2 accent swap approved**: Foundry's identity moves indigo → terracotta as
  part of the adoption path (Appendix B).

- **Icons: designed in-house and ship in v2** (supersedes the Hub doc's designer-only
  rule); optional designer refinement later.

No open questions remain. **Signed off 2026-06-11.**
