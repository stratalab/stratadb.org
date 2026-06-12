# Landing Experience Spec & Copy Deck — stratadb.org

| | |
|---|---|
| Status | **Signed off** (2026-06-11) |
| Owner | Ani (product) · Claude (drafting) |
| Last updated | 2026-06-11 (restructured to the 7-section shape) |
| Upstream | 00 (claims, R1/R2/R8), 01 (claim ladder §5), 02 (tokens), 03 (motion system) |
| Downstream | 05-components, 06-engineering, build Phases 1–3 |

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

**Seven sections** (restructured 2026-06-11 per Ani: hero + four capability sections +
resources + install-close). Fixed 128/80 rhythm, 1120px container. Horizon glow at §1
and §7 only. No scroll furniture.

```
1 Hero                    feel       executor terminal (set-piece A)
2 Branching               believe    animated terminal, live-capable
3 Multi-primitive         believe    strata column (interactive)
4 Time travel             believe    scroll-scrub — THE ONLY scrub piece
5 Native inference        believe    typed live demo
6 Resources               deepen     three quiet cards
7 Install & start         act        five surfaces + the command close
```

**The live hero (target architecture, scoped 2026-06-11).** The real engine powers
**the hero terminal only**: scripted loop at launch, the wasm engine when R8 lands —
interactive takeover, truthful status dot, and a **fullscreen expand** (⛶) that opens a
full-viewport overlay of the same instance (state carries over; not a route —
`/playground` stays retired). **Sections 2–5 are choreographed permanently**: scripted
demos always land their beat, and live views can't be art-directed against arbitrary
visitor data. One seed dataset feeds the hero engine and all choreographed demos, so the
world is coherent across the page. Engine states, fetch policy, fullscreen per 03 §4.
*(Recorded future option, not in scope: cross-section liveness via the unchanged
EngineProvider contract — e.g., the time-travel strip showing the visitor's own hero
writes.)*

## 1. Global elements

### Nav (launch config, per 01 §4)
Sticky, 64px, `--bg-void`/85 + blur, hairline. Layer glyph + "StrataDB" · `Docs ·
Architecture · Changelog` · GitHub (star count) · **"Get Started"** →
`/docs/getting-started`. Mobile: sheet menu.

### Footer (per 01 §4)
**Product** (Strata Foundry → repo, Changelog) · **Documentation** (Getting Started,
Guides, Cookbook, Reference) · **Internals** (Architecture, strata-core, strata-foundry,
stratahub) · **For agents** (`llms.txt`, For AI agents, MCP reference). Meta row:
`© {year} StrataDB · Apache-2.0 · Research preview` + GitHub. Nothing else.

### Section rules — the drafting system (v2, 2026-06-12)

*(Ani: "still doesn't look world class — look at supermemory.ai. A bit busy, but the
polish is genuinely impressive." The transferable thing under the busy-ness is its
RULING SYSTEM — the page reads as one engineered document. Ours, quieter:)*

Every section after the hero opens with a **SectionRule** band: a full-bleed hairline,
and inside the 70rem column `+ ⟩ EYEBROW` (mono, registration mark, ember chevron) on
the left and `[ NN / 07 ]` (current index in ember) on the right. The in-flow eyebrows
are RETIRED — the label lives in the rule. Running order: 01 hero (unruled cover) ·
02 BRANCH · 03 PRIMITIVES · 04 TIME TRAVEL · 05 NATIVE INFERENCE · 06 RESOURCES ·
07 INSTALL. The same drafting voice recurs inside set-pieces: the primitives rail
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
  fuller claim carries. *(Noted, not normalized: uses the family name "Strata" and
  "the" — both deliberate in Ani's phrasing; 02 §2 naming table records the exception.)*
- **The acquisition pair** (v2 of the control, 2026-06-12 — the joined group read as one
  copy-widget and "Foundry" assumed name-knowledge): two visibly different species —
  a filled ember **button, "Get the desktop app"** (app-window icon; R1 interim →
  strata-foundry repo; label flips to "Download…" when artifacts exist; the Foundry
  *name* is taught later, in the install tab) beside the quiet mono **curl chip**.
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

| Beat | Executor events | Choreography |
|---|---|---|
| 1 | `cmd: branch create experiment` → `OK` | Tier-1 typing; 300ms beat |
| 2 | `split` | Fork on `spring-settle`: main sits half-width centered pre-split and **translates left** while the fork panel slides in — transform-only by construction *(amended 2026-06-12: the original full-width→half "slide apart" was a layout animation and leaked CLS; end state identical)*. 1px branch line arcs; right title `experiment`, prompt `strata:experiment ›` |
| 3 | right: `cmd: kv put config.theme "midnight"` → `(version) 1` | Typing in right panel |
| 4 | left: `cmd: kv get config.theme` → `(nil)` | **Isolation beat** — `(nil)` in `--text-low` |
| 5 | left: `cmd: branch diff experiment` → `+1 key · config.theme` | **Verb beat** — the full model, not fork-and-pray |
| 6 | left: `cmd: branch merge experiment` → `merged` + `merge` | Panels rejoin on `spring-settle`; `+1 key` chip flashes ok-green |
| 7 | left: `cmd: kv get config.theme` → `"midnight"` | Payoff; hold 4s; fade-restart |

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

Eyebrow `BRANCH`; H2 **"Try anything. Keep what works."**; intro: "A branch is a
complete database — fork it, change it, diff it, merge it back. Forking copies
nothing, so it's instant at any size." *(2026-06-12, Ani: "People don't understand
O(1)" — the human-facing copy states the fact in plain terms; O(1) survives only on
agent surfaces (llms.txt, for-agents) and in the architecture deep-dives, where the
reader speaks it natively. Same fix in the scrub's Fork caption: "The whole
database, forked instantly. Nothing copied." — "database", not "portfolio": the verb
acts on the database term, the portfolio is just the data inside it.)*

**Set-piece: the branch story, v4 (2026-06-12) — finance domain, session panel, stage
lights.** The document is `json · portfolio` from the seed world —
`{ strategy: "balanced", stocks: 60, bonds: 30, cash: 10, rebalance, currency }` —
because *nobody experiments on live money, which is exactly what branching is for*. The
risky branch tries the aggressive allocation: four writes (strategy, stocks, bonds,
cash). Full pin, 340vh (≈2.4 vh ownership, cap 2.5), 4/8 grid:

- **Left — the act header + session terminal**: verb at title scale, finance-flavored
  caption ("Every change, exactly — before real money moves."), progress bars; beneath,
  a `strata — session` terminal where the commands ACCUMULATE like a real CLI
  transcript — the current act's lines flash in bright (scroll-driven, first 6% of each
  band), history dims above. By the merge, the whole session is on screen.
- **Right — the color-coded worlds**: main = cool slate surfaces (stable), risky =
  ember-warm (experimental); spread ±40%, geometry verified non-overlapping with the
  session panel. Acts as v3 (fork-peel → four cascading ValueSwaps → unified diff card
  `4 keys` → convergence, warm dissolving into cool, `merged` chip).
- **Stage lights (the section's pop, hero-equivalent)**: two large radial fields behind
  the cards — cool constant behind main's side; **ember scroll-driven**: blooms as the
  branch spreads (0.12→0.62 opacity), dies as it merges. Scroll-driven, not infinite —
  no new 03 §5 exemption needed.

Conformance: tier-2 scrub, spring-scrub, band 0 clamped · transform/opacity only ·
reduced motion = static acts + steppers (session panel included) · mobile = swipeable
acts with session + key artifact · all text real DOM · no scroll hijacking. *(History:
v2 line-diagram → v3 settings-doc cards → v4; each supersession same-day in the log.)*

## 4. Section 3 — Multi-primitive: The Strata Column

The motif's load-bearing appearance (02 §9). **Not** a card grid.

**v2 (2026-06-12, Ani): tabs + content, per claude.com/product/overview's "How you
can use Claude" — "each primitive should be a tab and should have an animation in
the content area."** The tab rail is **vertical, stacked like the column itself**,
so the motif survives: five layers, each with its hue on the left edge, the active
layer lit (`bg-raised`, ink-hi). The content area is a terminal-chrome demo card —
each primitive plays a short beat sequence from the seed world on activation:

| Tab | Demo (all seed-true) |
|---|---|
| kv | `kv put config.theme "midnight"` → v3; `kv history` → 3 versions stagger in, v3 lit |
| event | `event append deploys {deploy.fail…}` → #3; `event list` → stream replays, fail in err |
| json | `json get profile` → doc; `json set $.user.role "admin"` → path flash, value swap |
| vector | `vector search docs "why did the deploy fail?" -k 2` → d1/d2 rise with score bars |
| graph | nodes pop, edges draw, `graph bfs alice` → traversal lights the reachable set |

Each demo ends on a deadpan caption (mono-sm, ink-low): "every write keeps its
past…", "nothing is overwritten…", "one path written…", "search was ready before
you asked", "not a join table in disguise". Beats play once per tab activation
(manual tabs, no auto-rotate — no new infinite animation); SSR = completed state;
reduced motion = final frames, instant tab swap; mobile = horizontal scrollable
rail. Supersedes the v1 hover-rows + accordion (and 05's CSS-only rule for this
section — it is now an island). Guides linked per tab below the demo. *(Same-day
amendment, Ani: "too much whitespace around the content" — the head stays in the
70rem prose column; the rail + demo break out to an 88rem stage, demo type up to
17px/36 with p-8, rail tabs roomier.)*

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

**v1 layout (superseded).** Full-width cross-section: five layers — `kv` (surface)
down to `graph` (bedrock). Each: icon + name + role line; hover/tap/focus thickens
+8px, surfaces the API line in `mono-sm`. *(Branch is not a layer — branching is the
model the layers live inside; it owns section 2 and wears terracotta as brand, not
as a primitive hue.)*

**Copy.** Eyebrow `PRIMITIVES`; H2 **"Every kind of data. One file."** *(alternate held:
"Five primitives. One file.")*; intro: "Purpose-built stores that share one engine, one
transaction model, and one branch tree."

| Layer | Role line | API line |
|---|---|---|
| kv | "Versioned key-value. History included." | `kv put user:1 {…} · kv history user:1` |
| event | "Append-only streams. Replay anything." | `event append actions {…} · event list actions` |
| json | "Documents with path-level writes." | `json set profile $.user.role "admin"` |
| vector | "Embeddings with HNSW search." | `vector search docs <query> -k 5` |
| graph | "Nodes, edges, typed links. Traverse anything." | `graph add-edge alice knows bob · graph bfs alice` |

Motion: layers reveal bottom-up (geology accretes), 60ms stagger ≤800ms · entry drift
±12px within the seam budget (03 §3.1) · hover thicken `--dur-2` · reduced-motion: no
drift, thicken→border-bright · mobile: tap-to-expand accordion · keyboard traversable.
*(No live counts — scoped 2026-06-11; the column is CSS-only, see 05.)*

## 5. Section 4 — Time travel · the instrument (v2, 2026-06-12)

**v2 (Ani): "an interactive component that the user can scrub back and forth and see
how the value changes. We should not have another parallax scroll."** The scroll-scrub
is RETIRED (the page's scrub count drops to one — branch). Time travel is now **direct
manipulation**: the visitor owns a playhead.

**The artifact — TimeScrubber.** A terminal card (primitives material: ember border,
bloom, dot-grid body, ruled mono footer) running the live read
`kv get portfolio.value --as-of "<timestamp>"`. *(Domain v2.1, same day — Ani: "dark,
dusk, midnight doesn't pop." The FINANCE THREAD continues from the branch story:
`portfolio.value` is $98,400 on 06-09, DIPS to $91,750 on 06-10, then the aggressive
strategy merged in section 2 pays off — $111,080 on 06-11. Scrubbing tells that story
in dollars; `config.theme` remains the ops thread for hero/inference.)* A draggable
ember playhead rides a ruled timeline spanning the seed world's three days
(2026-06-09 → now); the command's timestamp and the answer update as you drag. The
answer row: the dollar value at stat scale (tabular nums), version chip, signed delta
vs the previous write (▲ ok-green / ▼ err-red — functional colors as data), written-at.
**Scrub before the first write and the key honestly does not exist yet** ("∅ nothing
here yet"). Write markers light ember as the playhead passes them; the elapsed span
tints. Footer: "drag the playhead — every read accepts --as-of" · "3 versions ·
0 overwrites".

**Copy.** H2 **"Go back to any moment."** (eyebrow lives in the section rule); intro:
"Every write is a version. Nothing is overwritten — drag the playhead and read the
past."

Interaction: pointer drag + click-to-jump (pointer capture, touch-none) · keyboard =
real slider (role=slider, aria-valuetext speaks the moment + version; arrows snap
between span start / writes / now; Home/End) · value swaps animate 220ms in a
fixed-height row (CLS-zero) · reduced motion: fully alive — it only moves when the
user moves it · SSR = playhead at "now" (completed state). Head in the prose column,
instrument on the 80rem stage with one quiet ember field.

*(v1 — the 1.5vh sticky version strip — retired 2026-06-12; its "choreographed
permanently" scoping is superseded by this direct-manipulation form. The live variant
— the instrument reading the visitor's own hero writes — remains the R8 future
option.)*

## 6. Section 5 — Native inference

**First-class section (2026-06-11):** the story is bigger than search — embedding,
retrieval, and generation are built into the engine, pointed at any OpenAI-compatible
endpoint (local Ollama included), with model management in the CLI and Foundry.

**Layout.** 5/7 split (demo right). The demo: a search field types (Tier-1 cadence) the
H2's own question; ranked results surface with primitive-colored edge ticks — an
`event` (deploy log), a `kv` version (config change), a `vector` hit (doc chunk).

**Copy.** Eyebrow `INFERENCE`; H2 **"Just ask."** *(alternate held: the query-as-headline
"“What changed before the deploy failed?”" — strongest alternate on the page; the
question now lives entirely in the demo, which types it in full)*. Body: "Ask in plain
language. One flag embeds every write as it lands; hybrid retrieval searches every
primitive at once. Point it at any OpenAI-compatible endpoint — or run models locally." Code chip beneath
(`mono-sm`): `db.configure_model(endpoint="http://localhost:11434/v1")` ·
`auto_embed=True`.

Motion: trigger ≥50%, plays once · typing Tier-1, results 40ms stagger · reduced-motion
= completed query + results · mobile = stack. *(Choreographed permanently — scoped
2026-06-11; the demo's query/results are authored against the seed dataset, so the
answer shown is the answer the real engine gives — truth rule holds via the transcript
verifier.)*

## 7. Section 6 — Resources

Three quiet cards, no imagery, hairline-bordered. **Render only what exists** (truth
rule). Eyebrow `RESOURCES`; H2 (small, `title` scale): **"Go deeper."**

| Card | Copy | → |
|---|---|---|
| **Documentation** | "Concepts, guides, and the full reference." | `/docs` |
| **Examples & quickstarts** | "First database in thirty seconds; real patterns after that." | `/docs/getting-started` + cookbook |
| **Whitepapers** | "The internals, written down: storage engine, concurrency model, durability and recovery." | `/architecture` |

Standard reveal. (Decided 2026-06-11: **the architecture deep-dives ARE the whitepaper
collection** — long-form, technical, argued; the label is honest today. Future standalone
papers join the same collection at `/architecture`. The Phase-4 re-skin of that section
may lean into paper-style presentation accordingly.)

## 8. Section 7 — Install & start

**The act section: five surfaces, one product** — humans and agents install in the same
place. Horizon glow, second and final use (60% hero opacity).

**Copy.** Eyebrow `INSTALL`; H2 **"Start in thirty seconds."** *(same testable claim,
imperative form; alternate held: "Thirty seconds to first write.")*

Tabs (each renders only if its path works — truth rule):

| Tab | Content |
|---|---|
| **Python** | `pip install stratadb` + 4-line first-write snippet |
| **CLI** | `cargo install strata-cli` · the curl chip (no brew — no tap exists, decided 2026-06-11) + first-write session: `strata --cache` → `kv put hello world` → `(version) 1` → `kv get hello` → `"world"` |
| **Node** | `npm install @stratadb/core` + snippet |
| **Foundry** | "The desktop studio — browse keys, switch branches, diff and merge visually. macOS first." CTA per R1: **"Star strata-foundry"** → repo, auto-upgrades to **"Download Foundry"** when artifacts exist. Optional small static frame (R2 rules: real capabilities, target dark identity) |
| **MCP** | The agent door (absorbs the "For your agent" card): copyable MCP config (verified against the MCP reference) · `stratadb.org/llms.txt` in mono · "For AI agents →" `/docs/getting-started/for-agents` |

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
Tools` stat (re-add in the MCP tab only if build-time verified — Open Q5).

## Open questions

**None. Signed off 2026-06-11** — all items resolved by Ani: hero H1 confirmed ·
verb-led head slate approved (all six) · no brew tap, line dropped · seed dataset =
curated fictional (authored in Phase 2; designed so every demo beat has a real answer in
the data) · 404 wit kept · MCP tool count omitted · Resources before Install (page ends
on the command) · **the architecture deep-dives are the whitepaper collection** — the
card says Whitepapers from day one; future standalone papers join it.
