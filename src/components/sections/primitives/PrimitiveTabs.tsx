// Section 3 (04 §5 v2, 2026-06-12): tabs + content per the claude.com
// "How you can use Claude" pattern — but the tab rail is VERTICAL, stacked
// like the strata column itself, so the motif's load-bearing appearance
// survives the redesign: five layers, each wearing its hue, the active one
// lit. Every demo tells the seed world's story (one world, Doc 04).
// Beats play once per tab activation (no infinite animation); SSR renders
// the completed state; reduced motion shows final frames instantly.
import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { SEED } from '../../../data/seed';

const EASE = [0.16, 1, 0.3, 1] as const;

const PRIMS = [
  {
    id: 'kv',
    role: 'Versioned key-value. History included.',
    guide: '/docs/guides/kv-store',
    icon: 'M5 7h14M5 12h14M5 17h8',
  },
  {
    id: 'event',
    role: 'Append-only streams. Replay anything.',
    guide: '/docs/guides/event-log',
    icon: 'M4 12h16m-5-5l5 5-5 5',
  },
  {
    id: 'json',
    role: 'Documents with path-level writes.',
    guide: '/docs/guides/json-store',
    icon: 'M8 4c-2 0-2 2-2 4s0 4-2 4c2 0 2 2 2 4s0 4 2 4M16 4c2 0 2 2 2 4s0 4 2 4c-2 0-2 2-2 4s0 4-2 4',
  },
  {
    id: 'vector',
    role: 'Embeddings with HNSW search.',
    guide: '/docs/guides/vector-store',
    icon: 'M5 19L19 5m0 0h-7m7 0v7',
  },
  {
    id: 'graph',
    role: 'Nodes, edges, typed links. Traverse anything.',
    guide: '/docs/guides/search',
    icon: 'M6 7a2 2 0 100-4 2 2 0 000 4zm12 4a2 2 0 100-4 2 2 0 000 4zM9 19a2 2 0 100-4 2 2 0 000 4zM7.5 8.5L16 10m-6.5 7L16 11',
  },
] as const;

type PrimId = (typeof PRIMS)[number]['id'];

// ---- beats: a per-demo step clock ----------------------------------------
// live=false (SSR, reduced motion, out of view) pins the final frame; when
// live flips true the sequence replays from zero. Panels remount per tab
// selection, so every activation replays.
function useBeats(delays: number[], live: boolean) {
  const [beat, setBeat] = useState(live ? 0 : delays.length);
  useEffect(() => {
    if (!live) {
      setBeat(delays.length);
      return;
    }
    setBeat(0);
    const timers: number[] = [];
    let acc = 0;
    delays.forEach((d, i) => {
      acc += d;
      timers.push(window.setTimeout(() => setBeat(i + 1), acc));
    });
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [live]);
  return beat;
}

// One enter treatment for every demo line: flash in, settle.
function Line({ on, children, className = '' }: { on: boolean; children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial={false}
      animate={{ opacity: on ? 1 : 0, y: on ? 0 : 6 }}
      transition={{ duration: 0.32, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Prompt({ branch = 'main', cmd }: { branch?: string; cmd: string }) {
  return (
    <>
      <span className="text-ink-low">strata:{branch} </span>
      <span className="text-terracotta-500">›</span>
      <span className="text-ink-hi"> {cmd}</span>
    </>
  );
}

// Terminal chrome shared by all five demos; fixed body height so switching
// tabs never moves layout.
function Demo({ id, children }: { id: PrimId; children: ReactNode }) {
  return (
    <div
      className="overflow-hidden rounded-(--radius-frame) border border-line bg-panel"
      style={{ boxShadow: 'var(--shadow-float)' }}
    >
      <div className="flex h-11 items-center gap-2.5 border-b border-line px-5">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: `var(--color-strata-${id})` }} aria-hidden="true" />
        <span className="font-mono text-mono-body text-ink-hi">{id}</span>
        <span className="ml-auto font-mono text-mono-sm text-ink-low">strata · main</span>
      </div>
      <div className="min-h-[23rem] bg-inset p-6 font-mono text-mono-body leading-8">{children}</div>
    </div>
  );
}

// ---- kv: the history demo -------------------------------------------------
function KvDemo({ live }: { live: boolean }) {
  const beat = useBeats([400, 500, 700, 450, 450, 450], live);
  const history = SEED.kv['config.theme'].history!;
  return (
    <Demo id="kv">
      <Line on={beat >= 1}>
        <Prompt cmd='kv put config.theme "midnight"' />
      </Line>
      <Line on={beat >= 2} className="text-ok">
        v3
      </Line>
      <Line on={beat >= 3} className="mt-4">
        <Prompt cmd="kv history config.theme" />
      </Line>
      {history.map((h, i) => (
        <Line key={h.version} on={beat >= 4 + i} className="flex items-baseline gap-4">
          <span
            className="rounded px-1.5 font-mono text-mono-sm"
            style={
              i === history.length - 1
                ? { background: 'rgba(124, 170, 255, 0.16)', color: 'var(--color-strata-kv)' }
                : { color: 'var(--color-ink-low)' }
            }
          >
            v{h.version}
          </span>
          <span className={i === history.length - 1 ? 'text-ink-hi' : 'text-ink-mid'}>"{String(h.value)}"</span>
          <span className="ml-auto text-mono-sm text-ink-low max-sm:hidden">{h.at.slice(0, 16).replace('T', ' ')}</span>
        </Line>
      ))}
      <Line on={beat >= 6} className="mt-4 text-mono-sm text-ink-low">
        every write keeps its past — no extra table, no triggers
      </Line>
    </Demo>
  );
}

// ---- event: append + replay ------------------------------------------------
function EventDemo({ live }: { live: boolean }) {
  const beat = useBeats([400, 500, 700, 450, 450, 450], live);
  const rows = SEED.events.deploys.map((e) => ({
    t: e.at.slice(11, 19),
    action: String(e.payload.action),
    detail:
      e.payload.action === 'config.update'
        ? `${e.payload.key} → ${e.payload.to}`
        : e.payload.action === 'deploy.start'
          ? String(e.payload.version)
          : String(e.payload.reason),
  }));
  return (
    <Demo id="event">
      <Line on={beat >= 1}>
        <Prompt cmd='event append deploys { "action": "deploy.fail", … }' />
      </Line>
      <Line on={beat >= 2} className="text-ok">
        #3 · 09:33:12
      </Line>
      <Line on={beat >= 3} className="mt-4">
        <Prompt cmd="event list deploys" />
      </Line>
      {rows.map((r, i) => (
        <Line key={r.t} on={beat >= 4 + i} className="flex items-baseline gap-4">
          <span className="text-mono-sm text-ink-low">{r.t}</span>
          <span className={r.action === 'deploy.fail' ? 'text-err' : 'text-ink-hi'}>{r.action}</span>
          <span className="ml-auto text-mono-sm text-ink-mid max-sm:hidden">{r.detail}</span>
        </Line>
      ))}
      <Line on={beat >= 6} className="mt-4 text-mono-sm text-ink-low">
        nothing is overwritten — the stream is the record
      </Line>
    </Demo>
  );
}

// ---- json: the path-level write ---------------------------------------------
function JsonDemo({ live }: { live: boolean }) {
  const beat = useBeats([400, 600, 800, 500], live);
  const wrote = beat >= 3;
  return (
    <Demo id="json">
      <Line on={beat >= 1}>
        <Prompt cmd="json get profile" />
      </Line>
      <Line on={beat >= 2} className="whitespace-pre text-ink-mid">
        <div>{'{'}</div>
        <div>
          {'  '}
          <span className="text-strata-json">"user"</span>: {'{'}
        </div>
        <div>
          {'    '}
          <span className="text-strata-json">"name"</span>: <span className="text-ink-hi">"Alice"</span>,
        </div>
        <div className="relative">
          {wrote && (
            <motion.span
              className="absolute -inset-x-2 inset-y-0 rounded"
              style={{ background: 'rgba(255, 198, 110, 0.14)' }}
              initial={live ? { opacity: 0 } : false}
              animate={{ opacity: [0, 1, 0.6] }}
              transition={{ duration: 0.6, ease: EASE }}
              aria-hidden="true"
            />
          )}
          <span className="relative">
            {'    '}
            <span className="text-strata-json">"role"</span>:{' '}
            <span className="relative inline-grid">
              <motion.span
                className="col-start-1 row-start-1 text-ink-hi"
                initial={false}
                animate={{ opacity: wrote ? 0 : 1, y: wrote ? -10 : 0 }}
                transition={{ duration: 0.32, ease: EASE }}
              >
                "engineer",
              </motion.span>
              <motion.span
                className="col-start-1 row-start-1 text-strata-json"
                initial={false}
                animate={{ opacity: wrote ? 1 : 0, y: wrote ? 0 : 10 }}
                transition={{ duration: 0.32, ease: EASE }}
              >
                "admin",
              </motion.span>
            </span>
          </span>
        </div>
        <div>
          {'    '}
          <span className="text-strata-json">"prefs"</span>: {'{ '}
          <span className="text-strata-json">"theme"</span>: <span className="text-ink-hi">"midnight"</span>
          {' }'}
        </div>
        <div>{'  }'}</div>
        <div>{'}'}</div>
      </Line>
      <Line on={beat >= 3} className="mt-4">
        <Prompt cmd='json set profile $.user.role "admin"' />
      </Line>
      <Line on={beat >= 4} className="text-ok">
        OK
      </Line>
      <Line on={beat >= 4} className="mt-4 text-mono-sm text-ink-low">
        one path written — the rest of the document untouched
      </Line>
    </Demo>
  );
}

// ---- vector: the search demo -------------------------------------------------
const HITS = [
  { id: 'd1', score: 0.91, text: SEED.vectors.docs[0].text },
  { id: 'd2', score: 0.84, text: SEED.vectors.docs[1].text },
];

function VectorDemo({ live }: { live: boolean }) {
  const beat = useBeats([400, 700, 600, 600], live);
  return (
    <Demo id="vector">
      <Line on={beat >= 1}>
        <Prompt cmd='vector search docs "why did the deploy fail?" -k 2' />
      </Line>
      <Line on={beat >= 2} className="text-mono-sm text-ink-low">
        searching 384-dim HNSW index…
      </Line>
      {HITS.map((hit, i) => (
        <Line key={hit.id} on={beat >= 3 + i} className="mt-3">
          <div className="flex items-baseline gap-4">
            <span style={{ color: 'var(--color-strata-vector)' }}>{hit.id}</span>
            <span className="text-ink-hi">{hit.score.toFixed(2)}</span>
            <span className="relative h-2 w-36 self-center overflow-hidden rounded-full bg-raised" aria-hidden="true">
              <motion.span
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ background: 'var(--color-strata-vector)', opacity: 0.8 }}
                initial={false}
                animate={{ width: beat >= 3 + i ? `${hit.score * 100}%` : '0%' }}
                transition={{ duration: 0.6, ease: EASE }}
              />
            </span>
          </div>
          <div className="text-mono-sm leading-6 text-ink-mid">“{hit.text}”</div>
        </Line>
      ))}
      <Line on={beat >= 4} className="mt-4 text-mono-sm text-ink-low">
        embedded on write — search was ready before you asked
      </Line>
    </Demo>
  );
}

// ---- graph: draw the world, then walk it ---------------------------------------
const NODES = [
  { id: 'alice', x: 70, y: 64, type: 'user' },
  { id: 'bob', x: 268, y: 52, type: 'user' },
  { id: 'deploy-v2.3', x: 196, y: 156, type: 'deploy' },
];
const EDGES = [
  { from: NODES[0], rel: 'knows', to: NODES[1] },
  { from: NODES[0], rel: 'triggered', to: NODES[2] },
];

function GraphDemo({ live }: { live: boolean }) {
  const beat = useBeats([400, 500, 400, 500, 700, 500], live);
  // beats: 1 cmd · 2 nodes · 3 edges · 4 bfs cmd · 5 traversal lights · 6 result
  return (
    <Demo id="graph">
      <Line on={beat >= 1}>
        <Prompt cmd="graph bfs alice --depth 1" />
      </Line>
      <div className="mt-2 flex justify-center">
        <svg viewBox="0 0 340 200" className="h-[12.5rem] w-full max-w-[24rem]" fill="none" aria-hidden="true">
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
                animate={{ pathLength: beat >= 3 ? 1 : 0, opacity: beat >= 3 ? 1 : 0 }}
                transition={{ duration: 0.5, ease: EASE }}
              />
              <motion.line
                x1={e.from.x}
                y1={e.from.y}
                x2={e.to.x}
                y2={e.to.y}
                stroke="var(--color-strata-graph)"
                strokeWidth="2"
                initial={false}
                animate={{ pathLength: beat >= 5 ? 1 : 0, opacity: beat >= 5 ? 0.9 : 0 }}
                transition={{ duration: 0.55, ease: EASE }}
              />
              <motion.text
                x={(e.from.x + e.to.x) / 2}
                y={(e.from.y + e.to.y) / 2 - 8}
                textAnchor="middle"
                className="font-mono"
                fontSize="11"
                fill="var(--color-ink-low)"
                initial={false}
                animate={{ opacity: beat >= 3 ? 1 : 0 }}
                transition={{ duration: 0.32 }}
              >
                {e.rel}
              </motion.text>
            </g>
          ))}
          {NODES.map((n, i) => {
            const lit = beat >= 5 || (n.id === 'alice' && beat >= 4);
            return (
              <motion.g
                key={n.id}
                initial={false}
                animate={{ opacity: beat >= 2 ? 1 : 0, scale: beat >= 2 ? 1 : 0.6 }}
                transition={{ duration: 0.4, ease: EASE, delay: live ? i * 0.12 : 0 }}
                style={{ transformOrigin: `${n.x}px ${n.y}px` }}
              >
                <circle
                  cx={n.x}
                  cy={n.y}
                  r="7"
                  fill={lit ? 'var(--color-strata-graph)' : 'var(--color-raised)'}
                  stroke="var(--color-strata-graph)"
                  strokeWidth="1.5"
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
      <Line on={beat >= 6} className="text-ok">
        2 nodes reachable
      </Line>
      <Line on={beat >= 6} className="mt-2 text-mono-sm text-ink-low">
        typed edges, real traversal — not a join table in disguise
      </Line>
    </Demo>
  );
}

const DEMOS: Record<PrimId, ComponentType<{ live: boolean }>> = {
  kv: KvDemo,
  event: EventDemo,
  json: JsonDemo,
  vector: VectorDemo,
  graph: GraphDemo,
};

// ---- the section ----------------------------------------------------------------
export default function PrimitiveTabs() {
  const rootRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [selected, setSelected] = useState<PrimId>('kv');
  const [reduced, setReduced] = useState(false);
  const [seen, setSeen] = useState(false);

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

  const live = seen && !reduced;
  const ActiveDemo = DEMOS[selected];
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
    setSelected(PRIMS[next].id);
    tabRefs.current[next]?.focus();
  };

  return (
    <div ref={rootRef} className="grid gap-10 lg:grid-cols-12">
      {/* The rail IS the strata column: five layers, stacked, each wearing
          its hue on the left edge — the active layer lit. */}
      <div
        role="tablist"
        aria-label="Primitives"
        aria-orientation="vertical"
        onKeyDown={onKeys}
        className="flex gap-1 overflow-x-auto max-lg:-mx-6 max-lg:px-6 lg:col-span-4 lg:flex-col lg:gap-0 lg:overflow-visible"
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
              onClick={() => setSelected(p.id)}
              className={`shrink-0 border-l-2 px-5 py-4 text-left outline-none transition-colors duration-200 focus-visible:bg-raised max-lg:rounded-(--radius-card) max-lg:border-l-0 max-lg:border-b-2 max-lg:px-4 max-lg:py-3 lg:first:rounded-t-(--radius-card) lg:last:rounded-b-(--radius-card) ${
                isActive ? 'bg-raised' : 'bg-panel hover:bg-raised/70'
              }`}
              style={{ borderColor: `var(--color-strata-${p.id})` }}
            >
              <span className="flex items-center gap-3">
                <svg
                  className="h-5 w-5 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={`var(--color-strata-${p.id})`}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d={p.icon} />
                </svg>
                <span className={`font-mono text-mono-body ${isActive ? 'text-ink-hi' : 'text-ink-mid'}`}>{p.id}</span>
              </span>
              <span className={`mt-1 block text-small ${isActive ? 'text-ink-mid' : 'text-ink-low'} max-lg:hidden`}>
                {p.role}
              </span>
            </button>
          );
        })}
      </div>

      <div
        id="prim-panel"
        role="tabpanel"
        aria-labelledby={`prim-tab-${selected}`}
        className="lg:col-span-8"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={selected}
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: reduced ? 0 : 0.26, ease: EASE }}
          >
            <ActiveDemo live={live} />
            <div className="mt-4 flex items-baseline justify-between gap-4">
              <p className="text-small text-ink-mid max-lg:hidden">{active.role}</p>
              <a
                href={active.guide}
                className="text-small text-ink-mid underline decoration-line underline-offset-4 transition-colors duration-200 hover:text-ink-hi"
              >
                Read the {active.id} guide →
              </a>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
