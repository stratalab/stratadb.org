// Scrub #2 of 2 (03 §3.2) — v2 (2026-06-12): the DATA is the protagonist.
// A real JSON document (from the seed world) lives on main; the fork peels an
// identical card off it; the value mutates on the branch; a true unified diff
// rises between the cards; the merge converges them — main absorbs the change.
// Full-stage: the cards own the viewport; commands ride a slim strip above.
import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useSpring, useTransform, type MotionValue } from 'motion/react';
import { SEED } from '../../../data/seed';

const SCRUB = { stiffness: 120, damping: 28, mass: 1.1 };
const BANDS = [0, 0.28, 0.55, 0.8];

const DOC = SEED.json.config as { theme: string; font_size: number; language: string };
const NEW_THEME = 'midnight';

const ACTS = [
  { verb: 'Fork', branch: 'main', cmd: 'branch create risky', line: 'A branch is a complete database. Nothing copied.' },
  { verb: 'Modify', branch: 'risky', cmd: 'json set config $.theme "midnight"', line: 'Writes land on the branch. main is untouched.' },
  { verb: 'Diff', branch: 'main', cmd: 'branch diff risky', line: 'The change, exactly — before you commit to it.' },
  { verb: 'Merge', branch: 'main', cmd: 'branch merge risky', line: 'Keep what works.' },
];

const clamp = { clamp: true };

// ---------- building blocks ----------

function ValueSwap({ from, to, swapped }: { from: string; to: string; swapped: MotionValue<number> | number }) {
  const n = typeof swapped === 'number';
  const oldOpacity = n ? 1 - (swapped as number) : useTransform(swapped as MotionValue<number>, (v) => 1 - v);
  const oldY = n ? -(swapped as number) * 10 : useTransform(swapped as MotionValue<number>, (v) => -v * 10);
  const newOpacity = swapped;
  const newY = n ? (1 - (swapped as number)) * 10 : useTransform(swapped as MotionValue<number>, (v) => (1 - v) * 10);
  return (
    <span className="relative inline-grid">
      <motion.span className="col-start-1 row-start-1" style={{ opacity: oldOpacity, y: oldY }}>
        {from}
      </motion.span>
      <motion.span className="col-start-1 row-start-1 text-terracotta-300" style={{ opacity: newOpacity, y: newY }}>
        {to}
      </motion.span>
    </span>
  );
}

function JsonCard({
  label,
  labelColor,
  swapped,
  highlight,
  chip,
}: {
  label: string;
  labelColor: string;
  swapped: MotionValue<number> | number;
  highlight?: MotionValue<number> | number;
  chip?: MotionValue<number> | number;
}) {
  return (
    <div
      className="w-[24rem] max-w-[92vw] overflow-hidden rounded-(--radius-frame) border border-line bg-panel"
      style={{ boxShadow: 'var(--shadow-float)' }}
    >
      <div className="flex h-10 items-center gap-2 border-b border-line px-4">
        <span className="h-2 w-2 rounded-full" style={{ background: labelColor }} aria-hidden="true" />
        <span className="font-mono text-mono-sm text-ink-mid">{label}</span>
        <span className="ml-auto font-mono text-mono-sm text-ink-low">json · config</span>
        {chip !== undefined && (
          <motion.span
            className="ml-2 rounded-full border border-line px-2 py-0.5 font-mono text-[11px] text-ok"
            style={{ opacity: chip }}
          >
            merged
          </motion.span>
        )}
      </div>
      <div className="bg-inset p-5 font-mono text-mono-body leading-7 text-ink-mid">
        <div>{'{'}</div>
        <div className="relative">
          {highlight !== undefined && (
            <motion.span
              className="absolute -inset-x-2 inset-y-0 rounded bg-terracotta-500/15"
              style={{ opacity: highlight }}
              aria-hidden="true"
            />
          )}
          <span className="relative">
            {'  '}
            <span className="text-strata-json">"theme"</span>:{' '}
            <ValueSwap from={`"${DOC.theme}",`} to={`"${NEW_THEME}",`} swapped={swapped} />
          </span>
        </div>
        <div>
          {'  '}
          <span className="text-strata-json">"font_size"</span>: <span className="text-ink-hi">{DOC.font_size}</span>,
        </div>
        <div>
          {'  '}
          <span className="text-strata-json">"language"</span>: <span className="text-ink-hi">"{DOC.language}"</span>
        </div>
        <div>{'}'}</div>
      </div>
    </div>
  );
}

function DiffCard({ visible }: { visible: MotionValue<number> | number }) {
  return (
    <motion.div
      className="w-[22rem] max-w-[88vw] overflow-hidden rounded-(--radius-frame) border border-line-hover bg-raised"
      style={{
        opacity: visible,
        scale: typeof visible === 'number' ? 0.94 + visible * 0.06 : useTransform(visible as MotionValue<number>, (v) => 0.94 + v * 0.06),
        boxShadow: 'var(--shadow-float)',
      }}
    >
      <div className="flex h-10 items-center gap-2 border-b border-line px-4">
        <span className="font-mono text-mono-sm text-ink-mid">branch diff risky</span>
        <span className="ml-auto font-mono text-mono-sm text-ok">1 key</span>
      </div>
      <div className="bg-inset p-5 font-mono text-mono-sm leading-7">
        <div className="text-err">- {'"theme": "dark",'}</div>
        <div className="text-ok">+ {'"theme": "midnight",'}</div>
        <div className="text-ink-low"> {'  "font_size": 14,'}</div>
        <div className="text-ink-low"> {'  "language": "en"'}</div>
      </div>
    </motion.div>
  );
}

// ---------- the stage ----------

function Stage({ p, staticScene }: { p?: MotionValue<number>; staticScene?: number }) {
  const mv = p!;
  const drive = (a: number, b: number, fallback: (s: number) => number) =>
    staticScene !== undefined ? fallback(staticScene) : useTransform(mv, [a, b], [0, 1], clamp);

  // act drivers
  const spread = drive(0.04, 0.2, (s) => (s < 3 ? 1 : 0)); // cards apart (acts 0–2), together (act 3)
  const riskySwap = drive(0.32, 0.42, (s) => (s >= 1 ? 1 : 0));
  const riskyFlash = drive(0.3, 0.36, (s) => (s === 1 ? 1 : 0));
  const diffIn =
    staticScene !== undefined
      ? staticScene === 2
        ? 1
        : 0
      : useTransform(mv, [0.57, 0.65, 0.76, 0.82], [0, 1, 1, 0], clamp);
  const converge = drive(0.82, 0.94, (s) => (s >= 3 ? 1 : 0));
  const riskyGone = drive(0.88, 0.97, (s) => (s >= 3 ? 1 : 0));
  const mainSwap = drive(0.84, 0.9, (s) => (s >= 3 ? 1 : 0));
  const mergedChip = drive(0.92, 1, (s) => (s >= 3 ? 1 : 0));

  // positions: cards spread from center, converge home
  const sep = (v: number, c: number) => v * (1 - c);
  const mainX =
    staticScene !== undefined
      ? `${-54 * sep(staticScene < 3 ? 1 : 0, staticScene >= 3 ? 1 : 0)}%`
      : useTransform([spread as MotionValue<number>, converge as MotionValue<number>], ([s, c]: number[]) => `${-54 * sep(s, c)}%`);
  const riskyX =
    staticScene !== undefined
      ? `${54 * sep(staticScene >= 0 && staticScene < 3 ? 1 : 0, staticScene >= 3 ? 1 : 0)}%`
      : useTransform([spread as MotionValue<number>, converge as MotionValue<number>], ([s, c]: number[]) => `${54 * sep(s, c)}%`);
  const riskyOpacity =
    staticScene !== undefined
      ? staticScene >= 3
        ? 0
        : staticScene >= 0
          ? 1
          : 0
      : useTransform([spread as MotionValue<number>, riskyGone as MotionValue<number>], ([s, g]: number[]) => Math.min(s * 3, 1) * (1 - g));

  return (
    <div className="relative flex h-[30rem] items-center justify-center">
      {/* risky card (peels off main) */}
      <motion.div className="absolute z-10" style={{ x: riskyX, opacity: riskyOpacity }}>
        <JsonCard label="risky" labelColor="var(--color-terracotta-500)" swapped={riskySwap} highlight={riskyFlash} />
      </motion.div>
      {/* main card */}
      <motion.div className="absolute z-10" style={{ x: mainX }}>
        <JsonCard label="main" labelColor="var(--color-ink-low)" swapped={mainSwap} chip={mergedChip} />
      </motion.div>
      {/* the diff, center stage above both */}
      <div className="absolute z-20">
        <DiffCard visible={diffIn} />
      </div>
    </div>
  );
}

function CommandStrip({ active }: { active: number }) {
  const act = ACTS[active];
  return (
    <div className="mx-auto mb-2 flex max-w-[44rem] flex-col items-center gap-1.5 text-center">
      <p className="font-mono text-mono-body">
        <span className="text-ink-low">strata:{act.branch} </span>
        <span className="text-terracotta-500">›</span>
        <span className="text-ink-hi"> {act.cmd}</span>
      </p>
      <p className="text-small text-ink-mid">
        <span className="font-medium text-ink-hi">{act.verb}</span> — {act.line}
      </p>
      <div className="mt-1 flex gap-2" aria-hidden="true">
        {ACTS.map((_, i) => (
          <span
            key={i}
            className={`h-1 w-6 rounded-full transition-colors duration-300 ${i <= active ? 'bg-terracotta-500' : 'bg-raised'}`}
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
      <div>
        <CommandStrip active={step} />
        <Stage staticScene={step} />
        <div className="mt-4 flex justify-center gap-3">
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
    );
  }

  return (
    <>
      {/* desktop: full-stage pin, ~2.4 viewport-heights of ownership */}
      <div ref={ref} className="relative hidden md:block" style={{ height: '340vh' }}>
        <div className="sticky top-0 flex h-screen flex-col justify-center">
          <CommandStrip active={active} />
          <Stage p={progress} />
        </div>
      </div>

      {/* mobile: swipeable acts, static end-states */}
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 md:hidden">
        {ACTS.map((act, i) => (
          <div key={act.verb} className="w-[92vw] shrink-0 snap-center">
            <p className="font-mono text-mono-sm text-terracotta-300">
              <span className="text-ink-low">strata:{act.branch} › </span>
              {act.cmd}
            </p>
            <p className="mb-4 mt-1 text-small text-ink-mid">
              <span className="font-medium text-ink-hi">{act.verb}</span> — {act.line}
            </p>
            <div className="flex flex-col items-center gap-4">
              {i === 2 ? (
                <DiffCard visible={1} />
              ) : i === 3 ? (
                <JsonCard label="main" labelColor="var(--color-ink-low)" swapped={1} chip={1} />
              ) : (
                <>
                  <JsonCard label="main" labelColor="var(--color-ink-low)" swapped={0} />
                  <JsonCard label="risky" labelColor="var(--color-terracotta-500)" swapped={i >= 1 ? 1 : 0} />
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
