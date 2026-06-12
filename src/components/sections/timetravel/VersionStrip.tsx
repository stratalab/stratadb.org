// Set-piece B (04 §4): one of the page's two scroll-scrubs (03 §3.2, at the cap). Scroll position
// drives values — never hijacked; scenes crossfade over soft 12% bands.
// Reduced motion: static scenes with Prev/Next steppers (03 §6).
// Authored against the seed world — every value shown is true in src/data/seed.ts.
import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useSpring, useTransform, type MotionValue } from 'motion/react';
import { SEED } from '../../../data/seed';

const HISTORY = SEED.kv['config.theme'].history!;
const fmt = (iso: string) => iso.slice(0, 16).replace('T', ' ');

// 03 §1 spring-scrub
const SCRUB = { stiffness: 120, damping: 28, mass: 1.1 };
// Scene bands: 0 – 0.35 – 0.70, 12% crossfades
const BANDS = [0, 0.35, 0.7];

const SCENES = [
  {
    caption: 'Every write is a version. Nothing is overwritten.',
    code: [
      { cmd: true, text: 'kv history config.theme' },
      ...HISTORY.slice()
        .reverse()
        .map((h) => ({
          cmd: false,
          text: `v${h.version}  ${JSON.stringify(h.value)}  ${fmt(h.at)}`,
        })),
    ],
  },
  {
    caption: 'Open the database as it was.',
    code: [
      { cmd: false, text: '# python — a snapshot is a database', dim: true },
      { cmd: false, text: 'snap = db.at("2026-06-10T09:31")' },
      { cmd: false, text: 'snap.kv.get("config.theme")' },
      { cmd: false, text: '"dusk"', out: true },
    ],
  },
  {
    caption: 'Diff then against now.',
    code: [
      { cmd: false, text: 'db.at(yesterday).kv.get("config.theme")' },
      { cmd: false, text: '- "dusk"', del: true },
      { cmd: false, text: 'db.kv.get("config.theme")' },
      { cmd: false, text: '+ "midnight"', add: true },
    ],
  },
];

function sceneOpacity(progress: MotionValue<number>, i: number) {
  const start = BANDS[i];
  const end = i < BANDS.length - 1 ? BANDS[i + 1] : 1.01;
  // 12% crossfade windows at band edges. Band 0 is clamped fully visible at
  // progress 0 (a Phase-6 fix: an unclamped window left scene 1 half-faded
  // before any scroll — visual bug + AA contrast fail).
  const fadeIn = i === 0 ? [0, 0] : [start - 0.06, start + 0.06];
  return useTransform(
    progress,
    [...fadeIn, end - 0.06, end + 0.06],
    [i === 0 ? 1 : 0, 1, 1, i === BANDS.length - 1 ? 1 : 0]
  );
}

function CodePanel({ scene }: { scene: (typeof SCENES)[number] }) {
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
        <span className="ml-2 font-mono text-mono-sm text-ink-low">time travel</span>
      </div>
      <div className="min-h-44 bg-inset p-4 font-mono text-mono-sm text-ink-mid">
        {scene.code.map((line: any, i) => (
          <div key={i} className="whitespace-pre-wrap">
            {line.cmd ? (
              <>
                <span className="text-ink-low">strata:main </span>
                <span className="text-terracotta-500">›</span>
                <span className="text-ink-hi"> {line.text}</span>
              </>
            ) : (
              <span
                className={
                  line.add
                    ? 'text-ok'
                    : line.del
                      ? 'text-err'
                      : line.dim
                        ? 'text-ink-low'
                        : line.out
                          ? 'text-ink-hi'
                          : 'text-ink-mid'
                }
              >
                {line.text}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Strip({ active }: { active: number }) {
  return (
    <div className="relative">
      <div className="flex items-stretch gap-3">
        {HISTORY.map((h, i) => (
          <div
            key={h.version}
            className={`flex-1 rounded-(--radius-card) border p-4 transition-colors duration-200 ${
              i <= active ? 'border-line-hover bg-raised' : 'border-line bg-panel opacity-40'
            }`}
          >
            <p className="font-mono text-mono-sm text-ink-low">v{h.version}</p>
            <p className="mt-1 font-mono text-mono-body text-ink-hi">{JSON.stringify(h.value)}</p>
            <p className="mt-2 font-mono text-mono-sm text-ink-low">{fmt(h.at)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function VersionStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);
  const [step, setStep] = useState(0); // reduced-motion stepper
  const [activeCell, setActiveCell] = useState(2);

  useEffect(() => {
    setReduced(document.documentElement.dataset.motion === 'reduced');
  }, []);

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const progress = useSpring(scrollYProgress, SCRUB);
  const o0 = sceneOpacity(progress, 0);
  const o1 = sceneOpacity(progress, 1);
  const o2 = sceneOpacity(progress, 2);
  const opacities = [o0, o1, o2];

  useEffect(
    () =>
      progress.on('change', (v) => {
        setActiveCell(v < 0.35 ? Math.min(2, Math.floor((v / 0.35) * 3)) : 2);
      }),
    [progress]
  );

  // ---- reduced motion: static scene + steppers (no pinning, no scrub) ----
  if (reduced) {
    const scene = SCENES[step];
    return (
      <div>
        <p className="mb-6 text-body-lg text-ink-mid">{scene.caption}</p>
        <div className="grid gap-6 md:grid-cols-2">
          <CodePanel scene={scene} />
          <Strip active={step === 0 ? 2 : step === 1 ? 1 : 2} />
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
            onClick={() => setStep((s) => Math.min(2, s + 1))}
            disabled={step === 2}
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
      {/* desktop scrub: 1.5 viewport-heights of scroll ownership while pinned */}
      <div ref={ref} className="relative hidden md:block" style={{ height: '250vh' }}>
        <div className="sticky top-0 flex h-screen flex-col justify-center">
          {/* caption rail — real DOM text, all present, opacity-swapped */}
          <div className="relative mb-10 h-8">
            {SCENES.map((s, i) => (
              <motion.p
                key={i}
                style={{ opacity: opacities[i] }}
                className="absolute inset-0 text-body-lg text-ink-mid"
              >
                {s.caption}
              </motion.p>
            ))}
          </div>
          <div className="grid items-start gap-8 md:grid-cols-2">
            <div className="relative min-h-64">
              {SCENES.map((s, i) => (
                <motion.div key={i} style={{ opacity: opacities[i] }} className="absolute inset-x-0 top-0">
                  <CodePanel scene={s} />
                </motion.div>
              ))}
            </div>
            <Strip active={activeCell} />
          </div>
        </div>
      </div>

      {/* mobile: swipeable scene carousel — no pinning (03 §3.2) */}
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 md:hidden">
        {SCENES.map((s, i) => (
          <div key={i} className="w-[85vw] shrink-0 snap-center">
            <p className="mb-4 text-body text-ink-mid">{s.caption}</p>
            <CodePanel scene={s} />
          </div>
        ))}
      </div>
    </>
  );
}
