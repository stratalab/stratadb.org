// Scrub #2 of 2 (03 §3.2) — v3 (2026-06-12): the DATA is the protagonist.
// A real settings document forks into two color-coded worlds (main = cool
// slate, risky = ember-warm); THREE writes cascade on the branch; a true
// unified diff rises between them; the merge dissolves warm into cool.
import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useSpring, useTransform, type MotionValue } from 'motion/react';
import { SEED } from '../../../data/seed';

const SCRUB = { stiffness: 120, damping: 28, mass: 1.1 };
const BANDS = [0, 0.28, 0.55, 0.8];
const clampOpt = { clamp: true };

const DOC = SEED.json.config as Record<string, string | number | boolean>;
const show = (v: string | number | boolean) => (typeof v === 'string' ? `"${v}"` : String(v));

// The three writes that land on the branch (lead change = the page narrative).
const CHANGES: Record<string, string | number | boolean> = {
  theme: 'midnight',
  font_size: 16,
  autosave: true,
};
const FIELDS = Object.keys(DOC);

const ACTS = [
  { verb: 'Fork', branch: 'main', cmds: ['branch create risky'], line: 'A branch is a complete database. Nothing copied.' },
  {
    verb: 'Modify',
    branch: 'risky',
    cmds: ['json set config $.theme "midnight"', 'json set config $.font_size 16', 'json set config $.autosave true'],
    line: 'Three writes land on the branch. main is untouched.',
  },
  { verb: 'Diff', branch: 'main', cmds: ['branch diff risky'], line: 'Every change, exactly — before you commit to it.' },
  { verb: 'Merge', branch: 'main', cmds: ['branch merge risky'], line: 'Keep what works.' },
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
      className="w-[34rem] max-w-[94vw] overflow-hidden rounded-(--radius-frame)"
      style={{
        background: cool ? 'var(--color-branch-main-surface)' : 'var(--color-branch-risky-surface)',
        border: `1px solid ${cool ? 'rgba(124, 170, 255, 0.28)' : 'rgba(255, 122, 82, 0.32)'}`,
        boxShadow: 'var(--shadow-float)',
      }}
    >
      <div
        className="flex h-12 items-center gap-2.5 px-5"
        style={{ borderBottom: `1px solid ${cool ? 'rgba(124, 170, 255, 0.18)' : 'rgba(255, 122, 82, 0.2)'}` }}
      >
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ background: cool ? 'var(--color-strata-kv)' : 'var(--color-terracotta-500)' }}
          aria-hidden="true"
        />
        <span className="font-mono text-mono-body text-ink-hi">{kind}</span>
        <span className="ml-auto font-mono text-mono-sm text-ink-low">json · config</span>
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
        className="p-7 font-mono text-[1.0625rem] leading-9 text-ink-mid"
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
      className="w-[30rem] max-w-[90vw] overflow-hidden rounded-(--radius-frame) border border-line-hover bg-raised"
      style={{ opacity: visible, scale, boxShadow: 'var(--shadow-float)' }}
    >
      <div className="flex h-12 items-center gap-2.5 border-b border-line px-5">
        <span className="font-mono text-mono-body text-ink-mid">branch diff risky</span>
        <span className="ml-auto font-mono text-mono-sm text-ok">3 keys</span>
      </div>
      <div className="bg-inset p-7 font-mono text-mono-body leading-8">
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

function Stage({ p, staticScene }: { p?: MotionValue<number>; staticScene?: number }) {
  const mv = p!;
  const drive = (a: number, b: number, fallback: (s: number) => number) =>
    staticScene !== undefined ? fallback(staticScene) : useTransform(mv, [a, b], [0, 1], clampOpt);

  const spread = drive(0.04, 0.2, (s) => (s < 3 ? 1 : 0));
  // three writes cascade across the modify band
  const swapTheme = drive(0.3, 0.36, (s) => (s >= 1 ? 1 : 0));
  const swapFont = drive(0.35, 0.41, (s) => (s >= 1 ? 1 : 0));
  const swapSave = drive(0.4, 0.46, (s) => (s >= 1 ? 1 : 0));
  const flash = drive(0.29, 0.34, (s) => (s === 1 ? 1 : 0));
  const diffIn =
    staticScene !== undefined ? (staticScene === 2 ? 1 : 0) : useTransform(mv, [0.57, 0.65, 0.76, 0.82], [0, 1, 1, 0], clampOpt);
  const converge = drive(0.82, 0.94, (s) => (s >= 3 ? 1 : 0));
  const riskyGone = drive(0.88, 0.97, (s) => (s >= 3 ? 1 : 0));
  const mainSwapAll = drive(0.84, 0.9, (s) => (s >= 3 ? 1 : 0));
  const mergedChip = drive(0.92, 1, (s) => (s >= 3 ? 1 : 0));

  const riskySwaps = { theme: swapTheme, font_size: swapFont, autosave: swapSave };
  const mainSwaps = { theme: mainSwapAll, font_size: mainSwapAll, autosave: mainSwapAll };

  const sep = (s: number, c: number) => s * (1 - c);
  const mainX =
    staticScene !== undefined
      ? `${-54 * sep(staticScene < 3 ? 1 : 0, staticScene >= 3 ? 1 : 0)}%`
      : useTransform([spread as MotionValue<number>, converge as MotionValue<number>], ([s, c]: number[]) => `${-54 * sep(s, c)}%`);
  const riskyX =
    staticScene !== undefined
      ? `${54 * sep(staticScene < 3 ? 1 : 0, staticScene >= 3 ? 1 : 0)}%`
      : useTransform([spread as MotionValue<number>, converge as MotionValue<number>], ([s, c]: number[]) => `${54 * sep(s, c)}%`);
  const riskyOpacity =
    staticScene !== undefined
      ? staticScene >= 3
        ? 0
        : 1
      : useTransform([spread as MotionValue<number>, riskyGone as MotionValue<number>], ([s, g]: number[]) => Math.min(s * 3, 1) * (1 - g));

  return (
    <div className="relative flex h-[32rem] items-center justify-center">
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

function CommandStrip({ active }: { active: number }) {
  const act = ACTS[active];
  const multi = act.cmds.length > 1;
  return (
    <div className="mx-auto mb-10 flex max-w-[56rem] flex-col items-center gap-3 text-center">
      <div className={multi ? 'space-y-1' : ''}>
        {act.cmds.map((cmd) => (
          <p key={cmd} className={`font-mono leading-tight ${multi ? 'text-[1.125rem]' : 'text-[1.625rem] max-lg:text-[1.25rem]'}`}>
            <span className="text-ink-low">strata:{act.branch} </span>
            <span className="text-terracotta-500">›</span>
            <span className="text-ink-hi"> {cmd}</span>
          </p>
        ))}
      </div>
      <p className="text-body-lg text-ink-mid">
        <span className="text-heading font-semibold text-ink-hi">{act.verb}</span> — {act.line}
      </p>
      <div className="mt-2 flex gap-2.5" aria-hidden="true">
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
      <div ref={ref} className="relative hidden md:block" style={{ height: '340vh' }}>
        <div className="sticky top-0 flex h-screen flex-col justify-center">
          <CommandStrip active={active} />
          <Stage p={progress} />
        </div>
      </div>

      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 md:hidden">
        {ACTS.map((act, i) => (
          <div key={act.verb} className="w-[92vw] shrink-0 snap-center">
            {act.cmds.map((cmd) => (
              <p key={cmd} className="font-mono text-mono-sm text-terracotta-300">
                <span className="text-ink-low">strata:{act.branch} › </span>
                {cmd}
              </p>
            ))}
            <p className="mb-4 mt-1 text-small text-ink-mid">
              <span className="font-medium text-ink-hi">{act.verb}</span> — {act.line}
            </p>
            <div className="flex flex-col items-center gap-4">
              {i === 2 ? (
                <DiffCard visible={1} />
              ) : i === 3 ? (
                <JsonCard kind="main" swaps={{ theme: 1, font_size: 1, autosave: 1 }} chip={1} />
              ) : (
                <>
                  <JsonCard kind="main" swaps={{}} />
                  <JsonCard kind="risky" swaps={{ theme: i >= 1 ? 1 : 0, font_size: i >= 1 ? 1 : 0, autosave: i >= 1 ? 1 : 0 }} />
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
