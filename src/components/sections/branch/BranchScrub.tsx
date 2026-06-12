// Scrub #2 of 2 (03 §3.2) — v5 (2026-06-12): the head rides the pin.
// A portfolio document forks into two color-coded worlds (main = cool slate,
// risky = ember-warm); the aggressive allocation lands as four cascading
// writes; a true diff rises; the merge dissolves warm into cool. Commands
// accumulate in a session terminal on the left like a real CLI transcript;
// scroll-driven light fields color the stage, and the branch river flows
// behind it (03 §5 infinite animation #3, sanctioned 2026-06-12).
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { motion, useScroll, useSpring, useTransform, type MotionValue } from 'motion/react';
import { SEED } from '../../../data/seed';

const SCRUB = { stiffness: 120, damping: 28, mass: 1.1 };
const BANDS = [0, 0.28, 0.55, 0.8];
const clampOpt = { clamp: true };

const DOC = SEED.json.portfolio as Record<string, string | number>;
const show = (v: string | number) => (typeof v === 'string' ? `"${v}"` : String(v));

// The aggressive allocation: four writes on the risky branch.
const CHANGES: Record<string, string | number> = {
  strategy: 'aggressive',
  stocks: 80,
  bonds: 15,
  cash: 5,
};
const FIELDS = Object.keys(DOC);

const ACTS = [
  { verb: 'Fork', line: 'The whole database, forked instantly. Nothing copied.' },
  { verb: 'Modify', line: 'Four writes land on the branch. main is untouched.' },
  { verb: 'Diff', line: 'Every change, exactly — before real money moves.' },
  { verb: 'Merge', line: 'Keep the strategy that works.' },
];

// The section head lives inside the island (04 §3 v5) so it can ride the pin.
const HEAD = {
  eyebrow: 'BRANCH',
  h2: 'Try anything. Keep what works.',
  intro:
    "A branch is a complete database — fork it, change it, diff it, merge it back. Forking copies nothing, so it's instant at any size.",
};

// The accumulated session (left terminal). Lines flash in with their act,
// then dim into history.
const SESSION: { act: number; cmd?: string; out?: string; branch?: string }[] = [
  { act: 0, cmd: 'branch create risky', branch: 'main' },
  { act: 0, out: 'OK' },
  { act: 1, cmd: 'json set portfolio $.strategy "aggressive"', branch: 'risky' },
  { act: 1, cmd: 'json set portfolio $.stocks 80', branch: 'risky' },
  { act: 1, cmd: 'json set portfolio $.bonds 15', branch: 'risky' },
  { act: 1, cmd: 'json set portfolio $.cash 5', branch: 'risky' },
  { act: 2, cmd: 'branch diff risky', branch: 'main' },
  { act: 2, out: '4 keys changed' },
  { act: 3, cmd: 'branch merge risky', branch: 'main' },
  { act: 3, out: 'merged' },
];

type Driver = MotionValue<number> | number;
const inv = (d: Driver) => (typeof d === 'number' ? 1 - d : useTransform(d, (v) => 1 - v));

function ValueSwap({ from, to, swapped }: { from: string; to: string; swapped: Driver }) {
  const oldY = typeof swapped === 'number' ? -swapped * 10 : useTransform(swapped, (v) => -v * 10);
  const newY = typeof swapped === 'number' ? (1 - swapped) * 10 : useTransform(swapped, (v) => (1 - v) * 10);
  return (
    <span className="relative inline-grid">
      <motion.span className="col-start-1 row-start-1" style={{ opacity: inv(swapped), y: oldY }}>
        {from}
      </motion.span>
      <motion.span className="col-start-1 row-start-1 text-terracotta-300" style={{ opacity: swapped, y: newY }}>
        {to}
      </motion.span>
    </span>
  );
}

function JsonCard({
  kind,
  swaps,
  flash,
  chip,
}: {
  kind: 'main' | 'risky';
  swaps: Record<string, Driver>;
  flash?: Driver;
  chip?: Driver;
}) {
  const cool = kind === 'main';
  return (
    <div
      className="w-[28rem] max-w-[94vw] overflow-hidden rounded-(--radius-frame)"
      style={{
        background: cool ? 'var(--color-branch-main-surface)' : 'var(--color-branch-risky-surface)',
        border: `1px solid ${cool ? 'rgba(124, 170, 255, 0.28)' : 'rgba(255, 122, 82, 0.32)'}`,
        boxShadow: 'var(--shadow-float)',
      }}
    >
      <div
        className="flex h-11 items-center gap-2.5 px-5"
        style={{ borderBottom: `1px solid ${cool ? 'rgba(124, 170, 255, 0.18)' : 'rgba(255, 122, 82, 0.2)'}` }}
      >
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ background: cool ? 'var(--color-strata-kv)' : 'var(--color-terracotta-500)' }}
          aria-hidden="true"
        />
        <span className="font-mono text-mono-body text-ink-hi">{kind}</span>
        <span className="ml-auto font-mono text-mono-sm text-ink-low">json · portfolio</span>
        {chip !== undefined && (
          <motion.span
            className="ml-2 rounded-full border border-line px-2.5 py-0.5 font-mono text-mono-sm text-ok"
            style={{ opacity: chip }}
          >
            merged
          </motion.span>
        )}
      </div>
      <div
        className="p-6 font-mono text-[1.0625rem] leading-9 text-ink-mid"
        style={{ background: cool ? 'var(--color-branch-main-well)' : 'var(--color-branch-risky-well)' }}
      >
        <div>{'{'}</div>
        {FIELDS.map((key, i) => {
          const changed = key in swaps;
          const comma = i < FIELDS.length - 1 ? ',' : '';
          return (
            <div key={key} className="relative">
              {changed && flash !== undefined && (
                <motion.span
                  className="absolute -inset-x-2 inset-y-0 rounded bg-terracotta-500/15"
                  style={{ opacity: flash }}
                  aria-hidden="true"
                />
              )}
              <span className="relative">
                {'  '}
                <span className="text-strata-json">"{key}"</span>:{' '}
                {changed ? (
                  <ValueSwap from={show(DOC[key]) + comma} to={show(CHANGES[key]) + comma} swapped={swaps[key]} />
                ) : (
                  <span className="text-ink-hi">
                    {show(DOC[key])}
                    {comma}
                  </span>
                )}
              </span>
            </div>
          );
        })}
        <div>{'}'}</div>
      </div>
    </div>
  );
}

function DiffCard({ visible }: { visible: Driver }) {
  const scale = typeof visible === 'number' ? 0.94 + visible * 0.06 : useTransform(visible, (v) => 0.94 + v * 0.06);
  return (
    <motion.div
      className="w-[26rem] max-w-[90vw] overflow-hidden rounded-(--radius-frame) border border-line-hover bg-raised"
      style={{ opacity: visible, scale, boxShadow: 'var(--shadow-float)' }}
    >
      <div className="flex h-11 items-center gap-2.5 border-b border-line px-5">
        <span className="font-mono text-mono-body text-ink-mid">branch diff risky</span>
        <span className="ml-auto font-mono text-mono-sm text-ok">4 keys</span>
      </div>
      <div className="bg-inset p-6 font-mono text-mono-body leading-8">
        {FIELDS.map((key) =>
          key in CHANGES ? (
            <div key={key}>
              <div className="text-err">
                - "{key}": {show(DOC[key])},
              </div>
              <div className="text-ok">
                + "{key}": {show(CHANGES[key])},
              </div>
            </div>
          ) : (
            <div key={key} className="text-ink-low">
              {'  '}"{key}": {show(DOC[key])},
            </div>
          )
        )}
      </div>
    </motion.div>
  );
}

// The session terminal: lines flash in with their act, then dim into history.
function SessionPanel({ active, lineIn }: { active: number; lineIn?: Driver }) {
  return (
    <div
      className="overflow-hidden rounded-(--radius-frame) border border-line bg-panel"
      style={{ boxShadow: 'var(--shadow-float)' }}
    >
      <div className="flex h-10 items-center gap-2 border-b border-line px-4">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-ink-low/40" />
          <span className="h-2.5 w-2.5 rounded-full bg-ink-low/40" />
          <span className="h-2.5 w-2.5 rounded-full bg-ink-low/40" />
        </span>
        <span className="ml-2 font-mono text-mono-sm text-ink-low">strata — session</span>
      </div>
      <div className="min-h-[20rem] bg-inset p-4 font-mono text-mono-sm leading-7">
        {SESSION.map((entry, i) => {
          if (entry.act > active) return null;
          const current = entry.act === active;
          const style = current && lineIn !== undefined ? { opacity: lineIn } : undefined;
          return (
            <motion.div key={i} style={style} className={current ? '' : 'opacity-45'}>
              {entry.cmd ? (
                <>
                  <span className="text-ink-low">strata:{entry.branch} </span>
                  <span className="text-terracotta-500">›</span>
                  <span className="text-ink-hi"> {entry.cmd}</span>
                </>
              ) : (
                <span className="text-ok">{entry.out}</span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function Stage({ p, staticScene }: { p?: MotionValue<number>; staticScene?: number }) {
  const mv = p!;
  const drive = (a: number, b: number, fallback: (s: number) => number) =>
    staticScene !== undefined ? fallback(staticScene) : useTransform(mv, [a, b], [0, 1], clampOpt);

  const spread = drive(0.04, 0.2, (s) => (s < 3 ? 1 : 0));
  const swapStrategy = drive(0.3, 0.35, (s) => (s >= 1 ? 1 : 0));
  const swapStocks = drive(0.34, 0.39, (s) => (s >= 1 ? 1 : 0));
  const swapBonds = drive(0.38, 0.43, (s) => (s >= 1 ? 1 : 0));
  const swapCash = drive(0.42, 0.47, (s) => (s >= 1 ? 1 : 0));
  const flash = drive(0.29, 0.34, (s) => (s === 1 ? 1 : 0));
  const diffIn =
    staticScene !== undefined ? (staticScene === 2 ? 1 : 0) : useTransform(mv, [0.57, 0.65, 0.76, 0.82], [0, 1, 1, 0], clampOpt);
  const converge = drive(0.82, 0.94, (s) => (s >= 3 ? 1 : 0));
  const riskyGone = drive(0.88, 0.97, (s) => (s >= 3 ? 1 : 0));
  const mainSwapAll = drive(0.84, 0.9, (s) => (s >= 3 ? 1 : 0));
  const mergedChip = drive(0.92, 1, (s) => (s >= 3 ? 1 : 0));

  const riskySwaps = { strategy: swapStrategy, stocks: swapStocks, bonds: swapBonds, cash: swapCash };
  const mainSwaps = { strategy: mainSwapAll, stocks: mainSwapAll, bonds: mainSwapAll, cash: mainSwapAll };

  // scroll-driven stage light: ember blooms with the branch, dies with the merge
  const emberGlow =
    staticScene !== undefined
      ? staticScene >= 3
        ? 0.12
        : 0.55
      : useTransform([spread as MotionValue<number>, riskyGone as MotionValue<number>], ([s, g]: number[]) => 0.12 + s * (1 - g) * 0.5);

  const sep = (s: number, c: number) => s * (1 - c);
  const mainX =
    staticScene !== undefined
      ? `${-50 * sep(staticScene < 3 ? 1 : 0, staticScene >= 3 ? 1 : 0)}%`
      : useTransform([spread as MotionValue<number>, converge as MotionValue<number>], ([s, c]: number[]) => `${-50 * sep(s, c)}%`);
  const riskyX =
    staticScene !== undefined
      ? `${62 * sep(staticScene < 3 ? 1 : 0, staticScene >= 3 ? 1 : 0)}%`
      : useTransform([spread as MotionValue<number>, converge as MotionValue<number>], ([s, c]: number[]) => `${62 * sep(s, c)}%`);
  const riskyOpacity =
    staticScene !== undefined
      ? staticScene >= 3
        ? 0
        : 1
      : useTransform([spread as MotionValue<number>, riskyGone as MotionValue<number>], ([s, g]: number[]) => Math.min(s * 3, 1) * (1 - g));

  return (
    <div className="relative flex h-full min-h-[30rem] items-center justify-center">
      {/* stage light: cool constant behind main's side; ember follows the branch's life */}
      <div
        className="pointer-events-none absolute -inset-x-16 inset-y-0"
        style={{ background: 'radial-gradient(58% 75% at 28% 50%, rgba(124, 170, 255, 0.13), transparent 65%)' }}
        aria-hidden="true"
      />
      <motion.div
        className="pointer-events-none absolute -inset-x-16 inset-y-0"
        style={{
          opacity: emberGlow,
          background: 'radial-gradient(58% 75% at 74% 50%, rgba(255, 122, 82, 0.28), transparent 65%)',
        }}
        aria-hidden="true"
      />
      <motion.div className="absolute z-10" style={{ x: riskyX, opacity: riskyOpacity }}>
        <JsonCard kind="risky" swaps={riskySwaps} flash={flash} />
      </motion.div>
      <motion.div className="absolute z-10" style={{ x: mainX }}>
        <JsonCard kind="main" swaps={mainSwaps} chip={mergedChip} />
      </motion.div>
      <div className="absolute z-20">
        <DiffCard visible={diffIn} />
      </div>
    </div>
  );
}

// Stacked head for in-flow layouts (mobile, reduced motion).
function FlowHead() {
  return (
    <div className="max-w-[42rem]">
      <p className="text-eyebrow font-medium uppercase text-ink-low">{HEAD.eyebrow}</p>
      <h2 className="mt-4 text-display text-balance text-ink-hi">{HEAD.h2}</h2>
      <p className="mt-6 text-body-lg text-ink-mid">{HEAD.intro}</p>
    </div>
  );
}

// The branch river (04 §3 v5; 03 §5 infinite animation #3): a 3-strand echo of
// the hero backdrop, slower. Routed to FRAME the scene, not hide behind it:
// the ember strand sweeps the bottom band and rises through the empty
// top-right corner toward risky's side; the cool strand holds the bottom
// (main's ground); a dim ember strand peels off and bends back down to meet
// it — fork and merge as ambient artwork. Desktop pin only; the
// reduced-motion variant never renders it.
const RIVER = [
  {
    d: 'M -40 820 C 300 815 560 800 800 730 C 1060 655 1300 480 1480 260',
    tone: 'ember',
    dur: '9s',
  },
  {
    d: 'M -40 860 C 360 856 760 848 1480 826',
    tone: 'cool',
    dur: '12s',
  },
  {
    d: 'M 800 730 C 960 690 1100 705 1230 770 C 1320 815 1400 838 1480 842',
    tone: 'dim',
    dur: '14s',
  },
];

function BranchRiver() {
  return (
    <>
      <svg
        className="branch-river pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 1440 900"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        {RIVER.map((p) => (
          <g key={p.tone}>
            <path d={p.d} className={`br-glow br-${p.tone}`} style={{ '--dur': p.dur } as CSSProperties} />
            <path d={p.d} className={`br-core br-${p.tone}`} style={{ '--dur': p.dur } as CSSProperties} />
          </g>
        ))}
      </svg>
      <style>{`
        .branch-river { opacity: 0.85; }
        .br-glow, .br-core { stroke-linecap: round; fill: none; }
        .br-glow { stroke-width: 7; opacity: 0.25; }
        .br-core {
          stroke-width: 1.75;
          stroke-dasharray: 90 160;
          animation: branch-river-flow var(--dur, 12s) linear infinite;
        }
        .br-core.br-ember { stroke: var(--color-terracotta-400); opacity: 0.85; }
        .br-glow.br-ember { stroke: var(--color-terracotta-600); }
        .br-core.br-cool { stroke: var(--color-strata-kv); opacity: 0.5; }
        .br-glow.br-cool { stroke: var(--color-strata-kv); opacity: 0.1; }
        .br-core.br-dim { stroke: var(--color-terracotta-600); opacity: 0.55; }
        .br-glow.br-dim { stroke: var(--color-terracotta-800); opacity: 0.14; }
        @keyframes branch-river-flow { to { stroke-dashoffset: -250; } }
      `}</style>
    </>
  );
}

function ActHeader({ active }: { active: number }) {
  const act = ACTS[active];
  return (
    <div>
      <p className="text-title font-semibold text-ink-hi">{act.verb}</p>
      <p className="mt-2 text-body-lg text-ink-mid">{act.line}</p>
      <div className="mt-4 flex gap-2.5" aria-hidden="true">
        {ACTS.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 w-9 rounded-full transition-colors duration-300 ${i <= active ? 'bg-terracotta-500' : 'bg-raised'}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function BranchScrub() {
  const ref = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);
  const [step, setStep] = useState(0);
  const [active, setActive] = useState(0);

  useEffect(() => {
    setReduced(document.documentElement.dataset.motion === 'reduced');
  }, []);

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const progress = useSpring(scrollYProgress, SCRUB);

  // current act's session lines flash in over the first 6% of its band
  const lineIn = useTransform(progress, (v) => {
    let i = 0;
    for (let k = 0; k < BANDS.length; k++) if (v >= BANDS[k]) i = k;
    return Math.min(1, Math.max(0, (v - BANDS[i]) / 0.06));
  });

  useEffect(
    () =>
      progress.on('change', (v) => {
        let i = 0;
        for (let k = 0; k < BANDS.length; k++) if (v >= BANDS[k]) i = k;
        setActive(i);
      }),
    [progress]
  );

  if (reduced) {
    return (
      <div className="mx-auto w-full max-w-[80rem] px-6 py-32 max-md:py-20">
        <div className="mb-12">
          <FlowHead />
        </div>
        <div className="mb-8 grid gap-8 md:grid-cols-12">
          <div className="md:col-span-4">
            <ActHeader active={step} />
            <div className="mt-6">
              <SessionPanel active={step} />
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className="rounded-(--radius-control) border border-line px-4 py-2 text-small text-ink-mid disabled:opacity-40"
              >
                ← Prev
              </button>
              <button
                type="button"
                onClick={() => setStep((s) => Math.min(3, s + 1))}
                disabled={step === 3}
                className="rounded-(--radius-control) border border-line px-4 py-2 text-small text-ink-mid disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          </div>
          <div className="md:col-span-8">
            <Stage staticScene={step} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div ref={ref} className="relative hidden md:block" style={{ height: '340vh' }}>
        {/* The pinned screen owns the whole composition: river behind, head on
            top (visible for the full scrub), session + stage filling the rest. */}
        <div className="sticky top-0 flex h-screen flex-col overflow-hidden">
          <BranchRiver />
          {/* pt clears the fixed nav so the eyebrow stays readable while pinned */}
          <div className="relative z-10 mx-auto w-full max-w-[96rem] px-12 pt-24">
            <p className="text-eyebrow font-medium uppercase text-ink-low">{HEAD.eyebrow}</p>
            {/* second h2 lives in the mobile branch — only one is ever displayed */}
            <h2 className="mt-4 text-display text-balance text-ink-hi">{HEAD.h2}</h2>
            <p className="mt-5 max-w-[44rem] text-body-lg text-ink-mid">{HEAD.intro}</p>
          </div>
          <div className="relative z-10 mx-auto grid w-full max-w-[96rem] flex-1 items-center gap-16 px-12 pb-8 lg:grid-cols-12">
            <div className="flex flex-col justify-center lg:col-span-4">
              <ActHeader active={active} />
              <div className="mt-10">
                <SessionPanel active={active} lineIn={lineIn} />
              </div>
            </div>
            <div className="h-full min-h-[30rem] lg:col-span-8">
              <Stage p={progress} />
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden">
        <div className="mx-auto w-full max-w-[70rem] px-6 pt-20 max-[480px]:px-4">
          <FlowHead />
        </div>
        <div className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-20">
        {ACTS.map((act, i) => (
          <div key={act.verb} className="w-[92vw] shrink-0 snap-center">
            <p className="text-heading font-semibold text-ink-hi">{act.verb}</p>
            <p className="mb-4 mt-1 text-small text-ink-mid">{act.line}</p>
            <div className="mb-4">
              <SessionPanel active={i} />
            </div>
            <div className="flex flex-col items-center gap-4">
              {i === 2 ? (
                <DiffCard visible={1} />
              ) : i === 3 ? (
                <JsonCard kind="main" swaps={{ strategy: 1, stocks: 1, bonds: 1, cash: 1 }} chip={1} />
              ) : (
                <>
                  <JsonCard kind="main" swaps={{}} />
                  <JsonCard
                    kind="risky"
                    swaps={{ strategy: i >= 1 ? 1 : 0, stocks: i >= 1 ? 1 : 0, bonds: i >= 1 ? 1 : 0, cash: i >= 1 ? 1 : 0 }}
                  />
                </>
              )}
            </div>
          </div>
        ))}
        </div>
      </div>
    </>
  );
}
