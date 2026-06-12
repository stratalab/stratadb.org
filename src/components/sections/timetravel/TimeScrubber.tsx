// Section 4 (04 §5 v2, 2026-06-12): time travel as DIRECT MANIPULATION.
// Ani: "an interactive component that the user can scrub back and forth and
// see how the value changes — not another parallax scroll." The page's
// scroll-scrub count drops to one (branch); this is a Tier-1 user-driven
// control, alive under reduced motion (it only moves when the user moves).
//
// The artifact: a terminal card running `kv get portfolio.value --as-of <t>`
// (domain v2.1, Ani: "dark, dusk, midnight doesn't pop" — the finance
// thread continues from the branch story: the value dips on 06-10, then
// the merged aggressive strategy pays off on 06-11). A draggable playhead
// rides a ruled timeline of the seed world's three days; the command's
// timestamp and the answer update live. Scrub before the first write and
// the key honestly does not exist yet. SSR renders the playhead at "now"
// (completed state).
import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { SEED } from '../../../data/seed';

const EASE = [0.16, 1, 0.3, 1] as const;
const EMBER = (a: number) => `rgba(255, 122, 82, ${a})`;

const HISTORY = (SEED.kv['portfolio.value'].history ?? []).map((h) => ({
  version: h.version,
  value: Number(h.value),
  at: h.at,
  ts: Date.parse(h.at),
}));

const usd = (n: number) => `$${Math.abs(n).toLocaleString('en-US')}`;

// The visible span: the day before the first write → "now" (the seed
// world's present, 2026-06-12).
const T0 = Date.parse('2026-06-09T00:00:00Z');
const T1 = Date.parse('2026-06-12T00:00:00Z');
const pos = (ts: number) => (ts - T0) / (T1 - T0);

const fmt = (ts: number) => new Date(ts).toISOString().slice(0, 16).replace('T', ' ');
const fmtFull = (ts: number) => new Date(ts).toISOString().slice(0, 19).replace('T', ' ');

// Keyboard stops: span start · each write · now.
const STOPS = [0, ...HISTORY.map((h) => pos(h.ts)), 1];

export default function TimeScrubber() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [t, setT] = useState(1); // playhead, normalized; init = now
  const [dragging, setDragging] = useState(false);

  const ts = T0 + t * (T1 - T0);
  let idx = -1;
  for (let i = 0; i < HISTORY.length; i++) if (HISTORY[i].ts <= ts) idx = i;
  const cur = idx >= 0 ? HISTORY[idx] : null;

  const seek = (clientX: number) => {
    const r = trackRef.current?.getBoundingClientRect();
    if (!r) return;
    setT(Math.min(1, Math.max(0, (clientX - r.left) / r.width)));
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    seek(e.clientX);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragging) seek(e.clientX);
  };
  const endDrag = () => setDragging(false);

  // Arrow keys snap between the interesting moments; Home/End to the rails.
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const EPS = 1e-6;
    let next: number | null = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = STOPS.find((s) => s > t + EPS) ?? 1;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = [...STOPS].reverse().find((s) => s < t - EPS) ?? 0;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = 1;
    if (next === null) return;
    e.preventDefault();
    setT(next);
  };

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
        <span className="font-mono text-mono-body text-ink-hi">time travel</span>
        <span className="ml-auto font-mono text-mono-sm text-ink-low">strata · main</span>
      </div>

      <div
        className="p-6 font-mono text-mono-body leading-8 md:p-8 md:text-[1.0625rem] md:leading-9"
        style={{
          backgroundColor: 'var(--color-inset)',
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.04) 1px, transparent 1.6px), linear-gradient(180deg, ${EMBER(0.035)}, transparent 38%)`,
          backgroundSize: '22px 22px, 100% 100%',
        }}
      >
        {/* the read, live: the timestamp is the playhead */}
        <div className="[overflow-wrap:anywhere]">
          <span className="text-ink-low">strata:main </span>
          <span className="text-terracotta-500">›</span>
          <span className="text-ink-hi"> kv get portfolio.value --as-of </span>
          <span className="text-terracotta-300 tabular-nums">"{fmt(ts)}"</span>
        </div>

        {/* the answer — fixed height, swap-animated on version change */}
        <div className="relative mt-4 h-24 md:h-28">
          <AnimatePresence initial={false}>
            <motion.div
              key={cur?.version ?? 'void'}
              className="absolute inset-0 flex items-center gap-5"
              initial={{ y: 22, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -22, opacity: 0 }}
              transition={{ duration: 0.22, ease: EASE }}
            >
              {cur ? (
                <>
                  <span className="text-stat text-ink-hi tabular-nums">{usd(cur.value)}</span>
                  <span className="flex flex-col gap-1 pt-1">
                    <span className="flex items-baseline gap-2.5">
                      <span
                        className="rounded px-1.5 font-mono text-mono-sm"
                        style={{ background: EMBER(0.16), color: 'var(--color-terracotta-300)' }}
                      >
                        v{cur.version}
                      </span>
                      {idx > 0 && (
                        <span
                          className={`font-mono text-mono-sm tabular-nums ${
                            cur.value >= HISTORY[idx - 1].value ? 'text-ok' : 'text-err'
                          }`}
                        >
                          {cur.value >= HISTORY[idx - 1].value ? '▲' : '▼'}{' '}
                          {usd(cur.value - HISTORY[idx - 1].value)}
                        </span>
                      )}
                    </span>
                    <span className="font-mono text-mono-sm text-ink-low max-sm:hidden">written {fmtFull(cur.ts)}</span>
                  </span>
                </>
              ) : (
                <span className="text-ink-low">
                  ∅ nothing here yet — the first write lands {fmtFull(HISTORY[0].ts)}
                </span>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* the timeline: a ruled strip, three writes, one ember playhead */}
        <div
          ref={trackRef}
          role="slider"
          tabIndex={0}
          aria-label="Time travel playhead — read portfolio.value as of any moment"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(t * 100)}
          aria-valuetext={cur ? `${fmt(ts)} — v${cur.version}, ${usd(cur.value)}` : `${fmt(ts)} — before the first write`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onKeyDown={onKey}
          className={`relative mt-6 h-20 touch-none select-none rounded-(--radius-card) outline-none focus-visible:ring-1 focus-visible:ring-terracotta-500 ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        >
          {/* ruler ticks: fine every 3h, day lines every 24h */}
          <div
            className="absolute inset-x-0 top-3 h-8"
            style={{
              backgroundImage:
                'repeating-linear-gradient(90deg, var(--color-line) 0 1px, transparent 1px calc(100% / 24)), repeating-linear-gradient(90deg, var(--color-line-hover) 0 1px, transparent 1px calc(100% / 3))',
            }}
            aria-hidden="true"
          />
          {/* elapsed span */}
          <div
            className="absolute top-3 h-8"
            style={{ left: 0, width: `${t * 100}%`, background: EMBER(0.08) }}
            aria-hidden="true"
          />
          {/* day labels */}
          <div className="absolute inset-x-0 top-12 font-mono text-mono-sm text-ink-low" aria-hidden="true">
            {['06-09', '06-10', '06-11'].map((d, i) => (
              <span key={d} className="absolute -translate-x-1/2" style={{ left: `${(i / 3) * 100}%` }}>
                {d}
              </span>
            ))}
            <span className="absolute right-0">now</span>
          </div>
          {/* write markers */}
          {HISTORY.map((h) => {
            const passed = h.ts <= ts;
            return (
              <span
                key={h.version}
                className="absolute top-3 h-8 w-px"
                style={{ left: `${pos(h.ts) * 100}%`, background: passed ? 'var(--color-terracotta-500)' : 'var(--color-ink-low)' }}
                aria-hidden="true"
              >
                <span
                  className="absolute -top-0.5 left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-full rounded-full"
                  style={{
                    background: passed ? 'var(--color-terracotta-500)' : 'var(--color-raised)',
                    border: `1px solid ${passed ? 'var(--color-terracotta-400)' : 'var(--color-ink-low)'}`,
                    boxShadow: passed ? `0 0 8px ${EMBER(0.6)}` : 'none',
                  }}
                />
                <span
                  className={`absolute -top-7 left-1/2 -translate-x-1/2 font-mono text-mono-sm ${passed ? 'text-terracotta-400' : 'text-ink-low'}`}
                >
                  v{h.version}
                </span>
              </span>
            );
          })}
          {/* the playhead */}
          <div
            className="absolute top-1 h-12 w-px"
            style={{ left: `${t * 100}%`, background: 'var(--color-terracotta-400)', boxShadow: `0 0 10px ${EMBER(0.7)}` }}
            aria-hidden="true"
          >
            <motion.span
              className="absolute -top-1 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full border-2"
              style={{ background: 'var(--color-terracotta-500)', borderColor: 'var(--color-ink-hi)' }}
              animate={{ scale: dragging ? 1.25 : 1 }}
              transition={{ duration: 0.15, ease: EASE }}
            />
          </div>
        </div>

        {/* the ruled footer, drafting voice */}
        <div className="mt-5 flex items-baseline justify-between gap-4 border-t border-line pt-3 font-mono text-mono-sm text-ink-low">
          <span>
            <span className="text-terracotta-400">drag the playhead</span> — every read accepts --as-of
          </span>
          <span className="max-sm:hidden">3 versions · 0 overwrites</span>
        </div>
      </div>
    </div>
  );
}
