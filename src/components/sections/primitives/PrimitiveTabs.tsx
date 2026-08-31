// Section 3: a compact VS Code-style Strata file browser for the data shapes
// that live in one embedded multi-modal store.
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { AnimatePresence, motion, useScroll } from 'motion/react';
import { SEED } from '../../../data/seed';
import { EASE, INK, Line, useBeats } from '../../shared/term';

const PRIMS = [
  {
    id: 'kv',
    label: 'Key–Value',
    role: 'Versioned key-value. History included.',
    guide: '/docs/data/key-value',
  },
  {
    id: 'event',
    label: 'Events',
    role: 'Append-only streams. Replay anything.',
    guide: '/docs/data/events',
  },
  {
    id: 'json',
    label: 'JSON',
    role: 'Documents with path-level writes.',
    guide: '/docs/data/json',
  },
  {
    id: 'vector',
    label: 'Vectors',
    role: 'Embeddings with HNSW search.',
    guide: '/docs/data/vectors',
  },
  {
    id: 'graph',
    label: 'Graph',
    role: 'Nodes, edges, typed links. Traverse anything.',
    guide: '/docs/data/graph',
  },
] as const;

const MORE_NAV = ['Queries', 'Models', 'Inference'];

const HEAD = {
  eyebrow: 'Primitives',
  h2: 'Store every kind of app data in one embedded database.',
  intro:
    'Use keys for settings, JSON for records, events for logs, vectors for embeddings, and graphs for relationships. They live together in the same local file, so your app does not need a separate store for each shape.',
};

type PrimId = (typeof PRIMS)[number]['id'];

function primitiveFromHash(hash: string): PrimId | null {
  const id = hash.replace(/^#primitive-/, '');
  return PRIMS.some((p) => p.id === id) ? (id as PrimId) : null;
}

const VS_BLUE = (amount: number) =>
  `color-mix(in srgb, var(--color-vscode-status) ${amount}%, transparent)`;

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
        style={
          selected
            ? {
                background: 'var(--color-vscode-selection)',
                boxShadow: 'inset 2px 0 0 var(--color-vscode-status)',
              }
            : undefined
        }
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
          ? { background: VS_BLUE(20), color: 'var(--color-vscode-text)' }
          : { background: INK(0.06), color: 'var(--color-vscode-muted)' }
      }
    >
      {children}
    </span>
  );
}

type ActivityKind = 'files' | 'find' | 'schema' | 'extension';

const ACTIVITY_NAV: { kind: ActivityKind; label: string }[] = [
  { kind: 'files', label: 'Explorer' },
  { kind: 'find', label: 'Search' },
  { kind: 'schema', label: 'Schema' },
  { kind: 'extension', label: 'Extensions' },
];

function ActivityIcon({ kind }: { kind: ActivityKind }) {
  const classes = 'h-5 w-5';
  if (kind === 'files') {
    return (
      <svg className={classes} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M5 4.5h5.1l1.7 2H19a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-14a1 1 0 0 1 1-1Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (kind === 'find') {
    return (
      <svg className={classes} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="10.5" cy="10.5" r="5.8" stroke="currentColor" strokeWidth="1.6" />
        <path d="m15 15 4.8 4.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === 'schema') {
    return (
      <svg className={classes} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 4.5 19 8.4v7.2l-7 3.9-7-3.9V8.4l7-3.9Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M5.5 8.7 12 12.4l6.5-3.7M12 12.4v7"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg className={classes} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8.5 4.5h7v4h4v7h-4v4h-7v-4h-4v-7h4v-4Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ActivityRail() {
  return (
    <div
      className="hidden w-12 shrink-0 flex-col items-center gap-1 border-r py-2.5 md:flex"
      style={{
        background: 'var(--color-vscode-activitybar)',
        borderColor: 'var(--color-vscode-border)',
        color: 'var(--color-vscode-muted)',
      }}
    >
      {ACTIVITY_NAV.map((item, i) => (
        <span
          key={item.kind}
          title={item.label}
          className={`flex h-9 w-9 items-center justify-center rounded-(--radius-control) transition-colors ${
            i === 0 ? 'text-vscode-text shadow-[inset_2px_0_0_var(--color-vscode-status)]' : ''
          }`}
          style={i === 0 ? { background: 'var(--color-vscode-selection)' } : undefined}
          aria-hidden="true"
        >
          <ActivityIcon kind={item.kind} />
        </span>
      ))}
    </div>
  );
}

// ---- Key–Value: the master–detail browser, history open -------------------
function KvView({ live }: { live: boolean }) {
  const beat = useBeats([300, 250, 250, 350, 400, 300, 300, 300], live);
  const keys = ['portfolio.value', 'portfolio.currency', 'portfolio.strategy', 'portfolio.risk'];
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
        <Line
          on={beat >= 5}
          className="mt-3 rounded-(--radius-card) border border-line bg-inset p-4"
        >
          <span className="font-mono text-[1.4rem] text-ink-hi tabular-nums">111080</span>
        </Line>
        <div className="mt-5">
          <PanelLabel>History</PanelLabel>
          <div className="mt-2 space-y-1">
            {history.map((h, i) => (
              <SelectableRow key={h.version} on={beat >= 6 + i} selected={i === 0 && beat >= 8}>
                <span className="flex items-baseline gap-3">
                  <span className={i === 0 ? 'text-vscode-text' : 'text-ink-low'}>
                    v{h.version}
                  </span>
                  <span className="tabular-nums">{Number(h.value).toLocaleString('en-US')}</span>
                </span>
                {/* ink-mid on the selected row - the ember wash eats ink-low's margin */}
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
  const rows = [
    { t: '14:02:11', action: 'portfolio.seed', detail: 'value, allocation, and policy stored' },
    { t: '09:31:47', action: 'allocation.rebalance', detail: 'stocks 60 -> 80, bonds 30 -> 15' },
    { t: '16:55:03', action: 'portfolio.valued', detail: 'portfolio.value 111080' },
  ];
  return (
    <div className="flex h-full flex-col p-5">
      <Line on={beat >= 1} className="flex items-center gap-3">
        <span className="font-mono text-mono-body text-ink-hi">portfolio</span>
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
              style={i === rows.length - 1 && beat >= 4 ? { background: VS_BLUE(12) } : undefined}
            >
              <span className="text-ink-low tabular-nums">{r.t}</span>
              <span className={r.action === 'portfolio.valued' ? 'text-ok' : 'text-ink-hi'}>
                {r.action}
              </span>
              <span className="text-ink-mid max-sm:hidden">{r.detail}</span>
            </div>
          </Line>
        ))}
      </div>
      <Line on={beat >= 5} className="mt-3 font-mono text-mono-sm text-ink-low">
        3 events · a typed stream is ready for replay
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
        style={{
          paddingLeft: `${depth * 1.25 + 0.5}rem`,
          background: hot ? VS_BLUE(16) : undefined,
        }}
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
            <span className={hot ? 'text-vscode-text' : 'text-ink-hi'}>{v}</span>
          </>
        )}
      </div>
    </Line>
  );
}

function JsonView({ live }: { live: boolean }) {
  const beat = useBeats([300, 250, 250, 400, 250, 250, 300, 250, 450], live);
  const docs = ['portfolio', 'allocation.policy', 'risk.snapshot'];
  return (
    <div className="flex h-full max-md:flex-col">
      <div className="w-56 shrink-0 border-r border-line p-3 max-md:w-full max-md:border-b max-md:border-r-0">
        <PanelLabel>Documents</PanelLabel>
        <div className="mt-2">
          {docs.map((d, i) => (
            <SelectableRow key={d} on={beat >= 1 + i} selected={d === 'portfolio' && beat >= 4}>
              <span>{d}</span>
            </SelectableRow>
          ))}
        </div>
      </div>
      <div className="min-w-0 flex-1 p-5">
        <Line on={beat >= 4} className="flex items-center gap-3">
          <span className="font-mono text-mono-body text-ink-hi">portfolio</span>
          <Chip tone="dim">5 fields</Chip>
        </Line>
        <div className="mt-3 rounded-(--radius-card) border border-line bg-inset py-2">
          <TreeRow on={beat >= 5} depth={0} caret k="portfolio" />
          <TreeRow on={beat >= 6} depth={1} k="strategy" v={'"aggressive"'} hot={beat >= 9} />
          <TreeRow on={beat >= 7} depth={1} k="stocks" v="80" hot={beat >= 9} />
          <TreeRow on={beat >= 8} depth={1} k="bonds" v="15" hot={beat >= 9} />
          <TreeRow on={beat >= 8} depth={1} k="cash" v="5" hot={beat >= 9} />
          <TreeRow on={beat >= 8} depth={1} k="rebalance" v={'"quarterly"'} />
        </div>
        <Line on={beat >= 9} className="mt-3 font-mono text-mono-sm text-ink-low">
          allocation fields updated - rebalance stayed put
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
  { id: 'd1', score: 0.91, text: 'portfolio.value moved after allocation shifted toward stocks.' },
  {
    id: 'd2',
    score: 0.84,
    text: 'the risk policy kept rebalancing quarterly while exposure changed.',
  },
];

function VectorView({ live }: { live: boolean }) {
  const beat = useBeats([350, 500, 450, 450, 350], live);
  return (
    <div className="flex h-full flex-col p-5">
      <Line on={beat >= 1} className="flex items-center gap-3">
        <span className="font-mono text-mono-body text-ink-hi">notes</span>
        <Chip tone="dim">384 dims · HNSW</Chip>
      </Line>
      <Line on={beat >= 2} className="mt-3">
        <div className="flex items-center gap-2.5 rounded-(--radius-control) border border-line bg-panel px-3 py-2.5">
          <svg
            className="h-4 w-4 shrink-0 text-ink-low"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" strokeLinecap="round" />
          </svg>
          <span className="font-mono text-mono-sm text-ink-hi">why did portfolio.value move?</span>
          <span
            className="ml-auto rounded px-2 py-0.5 font-mono text-mono-sm"
            style={{ background: VS_BLUE(18), color: 'var(--color-vscode-text)' }}
          >
            k = 2
          </span>
        </div>
      </Line>
      <div className="mt-3 space-y-2">
        {HITS.map((hit, i) => (
          <Line key={hit.id} on={beat >= 3 + i}>
            <div className="rounded-(--radius-card) border border-line bg-panel p-3.5">
              <div className="flex items-baseline gap-4">
                <span className="font-mono text-mono-sm text-vscode-text">{hit.id}</span>
                <span className="font-mono text-mono-sm text-ink-hi tabular-nums">
                  <CountUp to={hit.score} on={beat >= 3 + i} live={live} />
                </span>
                <span
                  className="relative h-1.5 w-40 self-center overflow-hidden rounded-full bg-raised"
                  aria-hidden="true"
                >
                  <motion.span
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${VS_BLUE(42)}, var(--color-vscode-status))`,
                    }}
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
        embedded on write - vector query was ready before you asked
      </Line>
    </div>
  );
}

// ---- Graph: the canvas -------------------------------------------------------
const NODES = [
  { id: 'portfolio', x: 80, y: 78 },
  { id: 'policy', x: 262, y: 62 },
  { id: 'note', x: 192, y: 158 },
];
const EDGES = [
  { from: NODES[0], rel: 'uses', to: NODES[1] },
  { from: NODES[2], rel: 'explains', to: NODES[0] },
];

function GraphView({ live }: { live: boolean }) {
  const beat = useBeats([350, 450, 450, 500, 650, 400], live);
  return (
    <div className="flex h-full flex-col p-5">
      <Line on={beat >= 1} className="flex flex-wrap items-center gap-3">
        <span className="font-mono text-mono-body text-ink-hi">graph</span>
        <Chip tone="dim">3 nodes · 2 edges</Chip>
        <span className="ml-auto flex items-center gap-2 font-mono text-mono-sm text-ink-low">
          bfs from <Chip>portfolio</Chip> depth <Chip tone="dim">1</Chip>
        </span>
      </Line>
      <div
        className="mt-3 flex flex-1 items-center justify-center rounded-(--radius-card) border border-line"
        style={{
          backgroundColor: 'var(--color-inset)',
          backgroundImage: `radial-gradient(circle at 1px 1px, ${INK(0.05)} 1px, transparent 1.6px)`,
          backgroundSize: '22px 22px',
        }}
      >
        <svg
          viewBox="0 0 340 200"
          className="h-[13rem] w-full max-w-[26rem]"
          fill="none"
          aria-hidden="true"
        >
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
                stroke="var(--color-vscode-status)"
                strokeWidth="2"
                initial={false}
                animate={{ pathLength: beat >= 4 ? 1 : 0, opacity: beat >= 4 ? 0.9 : 0 }}
                transition={{ duration: 0.55, ease: EASE }}
              />
              {live && beat >= 4 && (
                <motion.circle
                  r="4"
                  fill="var(--color-vscode-status)"
                  style={{ filter: `drop-shadow(0 0 6px ${VS_BLUE(90)})` }}
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
            const lit = beat >= 4 || (n.id === 'portfolio' && beat >= 3);
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
                  fill={lit ? 'var(--color-vscode-selection)' : 'var(--color-vscode-tab)'}
                  stroke={lit ? 'var(--color-vscode-status)' : 'var(--color-vscode-muted)'}
                  strokeWidth="1.5"
                  style={lit ? { filter: `drop-shadow(0 0 8px ${VS_BLUE(70)})` } : undefined}
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

// ---- the Strata file window ------------------------------------------------
// The window pins on desktop and continued scrolling walks the five views, one
// band each. The section head rides in the same pinned viewport; clicking a
// view only changes state, never the page's scroll position.
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
      { threshold: 0.25 },
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
    [scrollYProgress, reduced],
  );

  const selectIndex = useCallback((i: number) => {
    setTouched(true);
    setSelected(PRIMS[i].id);
  }, []);

  const selectPrimitive = useCallback(
    (primitive?: string | null) => {
      if (!primitive) return;
      const i = PRIMS.findIndex((p) => p.id === primitive);
      if (i >= 0) selectIndex(i);
    },
    [selectIndex],
  );

  useEffect(() => {
    const syncFromHash = () => selectPrimitive(primitiveFromHash(window.location.hash));
    const onPrimitiveRequest = (event: Event) => {
      selectPrimitive((event as CustomEvent<{ primitive?: string }>).detail?.primitive);
    };

    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    window.addEventListener('popstate', syncFromHash);
    window.addEventListener('strata:primitive-request', onPrimitiveRequest);
    return () => {
      window.removeEventListener('hashchange', syncFromHash);
      window.removeEventListener('popstate', syncFromHash);
      window.removeEventListener('strata:primitive-request', onPrimitiveRequest);
    };
  }, [selectPrimitive]);

  const live = seen && !reduced;
  const ActiveView = VIEWS[selected];
  const activeIdx = PRIMS.findIndex((p) => p.id === selected);
  const active = PRIMS[activeIdx];

  const onKeys = (e: KeyboardEvent) => {
    const delta =
      e.key === 'ArrowDown' || e.key === 'ArrowRight'
        ? 1
        : e.key === 'ArrowUp' || e.key === 'ArrowLeft'
          ? -1
          : 0;
    let next = activeIdx;
    if (delta) next = (activeIdx + delta + PRIMS.length) % PRIMS.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = PRIMS.length - 1;
    else return;
    e.preventDefault();
    selectIndex(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div ref={pinRef} className={reduced ? '' : 'lg:h-[190vh]'}>
      <div
        ref={rootRef}
        className={`relative ${
          reduced
            ? ''
            : 'lg:sticky lg:top-[calc(4rem+1.625rem)] lg:flex lg:h-[calc(100svh-5.625rem)] lg:items-center'
        }`}
      >
        <div className="grid w-full gap-10 lg:grid-cols-[minmax(19rem,0.35fr)_minmax(0,1fr)] lg:items-center xl:gap-14">
          <div className="max-w-[42rem] lg:max-w-none">
            <p
              data-feature-eyebrow="primitives"
              className="mb-4 font-mono text-eyebrow uppercase text-terracotta-400"
            >
              {HEAD.eyebrow}
            </p>
            <h2 className="text-display text-balance text-ink-hi lg:text-title">{HEAD.h2}</h2>
            <p className="mt-6 text-body-lg text-ink-mid">{HEAD.intro}</p>
          </div>

          <div className="relative min-w-0" onPointerDownCapture={() => setTouched(true)}>
            {/* stage lights: the page's one pair */}
            <div
              className="pointer-events-none absolute -inset-x-20 -inset-y-16"
              aria-hidden="true"
              style={{
                background: `radial-gradient(44% 58% at 60% 40%, ${VS_BLUE(18)}, transparent 70%), radial-gradient(30% 44% at 10% 80%, ${VS_BLUE(8)}, transparent 72%)`,
              }}
            />

            <div className="relative">
              {/* the window */}
              <div
                className="overflow-hidden rounded-(--radius-frame)"
                style={{
                  background: 'var(--color-vscode-editor)',
                  border: '1px solid var(--color-vscode-border)',
                  boxShadow: `var(--shadow-float), 0 0 110px -30px ${VS_BLUE(42)}`,
                }}
              >
                {/* titlebar */}
                <div
                  className="flex h-11 min-w-0 items-center gap-2 overflow-hidden px-3"
                  style={{
                    borderBottom: '1px solid var(--color-vscode-border)',
                    background: 'var(--color-vscode-titlebar)',
                  }}
                >
                  <span className="flex shrink-0 gap-1.5" aria-hidden="true">
                    <span className="h-2.5 w-2.5 rounded-full bg-ink-low/40" />
                    <span className="h-2.5 w-2.5 rounded-full bg-ink-low/40" />
                    <span className="h-2.5 w-2.5 rounded-full bg-ink-low/40" />
                  </span>
                  <span className="hidden shrink-0 font-mono text-mono-sm text-vscode-muted sm:inline">
                    StrataDB for VS Code
                  </span>
                  <span
                    className="mx-auto flex min-w-0 max-w-[29rem] flex-1 items-center gap-2 rounded-(--radius-control) border px-2.5 py-1 font-mono text-mono-sm"
                    style={{
                      background: 'var(--color-vscode-input)',
                      borderColor: 'var(--color-vscode-border)',
                      color: 'var(--color-vscode-text)',
                    }}
                  >
                    <ActivityIcon kind="find" />
                    <span className="truncate">Strata: open data view in portfolio.strata</span>
                  </span>
                  {/* the invitation - fades on first touch */}
                  <motion.span
                    className="rounded-full px-2.5 py-0.5 font-mono text-mono-sm max-[560px]:hidden"
                    style={{ background: VS_BLUE(22), color: 'var(--color-vscode-text)' }}
                    initial={false}
                    animate={
                      touched
                        ? { opacity: 0, visibility: 'hidden' }
                        : { opacity: [1, 0.55, 1, 0.55, 1], visibility: 'visible' }
                    }
                    transition={touched ? { duration: 0.3 } : { duration: 3.2, ease: 'easeInOut' }}
                    aria-hidden={touched}
                  >
                    click around
                  </motion.span>
                  <span className="ml-auto hidden items-center gap-2 font-mono text-mono-sm text-vscode-muted lg:flex">
                    <span className="h-1.5 w-1.5 rounded-full bg-ok" aria-hidden="true" />
                    ready
                  </span>
                </div>

                <div className="flex min-h-[32rem] max-md:flex-col lg:min-h-[28rem] xl:min-h-[32rem]">
                  <ActivityRail />

                  {/* the sidebar is the Strata explorer: five numbered data views,
                active one lit by ember - plus the app's other surfaces, dimmed */}
                  <div
                    role="tablist"
                    aria-label="Strata data views"
                    aria-orientation="vertical"
                    onKeyDown={onKeys}
                    className="flex w-60 shrink-0 flex-col gap-0.5 border-r p-2.5 max-md:w-full max-md:flex-row max-md:overflow-x-auto max-md:border-b max-md:border-r-0"
                    style={{
                      background: 'var(--color-vscode-sidebar)',
                      borderColor: 'var(--color-vscode-border)',
                    }}
                  >
                    <div className="mb-2 px-2 max-md:hidden">
                      <PanelLabel>Explorer</PanelLabel>
                      <div
                        className="mt-2 rounded-(--radius-control) border px-2.5 py-1.5 font-mono text-mono-sm"
                        style={{
                          background: 'var(--color-vscode-input)',
                          borderColor: 'var(--color-vscode-border)',
                          color: 'var(--color-vscode-text)',
                        }}
                      >
                        portfolio.strata
                      </div>
                    </div>
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
                          onClick={() => selectIndex(i)}
                          className={`flex shrink-0 items-center gap-2.5 rounded-(--radius-control) px-3 py-2 text-left text-small outline-none transition-colors duration-200 focus-visible:ring-1 focus-visible:ring-vscode-status ${
                            isActive ? 'text-vscode-text' : 'text-vscode-muted'
                          }`}
                          style={
                            isActive
                              ? {
                                  background: 'var(--color-vscode-selection)',
                                  boxShadow: 'inset 2px 0 0 var(--color-vscode-status)',
                                }
                              : undefined
                          }
                        >
                          <span
                            className={`font-mono text-mono-sm ${
                              isActive ? 'text-vscode-text' : 'text-vscode-muted'
                            }`}
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
                        <span key={label} className="px-3 py-1.5 text-small text-vscode-muted">
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* the content view */}
                  <div
                    className="flex min-w-0 flex-1 flex-col"
                    style={{ background: 'var(--color-vscode-editor)' }}
                  >
                    <div
                      className="flex h-10 shrink-0 items-center gap-1 border-b px-2"
                      style={{
                        background: 'var(--color-vscode-titlebar)',
                        borderColor: 'var(--color-vscode-border)',
                      }}
                    >
                      <span
                        className="flex h-full items-center border-x px-3 font-mono text-mono-sm"
                        style={{
                          background: 'var(--color-vscode-editor)',
                          borderColor: 'var(--color-vscode-border)',
                          color: 'var(--color-vscode-text)',
                        }}
                      >
                        portfolio.strata
                      </span>
                      <span className="hidden font-mono text-mono-sm text-vscode-muted sm:inline">
                        {active.label}
                      </span>
                    </div>
                    <div
                      id="prim-panel"
                      role="tabpanel"
                      aria-labelledby={`prim-tab-${selected}`}
                      className="min-h-0 flex-1"
                    >
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
                    <div className="flex h-7 shrink-0 items-center gap-3 bg-vscode-status px-3 font-mono text-[0.72rem] text-white/95 max-sm:hidden">
                      <span>Strata extension active</span>
                      <span>local engine</span>
                      <span>portfolio.strata</span>
                      <span className="ml-auto">{active.id} · local file</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* the ruled footer, drafting voice */}
              <div className="mt-5 flex items-baseline justify-between gap-4 border-t border-line pt-3">
                <p className="font-mono text-mono-sm text-ink-low">
                  <span className="text-vscode-status">0{activeIdx + 1}</span> / 05 · {active.id} -{' '}
                  <span className="max-sm:hidden">
                    {active.role.toLowerCase().replace(/\.$/, '')}
                  </span>
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
      </div>
    </div>
  );
}
