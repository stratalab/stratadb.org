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

---

## 2. Section 1 — Hero + Set-piece A: "The Forking Terminal"

**Layout.** Badge → H1 → CTAs → set-piece → stat strip (no eyebrow, no sub). Horizon:
1px gradient line + `--horizon-glow` behind the terminal. Parallax site #1: glow 0.85×,
terminal 1.0×, stat strip 1.04×.

**Copy** (final; simple — the hero describes nothing; the demo does).
- Badge: `Research preview · v{version}` → `/changelog`
- H1 (`display-xl`): **"An embedded database."** — **CONFIRMED (Ani, 2026-06-11).**
  Maximal understatement over an impossible demo; the gap is the entire effect.
  Rationale in the approver's words: *"We are so unbothered by marketing that we
  literally call ourselves an embedded database and that's it."* Era-framings rejected
  (saturated, unverifiable, collapse the understatement).
- CTAs: **"Get Started"** → `/docs/getting-started` · copyable mono chip
  `curl -fsSL stratadb.org/install.sh | sh`
- Stat strip (Commit Mono, footnote markers → conditions in docs):
  `250K ops/s · <1 ms fork · 5 primitives · 0 servers · Apache-2.0`

**Storyboard (set-piece A).** Executor-driven (03 §4); one terminal that forks. ≈22s
loop + 4s hold. First frame (SSR'd): completed `strata:main › kv put greeting "hello"`
→ `(version) 1`.

| Beat | Executor events | Choreography |
|---|---|---|
| 1 | `cmd: branch create experiment` → `OK` | Tier-1 typing; 300ms beat |
| 2 | `split` | Panels fork on `spring-settle`; 1px branch line arcs; right title `experiment`, prompt `strata:experiment ›` |
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

**Layout.** 7/5 split (text left). **Copy.** Eyebrow `BRANCH`; H2 **"Try anything.
Keep what works."** *(section-head register per claude.com reference, 2026-06-11 —
verb-led, second person; alternate held: "A branch is a database.")*; body: "Forking is
O(1) — nothing is copied, at any size. A branch is a complete database: diff it, merge
it, cherry-pick a single change across. `main` is untouched until you say so."
*(the old head survives as the body's conceptual anchor)* **Right:** terminal (chrome 02
§12), completed transcript of the **full verb set**: fork → write → `branch diff` →
`branch cherry-pick` → `branch delete` — main intact. Fork-only "branching" products
can't screenshot this. Standard reveal; live-capable (executor). Mobile: stack,
terminal first.

## 4. Section 3 — Multi-primitive: The Strata Column

The motif's load-bearing appearance (02 §9). **Not** a card grid.

**Layout.** Full-width cross-section: five layers — `kv` (surface) down to `graph`
(bedrock). Each: icon + name + role line; hover/tap/focus thickens +8px, surfaces the
API line in `mono-sm`. *(Branch is not a layer — branching is the model the layers live
inside; it owns section 2 and wears terracotta as brand, not as a primitive hue.)*

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

## 5. Section 4 — Time travel · Set-piece B (the only scrub)

**Layout.** Sticky scrub, 1.5 viewport-heights. Horizontal **version strip**: versions
of `config` accrete left→right as timestamped sediment cells; playhead tracks scroll;
left code panel updates per scene.

**Copy.** Eyebrow `TIME TRAVEL`; H2 **"Go back to any moment."** *(alternate held:
"Yesterday is a query.")*; caption rail:
1. "Every write is a version. Nothing is overwritten." — `kv history config`
2. "Open the database as it was." — `db.at(yesterday)` → `snapshot.kv.get("config")`
3. "Diff then against now." — old vs new, changed field highlighted

Motion: bands 0–35–70, 12% crossfades, `spring-scrub` · reduced-motion = static scenes
+ Prev/Next steppers · mobile = swipeable carousel · captions are real DOM text.

*(Choreographed permanently — scoped 2026-06-11. The live variant — the strip showing
the visitor's own hero writes — is recorded as a future option in §0.)*

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
