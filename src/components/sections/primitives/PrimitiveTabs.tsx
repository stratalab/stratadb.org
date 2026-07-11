// Section 3 (04 §4 v5, 2026-06-12): the Foundry window. Ani: "I don't
// think it's a good idea to overuse the CLI animation. It is in every
// section now. We want to show some stuff from Foundry — that would be
// much more beautiful." So this section now shows the desktop app itself:
// ONE Foundry window whose real sidebar (Key–Value · Events · JSON ·
// Vectors · Graph, with the app's other views dimmed below) is the tab
// rail, and whose content area renders each primitive's actual view —
// master–detail key browser with history, the event stream, the JSON
// tree, vector search, the graph canvas. Structure is faithful to
// strata-foundry/src (Sidebar, KvView, JsonTree, GraphCanvas …); the skin
// is the shared design language Foundry adopts in Doc 02 §B. GUI
// choreography per activation — no typed commands here. SSR renders
// completed states; reduced motion shows final frames.
import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { AnimatePresence, motion, useScroll } from 'motion/react';
import { SEED } from '../../../data/seed';
import { COOL, EASE, EMBER, Line, useBeats } from '../../shared/term';

const PRIMS = [
  { id: 'kv', label: 'Key–Value', role: 'Versioned key-value. History included.', guide: '/docs/guides/kv-store' },
  { id: 'event', label: 'Events', role: 'Append-only streams. Replay anything.', guide: '/docs/guides/event-log' },
  { id: 'json', label: 'JSON', role: 'Documents with path-level writes.', guide: '/docs/guides/json-store' },
  { id: 'vector', label: 'Vectors', role: 'Embeddings with HNSW search.', guide: '/docs/guides/vector-store' },
  { id: 'graph', label: 'Graph', role: 'Nodes, edges, typed links. Traverse anything.', guide: '/docs/guides/graph' },
] as const;

// The rest of the real app's nav — present and dimmed: Foundry is bigger
// than five views, and the other stories live in other sections.
const MORE_NAV = ['Branches', 'Generate', 'Models', 'Inference', 'Search'];

type PrimId = (typeof PRIMS)[number]['id'];

// ---- shared GUI bits -------------------------------------------------------

function SelectableRow({
  on,
  selected,
  children,
  mono = true,
}: {
  on: boolean;
  selected?: boolean;
  children: ReactNode;
  mono?: boolean;
}) {
  return (
    <Line on={on}>
      <div
        className={`flex items-baseline justify-between gap-3 rounded-(--radius-control) px-2.5 py-1.5 ${mono ? 'font-mono text-mono-sm' : 'text-small'} ${
          selected ? 'text-ink-hi' : 'text-ink-mid'
        }`}
        style={selected ? { background: EMBER(0.13), boxShadow: `inset 2px 0 0 var(--color-terracotta-500)` } : undefined}
      >
        {children}
      </div>
    </Line>
  );
}

function PanelLabel({ children }: { children: ReactNode }) {
  return <p className="font-mono text-eyebrow uppercase text-ink-low">{children}</p>;
}

function Chip({ children, tone = 'ember' }: { children: ReactNode; tone?: 'ember' | 'dim' }) {
  return (
    <span
      className="rounded px-1.5 py-0.5 font-mono text-mono-sm"
      style={
        tone === 'ember'
          ? { background: EMBER(0.16), color: 'var(--color-terracotta-300)' }
          : { background: 'rgba(255, 255, 255, 0.06)', color: 'var(--color-ink-mid)' }
      }
    >
      {children}
    </span>
  );
}

// ---- Key–Value: the master–detail browser, history open -------------------
function KvView({ live }: { live: boolean }) {
  const beat = useBeats([300, 250, 250, 350, 400, 300, 300, 300], live);
  const keys = ['config.theme', 'greeting', 'portfolio.value', 'user:1'];
  const history = (SEED.kv['portfolio.value'].history ?? []).slice().reverse();
  return (
    <div className="flex h-full max-md:flex-col">
      <div className="w-56 shrink-0 border-r border-line p-3 max-md:w-full max-md:border-b max-md:border-r-0">
        <div className="mb-2 rounded-(--radius-control) border border-line bg-panel px-2.5 py-1.5 font-mono text-mono-sm text-ink-low">
          filter keys…
        </div>
        {keys.map((k, i) => (
          <SelectableRow key={k} on={beat >= 1 + i} selected={k === 'portfolio.value' && beat >= 4}>
            <span className="truncate">{k}</span>
          </SelectableRow>
        ))}
      </div>
      <div className="min-w-0 flex-1 p-5">
        <Line on={beat >= 5} className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-mono-body text-ink-hi">portfolio.value</span>
          <Chip>v3</Chip>
          <Chip tone="dim">int</Chip>
        </Line>
        <Line on={beat >= 5} className="mt-3 rounded-(--radius-card) border border-line bg-inset p-4">
          <span className="font-mono text-[1.4rem] text-ink-hi tabular-nums">111080</span>
        </Line>
        <div className="mt-5">
          <PanelLabel>History</PanelLabel>
          <div className="mt-2 space-y-1">
            {history.map((h, i) => (
              <SelectableRow key={h.version} on={beat >= 6 + i} selected={i === 0 && beat >= 8}>
                <span className="flex items-baseline gap-3">
                  <span className={i === 0 ? 'text-terracotta-300' : 'text-ink-low'}>v{h.version}</span>
                  <span className="tabular-nums">{Number(h.value).toLocaleString('en-US')}</span>
                </span>
                {/* ink-mid on the selected row — the ember wash eats ink-low's margin */}
                <span className={`${i === 0 ? 'text-ink-mid' : 'text-ink-low'} max-sm:hidden`}>
                  {h.at.slice(0, 16).replace('T', ' ')}
                </span>
              </SelectableRow>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Events: the append-only stream ----------------------------------------
function EventsView({ live }: { live: boolean }) {
  const beat = useBeats([350, 400, 400, 400, 350], live);
  const rows = SEED.events.deploys.map((e) => ({
    t: e.at.slice(11, 19),
    action: String(e.payload.action),
    detail:
      e.payload.action === 'config.update'
        ? `${e.payload.key} → "${e.payload.to}"`
        : e.payload.action === 'deploy.start'
          ? String(e.payload.version)
          : String(e.payload.reason),
  }));
  return (
    <div className="flex h-full flex-col p-5">
      <Line on={beat >= 1} className="flex items-center gap-3">
        <span className="font-mono text-mono-body text-ink-hi">deploys</span>
        <Chip tone="dim">stream</Chip>
        <span className="ml-auto font-mono text-mono-sm text-ink-low">append-only</span>
      </Line>
      <div className="mt-3 overflow-hidden rounded-(--radius-card) border border-line">
        <div className="grid grid-cols-[6rem_1fr_1.2fr] gap-3 border-b border-line bg-panel px-4 py-2 font-mono text-eyebrow uppercase text-ink-low max-sm:grid-cols-[6rem_1fr]">
          <span>time</span>
          <span>action</span>
          <span className="max-sm:hidden">payload</span>
        </div>
        {rows.map((r, i) => (
          <Line key={r.t} on={beat >= 2 + i}>
            <div
              className={`grid grid-cols-[6rem_1fr_1.2fr] gap-3 px-4 py-2.5 font-mono text-mono-sm max-sm:grid-cols-[6rem_1fr] ${i < rows.length - 1 ? 'border-b border-line' : ''}`}
              style={i === rows.length - 1 && beat >= 4 ? { background: EMBER(0.07) } : undefined}
            >
              <span className="text-ink-low tabular-nums">{r.t}</span>
              <span className={r.action === 'deploy.fail' ? 'text-err' : 'text-ink-hi'}>{r.action}</span>
              <span className="text-ink-mid max-sm:hidden">{r.detail}</span>
            </div>
          </Line>
        ))}
      </div>
      <Line on={beat >= 5} className="mt-3 font-mono text-mono-sm text-ink-low">
        3 events · nothing is overwritten — the stream is the record
      </Line>
    </div>
  );
}

// ---- JSON: the document tree ------------------------------------------------
function TreeRow({
  on,
  depth,
  caret,
  k,
  v,
  hot,
}: {
  on: boolean;
  depth: number;
  caret?: boolean;
  k: string;
  v?: string;
  hot?: boolean;
}) {
  return (
    <Line on={on}>
      <div
        className="relative flex items-baseline gap-2 rounded px-2 py-1 font-mono text-mono-sm"
        style={{ paddingLeft: `${depth * 1.25 + 0.5}rem`, background: hot ? EMBER(0.12) : undefined }}
      >
        {caret !== undefined && (
          <span className="text-ink-low" aria-hidden="true">
            {caret ? '▾' : '▸'}
          </span>
        )}
        <span className="text-strata-json">{k}</span>
        {v !== undefined && (
          <>
            <span className="text-ink-low">:</span>
            <span className={hot ? 'text-terracotta-300' : 'text-ink-hi'}>{v}</span>
          </>
        )}
      </div>
    </Line>
  );
}

function JsonView({ live }: { live: boolean }) {
  const beat = useBeats([300, 250, 250, 400, 250, 250, 300, 250, 450], live);
  const docs = ['config', 'portfolio', 'profile'];
  return (
    <div className="flex h-full max-md:flex-col">
      <div className="w-56 shrink-0 border-r border-line p-3 max-md:w-full max-md:border-b max-md:border-r-0">
        <PanelLabel>Documents</PanelLabel>
        <div className="mt-2">
          {docs.map((d, i) => (
            <SelectableRow key={d} on={beat >= 1 + i} selected={d === 'profile' && beat >= 4}>
              <span>{d}</span>
            </SelectableRow>
          ))}
        </div>
      </div>
      <div className="min-w-0 flex-1 p-5">
        <Line on={beat >= 4} className="flex items-center gap-3">
          <span className="font-mono text-mono-body text-ink-hi">profile</span>
          <Chip tone="dim">2 levels</Chip>
        </Line>
        <div className="mt-3 rounded-(--radius-card) border border-line bg-inset py-2">
          <TreeRow on={beat >= 5} depth={0} caret k="user" />
          <TreeRow on={beat >= 6} depth={1} k="name" v={'"Alice"'} />
          <TreeRow on={beat >= 7} depth={1} k="role" v={'"admin"'} hot={beat >= 9} />
          <TreeRow on={beat >= 8} depth={1} caret k="prefs" />
          <TreeRow on={beat >= 8} depth={2} k="theme" v={'"midnight"'} />
        </div>
        <Line on={beat >= 9} className="mt-3 font-mono text-mono-sm text-ink-low">
          $.user.role written in place — the rest untouched
        </Line>
      </div>
    </div>
  );
}

// ---- Vectors: search, scored ------------------------------------------------
function CountUp({ to, on, live }: { to: number; on: boolean; live: boolean }) {
  const [v, setV] = useState(() => (live ? 0 : to));
  useEffect(() => {
    if (!live || !on) {
      setV(!live ? to : 0);
      return;
    }
    let raf: number;
    const t0 = performance.now();
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / 600);
      setV(to * (1 - Math.pow(1 - k, 3)));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [on, live]);
  return <>{v.toFixed(2)}</>;
}

const HITS = [
  { id: 'd1', score: 0.91, text: SEED.vectors.docs[0].text },
  { id: 'd2', score: 0.84, text: SEED.vectors.docs[1].text },
];

function VectorView({ live }: { live: boolean }) {
  const beat = useBeats([350, 500, 450, 450, 350], live);
  return (
    <div className="flex h-full flex-col p-5">
      <Line on={beat >= 1} className="flex items-center gap-3">
        <span className="font-mono text-mono-body text-ink-hi">docs</span>
        <Chip tone="dim">384 dims · HNSW</Chip>
      </Line>
      <Line on={beat >= 2} className="mt-3">
        <div className="flex items-center gap-2.5 rounded-(--radius-control) border border-line bg-panel px-3 py-2.5">
          <svg className="h-4 w-4 shrink-0 text-ink-low" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" strokeLinecap="round" />
          </svg>
          <span className="font-mono text-mono-sm text-ink-hi">why did the deploy fail?</span>
          <span className="ml-auto rounded bg-terracotta-500/15 px-2 py-0.5 font-mono text-mono-sm text-terracotta-300">
            k = 2
          </span>
        </div>
      </Line>
      <div className="mt-3 space-y-2">
        {HITS.map((hit, i) => (
          <Line key={hit.id} on={beat >= 3 + i}>
            <div className="rounded-(--radius-card) border border-line bg-panel p-3.5">
              <div className="flex items-baseline gap-4">
                <span className="font-mono text-mono-sm text-terracotta-400">{hit.id}</span>
                <span className="font-mono text-mono-sm text-ink-hi tabular-nums">
                  <CountUp to={hit.score} on={beat >= 3 + i} live={live} />
                </span>
                <span className="relative h-1.5 w-40 self-center overflow-hidden rounded-full bg-raised" aria-hidden="true">
                  <motion.span
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ background: `linear-gradient(90deg, ${EMBER(0.45)}, var(--color-terracotta-400))` }}
                    initial={false}
                    animate={{ width: beat >= 3 + i ? `${hit.score * 100}%` : '0%' }}
                    transition={{ duration: 0.6, ease: EASE }}
                  />
                </span>
              </div>
              <p className="mt-1.5 text-small text-ink-mid">“{hit.text}”</p>
            </div>
          </Line>
        ))}
      </div>
      <Line on={beat >= 5} className="mt-3 font-mono text-mono-sm text-ink-low">
        embedded on write — search was ready before you asked
      </Line>
    </div>
  );
}

// ---- Graph: the canvas -------------------------------------------------------
const NODES = [
  { id: 'alice', x: 70, y: 64 },
  { id: 'bob', x: 268, y: 52 },
  { id: 'deploy-v2.3', x: 196, y: 156 },
];
const EDGES = [
  { from: NODES[0], rel: 'knows', to: NODES[1] },
  { from: NODES[0], rel: 'triggered', to: NODES[2] },
];

function GraphView({ live }: { live: boolean }) {
  const beat = useBeats([350, 450, 450, 500, 650, 400], live);
  return (
    <div className="flex h-full flex-col p-5">
      <Line on={beat >= 1} className="flex flex-wrap items-center gap-3">
        <span className="font-mono text-mono-body text-ink-hi">graph</span>
        <Chip tone="dim">3 nodes · 2 edges</Chip>
        <span className="ml-auto flex items-center gap-2 font-mono text-mono-sm text-ink-low">
          bfs from <Chip>alice</Chip> depth <Chip tone="dim">1</Chip>
        </span>
      </Line>
      <div
        className="mt-3 flex flex-1 items-center justify-center rounded-(--radius-card) border border-line"
        style={{
          backgroundColor: 'var(--color-inset)',
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.05) 1px, transparent 1.6px)',
          backgroundSize: '22px 22px',
        }}
      >
        <svg viewBox="0 0 340 200" className="h-[13rem] w-full max-w-[26rem]" fill="none" aria-hidden="true">
          {EDGES.map((e) => (
            <g key={e.rel}>
              <motion.line
                x1={e.from.x}
                y1={e.from.y}
                x2={e.to.x}
                y2={e.to.y}
                stroke="var(--color-line-hover)"
                strokeWidth="1.5"
                initial={false}
                animate={{ pathLength: beat >= 2 ? 1 : 0, opacity: beat >= 2 ? 1 : 0 }}
                transition={{ duration: 0.5, ease: EASE }}
              />
              <motion.line
                x1={e.from.x}
                y1={e.from.y}
                x2={e.to.x}
                y2={e.to.y}
                stroke="var(--color-terracotta-400)"
                strokeWidth="2"
                initial={false}
                animate={{ pathLength: beat >= 4 ? 1 : 0, opacity: beat >= 4 ? 0.9 : 0 }}
                transition={{ duration: 0.55, ease: EASE }}
              />
              {live && beat >= 4 && (
                <motion.circle
                  r="4"
                  fill="var(--color-terracotta-400)"
                  style={{ filter: `drop-shadow(0 0 6px ${EMBER(0.9)})` }}
                  initial={{ cx: e.from.x, cy: e.from.y, opacity: 0 }}
                  animate={{ cx: e.to.x, cy: e.to.y, opacity: [0, 1, 1, 0] }}
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                />
              )}
              <motion.text
                x={(e.from.x + e.to.x) / 2}
                y={(e.from.y + e.to.y) / 2 - 8}
                textAnchor="middle"
                className="font-mono"
                fontSize="11"
                fill="var(--color-ink-low)"
                initial={false}
                animate={{ opacity: beat >= 2 ? 1 : 0 }}
                transition={{ duration: 0.32 }}
              >
                {e.rel}
              </motion.text>
            </g>
          ))}
          {NODES.map((n, i) => {
            const lit = beat >= 4 || (n.id === 'alice' && beat >= 3);
            return (
              <motion.g
                key={n.id}
                initial={false}
                animate={{ opacity: beat >= 1 ? 1 : 0, scale: beat >= 1 ? 1 : 0.6 }}
                transition={{ duration: 0.4, ease: EASE, delay: live ? i * 0.12 : 0 }}
                style={{ transformOrigin: `${n.x}px ${n.y}px` }}
              >
                <circle
                  cx={n.x}
                  cy={n.y}
                  r="7"
                  fill={lit ? 'var(--color-terracotta-500)' : 'var(--color-raised)'}
                  stroke={lit ? 'var(--color-terracotta-400)' : 'var(--color-ink-low)'}
                  strokeWidth="1.5"
                  style={lit ? { filter: `drop-shadow(0 0 8px ${EMBER(0.7)})` } : undefined}
                />
                <text
                  x={n.x}
                  y={n.y + (n.y > 100 ? 24 : -16)}
                  textAnchor="middle"
                  className="font-mono"
                  fontSize="12"
                  fill={lit ? 'var(--color-ink-hi)' : 'var(--color-ink-mid)'}
                >
                  {n.id}
                </text>
              </motion.g>
            );
          })}
        </svg>
      </div>
      <Line on={beat >= 5} className="mt-3 font-mono text-mono-sm text-ink-low">
        2 nodes reachable · typed edges, real traversal
      </Line>
    </div>
  );
}

const VIEWS: Record<PrimId, ComponentType<{ live: boolean }>> = {
  kv: KvView,
  event: EventsView,
  json: JsonView,
  vector: VectorView,
  graph: GraphView,
};

// ---- the Foundry window ----------------------------------------------------
// v6 (2026-06-12, Ani): "make it so the scroll doesn't just blow past it" —
// the window PINS (scrub #2 of 2; the slot freed by the time-travel
// conversion) and continued scrolling walks the five views, one band each.
// Clicking a view never fights the scroll: it JUMPS the scroll position to
// that view's band, so pointer and pin always agree. Desktop only; reduced
// motion and mobile keep the unpinned manual window.
const PIN_VH = 260; // 100vh screen + 5 bands of dwell

const isPinned = () => window.matchMedia('(min-width: 1024px)').matches;

export default function PrimitiveTabs() {
  const rootRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [selected, setSelected] = useState<PrimId>('kv');
  const [reduced, setReduced] = useState(false);
  const [seen, setSeen] = useState(false);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    setReduced(document.documentElement.dataset.motion === 'reduced');
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    if (rootRef.current) io.observe(rootRef.current);
    return () => io.disconnect();
  }, []);

  // While pinned, scroll position drives the active view (band-stepped).
  const { scrollYProgress } = useScroll({ target: pinRef, offset: ['start start', 'end end'] });
  useEffect(
    () =>
      scrollYProgress.on('change', (v) => {
        if (reduced || !isPinned()) return;
        const i = Math.min(PRIMS.length - 1, Math.max(0, Math.floor(v * PRIMS.length)));
        setSelected(PRIMS[i].id);
      }),
    [scrollYProgress, reduced]
  );

  // Clicking a view jumps the scroll to its band — pointer and pin agree.
  const goTo = (i: number) => {
    setTouched(true);
    const el = pinRef.current;
    if (el && !reduced && isPinned()) {
      const scrollable = el.offsetHeight - window.innerHeight;
      if (scrollable > 0) {
        const top = window.scrollY + el.getBoundingClientRect().top;
        window.scrollTo({ top: Math.round(top + (scrollable * (i + 0.5)) / PRIMS.length), behavior: 'auto' });
      }
    }
    setSelected(PRIMS[i].id);
  };

  const live = seen && !reduced;
  const ActiveView = VIEWS[selected];
  const activeIdx = PRIMS.findIndex((p) => p.id === selected);
  const active = PRIMS[activeIdx];

  const onKeys = (e: KeyboardEvent) => {
    const delta =
      e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
    let next = activeIdx;
    if (delta) next = (activeIdx + delta + PRIMS.length) % PRIMS.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = PRIMS.length - 1;
    else return;
    e.preventDefault();
    goTo(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div ref={pinRef} className={reduced ? '' : 'lg:h-[260vh]'}>
      <div ref={rootRef} className={`relative ${reduced ? '' : 'lg:sticky lg:top-24'}`}>
        {/* stage lights: the page's one pair */}
        <div
          className="pointer-events-none absolute -inset-x-20 -inset-y-16"
          aria-hidden="true"
          style={{
            background: `radial-gradient(44% 58% at 60% 40%, ${EMBER(0.11)}, transparent 70%), radial-gradient(30% 44% at 10% 80%, ${COOL(0.07)}, transparent 72%)`,
          }}
        />

        <div className="relative" onPointerDownCapture={() => setTouched(true)}>
        {/* the window */}
        <div
          className="overflow-hidden rounded-(--radius-frame)"
          style={{
            background: 'var(--color-panel)',
            border: `1px solid ${EMBER(0.22)}`,
            boxShadow: `var(--shadow-float), 0 0 110px -28px ${EMBER(0.35)}`,
          }}
        >
          {/* titlebar */}
          <div
            className="flex h-12 items-center gap-3 px-4"
            style={{ borderBottom: `1px solid ${EMBER(0.14)}`, background: EMBER(0.04) }}
          >
            <span className="flex gap-1.5" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-full bg-ink-low/40" />
              <span className="h-2.5 w-2.5 rounded-full bg-ink-low/40" />
              <span className="h-2.5 w-2.5 rounded-full bg-ink-low/40" />
            </span>
            <span className="font-mono text-mono-sm text-ink-low">Strata Foundry</span>
            <span className="flex items-center gap-2 rounded-(--radius-control) border border-line bg-raised px-2.5 py-1 font-mono text-mono-sm text-ink-hi">
              <span className="h-1.5 w-1.5 rounded-full bg-ok" aria-hidden="true" />
              portfolio.strata
            </span>
            {/* the invitation — fades on first touch */}
            <motion.span
              className="rounded-full px-2.5 py-0.5 font-mono text-mono-sm max-[560px]:hidden"
              style={{ background: EMBER(0.14), color: 'var(--color-terracotta-300)' }}
              initial={false}
              animate={
                touched
                  ? { opacity: 0, visibility: 'hidden' }
                  : { opacity: [1, 0.55, 1, 0.55, 1], visibility: 'visible' }
              }
              transition={touched ? { duration: 0.3 } : { duration: 3.2, ease: 'easeInOut' }}
              aria-hidden={touched}
            >
              interactive — click around
            </motion.span>
            <span className="ml-auto flex items-center gap-2 font-mono text-mono-sm text-ink-low max-sm:hidden">
              <span className="rounded-(--radius-control) border border-line px-2 py-0.5">⎇ main</span>
              <span className="rounded-(--radius-control) border border-line px-2 py-0.5 max-md:hidden">space: default</span>
            </span>
          </div>

          <div className="flex min-h-[32rem] max-md:flex-col">
            {/* the sidebar IS the strata column: five numbered layers, the
                active one lit by ember — plus the app's other views, dimmed */}
            <div
              role="tablist"
              aria-label="Foundry views — the five primitives"
              aria-orientation="vertical"
              onKeyDown={onKeys}
              className="flex w-56 shrink-0 flex-col gap-0.5 border-r border-line bg-raised/40 p-3 max-md:w-full max-md:flex-row max-md:overflow-x-auto max-md:border-b max-md:border-r-0"
            >
              {PRIMS.map((p, i) => {
                const isActive = p.id === selected;
                return (
                  <button
                    key={p.id}
                    ref={(el) => {
                      tabRefs.current[i] = el;
                    }}
                    type="button"
                    role="tab"
                    id={`prim-tab-${p.id}`}
                    aria-selected={isActive}
                    aria-controls="prim-panel"
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => goTo(i)}
                    className={`flex shrink-0 items-center gap-2.5 rounded-(--radius-control) px-3 py-2 text-left text-small outline-none transition-colors duration-200 focus-visible:ring-1 focus-visible:ring-terracotta-500 ${
                      isActive ? 'text-ink-hi' : 'text-ink-mid hover:bg-raised'
                    }`}
                    style={
                      isActive
                        ? { background: `linear-gradient(90deg, ${EMBER(0.16)}, ${EMBER(0.05)})`, boxShadow: `inset 2px 0 0 var(--color-terracotta-500)` }
                        : undefined
                    }
                  >
                    <span
                      className={`font-mono text-mono-sm ${isActive ? 'text-terracotta-400' : 'text-ink-low'}`}
                      aria-hidden="true"
                    >
                      0{i + 1}
                    </span>
                    {p.label}
                  </button>
                );
              })}
              <div className="my-2 border-t border-line max-md:hidden" aria-hidden="true" />
              <div className="flex flex-col gap-0.5 max-md:hidden" aria-hidden="true">
                {MORE_NAV.map((label) => (
                  <span key={label} className="px-3 py-1.5 text-small text-ink-low">
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* the content view */}
            <div id="prim-panel" role="tabpanel" aria-labelledby={`prim-tab-${selected}`} className="min-w-0 flex-1 bg-void/40">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={selected}
                  className="h-full"
                  initial={reduced ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduced ? undefined : { opacity: 0, y: -6 }}
                  transition={{ duration: reduced ? 0 : 0.26, ease: EASE }}
                >
                  <ActiveView live={live} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* the ruled footer, drafting voice */}
        <div className="mt-5 flex items-baseline justify-between gap-4 border-t border-line pt-3">
          <p className="font-mono text-mono-sm text-ink-low">
            <span className="text-terracotta-400">0{activeIdx + 1}</span> / 05 · {active.id} —{' '}
            <span className="max-sm:hidden">{active.role.toLowerCase().replace(/\.$/, '')}</span>
          </p>
          <a
            href={active.guide}
            className="shrink-0 text-small text-ink-mid underline decoration-line underline-offset-4 transition-colors duration-200 hover:text-ink-hi"
          >
            Read the {active.id} guide →
          </a>
        </div>
        </div>
      </div>
    </div>
  );
}
