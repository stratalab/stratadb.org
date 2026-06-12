// Scrub #2 of 2 (03 §3.2 — at the cap): fork → modify → diff → merge as a
// scroll-driven branch diagram. Also backlog I2's first claim artifact.
// Same rules as VersionStrip: scroll drives values, never hijacked; band 0
// clamped; reduced motion = static scenes + steppers; mobile = carousel.
import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useSpring, useTransform, type MotionValue } from 'motion/react';

const SCRUB = { stiffness: 120, damping: 28, mass: 1.1 };
const BANDS = [0, 0.28, 0.55, 0.8];

const SCENES = [
  {
    verb: 'Fork',
    cmd: 'branch create risky',
    line: 'O(1). Nothing is copied, at any size.',
  },
  {
    verb: 'Modify',
    cmd: 'kv put config.retries 5',
    line: 'Writes land on the branch. main is untouched.',
  },
  {
    verb: 'Diff',
    cmd: 'branch diff risky',
    line: 'See exactly what changed — before you commit to it.',
  },
  {
    verb: 'Merge',
    cmd: 'branch merge risky',
    line: 'Keep what works. The branch did its job.',
  },
];

// progress → 0..1 within [a, b]
function seg(p: MotionValue<number>, a: number, b: number) {
  return useTransform(p, [a, b], [0, 1], { clamp: true });
}

function Diagram({ p, staticScene }: { p?: MotionValue<number>; staticScene?: number }) {
  // When staticScene is set (reduced motion / mobile), render that scene's end
  // state; otherwise drive everything from scroll progress.
  const mv = p!;
  const useSeg = (a: number, b: number, fallback: (s: number) => number) =>
    staticScene !== undefined ? fallback(staticScene) : seg(mv, a, b);

  const forkDraw = useSeg(0.02, 0.24, (s) => (s >= 0 ? 1 : 0));
  const writeIn = useSeg(0.3, 0.4, (s) => (s >= 1 ? 1 : 0));
  const diffIn = useSeg(0.57, 0.68, (s) => (s === 2 ? 1 : 0));
  const mergeDraw = useSeg(0.82, 0.96, (s) => (s >= 3 ? 1 : 0));
  const riskyDim = useSeg(0.94, 1, (s) => (s >= 3 ? 1 : 0));

  const riskyOpacity =
    staticScene !== undefined
      ? staticScene >= 3
        ? 0.35
        : 1
      : useTransform(riskyDim as MotionValue<number>, [0, 1], [1, 0.35]);

  return (
    <svg viewBox="0 0 800 340" fill="none" className="w-full" aria-hidden="true">
      {/* main line — always present */}
      <line x1="32" y1="230" x2="768" y2="230" stroke="var(--color-ink-low)" strokeWidth="1.5" opacity="0.7" />
      <text x="36" y="254" fill="var(--color-ink-low)" fontSize="13" fontFamily="var(--font-mono)">main</text>

      {/* the fork: springs off main */}
      <motion.g style={{ opacity: riskyOpacity }}>
        <motion.path
          d="M 180 230 C 230 230 250 110 320 104 L 656 104"
          stroke="var(--color-terracotta-700)"
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.3"
          style={{ pathLength: forkDraw }}
        />
        <motion.path
          d="M 180 230 C 230 230 250 110 320 104 L 656 104"
          stroke="var(--color-terracotta-400)"
          strokeWidth="1.75"
          strokeLinecap="round"
          style={{ pathLength: forkDraw }}
        />
        <motion.text
          x="324"
          y="86"
          fill="var(--color-terracotta-400)"
          fontSize="13"
          fontFamily="var(--font-mono)"
          style={{ opacity: forkDraw }}
        >
          risky
        </motion.text>

        {/* the write: a dot lands on the branch */}
        <motion.circle
          cx="430"
          cy="104"
          r="7"
          fill="var(--color-terracotta-500)"
          style={{ scale: writeIn, opacity: writeIn, transformOrigin: '430px 104px' }}
        />
        <motion.text
          x="430"
          y="76"
          textAnchor="middle"
          fill="var(--color-ink-mid)"
          fontSize="12"
          fontFamily="var(--font-mono)"
          style={{ opacity: writeIn }}
        >
          config.retries = 5
        </motion.text>
      </motion.g>

      {/* the diff: a bridge between the lines */}
      <motion.g style={{ opacity: diffIn }}>
        <line x1="530" y1="112" x2="530" y2="222" stroke="var(--color-ink-low)" strokeWidth="1" strokeDasharray="4 5" />
        <rect x="468" y="148" width="124" height="34" rx="8" fill="var(--color-raised)" stroke="var(--color-line-hover)" />
        <text x="530" y="170" textAnchor="middle" fill="var(--color-ok)" fontSize="13" fontFamily="var(--font-mono)">
          +1 key
        </text>
      </motion.g>

      {/* the merge: home again */}
      <motion.path
        d="M 656 104 C 700 108 700 222 744 229"
        stroke="var(--color-terracotta-700)"
        strokeWidth="6"
        strokeLinecap="round"
        opacity="0.3"
        style={{ pathLength: mergeDraw }}
      />
      <motion.path
        d="M 656 104 C 700 108 700 222 744 229"
        stroke="var(--color-terracotta-400)"
        strokeWidth="1.75"
        strokeLinecap="round"
        style={{ pathLength: mergeDraw }}
      />
      <motion.circle
        cx="744"
        cy="230"
        r="7"
        fill="var(--color-terracotta-500)"
        style={{ scale: mergeDraw, opacity: mergeDraw, transformOrigin: '744px 230px' }}
      />
    </svg>
  );
}

function CaptionRail({ active }: { active: number }) {
  return (
    <ol className="space-y-6">
      {SCENES.map((s, i) => (
        <li key={s.verb} className={`transition-opacity duration-300 ${i === active ? 'opacity-100' : 'opacity-35'}`}>
          <p className="flex items-center gap-3">
            <span
              className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${i === active ? 'bg-terracotta-500' : 'bg-ink-low'}`}
              aria-hidden="true"
            />
            <span className="text-heading text-ink-hi">{s.verb}</span>
          </p>
          <p className="mt-1.5 pl-[18px] font-mono text-mono-sm text-terracotta-300">
            <span className="text-ink-low">strata:main › </span>
            {s.cmd}
          </p>
          <p className="mt-1 pl-[18px] text-small text-ink-mid">{s.line}</p>
        </li>
      ))}
    </ol>
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
        <div className="grid items-center gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <CaptionRail active={step} />
            <div className="mt-8 flex gap-3">
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
          <div className="md:col-span-7">
            <Diagram staticScene={step} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* desktop scrub: ~2.4 viewport-heights of ownership (03 cap: ≤2.5) */}
      <div ref={ref} className="relative hidden md:block" style={{ height: '340vh' }}>
        <div className="sticky top-0 flex h-screen items-center">
          <div className="grid w-full items-center gap-10 md:grid-cols-12">
            <div className="md:col-span-5">
              <CaptionRail active={active} />
            </div>
            <div className="md:col-span-7">
              <Diagram p={progress} />
            </div>
          </div>
        </div>
      </div>

      {/* mobile: swipeable scenes, static diagram states */}
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 md:hidden">
        {SCENES.map((s, i) => (
          <div key={s.verb} className="w-[85vw] shrink-0 snap-center">
            <p className="text-heading text-ink-hi">{s.verb}</p>
            <p className="mt-1 font-mono text-mono-sm text-terracotta-300">{s.cmd}</p>
            <p className="mb-4 mt-1 text-small text-ink-mid">{s.line}</p>
            <Diagram staticScene={i} />
          </div>
        ))}
      </div>
    </>
  );
}
