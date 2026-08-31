// Section 5 demo (04 §6 v4, 2026-08-31): one simple AI loop.
// The old workbench tried to prove every inference surface at once. This version
// shows the product idea directly: records stay in Strata, AI runs beside them,
// and the answer comes back grounded in the database.
import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { EASE, EMBER, INK, useBeats } from '../../shared/term';

const RECORDS = [
  {
    kind: 'KV',
    name: 'portfolio.value',
    value: '111080',
    tone: 'var(--color-strata-kv)',
  },
  {
    kind: 'JSON',
    name: 'allocation',
    value: 'stocks 80 / bonds 15 / cash 5',
    tone: 'var(--color-strata-json)',
  },
  {
    kind: 'Event',
    name: 'branch.merge',
    value: 'clean merge at 16:55:03',
    tone: 'var(--color-strata-event)',
  },
  {
    kind: 'Vector',
    name: 'notes.d1',
    value: 'risky allocation merged',
    tone: 'var(--color-strata-vector)',
  },
];

const STEPS = [
  ['read', 'records'],
  ['embed', 'question'],
  ['rank', 'context'],
  ['generate', 'answer'],
] as const;

const ANSWER =
  'The portfolio value moved from 98400 to 111080 after the branch merge changed the allocation to 80% stocks, 15% bonds, and 5% cash.';
const ANSWER_WORDS = ANSWER.split(' ');

function phaseFor(beat: number) {
  return Math.min(beat, STEPS.length - 1);
}

function AnswerText({ on, live }: { on: boolean; live: boolean }) {
  const [count, setCount] = useState(() => (live ? 0 : ANSWER_WORDS.length));

  useEffect(() => {
    if (!live) {
      setCount(ANSWER_WORDS.length);
      return;
    }
    if (!on) {
      setCount(0);
      return;
    }

    setCount(0);
    let i = 0;
    const timer = window.setInterval(() => {
      i += 1;
      setCount(i);
      if (i >= ANSWER_WORDS.length) window.clearInterval(timer);
    }, 42);

    return () => window.clearInterval(timer);
  }, [live, on]);

  const streaming = live && on && count < ANSWER_WORDS.length;

  return (
    <p className="min-h-[7.5rem] text-body text-ink-mid">
      {ANSWER_WORDS.slice(0, count).join(' ')}
      {streaming && (
        <span
          className="ml-1 inline-block h-[1em] w-[0.55ch] translate-y-[2px] bg-ink-mid/70"
          aria-hidden="true"
        />
      )}
    </p>
  );
}

function FlowLines({ phase }: { phase: number }) {
  const recordsToAi = phase >= 1 ? 1 : 0;
  const aiToAnswer = phase >= 3 ? 1 : 0;

  return (
    <svg
      className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <motion.path
        d="M 30 34 C 41 30 45 36 51 45"
        fill="none"
        stroke={EMBER(0.52)}
        strokeLinecap="round"
        strokeWidth="0.32"
        initial={false}
        animate={{ pathLength: recordsToAi, opacity: recordsToAi ? 1 : 0 }}
        transition={{ duration: 0.62, ease: EASE }}
      />
      <motion.path
        d="M 30 66 C 41 70 45 64 51 55"
        fill="none"
        stroke={EMBER(0.34)}
        strokeLinecap="round"
        strokeWidth="0.26"
        initial={false}
        animate={{ pathLength: recordsToAi, opacity: recordsToAi ? 1 : 0 }}
        transition={{ duration: 0.62, delay: 0.08, ease: EASE }}
      />
      <motion.path
        d="M 57 50 C 64 50 68 50 75 50"
        fill="none"
        stroke={EMBER(0.56)}
        strokeLinecap="round"
        strokeWidth="0.34"
        initial={false}
        animate={{ pathLength: aiToAnswer, opacity: aiToAnswer ? 1 : 0 }}
        transition={{ duration: 0.62, ease: EASE }}
      />
      <motion.circle
        r="0.8"
        fill={EMBER(0.95)}
        initial={false}
        animate={{
          cx: recordsToAi ? 51 : 30,
          cy: recordsToAi ? 45 : 34,
          opacity: recordsToAi && !aiToAnswer ? 1 : 0,
        }}
        transition={{ duration: 0.7, ease: EASE }}
      />
      <motion.circle
        r="0.82"
        fill={EMBER(0.98)}
        initial={false}
        animate={{ cx: aiToAnswer ? 75 : 57, cy: 50, opacity: aiToAnswer ? 1 : 0 }}
        transition={{ duration: 0.7, ease: EASE }}
      />
    </svg>
  );
}

function RecordStack({ phase }: { phase: number }) {
  return (
    <section className="rounded-lg border border-line bg-panel/80 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="font-mono text-mono-body text-ink-hi">database records</h3>
        <span className="font-mono text-mono-sm text-ink-low">same file</span>
      </div>
      <div className="space-y-2.5">
        {RECORDS.map((record, index) => {
          const active = phase >= 1 || index === 0;

          return (
            <motion.div
              key={record.name}
              className="relative overflow-hidden rounded-(--radius-control) border px-3 py-2.5"
              style={{
                borderColor: active ? 'var(--color-line-hover)' : 'var(--color-line)',
                background: active
                  ? `color-mix(in srgb, ${record.tone} 4%, var(--color-panel))`
                  : 'var(--color-panel)',
              }}
              initial={false}
              animate={{ opacity: active ? 1 : 0.52, x: active ? 0 : -6 }}
              transition={{
                duration: 0.34,
                delay: phase >= 1 ? index * 0.06 : 0,
                ease: EASE,
              }}
            >
              <span
                className="absolute inset-y-0 left-0 w-px"
                style={{ background: record.tone, opacity: active ? 0.9 : 0.28 }}
                aria-hidden="true"
              />
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="rounded border border-line bg-inset px-1.5 py-0.5 font-mono text-mono-sm text-ink-mid"
                  style={{ borderColor: active ? record.tone : 'var(--color-line)' }}
                >
                  {record.kind}
                </span>
                <span className="min-w-0 truncate font-mono text-mono-sm text-ink-hi">
                  {record.name}
                </span>
              </div>
              <p className="mt-1.5 truncate font-mono text-mono-sm text-ink-low">{record.value}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

function AiCore({ phase }: { phase: number }) {
  const [, detail] = STEPS[phase];

  return (
    <section className="flex flex-col items-center justify-center rounded-lg border border-line bg-raised/70 p-4 text-center">
      <motion.div
        className="flex aspect-square w-full max-w-[11rem] flex-col items-center justify-center rounded-full border"
        style={{
          borderColor: EMBER(0.36),
          background: `radial-gradient(70% 80% at 50% 20%, ${EMBER(0.18)}, transparent 70%), var(--color-inset)`,
          boxShadow: `0 0 78px -24px ${EMBER(0.62)}`,
        }}
        initial={false}
        animate={{
          scale: phase >= 1 && phase <= 3 ? [1, 1.035, 1] : 1,
          borderColor: phase >= 1 ? EMBER(0.56) : EMBER(0.3),
        }}
        transition={{ duration: 0.72, ease: EASE }}
      >
        <span className="font-mono text-heading text-ink-hi">AI</span>
        <span className="mt-1 font-mono text-mono-sm text-ink-low">built into Strata</span>
      </motion.div>

      <div className="mt-5 flex w-full flex-wrap justify-center gap-2">
        {['embed', 'rank', 'generate'].map((op, index) => {
          const active = phase >= index + 1;

          return (
            <motion.span
              key={op}
              className="rounded-(--radius-control) border px-2.5 py-1.5 font-mono text-mono-sm"
              style={{
                borderColor: active ? EMBER(0.36) : 'var(--color-line)',
                background: active ? EMBER(0.08) : 'var(--color-panel)',
                color: active ? 'var(--color-ink-hi)' : 'var(--color-ink-low)',
              }}
              initial={false}
              animate={{ opacity: active ? 1 : 0.58, y: active ? 0 : 4 }}
              transition={{ duration: 0.28, ease: EASE }}
            >
              {op}
            </motion.span>
          );
        })}
      </div>
      <p className="mt-4 font-mono text-mono-sm text-terracotta-400">{detail}</p>
    </section>
  );
}

function AnswerCard({ phase, live }: { phase: number; live: boolean }) {
  const answering = phase >= 3;

  return (
    <section className="rounded-lg border border-line bg-panel/80 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="font-mono text-mono-body text-ink-hi">grounded answer</h3>
        <span className="font-mono text-mono-sm text-ink-low">ranked context</span>
      </div>
      <div className="rounded-(--radius-control) border border-line bg-inset p-3">
        <p className="font-mono text-mono-sm text-ink-low">ask</p>
        <p className="mt-1 text-body text-ink-hi">Why did portfolio.value move?</p>
      </div>
      <div className="mt-3 rounded-(--radius-control) border border-line bg-panel p-3">
        <div className="mb-2 flex items-center gap-2 font-mono text-mono-sm">
          <span className="text-terracotta-300">generate</span>
          <span className="text-ink-low">from database context</span>
        </div>
        <AnswerText on={answering} live={live} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2 font-mono text-mono-sm text-ink-low">
        {['kv', 'json', 'event', 'vector'].map((source, index) => (
          <motion.span
            key={source}
            className="rounded-full border border-line bg-inset px-2.5 py-1"
            initial={false}
            animate={{ opacity: phase >= 2 ? 1 : 0.45, y: phase >= 2 ? 0 : 4 }}
            transition={{
              duration: 0.24,
              delay: phase >= 2 ? index * 0.04 : 0,
              ease: EASE,
            }}
          >
            {source}
          </motion.span>
        ))}
      </div>
    </section>
  );
}

function StepRail({ phase }: { phase: number }) {
  return (
    <div className="mt-4 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-4">
      {STEPS.map(([label, detail], index) => {
        const active = phase >= index;

        return (
          <motion.div
            key={label}
            className="bg-panel px-4 py-3"
            initial={false}
            animate={{ opacity: active ? 1 : 0.5 }}
            transition={{ duration: 0.24, ease: EASE }}
          >
            <p className="font-mono text-mono-sm text-terracotta-400">{label}</p>
            <p className="mt-1 font-mono text-mono-sm text-ink-low">{detail}</p>
          </motion.div>
        );
      })}
    </div>
  );
}

export default function InferenceDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    setReduced(document.documentElement.dataset.motion === 'reduced');

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const live = seen && !reduced;
  const beat = useBeats([620, 820, 820, 1260], live);
  const phase = phaseFor(beat);

  return (
    <div ref={ref}>
      <div
        data-inference-workbench
        className="overflow-hidden rounded-(--radius-frame)"
        style={{
          background: 'var(--color-panel)',
          border: `1px solid ${EMBER(0.22)}`,
          boxShadow: `var(--shadow-float), 0 0 110px -28px ${EMBER(0.35)}`,
        }}
      >
        <div
          className="flex min-h-11 flex-wrap items-center gap-x-4 gap-y-1 border-b border-line px-5 py-2"
          style={{ background: EMBER(0.04) }}
        >
          <span className="font-mono text-mono-body text-ink-hi">built-in AI loop</span>
          <span className="font-mono text-mono-sm text-ink-low">embed · rank · generate</span>
          <span className="ml-auto font-mono text-mono-sm text-ink-low">strata · main</span>
        </div>
        <div
          className="relative overflow-hidden p-4 xl:p-5"
          style={{
            backgroundColor: 'var(--color-inset)',
            backgroundImage: `radial-gradient(circle at 1px 1px, ${INK(0.04)} 1px, transparent 1.6px), radial-gradient(58% 68% at 55% 42%, ${EMBER(0.08)}, transparent 72%)`,
            backgroundSize: '22px 22px, 100% 100%',
          }}
        >
          <FlowLines phase={phase} />
          <div className="relative grid gap-4 lg:grid-cols-[minmax(0,0.92fr)_minmax(10rem,0.56fr)_minmax(0,1fr)]">
            <RecordStack phase={phase} />
            <AiCore phase={phase} />
            <AnswerCard phase={phase} live={live} />
          </div>
          <StepRail phase={phase} />
        </div>
      </div>
    </div>
  );
}
