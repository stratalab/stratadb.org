// Section 3 (04 §4 v4, 2026-06-12): the lit stage, one temperature. Tabs +
// content per the claude.com pattern; the tab rail is VERTICAL, stacked
// like the strata column itself, so the motif's load-bearing appearance
// survives. v3 added the craft pass (stage lighting, card material, typed
// commands per 03 §2, count-up scores, traveling traversal); v4 resolves
// Ani's original five-hue reservation — "the 5 primitives with 5 colors is
// a bit jarring" — by restyling to the page's law: ember is the only
// temperature, cool slate the one counterpoint. The hue tokens live on in
// tokens.css for the specimen and future data-viz; this section is
// monochrome + ember. All animation is triggered per activation — no new
// infinite loops (03 §5 cap stays at 3); SSR renders the completed state;
// reduced motion shows final frames instantly.
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

// The page's two lights as alpha ramps (rgb triplets — tokens.css owns the
// hex; CI enforces it): ember is the only temperature, cool slate the one
// counterpoint (same pair as the hero backdrop and the branch stage).
const EMBER = (a: number) => `rgba(255, 122, 82, ${a})`;
const COOL = (a: number) => `rgba(124, 170, 255, ${a})`;

// Typing time for a command (03 §2: 24–40ms jittered) + a settle beat.
const T = (cmd: string) => Math.round(cmd.length * 30) + 500;

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

// ---- typed commands (03 §2: commands are typed, output is printed) --------
function useTyped(text: string, live: boolean, start: boolean) {
  const [n, setN] = useState(() => (live ? 0 : text.length));
  useEffect(() => {
    if (!live) {
      setN(text.length);
      return;
    }
    if (!start) {
      setN(0);
      return;
    }
    setN(0);
    let i = 0;
    let t: number;
    const tick = () => {
      i += 1;
      setN(i);
      if (i < text.length) t = window.setTimeout(tick, 24 + Math.random() * 16);
    };
    t = window.setTimeout(tick, 120);
    return () => window.clearTimeout(t);
  }, [live, start]);
  return n;
}

function Cmd({ branch = 'main', cmd, on, live }: { branch?: string; cmd: string; on: boolean; live: boolean }) {
  const n = useTyped(cmd, live, on);
  const typing = live && on && n < cmd.length;
  return (
    // invisible (not display:none) — the line reserves its height, so
    // nothing below shifts when it lands; hidden lines stay out of the
    // a11y tree.
    <div className={on ? '' : 'invisible'}>
      <span className="text-ink-low">strata:{branch} </span>
      <span className="text-terracotta-500">›</span>
      <span className="text-ink-hi"> {cmd.slice(0, n)}</span>
      {typing && (
        <span className="ml-px inline-block h-[1.05em] w-[0.55ch] translate-y-[3px] bg-ink-hi/80" aria-hidden="true" />
      )}
    </div>
  );
}

// One enter treatment for every OUTPUT line: flash in, settle.
function Line({ on, children, className = '' }: { on: boolean; children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial={false}
      animate={{ opacity: on ? 1 : 0, y: on ? 0 : 6, visibility: on ? 'visible' : 'hidden' }}
      transition={{ duration: 0.32, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Terminal chrome shared by all five demos: neutral panel material with the
// page's one temperature — ember dot, ember header wash, ember bloom behind
// the card. Fixed body height so switching tabs never moves layout.
function Demo({ id, children }: { id: PrimId; children: ReactNode }) {
  return (
    <div
      className="overflow-hidden rounded-(--radius-frame)"
      style={{
        background: 'var(--color-panel)',
        border: `1px solid ${EMBER(0.22)}`,
        boxShadow: `var(--shadow-float), 0 0 110px -28px ${EMBER(0.35)}`,
      }}
    >
      <div
        className="flex h-12 items-center gap-2.5 px-5"
        style={{ borderBottom: `1px solid ${EMBER(0.14)}`, background: EMBER(0.04) }}
      >
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ background: 'var(--color-terracotta-500)', boxShadow: `0 0 10px ${EMBER(0.8)}` }}
          aria-hidden="true"
        />
        <span className="font-mono text-mono-body text-ink-hi">{id}</span>
        <span className="ml-auto font-mono text-mono-sm text-ink-low">strata · main</span>
      </div>
      {/* min-h = the tallest demo (json), measured — tab switches never move
          the page below */}
      <div
        className="min-h-[27rem] p-6 font-mono text-mono-body leading-8 md:min-h-[30rem] md:p-8 md:text-[1.0625rem] md:leading-9"
        style={{
          background: `linear-gradient(180deg, ${EMBER(0.035)}, transparent 38%), var(--color-inset)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ---- kv: the history demo -------------------------------------------------
const KV_C1 = 'kv put config.theme "midnight"';
const KV_C2 = 'kv history config.theme';

function KvDemo({ live }: { live: boolean }) {
  const beat = useBeats([350, T(KV_C1), 650, T(KV_C2), 380, 380], live);
  const history = SEED.kv['config.theme'].history!;
  return (
    <Demo id="kv">
      <Cmd cmd={KV_C1} on={beat >= 1} live={live} />
      <Line on={beat >= 2} className="text-ok">
        v3
      </Line>
      <div className="mt-4">
        <Cmd cmd={KV_C2} on={beat >= 3} live={live} />
      </div>
      {history.map((h, i) => {
        const latest = i === history.length - 1;
        return (
          <Line key={h.version} on={beat >= 4 + i} className="flex items-baseline gap-4">
            <motion.span
              className="rounded px-1.5 font-mono text-mono-sm"
              style={
                latest
                  ? { background: EMBER(0.16), color: 'var(--color-terracotta-300)' }
                  : { color: 'var(--color-ink-low)' }
              }
              initial={false}
              animate={latest && beat >= 6 ? { scale: [1, 1.12, 1] } : {}}
              transition={{ duration: 0.45, ease: EASE }}
            >
              v{h.version}
            </motion.span>
            <span className={latest ? 'text-ink-hi' : 'text-ink-mid'}>"{String(h.value)}"</span>
            <span className="ml-auto text-mono-sm text-ink-low max-sm:hidden">{h.at.slice(0, 16).replace('T', ' ')}</span>
          </Line>
        );
      })}
      <Line on={beat >= 6} className="mt-4 text-mono-sm text-ink-low">
        every write keeps its past — no extra table, no triggers
      </Line>
    </Demo>
  );
}

// ---- event: append + replay ------------------------------------------------
const EV_C1 = 'event append deploys { "action": "deploy.fail", … }';
const EV_C2 = 'event list deploys';

function EventDemo({ live }: { live: boolean }) {
  const beat = useBeats([350, T(EV_C1), 650, T(EV_C2), 380, 380], live);
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
      <Cmd cmd={EV_C1} on={beat >= 1} live={live} />
      <Line on={beat >= 2} className="text-ok">
        #3 · 09:33:12
      </Line>
      <div className="mt-4">
        <Cmd cmd={EV_C2} on={beat >= 3} live={live} />
      </div>
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
const JS_C1 = 'json get profile';
const JS_C2 = 'json set profile $.user.role "admin"';

function JsonDemo({ live }: { live: boolean }) {
  const beat = useBeats([350, T(JS_C1), 800, T(JS_C2), 450], live);
  const wrote = beat >= 4;
  return (
    <Demo id="json">
      <Cmd cmd={JS_C1} on={beat >= 1} live={live} />
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
              className="absolute -inset-x-2 inset-y-0 rounded bg-terracotta-500/15"
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
      <div className="mt-4">
        <Cmd cmd={JS_C2} on={beat >= 3} live={live} />
      </div>
      <Line on={beat >= 5} className="text-ok">
        OK
      </Line>
      <Line on={beat >= 5} className="mt-4 text-mono-sm text-ink-low">
        one path written — the rest of the document untouched
      </Line>
    </Demo>
  );
}

// ---- vector: the search demo -------------------------------------------------
const VEC_C = 'vector search docs "why did the deploy fail?" -k 2';
const HITS = [
  { id: 'd1', score: 0.91, text: SEED.vectors.docs[0].text },
  { id: 'd2', score: 0.84, text: SEED.vectors.docs[1].text },
];

// Scores count up while their bars fill — numbers that move read as
// computation, not decoration.
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

function VectorDemo({ live }: { live: boolean }) {
  const beat = useBeats([350, T(VEC_C), 750, 650, 550], live);
  return (
    <Demo id="vector">
      <Cmd cmd={VEC_C} on={beat >= 1} live={live} />
      <Line on={beat >= 2} className="text-mono-sm text-ink-low">
        searching 384-dim HNSW index…
      </Line>
      {HITS.map((hit, i) => (
        <Line key={hit.id} on={beat >= 3 + i} className="mt-3">
          <div className="flex items-baseline gap-4">
            <span className="text-terracotta-400">{hit.id}</span>
            <span className="text-ink-hi tabular-nums">
              <CountUp to={hit.score} on={beat >= 3 + i} live={live} />
            </span>
            <span className="relative h-2 w-36 self-center overflow-hidden rounded-full bg-raised md:w-56" aria-hidden="true">
              <motion.span
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${EMBER(0.45)}, var(--color-terracotta-400))`,
                  boxShadow: `0 0 12px ${EMBER(0.5)}`,
                }}
                initial={false}
                animate={{ width: beat >= 3 + i ? `${hit.score * 100}%` : '0%' }}
                transition={{ duration: 0.6, ease: EASE }}
              />
            </span>
          </div>
          <div className="text-mono-sm leading-6 text-ink-mid">“{hit.text}”</div>
        </Line>
      ))}
      <Line on={beat >= 5} className="mt-4 text-mono-sm text-ink-low">
        embedded on write — search was ready before you asked
      </Line>
    </Demo>
  );
}

// ---- graph: draw the world, then walk it ---------------------------------------
const GR_C = 'graph bfs alice --depth 1';
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
  const beat = useBeats([350, T(GR_C), 550, 420, 650, 600], live);
  // beats: 1 cmd types · 2 nodes pop · 3 edges draw · 4 alice lights ·
  // 5 traversal travels · 6 result
  return (
    <Demo id="graph">
      <Cmd cmd={GR_C} on={beat >= 1} live={live} />
      <div className="mt-2 flex justify-center">
        <svg
          viewBox="0 0 340 200"
          className="h-[12.5rem] w-full max-w-[24rem] md:h-[15rem] md:max-w-[28rem]"
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
                animate={{ pathLength: beat >= 3 ? 1 : 0, opacity: beat >= 3 ? 1 : 0 }}
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
                animate={{ pathLength: beat >= 5 ? 1 : 0, opacity: beat >= 5 ? 0.9 : 0 }}
                transition={{ duration: 0.55, ease: EASE }}
              />
              {/* the traversal itself: a pulse travels the edge */}
              {live && beat >= 5 && (
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
    <div ref={rootRef} className="relative">
      {/* The stage lights: the page's one pair — ember over the demo, cool
          counterpoint low on the rail side (the same lighting language as
          the hero backdrop and the branch stage). Static fields. */}
      <div
        className="pointer-events-none absolute -inset-x-20 -inset-y-16"
        aria-hidden="true"
        style={{
          background: `radial-gradient(44% 58% at 66% 40%, ${EMBER(0.11)}, transparent 70%), radial-gradient(30% 44% at 12% 78%, ${COOL(0.07)}, transparent 72%)`,
        }}
      />

      <div className="relative grid gap-10 lg:grid-cols-12">
        {/* The rail IS the strata column: five layers under one frame,
            hairline-divided like a core sample — monochrome, the active
            layer lit by the page's ember (Ani's five-hue reservation,
            resolved 2026-06-12: hue-coding read as jarring). */}
        <div
          role="tablist"
          aria-label="Primitives"
          aria-orientation="vertical"
          onKeyDown={onKeys}
          className="flex gap-1 overflow-x-auto max-lg:-mx-6 max-lg:px-6 lg:col-span-4 lg:flex-col lg:gap-0 lg:divide-y lg:divide-line lg:self-start lg:overflow-visible lg:rounded-(--radius-frame) lg:border lg:border-line lg:shadow-[var(--shadow-float)]"
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
                className={`shrink-0 border-l-2 px-6 py-5 text-left outline-none transition-colors duration-200 focus-visible:bg-raised max-lg:rounded-(--radius-card) max-lg:border-b-2 max-lg:border-l-0 max-lg:px-4 max-lg:py-3 ${
                  isActive ? '' : 'bg-panel hover:bg-raised/70'
                }`}
                style={{
                  borderColor: isActive ? 'var(--color-terracotta-500)' : 'var(--color-line)',
                  background: isActive
                    ? `linear-gradient(90deg, ${EMBER(0.12)}, ${EMBER(0.025)} 55%, transparent), var(--color-raised)`
                    : undefined,
                }}
              >
                <span className="flex items-center gap-3">
                  <svg
                    className="h-5 w-5 shrink-0 lg:h-6 lg:w-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={isActive ? 'var(--color-terracotta-400)' : 'var(--color-ink-low)'}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d={p.icon} />
                  </svg>
                  <span
                    className={`font-mono text-mono-body lg:text-[1.0625rem] ${isActive ? 'text-ink-hi' : 'text-ink-mid'}`}
                  >
                    {p.id}
                  </span>
                </span>
                <span className={`mt-1.5 block text-body ${isActive ? 'text-ink-mid' : 'text-ink-low'} max-lg:hidden`}>
                  {p.role}
                </span>
              </button>
            );
          })}
        </div>

        <div id="prim-panel" role="tabpanel" aria-labelledby={`prim-tab-${selected}`} className="lg:col-span-8">
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
    </div>
  );
}
