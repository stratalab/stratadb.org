# Landing Experience Spec & Copy Deck — stratadb.org

|              |                                                                              |
| ------------ | ---------------------------------------------------------------------------- |
| Status       | **Signed off** (2026-06-11)                                                  |
| Owner        | Ani (product) · Claude (drafting)                                            |
| Last updated | 2026-06-11 (restructured to the 7-section shape)                             |
| Upstream     | 00 (claims, R1/R2/R8), 01 (claim ladder §5), 02 (tokens), 03 (motion system) |
| Downstream   | 05-components, 06-engineering, build Phases 1–3                              |

How to read: each section gets **Layout · Copy · Motion · States · Responsive**. Copy in
quotes is canonical — the build uses these exact strings. Set-pieces carry storyboards
conforming to 03 §8; ordinary section entrances use the **standard reveal recipe** (03
§2, declared once). DESIGN.md retires when this doc is signed off.

**Build-time truth rules (binding, PRD §7):** every CLI command/output string verified
against real v0.12 CLI output before cutover; stats render from a benchmarks data file
(strata-benchmarks), never prose; version strings from release data; an install surface
renders only if its path actually works.

---

## 0. Page skeleton

**Seven sections** (restructured 2026-08-30 per Ani: hero + four capability sections +
Hub + install-close). Fixed 128/80 rhythm, 1120px container. Horizon glow at §1 and §7 only.
No scroll furniture.

```
1 Hero                    feel       executor terminal (set-piece A)
2 Branching               believe    animated terminal, live-capable
3 Multi-primitive         believe    strata column (interactive)
4 Time travel             believe    scroll-scrub — THE ONLY scrub piece
5 Native inference        believe    native pipeline demo
6 Strata Hub              consequence catalog of clone-ready datasets
7 Install & start         act        library, CLI, Hub, and agent paths
```

**The live hero (target architecture, scoped 2026-06-11).** The real engine powers
**the hero terminal only**: scripted loop at launch, the wasm engine when R8 lands —
interactive takeover, truthful status dot, and a **fullscreen expand** (⛶) that opens a
full-viewport overlay of the same instance (state carries over; not a route —
`/playground` stays retired). **Sections 2–5 are choreographed permanently**: scripted
demos always land their beat, and live views can't be art-directed against arbitrary
visitor data. One seed dataset feeds the hero engine and all choreographed demos, so the
world is coherent across the page. Engine states, fetch policy, fullscreen per 03 §4.
_(Recorded future option, not in scope: cross-section liveness via the unchanged
EngineProvider contract — e.g., the time-travel strip showing the visitor's own hero
writes.)_

## 1. Global elements

### Nav (launch config, per 01 §4)

Sticky, 64px, `--bg-void`/85 + blur, hairline. Layer glyph + "StrataDB" · `Docs ·
Architecture · Changelog` · GitHub (star count) · **"Get Started"** →
`/docs/getting-started`. Mobile: sheet menu.

### Footer (per 01 §4)

**Product** (Playground, Strata Hub, Changelog) · **Documentation** (Getting Started,
Guides, Cookbook, Reference) · **Internals** (Architecture, strata-core) ·
**For agents** (`llms.txt`, For AI agents, MCP reference). Meta row:
`© {year} StrataDB · Apache-2.0 · Research preview` + GitHub. Nothing else.

### Section rules — the drafting system (v2, 2026-06-12)

_(Ani: "still doesn't look world class — look at supermemory.ai. A bit busy, but the
polish is genuinely impressive." The transferable thing under the busy-ness is its
RULING SYSTEM — the page reads as one engineered document. Ours, quieter:)_

Every section after the hero opens with a **SectionRule** band: a full-bleed hairline,
and inside the 70rem column `+ ⟩ EYEBROW` (mono, registration mark, ember chevron) on
the left and `[ NN / 07 ]` (current index in ember) on the right. The in-flow eyebrows
are RETIRED — the label lives in the rule. Running order: 01 hero (unruled cover) ·
02 BRANCH · 03 PRIMITIVES · 04 TIME TRAVEL · 05 NATIVE INFERENCE · 06 STRATA HUB ·
07 INSTALL.
The same drafting voice recurs inside set-pieces: the primitives rail
numbers its layers (`01`–`05` mono), demo bodies sit on a barely-there dot grid
(graph paper, rgba(255,255,255,0.04) at 22px), and the tabpanel closes with a ruled
mono footer (`03 / 05 · json — documents with path-level writes`).

---

## 2. Section 1 — Hero + Set-piece A: "The Forking Terminal"

**Layout.** Badge → H1 → CTAs → set-piece → stat strip (no eyebrow, no sub). Horizon:
1px gradient line + `--horizon-glow` behind the terminal. Parallax site #1: glow 0.85×,
terminal 1.0×, stat strip 1.04×.

**Copy** (v3, 2026-06-12 — the hero is the acquisition surface).

- Badge: `Research preview · v{version}` → `/changelog`
- H1 (`display-xl`): **"Strata is the embedded database with git-like powers"** —
  Ani's wording verbatim (2026-06-12), superseding "An embedded database." The
  understatement experiment served its month; with the river artwork behind it, the
  fuller claim carries. _(Noted, not normalized: uses the family name "Strata" and
  "the" — both deliberate in Ani's phrasing; 02 §2 naming table records the exception.)_
- **The acquisition pair** (v2 of the control, 2026-06-12 — the joined group read as one
  copy-widget and "Foundry" assumed name-knowledge): two visibly different species —
  a filled ember **button, "Get the desktop app"** (app-window icon; R1 interim →
  strata-foundry repo; label flips to "Download…" when artifacts exist; the Foundry
  _name_ is taught later, in the install tab) beside the quiet mono **curl chip**.
  Beneath them, **the agent door as an action** (v2, 2026-06-12; pattern: mem0.ai's
  "Set up for agents"): a pill button — "Set up with your agent" — that copies a
  ready-to-paste instruction pointing at the for-agents recipe's `.md` mirror, with
  report-back included; feedback teaches the flow ("✓ copied — paste it to your
  agent"). The human is the courier between the page and their agent. llms.txt remains
  the discovery door (footer, install tab). A content scrim quiets the river artwork
  behind the entire center column.
- Funnel note: the hero now carries **Feel + Act in one screen** — claim, get-the-product
  (human CLI · human GUI · agent URL), proof below.
- Stat strip (Commit Mono, footnote markers → conditions in docs):
  `250K ops/s · <1 ms fork · 5 primitives · 0 servers · Apache-2.0`

**Storyboard (set-piece A).** Executor-driven (03 §4); one terminal that forks. ≈22s
loop + 4s hold. First frame (SSR'd): completed `strata:main › kv put greeting "hello"`
→ `(version) 1`.

| Beat | Executor events                                               | Choreography                                                                                                                                                                                                                                                                                                                                                         |
| ---- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | `cmd: branch create experiment` → `OK`                        | Tier-1 typing; 300ms beat                                                                                                                                                                                                                                                                                                                                            |
| 2    | `split`                                                       | Fork on `spring-settle`: main sits half-width centered pre-split and **translates left** while the fork panel slides in — transform-only by construction _(amended 2026-06-12: the original full-width→half "slide apart" was a layout animation and leaked CLS; end state identical)_. 1px branch line arcs; right title `experiment`, prompt `strata:experiment ›` |
| 3    | right: `cmd: kv put config.theme "midnight"` → `(version) 1`  | Typing in right panel                                                                                                                                                                                                                                                                                                                                                |
| 4    | left: `cmd: kv get config.theme` → `(nil)`                    | **Isolation beat** — `(nil)` in `--text-low`                                                                                                                                                                                                                                                                                                                         |
| 5    | left: `cmd: branch diff experiment` → `+1 key · config.theme` | **Verb beat** — the full model, not fork-and-pray                                                                                                                                                                                                                                                                                                                    |
| 6    | left: `cmd: branch merge experiment` → `merged` + `merge`     | Panels rejoin on `spring-settle`; `+1 key` chip flashes ok-green                                                                                                                                                                                                                                                                                                     |
| 7    | left: `cmd: kv get config.theme` → `"midnight"`               | Payoff; hold 4s; fade-restart                                                                                                                                                                                                                                                                                                                                        |

Conformance: trigger ≥50% in view · tier 1+executor · transform/opacity ·
reduced-motion = completed two-panel transcript, static branch line · mobile = vertical
fork · exit = pause out-of-view · pause/play control · live mode: interactive takeover +
status dot + state continuity + **fullscreen expand (⛶ → full-viewport overlay,
focus-trapped, Esc closes)** per 03 §4. The fullscreen overlay is especially the mobile
path to real interaction.

## 3. Section 2 — Branching

**v2 (2026-06-12, Ani): the section is scrub #2 — fork → modify → diff → merge.**

**v5 (2026-06-12, Ani): the head rides the pin + the branch river.** The
eyebrow/H2/intro no longer sit in a SectionShell above the scrub (they scrolled away
the moment the pin engaged) — they render INSIDE the pinned screen as its top row
(H2 left, intro right, baseline-aligned), visible for the whole 340vh. And behind
the scene: the **branch river** — a 3-strand echo of the hero backdrop. A trunk
forks left of center; the ember strand rises toward risky's side, the cool strand
holds toward main's, and a dim ember strand bends back down to meet it — fork and
merge as ambient artwork. Slower than the hero (9–14s), desktop pin only (Doc 03 §5
cap amended to 3 infinite animations). On mobile/reduced the head renders in flow.

**v6 (2026-08-30, Ani): section breaks dock where scroll is owned.** The rule
band is not a loose divider. Branches and Primitives are scroll-owned sections:
their rule band docks below the sticky nav while the pinned frame advances.
Static sections use the same rule band at entry, but it scrolls away with the
section so an old label never sits over the next section's content. Hash links
target the section boundary first; any richer state change, such as selecting
`#primitive-json`, happens after the visitor lands at the section.

**v7 (2026-08-30, Ani): section entry owns the frame.** Branch pins below the
nav/rule stack instead of the viewport top. Primitives pairs its title rail and
artifact in one centered pinned frame. Primitive links and tabs select the matching
view in place; they never call `window.scrollTo` after the browser lands at the hash
target.

**v8 (2026-08-30, Ani): Time Travel needs a stop.** Time Travel is scroll-owned
again: its rule band docks under the nav and its head/instrument sit in one
centered pinned frame. The instrument is still direct manipulation; the page
stop exists to give the self-playing playhead enough time to be noticed during
normal scrolling.

**v9 (2026-08-30, Ani): all capability set pieces get a stop.** Native Inference
now follows the same section-break contract as Branches, Primitives, and Time
Travel: the rule docks, the copy and workbench stay centered in one pinned frame,
and continued scroll gives the animation time to land before Install begins.

**v10 (2026-08-30, Ani): feature names live above the H2.** The rule band stays
as the engineered navigation marker: `BRANCHES 02/07`, `PRIMITIVES 03/07`, and so
on. Each section also gets a terracotta feature-name eyebrow above its H2:
`Branching`, `Primitives`, `Time travel`, `Inference`, and `Strata Hub`. The
paragraph below the H2 explains why the feature matters.

Section rule `BRANCHES`; feature eyebrow **"Branching"**; H2 **"Branch the
whole database."**; intro: "Test agent writes,
migrations, and risky data changes away from default. Compare the branch, preview
the merge, and promote only what should land." Use chips: `agent runs`,
`migrations`, `what-if changes`, `review before merge`. _(2026-08-30, Ani: "Fork
the portfolio" made the sample data sound like the feature. The section now names
the product behavior first; the portfolio remains only the concrete demo object.
2026-06-12 plain-language rule still holds: O(1) survives only on agent surfaces
and architecture deep-dives.)_

**Set-piece: the branch story, v4 (2026-06-12) — finance domain, session panel, stage
lights.** The document is `json · portfolio` from the seed world —
`{ strategy: "balanced", stocks: 60, bonds: 30, cash: 10, rebalance, currency }` —
because _nobody experiments on live money, which is exactly what branching is for_. The
risky branch tries the aggressive allocation: four writes (strategy, stocks, bonds,
cash). Full pin, 340vh (≈2.4 vh ownership, cap 2.5), 4/8 grid:

- **Left — the act header + session terminal**: verb at title scale, plain feature/use
  captions, progress bars; beneath,
  a `strata — session` terminal where the commands ACCUMULATE like a real CLI
  transcript — the current act's lines flash in bright (scroll-driven, first 6% of each
  band), history dims above. By the merge, the whole session is on screen.
- **Right — the color-coded worlds**: main = cool slate surfaces (stable), risky =
  ember-warm (experimental); spread ±40%, geometry verified non-overlapping with the
  session panel. Acts as v3 (fork-peel → four cascading ValueSwaps → unified diff card
  `4 changes · clean` with `preview: 0 conflicts` → convergence, warm dissolving into
  cool, `merged` chip).
- **Stage lights (the section's pop, hero-equivalent)**: two large radial fields behind
  the cards — cool constant behind main's side; **ember scroll-driven**: blooms as the
  branch spreads (0.12→0.62 opacity), dies as it merges. Scroll-driven, not infinite —
  no new 03 §5 exemption needed.

Conformance: tier-2 scrub, spring-scrub, band 0 clamped · transform/opacity only ·
reduced motion = static acts + steppers (session panel included) · mobile = swipeable
acts with session + key artifact · all text real DOM · no scroll hijacking. _(History:
v2 line-diagram → v3 settings-doc cards → v4; each supersession same-day in the log.)_

## 4. Section 3 — Multi-primitive: The Strata Column

The motif's load-bearing appearance (02 §9). **Not** a card grid.

**v2 (2026-06-12, Ani): tabs + content, per claude.com/product/overview's "How you
can use Claude" — "each primitive should be a tab and should have an animation in
the content area."** The tab rail is **vertical, stacked like the column itself**,
so the motif survives: five layers, each with its hue on the left edge, the active
layer lit (`bg-raised`, ink-hi). The content area is a terminal-chrome demo card —
each primitive plays a short beat sequence from the seed world on activation:

| Tab    | Demo (all seed-true)                                                                   |
| ------ | -------------------------------------------------------------------------------------- |
| kv     | `kv put config.theme "midnight"` → v3; `kv history` → 3 versions stagger in, v3 lit    |
| event  | `event append deploys {deploy.fail…}` → #3; `event list` → stream replays, fail in err |
| json   | `json get profile` → doc; `json set $.user.role "admin"` → path flash, value swap      |
| vector | `vector search docs "why did the deploy fail?" -k 2` → d1/d2 rise with score bars      |
| graph  | nodes pop, edges draw, `graph bfs alice` → traversal lights the reachable set          |

Each demo ends on a deadpan caption (mono-sm, ink-low): "every write keeps its
past…", "nothing is overwritten…", "one path written…", "search was ready before
you asked", "not a join table in disguise". Beats play once per tab activation
(manual tabs, no auto-rotate — no new infinite animation); SSR = completed state;
reduced motion = final frames, instant tab swap; mobile = horizontal scrollable
rail. Supersedes the v1 hover-rows + accordion (and 05's CSS-only rule for this
section — it is now an island). Guides linked per tab below the demo. _(Same-day
amendment, Ani: "too much whitespace around the content" — the head stays in the
70rem prose column; the rail + demo break out to an 88rem stage, demo type up to
17px/36 with p-8, rail tabs roomier.)_

**v3 (2026-06-12, Ani: "good but not yet world class — animations, color scheme,
lighting, background can be 10x better"): the lit stage.** The active primitive's
hue owns the room: per-hue radial light fields behind the whole grid crossfade on
tab switch (triggered, not looping — the 03 §5 cap stays at 3 infinite animations).
The demo card wears the hue as material — tinted border (`rgba(hue, .28)`), header
wash, faint body tint, and a bloom shadow behind the card. The rail becomes one
framed column, hairline-divided like a core sample; the active layer is lit by its
own hue wash bleeding from the left edge. Demo physicality: **commands are typed**
(03 §2 law: 24–40ms jittered, block cursor while typing, output prints) — beat
clocks sized to typing time; vector scores **count up** while gradient bars fill
with glow; the graph traversal **travels** (a pulse rides each edge, lit nodes get
drop-shadow); kv's v3 chip stamps with a scale pulse. Stage lights bleed past the
container under `overflow-x-clip`.

**v4 (2026-06-12, Ani: "keep the color scheme consistent with the rest of the page —
the 5 primitives with 5 colors is a bit jarring"): one temperature.** The 02 §4.3
reservation resolves against hue-coding: stage lights become the page's one static
pair (ember over the demo, cool counterpoint on the rail side — the hero/branch
lighting language); card material, rail accents, kv chip, vector bars, and the graph
traversal all wear ember; rail layers go monochrome (line-colored edges, ink icons)
with only the active layer lit. Inference ticks follow. Syntax amber on json keys
survives as syntax. Differentiation now comes from the demo content itself, not from
color-coding.

**v5 (2026-06-12, Ani): THE FOUNDRY WINDOW.** "I don't think it's a good idea to
overuse the CLI animation. It is in every section now. We want to show some stuff
from Foundry. In fact that would be much more beautiful." And, same day: "We
definitely want to redo Foundry with this new visual language. The current one is a
v0.1." So the section becomes ONE Foundry window — and it is the canonical preview
of Foundry's redesign in the shared design language (02 §B):

- **Structure faithful to strata-foundry/src**: titlebar (traffic dots, app name,
  database tab `portfolio.strata` with ok-dot, `⎇ main` + `space: default` chips —
  the real BranchSwitcher/SpaceSwitcher), the real Sidebar nav as the tab rail —
  the five primitive views numbered 01–05 (the strata-column motif now lives in the
  sidebar's stacked, numbered layers; active = ember pill + inset edge), with the
  app's other real views (Branches · Generate · Models · Inference · Search) present
  and DIMMED below a hairline: Foundry is bigger than five views.
- **Per-view content = the app's actual screens, seed-true**: kv = master–detail
  key browser (filter, key list, value well, History panel with v1–v3 of
  portfolio.value); event = the deploys stream table (deploy.fail in err, last row
  ember-washed as the append); json = document list + JsonTree (profile; $.user.role
  ember-flashed); vector = search bar ("why did the deploy fail?", k=2) + scored
  results with count-up bars; graph = the GraphCanvas on dot-grid with bfs toolbar
  and traveling traversal.
- **GUI choreography replaces typed commands** — rows populate, selections light,
  panels fill; no CLI in this section at all. The page's CLI census after v5:
  hero (the live terminal, sacred) · branch session panel · time-travel command
  readout · inference transcript.
- The 88rem stage, lighting, ruled mono footer (0n / 05) and guide links survive
  unchanged.

**v7 (2026-08-30, Ani: "the scroll blows past the title and stops at the
animation"): the section head rides the primitive frame.** The window still pins
on desktop and continued scrolling walks the five views, one band each, but the
section head now lives in the same pinned viewport as a left rail. Clicking a view
or arriving from `#primitive-json` changes the active tab in place; it does not
drive page scroll. An ember **"interactive — click around" pill** in the titlebar
pulses twice on arrival and fades permanently on first touch (opacity+visibility —
the a11y rule). Desktop only; reduced motion and mobile keep the unpinned manual
window.

**v8 (2026-08-30, Ani: "The rest lives beside it doesn't make sense" + VS Code
extension direction): sharpen the primitive promise and make the artifact
editor-native.** The primitive head now states the actual model: multi-modal data
in one embedded file. Section 2 owns branching; Section 3 should not re-sell it.
The artifact keeps the same interaction contract, but its chrome shifts toward
the real VS Code mental model and palette: activity bar, Explorer panel,
command/search bar, file tab, dark editor surface, and blue Strata status bar.
The titlebar may say `StrataDB for VS Code` once the extension is available.

**v1 layout (superseded).** Full-width cross-section: five layers — `kv` (surface)
down to `graph` (bedrock). Each: icon + name + role line; hover/tap/focus thickens
+8px, surfaces the API line in `mono-sm`. _(Branch is not a layer — branching is the
model the layers live inside; it owns section 2 and wears terracotta as brand, not
as a primitive hue.)_

**Copy.** Section rule `PRIMITIVES`; feature eyebrow **"Primitives"**; H2
**"Store every kind of app data in one embedded database."**; intro: "Use keys for
settings, JSON for records, events for logs, vectors for embeddings, and graphs
for relationships. They live together in the same local file, so your app does
not need a separate store for each shape."

| Layer  | Role line                                       | API line                                           |
| ------ | ----------------------------------------------- | -------------------------------------------------- |
| kv     | "Versioned key-value. History included."        | `kv put user:1 {…} · kv history user:1`            |
| event  | "Append-only streams. Replay anything."         | `event append actions {…} · event list actions`    |
| json   | "Documents with path-level writes."             | `json set profile $.user.role "admin"`             |
| vector | "Embeddings with HNSW search."                  | `vector search docs <query> -k 5`                  |
| graph  | "Nodes, edges, typed links. Traverse anything." | `graph add-edge alice knows bob · graph bfs alice` |

Motion: layers reveal bottom-up (geology accretes), 60ms stagger ≤800ms · entry drift
±12px within the seam budget (03 §3.1) · hover thicken `--dur-2` · reduced-motion: no
drift, thicken→border-bright · mobile: tap-to-expand accordion · keyboard traversable.
_(No live counts — scoped 2026-06-11; the column is CSS-only, see 05.)_

## 5. Section 4 — Time travel · the instrument (v2, 2026-06-12)

**v2 (Ani): "an interactive component that the user can scrub back and forth and see
how the value changes. We should not have another parallax scroll."** The scroll-scrub
is RETIRED (the page's scrub count drops to one — branch). Time travel is now **direct
manipulation**: the visitor owns a playhead.

**The artifact — TimeScrubber.** A terminal card (primitives material: ember border,
bloom, dot-grid body, ruled mono footer) running the live read
`kv get portfolio.value --as-of <version>`. A draggable ember playhead rides a
ruled timeline spanning the seed world's three days (2026-06-09 → now); the
command's version and the answer update as you drag. The
answer row: the dollar value at stat scale (tabular nums), version chip, signed delta
vs the previous write (▲ ok-green / ▼ err-red — functional colors as data), written-at.
**Scrub before the first write and the key honestly does not exist yet** ("∅ nothing
here yet"). Write markers light ember as the playhead passes them; the elapsed span
tints. Footer: "drag the playhead — every read accepts --as-of" · "3 versions ·
0 overwrites".

**Copy.** Section rule `TIME TRAVEL`; feature eyebrow **"Time travel"**; H2
**"Read any past version of your data."**; intro: "Every write records a version.
Use `--as-of` to see what the database returned before a later change, without
restoring a backup or copying data aside."

Interaction: pointer drag + click-to-jump (pointer capture, touch-none) · keyboard =
real slider (role=slider, aria-valuetext speaks the moment + version; arrows snap
between span start / writes / now; Home/End) · value swaps animate 220ms in a
fixed-height row (CLS-zero) · reduced motion: fully alive — it only moves when the
user moves it · SSR = playhead at "now" (completed state).

**Discoverability (same day, Ani: "how would the user know to scroll it"): invite by
demonstration.** On first view (≥50% visible) the instrument plays itself ONCE — the
playhead glides back to the 06-10 dip (the red delta blooms), holds a beat, returns;
three beats at the `--dur-5` cap, handle swollen while it moves. Any pointer/keyboard
interaction cancels it instantly and it never replays. A **"← drag →" pill rides the
playhead** (clamped off the card edges) until the first real interaction, then fades.
Under reduced motion the demo is skipped; the pill is not — the label still teaches. Head in the prose column,
instrument on the 80rem stage with one quiet ember field.

_(v1 — the 1.5vh sticky version strip — retired 2026-06-12; its "choreographed
permanently" scoping is superseded by this direct-manipulation form. The live variant
— the instrument reading the visitor's own hero writes — remains the R8 future
option.)_

## 6. Section 5 — Native inference

**v3 (2026-08-30, Ani): native inference is database work, not a command sampler.**
The old transcript proved breadth but did not show why the feature changes the product.
The new section shows the workflow a developer actually wants: inspect a model, gather
records that already live in the embedded file, embed the question, rank useful context,
and generate a grounded answer without adding a separate AI service layer. Inference is
a compute layer over data, not a stored primitive.

**Copy.** Section rule `NATIVE INFERENCE`; feature eyebrow **"Inference"**; H2
**"AI is built-in"** Intro: "Run model work where the data already lives.
Strata can embed text from records, rank context, generate answers, tokenize text,
and inspect model capability through one layer that works with local models or
hosted providers." Capability chips beneath (mono pills): embed · rank · generate
· tokenize · model checks.

**Layout.** Head in the prose column; artifact on the 80rem stage with one quiet ember
field. Native Inference is scroll-owned: the rule docks below the nav, and the copy
plus workbench share a centered pinned frame.

**The demo — five beats, one native inference layer (plays once ≥35%):**

1. Capability check: `inference capability openai:gpt-4o-mini` lights model support
   without pretending a provider request was sent.
2. Context gather: KV `portfolio.value`, JSON allocation, merge event, and vector note
   appear as records inside the same database file.
3. Embed: `inference embed miniLM "why did portfolio.value move?"` sends the question
   through a local model and lights the vector path.
4. Rank: `inference rank jina-reranker-v1-tiny ...` reorders database context by score.
5. Generate: `inference generate openai:gpt-4o-mini ...` streams the seed-true answer:
   "The portfolio value moved from 98400 to 111080 after the no-conflict merge..."
   Provider rail shows local GGUF, OpenAI, Anthropic, and Google as routes through the
   same layer. Reduced motion and SSR render the completed workbench.

## 7. Section 6 — Strata Hub

**v1 (2026-08-30, Ani): Hub needs its own section.** The real value of Hub is
not that it adds another way to install Strata. It is the dataset distribution
layer: a developer should be able to decide "I want to run an experiment," find a
prepared dataset, and pull it with one command. As Hub grows, the same
`strata clone` workflow should cover tutorials, RAG corpora, event streams,
benchmarks, reference data, agent-memory fixtures, classification datasets, and
product experiments.

**Copy.** Section rule `STRATA HUB`; feature eyebrow **"Strata Hub"** H2
**"Clone the dataset your experiment needs."** Intro: "Strata Hub is a catalog of
prepared Strata databases for RAG, agents, benchmarks, events, and reference
data. Clone one with schema, examples, branches, and history, then start locally."

**Artifact.** A compact catalog-to-clone surface, not a dashboard:

- Search/filter row with short use-case chips: RAG, agents, benchmarks, events,
  reference.
- Four tight dataset rows from the StrataHub curated set: `movielens-100k`,
  `agent-memory-with-experiments`, `stackoverflow`, and `github-events`.
  Rows show dataset, use, and one terse include line; no table header, row
  descriptions, or tag clouds.
- Clone bar with the selected dataset, the copyable command
  `strata clone movielens-100k ./ml`, included assets, and local-ready status.

**Handoff.** The hero Hub tile lands on this section, not Install. Hub should not
introduce a separate CTA pattern; the clone command lives inside the artifact, and
the page's conversion stays in the Install section. Internal docs remain the
public links until `stratahub.io` and `hub.stratahub.io` are reachable without
auth/errors.

## 8. Section 7 — Install & start

**The act section: four paths, one local database** — humans install, clone from Hub,
open the CLI, or hand setup to an agent in the same place. Horizon glow, second and
final use (60% hero opacity).

**v2 (2026-06-12): the act surface acts.** The tabs card wears the page's material
(ember border, bloom, ember tab-row wash, graph-paper wells) — and **every command
line carries its own copy button** (hover/focus reveal, ✓ feedback; `$` stripped on
copy). The MCP tab gets a copy-config button for the whole JSON block. The Foundry
tab's copy now points back at the set-piece: "It is the window in section 03, the
one the primitives live in."

**v3 (2026-06-12, Ani: "steal the install section from mem0.ai").** Two structural
steals, our skin: (1) **integration modes first** — the outer tabs become a
segmented control of HOW you want in (Library · CLI · Desktop app · For agents),
with language pills (Python | Node.js) tucked INSIDE the window chrome, mem0-style;
(2) **the code is a complete numbered quickstart** — line numbers, step comments
("# Step 1 — install (run in your terminal…)", "# Step 2 — save as quickstart.py
and run…"), tokenized highlighting (comments ink-low, keywords terracotta-300,
strings syntax-amber, calls ink-hi), a script you paste and run, telling the
portfolio story (put → put → get → history). Copy-script button in the chrome.
The For-agents mode gains the hero's agent-instruction pattern: "copy agent
instructions" → the for-agents.md one-liner. CLI/Foundry panes carry over from v2.
Window title tracks the mode (quickstart.py / terminal / Strata Foundry / mcp.json).

**v3.1 (same day, Ani): the big close retired.** The stat-scale "pip install
stratadb" copy-chip and the small print beneath it (one-file line, fuzzing line,
version/changelog, Get Started / Star links) are REMOVED — the quickstart window is
the close; the footer already carries version, changelog, and GitHub. The original
"the command is the copy" close concept is superseded: the command now lives inside
the quickstart, where it runs. **Same day: the hero stat strip is removed too**
(250K ops/s · <1 ms fork · 5 primitives · 0 servers · Apache-2.0) — benchmark
numbers leave the landing page entirely, which also unblocks the benchmarks
re-measurement cutover gate; `benchmarks.json` + StatStrip remain for the specimen
and docs. Hero parallax census: glow 0.85× · terminal 1.0×.

**v4 (2026-08-30): Strata Hub enters the adoption path.** The Install mode shows
curated examples from the StrataHub repo and copyable `strata clone` commands,
with internal links to the clone guide and hub concept page. Public
`stratahub.io` / `hub.stratahub.io` CTAs stay out of the page until those hosts
are publicly reachable.

**v5 (2026-08-30, Ani): Hub promoted above Install.** The Hub value proposition
now owns a dedicated section before Install. The Install Hub mode remains as the
copy-command handoff after the product argument has established why clone-ready
datasets matter.

**Copy.** Eyebrow `INSTALL` (in the section rule); H2 **"Start in thirty seconds."**
_(same testable claim, imperative form; alternate held: "Thirty seconds to first
write.")_

Tabs (each renders only if its path works — truth rule):

| Tab            | Content                                                                                                                                                                                              |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Library**    | Python and Node quickstart scripts: install, open one local database, write values, and read history.                                                                                                |
| **CLI**        | `cargo install strata-cli` · the curl chip + first-write session: `strata --cache` → `kv put hello world` → `kv get hello`.                                                                          |
| **Hub**        | Strata Hub as the cold-start path: copyable `strata clone iris ./iris`, curated examples (`agent-memory-with-experiments`, `movielens-100k`, `ab-test-results`), and links to clone/hub docs.       |
| **For agents** | The agent door: copyable MCP config · `stratadb.org/llms.txt` in mono · "For AI agents →" `/docs/agents`.                                                                                            |

Beneath the tabs, **the close** — the page's final statement:

```
pip install stratadb
```

at `stat` scale in Commit Mono with copy affordance. Under it, `small`:
"One file. No server. Apache-2.0." · trust line: `fuzzing-tested · crash-recovery
verified` · version line `v{version} · changelog` (build-time sourced) · two quiet
links: **"Get Started"** + **"Star on GitHub"**. Then footer. The command is the copy.

---

## 9. Global strings & meta

- `<title>`: "StrataDB — an embedded database with git semantics"
- Meta description / canonical one-liner (repos, registries, llms.txt — enumeration is
  the job here, hero simplicity does not apply): "StrataDB is an embedded database with
  the whole git model: zero-copy O(1) branches, diff, merge, cherry-pick, time travel,
  and search — across five primitives. One file, no server. Research preview."
- OG image (template, build-time): dark canvas, layer glyph, H1, stat strip.
- Structured data: `SoftwareApplication` (license Apache-2.0, softwareVersion build-time).
- 404: H1 "This layer doesn't exist." body "Nothing was deposited at this address. Try
  the docs — or send your agent to llms.txt." Links: Docs · Home · llms.txt.

## 10. Deletions vs. today (claims-policy + restructure enforcement)

Gone: the red/green comparison cards · "Growing Community" + dead social links ·
"production-ready" · "zero dependencies" (→ "0 servers") · scroll-indicator mouse ·
"for AI agents" as positioning (PRD §2 copy rule) · hero eyebrow/sub · **the Foundry
showcase section** (Foundry = an install surface; the dedicated `/foundry` page remains
pre-approved for when artifacts land) · **the performance section** (stat strip carries
measured numbers; durability table + trust facts live in docs; one trust line in the
close) · the standalone search section (absorbed into Native inference) · `60+ MCP
Tools` stat (re-add in the MCP tab only if build-time verified — Open Q5) · the
standalone Resources / "Go deeper" section (the nav and install close now carry the
handoff).

## Open questions

**None. Signed off 2026-06-11** — all items resolved by Ani: hero H1 confirmed ·
verb-led head slate approved (current heads) · no brew tap, line dropped · seed dataset =
curated fictional (authored in Phase 2; designed so every demo beat has a real answer in
the data) · 404 wit kept · MCP tool count omitted · Resources section retired
(2026-08-30; page ends on the command) · **the architecture deep-dives are the whitepaper
collection** — future standalone papers join it.
