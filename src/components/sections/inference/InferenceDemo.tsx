// Section 5 demo (04 §6 v6, 2026-08-31): a compact native inference loop.
// The artifact avoids implementation inventory and shows one product idea:
// records stay local, model work runs in the database layer, and the answer
// returns with database context.
import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { EASE, EMBER, INK, useBeats } from '../../shared/term';

const SOURCES = ['KV', 'JSON', 'Event', 'Vector'];
const OPS = ['read records', 'embed question', 'rank context', 'generate answer'];

const ANSWER =
  'The portfolio value moved from 98400 to 111080 after the merge changed allocation to 80/15/5.';
const ANSWER_WORDS = ANSWER.split(' ');

function phaseFor(beat: number) {
  return Math.min(beat, OPS.length - 1);
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
    }, 48);

    return () => window.clearInterval(timer);
  }, [live, on]);

  const streaming = live && on && count < ANSWER_WORDS.length;

  return (
    <p className="min-h-[5.25rem] text-body text-ink-mid">
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
  const first = phase >= 1 ? 1 : 0;
  const second = phase >= 3 ? 1 : 0;

  return (
    <svg
      className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <motion.path
        d="M 28 50 C 38 50 41 50 48 50"
        fill="none"
        stroke={EMBER(0.46)}
        strokeLinecap="round"
        strokeWidth="0.3"
        initial={false}
        animate={{ pathLength: first, opacity: first ? 1 : 0 }}
        transition={{ duration: 0.58, ease: EASE }}
      />
      <motion.path
        d="M 58 50 C 66 50 70 50 78 50"
        fill="none"
        stroke={EMBER(0.56)}
        strokeLinecap="round"
        strokeWidth="0.3"
        initial={false}
        animate={{ pathLength: second, opacity: second ? 1 : 0 }}
        transition={{ duration: 0.58, ease: EASE }}
      />
      <motion.rect
        width="1.45"
        height="1.45"
        rx="0.18"
        fill={EMBER(0.95)}
        initial={false}
        animate={{
          x: first ? 47.25 : 27.25,
          y: 49.25,
          opacity: first && !second ? 1 : 0,
        }}
        transition={{ duration: 0.64, ease: EASE }}
      />
      <motion.rect
        width="1.45"
        height="1.45"
        rx="0.18"
        fill={EMBER(0.98)}
        initial={false}
        animate={{ x: second ? 77.25 : 57.25, y: 49.25, opacity: second ? 1 : 0 }}
        transition={{ duration: 0.64, ease: EASE }}
      />
    </svg>
  );
}

function RecordsNode({ phase }: { phase: number }) {
  const active = phase >= 1;

  return (
    <motion.section
      className="rounded-lg border border-line bg-panel/80 p-5"
      initial={false}
      animate={{ opacity: active ? 1 : 0.74 }}
      transition={{ duration: 0.32, ease: EASE }}
    >
      <p className="font-mono text-mono-sm text-terracotta-400">records</p>
      <h3 className="mt-2 text-heading text-ink-hi">Stored context</h3>
      <div className="mt-5 grid grid-cols-2 gap-2">
        {SOURCES.map((source, index) => (
          <motion.span
            key={source}
            className="rounded-(--radius-control) border border-line bg-inset px-3 py-2 text-center font-mono text-mono-sm text-ink-mid"
            initial={false}
            animate={{ opacity: active ? 1 : 0.52, y: active ? 0 : 4 }}
            transition={{ duration: 0.24, delay: active ? index * 0.04 : 0, ease: EASE }}
          >
            {source}
          </motion.span>
        ))}
      </div>
      <p className="mt-5 font-mono text-mono-sm text-ink-low">records stay local</p>
    </motion.section>
  );
}

function InferencePlane({ phase }: { phase: number }) {
  return (
    <section className="relative overflow-hidden rounded-lg border border-line bg-raised/70 p-5">
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background: `linear-gradient(135deg, transparent, ${EMBER(0.07)} 48%, transparent 74%)`,
        }}
        aria-hidden="true"
      />
      <div className="relative flex min-h-[15.5rem] flex-col items-center justify-center">
        <div className="relative h-[10rem] w-full max-w-[15rem]">
          {[0, 1, 2].map((layer) => {
            const active = phase >= layer + 1;

            return (
              <motion.div
                key={layer}
                className="absolute left-1/2 h-[3.45rem] w-[12.6rem] -translate-x-1/2 rotate-[-8deg] overflow-hidden rounded-[0.9rem] border"
                style={{
                  top: `${0.8 + layer * 1.55}rem`,
                  zIndex: layer + 1,
                  borderColor: active ? EMBER(0.58) : EMBER(0.22),
                  background: `linear-gradient(135deg, ${EMBER(
                    active ? 0.16 : 0.08,
                  )}, rgb(var(--rgb-white) / 0.035) 46%, rgb(var(--rgb-black) / 0.2) 84%)`,
                  boxShadow: active
                    ? `0 22px 52px -34px ${EMBER(0.76)}, inset 0 1px 0 rgb(var(--rgb-white) / 0.12)`
                    : 'inset 0 1px 0 rgb(var(--rgb-white) / 0.08)',
                }}
                initial={false}
                animate={{ opacity: active ? 1 : 0.42 }}
                transition={{ duration: 0.32, ease: EASE }}
                aria-hidden="true"
              >
                <span className="absolute left-4 right-4 top-4 h-px bg-line" />
                <span className="absolute left-4 right-7 top-7 h-px bg-line" />
                <span
                  className="absolute bottom-3 left-5 top-3 w-px"
                  style={{ background: active ? EMBER(0.42) : 'var(--color-line)' }}
                />
                <motion.span
                  className="absolute inset-y-0 w-8"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${EMBER(0.22)}, transparent)`,
                  }}
                  initial={false}
                  animate={{
                    x: active ? [18, 150, 18] : 18,
                    opacity: active ? 0.9 : 0,
                  }}
                  transition={{ duration: 1.1, ease: EASE }}
                />
              </motion.div>
            );
          })}

          <motion.div
            className="absolute bottom-5 left-[16%] h-px w-[72%]"
            style={{ background: EMBER(0.38), boxShadow: `0 0 28px ${EMBER(0.5)}` }}
            initial={false}
            animate={{ opacity: phase >= 1 ? 1 : 0.24, scaleX: phase >= 1 ? 1 : 0.72 }}
            transition={{ duration: 0.48, ease: EASE }}
            aria-hidden="true"
          />
        </div>

        <div className="text-center">
          <p className="font-mono text-mono-sm text-terracotta-400">native</p>
          <h3 className="mt-2 text-heading text-ink-hi">Inference layer</h3>
          <motion.p
            className="mt-4 font-mono text-mono-sm text-ink-mid"
            key={OPS[phase]}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, ease: EASE }}
          >
            {OPS[phase]}
          </motion.p>
        </div>
      </div>
    </section>
  );
}

function AnswerNode({ phase, live }: { phase: number; live: boolean }) {
  const answering = phase >= 3;

  return (
    <motion.section
      className="rounded-lg border border-line bg-panel/80 p-5"
      initial={false}
      animate={{ opacity: answering ? 1 : 0.68 }}
      transition={{ duration: 0.32, ease: EASE }}
    >
      <p className="font-mono text-mono-sm text-terracotta-400">answer</p>
      <h3 className="mt-2 text-heading text-ink-hi">Grounded result</h3>
      <div className="mt-5 rounded-(--radius-control) border border-line bg-inset p-4">
        <AnswerText on={answering} live={live} />
      </div>
      <p className="mt-5 font-mono text-mono-sm text-ink-low">from ranked context</p>
    </motion.section>
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
  const beat = useBeats([620, 780, 780, 1120], live);
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
          <span className="font-mono text-mono-body text-ink-hi">native inference</span>
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
          <div className="relative grid gap-4 lg:grid-cols-[minmax(0,0.82fr)_minmax(11rem,0.64fr)_minmax(0,0.92fr)]">
            <RecordsNode phase={phase} />
            <InferencePlane phase={phase} />
            <AnswerNode phase={phase} live={live} />
          </div>
        </div>
      </div>
    </div>
  );
}
