# IA & Content Strategy — stratadb.org

| | |
|---|---|
| Status | **In review** (gate: Ani sign-off) |
| Owner | Ani (product) · Claude (drafting) |
| Last updated | 2026-06-11 |
| Upstream | 00-prd.md (dual-loop model, personas, claims policy) |
| Downstream | 02-design-language, 04-experience, 06-engineering |

---

## 1. What this document owns

Where everything lives and why: domains, sitemap, navigation, each page's job, the order
of claims on the landing page, the agent surface's structure, and SEO posture. It does
**not** own visuals (02/04) or implementation (06).

## 2. Domain strategy

**Decided 2026-06-11: `stratadb.org` is the family root.** Ownership facts (Ani):
`stratadb.ai` and `stratahub.io` are owned; **`strata.dev` is not owned** — yet the Hub
README links to it today. An unowned domain in a public README is a squatting/phishing
risk; scrubbing it is a priority cross-repo cleanup item.

Why consolidate on stratadb.org:

1. **It's live and indexed** — the only one with deployed content and (modest) SEO equity.
2. **It matches the product's installable names** — `pip install stratadb`,
   `@stratadb/core`, the `stratadb` crate. The name a developer types is the name they
   should visit; "strata" alone is heavily contested namespace (conferences, companies).
3. **SEO and agent discovery compound on one domain.** P4 agents resolve one well-known
   `llms.txt`; split domains dilute both crawlers and citations.
4. **Small team, one cert, one deploy story.**

Family layout under this strategy:

| Surface | Host | Status |
|---|---|---|
| Marketing + docs + agent surface | `stratadb.org` | live (this repo) |
| Hub discovery UI (V1.5, other repo) | `hub.stratadb.org` | reserved; not linked until it exists |
| Hub protocol API | `stratahub.io` (owned) — stays the protocol/API host | confirmed |
| `stratadb.ai` (owned) | 301 → stratadb.org | cleanup |
| `strata.dev` (**not owned**) | remove all references; do not link | **priority cleanup** |

Follow-ups outside this repo: remove the Hub README's `strata.dev` link; update the Hub
discovery-UI doc's `stratadb.ai` targets to `hub.stratadb.org`; configure the
`stratadb.ai` 301. (The site itself hosts on Cloudflare from v2 cutover — PRD R5 — so
zones, redirects, and analytics land as one DNS work package, specced in 06.)

**URL permanence rule:** agents cite our URLs back to humans (PRD §4 agent loop). Every
`/docs/*` URL published in v2 is permanent; renames require edge 301s (available since
the site hosts on Cloudflare — decided 2026-06-11, PRD R5).

## 3. Sitemap (v2)

| Route | Job | Loop | Build phase |
|---|---|---|---|
| `/` | The human funnel: feel → believe → see → act → deepen | Human | 1–3 |
| `/docs` + subtree | Deepen: tutorials → concepts → guides → cookbook → reference | Human + agent | 4 |
| `/docs/getting-started/for-agents` | **The agent integration recipe**: exact-sequence SDK + MCP setup, written to be executed by a coding agent | Agent (human-readable too) | 4 |
| `/architecture` + subtree | P2's front door: internals, invariants, durability — **the whitepaper collection** (framing decided 2026-06-11; future standalone papers join it here) | Human (P2) | 4 (re-skin) |
| `/changelog` | Truthful release history, generated from release data (PRD §7) | Human | 5 |
| `/llms.txt` | Agent front door: index + pointers (§7) | Agent | 4 |
| `/llms-full.txt` | Full docs corpus as one markdown file | Agent | 4 |
| `/docs/**/*.md` mirrors | Every docs page fetchable as clean markdown at `<url>.md` | Agent | 4 |
| `/404` | On-brand recovery + search-free wayfinding (links to docs/llms.txt) | Both | 5 |
| `/install.sh` | Shell installer (exists; content-integrity maintained) | Both | — |

**`/playground` — permanently retired (PRD §6, living-page model).** The simulated REPL
is deleted at cutover and the URL 301s to `/`, forever. The homepage is the playground:
when the wasm artifact lands (R8), one real instance powers every homepage demo — Cache
mode in-tab, honestly labeled ("in-memory; nothing leaves your browser"). No nav slot,
no separate destination, ever.

## 4. Navigation model

**Principle (shared with the Hub's design doc, independently): no empty shelves.** Nothing
enters the nav until it exists for real.

### Primary nav at v2 launch
`Docs · Architecture · Changelog` + GitHub icon (live star count) + **Get Started**
(primary button → `/docs/getting-started`).

Foundry deliberately does **not** get a nav item at launch: it has no page of its own yet
(it's a landing section + repo CTA per PRD §6). Nav evolution is event-driven:

| Event | Nav change |
|---|---|
| Foundry release artifact exists + `/foundry` page ships (fast-follow) | + `Foundry` |
| Packaged wasm artifact exists (PRD R8) | No nav change — homepage demos go live (living-page model) |
| Hub discovery UI live at hub.stratadb.org | + `Datasets` (external) |

### Footer (4 columns + meta row)
- **Product** — Foundry (repo → page when live), Changelog, Roadmap-less by design
- **Documentation** — Getting Started, Guides, Cookbook, Reference
- **Internals** — Architecture, strata-core, strata-foundry, stratahub (GitHub)
- **For agents** — `llms.txt`, For-agents recipe, MCP reference
  *(a footer column addressed to agents is itself a brand statement humans read)*
- Meta row: © · Apache-2.0 (core) · GitHub. **No social links until channels exist**
  (PRD §5). No /privacy, /terms until there's content for them.

## 5. Landing page: messaging hierarchy

IA owns the **order of claims**; 04 owns their execution. The ladder, top to bottom —
each rung answers the objection the previous one creates:

| # | Section | Claim | Objection it answers | Funnel stage |
|---|---|---|---|---|
| 1 | Hero + set-piece | "An embedded database." — and then it forks, diffs, and merges in front of you; the understatement is the claim | "what is this?" | Feel |
| 2 | Branching | The whole git model: O(1) zero-copy fork + diff + merge + cherry-pick — not fork-only "branching" | "isn't branching everywhere now?" | Believe |
| 3 | Multi-primitive | Five primitives, one engine, one transaction model, one branch tree, one file | "another single-trick DB?" | Believe |
| 4 | Time travel | Every version queryable; nothing is ever overwritten | "is this just snapshots?" | Believe |
| 5 | Native inference | Embedding, retrieval, generation in the engine — any OpenAI-compatible endpoint, local models included | "what about AI workloads?" | Believe |
| 6 | Resources | Documentation, examples & quickstarts, whitepapers | "where's the depth?" | Deepen |
| 7 | Install & start | Five surfaces — Python · CLI · Node · Foundry · MCP — ending on the command close | "how do I start?" | Act |

Decisions encoded here (restructure, 2026-06-11):
- **Foundry has no section.** It is an install surface (one of five tabs) plus a footer
  link; the pre-approved `/foundry` page remains its future home. The funnel's "See"
  stage is carried by the living demos themselves.
- **The MCP tab absorbs the "For your agent" block** — five doors, one section: humans
  and agents install in the same place.
- **The performance section is retired**: measured numbers live in the hero stat strip;
  the durability table and trust facts live in docs; one trust line in the close.
- **Resources sits before Install** so the page ends on the `pip install stratadb` close.
- Research-preview marker appears once in the hero region (PRD §5), not on every section.

## 6. Docs information architecture

The existing five-section structure (Getting Started / Concepts / Guides / Cookbook /
Reference + FAQ/Troubleshooting) is sound and maps cleanly to personas — it stays. Changes:

| Change | Rationale |
|---|---|
| Add **Getting Started → "For AI agents"** (the recipe, §3) immediately after Installation | Agent loop entry; also the page humans paste into their agent |
| Remove Playground from all docs links/quick-links | §3 retirement |
| Reference section: fold the unused `reference` content-collection schema into `docs` (config defines a collection that has no directory) | Integrity; eng task for 06 |
| Every docs page declares `description` frontmatter (many currently don't) | Feeds SEO meta + llms.txt entries |

Persona mapping (summary): Getting Started + Cookbook serve P1; Concepts + Architecture
serve P2; Reference serves P1/P3 in execution mode; For-agents + mirrors serve P4.

Content source of truth: docs markdown is synced from `strata-core` (existing
`repository_dispatch: docs-update` pipeline); this repo owns presentation, not prose.
Landing copy is owned here (copy deck in 04).

## 7. The agent surface (spec)

**`/llms.txt`** (per the llms.txt convention) — hand-curated index, ~1 screen:

```
# StrataDB
> Embedded database for AI agents — research preview. Git semantics for data:
> branch, time-travel, diff, merge, search across five primitives. Rust core,
> Python/Node SDKs, MCP server. Apache-2.0.

## Docs
- [Installation](https://stratadb.org/docs/getting-started/installation.md)
- [For AI agents — integration recipe](https://stratadb.org/docs/getting-started/for-agents.md)
- [API quick reference](https://stratadb.org/docs/reference/api-quick-reference.md)
- [MCP server reference](https://stratadb.org/docs/reference/mcp.md)
- [Concepts: branches](https://stratadb.org/docs/concepts/branches.md)

## Optional
- [Full documentation corpus](https://stratadb.org/llms-full.txt)
- [Architecture internals](https://stratadb.org/architecture/index.md)
```

**`/llms-full.txt`** — build-time concatenation of all docs markdown, section-delimited,
with stable source URLs per section so agents can cite precisely.

**Markdown mirrors** — every docs route also emits `<route>.md`: front-matter stripped,
pure CommonMark, no component residue. Generated from the same content collections as the
HTML (PRD §7.6 — the two front doors cannot drift).

**The recipe page** (`for-agents`) is written *to* the agent: numbered steps, exact
commands, copy-paste config blocks, explicit version pinning, a final "verify" step
(`strata --cache ping` → `PONG`), and what to report back to the human.

## 8. SEO posture

- **Query targets, in priority order:** "embedded database with branching" · "git for
  data" / "database branching" · "versioned embedded database" · "embedded vector
  database" · "MCP database server". Agent-intent queries ("database for AI agents,"
  "agent memory database") remain targets but are served by the cookbook/docs pages where
  those use cases genuinely live — not by homepage identity copy (PRD §2 copy rule).
- **Title pattern:** `<Page> — StrataDB` ; landing: `StrataDB — branch your data like
  code` (final copy in 04). Every page gets a real description (≤155 chars).
- **Structured data:** `SoftwareApplication` (landing), `FAQPage` (FAQ), `BreadcrumbList`
  (docs). JSON-LD, build-time.
- **Hygiene:** restore the sitemap (currently disabled while robots.txt advertises one —
  integrity bug); canonical URLs throughout; trailing-slash style locked to current
  GitHub Pages behavior (`/docs/faq/`); OG image per page template-generated at build
  (Phase 5).
- **Posture, not program:** no content-marketing/blog in v2 (PRD non-goal). SEO comes from
  correct structure + the docs corpus + the agent surface, not from publishing cadence.

## 9. Retirements & cleanup at cutover

- `/playground` → edge **301** to `/` (permanent — the homepage is the playground);
  fake-REPL components deleted; nav/footer/quick-links references removed.
- Dead social links, `/privacy`, `/terms` references: removed (no stubs — they were never
  real).
- `stratadb-labs` → `stratalab` across all content (the half-finished org rename).
- Duplicate `/docs/index` content page vs `docs/index.astro`: collapse to one.
- Old landing components incl. the 7 dead ones: deleted in Phase 6.

## 10. Open questions

**None.** All resolved 2026-06-11: domains finalized in §2 (stratadb.org root; strata.dev
scrubbed; stratadb.ai 301; stratahub.io = API host) · Foundry fast-follow **pre-approved**
(`/foundry` + nav slot ship automatically when a release artifact exists) · strata-core
confirmed as docs-prose source of truth (sync pipeline stays).
