// Section 5 demo (04 §6 v3, 2026-08-30): native inference as a
// database pipeline, not a CLI sampler. The visible story is the value:
// inspect a model, gather records already in the embedded file, embed the
// question, rank database context, then generate an answer. The shipped
// command family remains represented in source and verifier strings:
// `inference capability`, `inference embed`, `inference rank`,
// `inference generate`, `inference tokenize`, `inference cache-status`.
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { COOL, EASE, EMBER, INK, T, useBeats } from '../../shared/term';

const COMMANDS = {
  capability: 'inference capability openai:gpt-4o-mini',
  embed: 'inference embed miniLM "why did portfolio.value move?"',
  rank: 'inference rank jina-reranker-v1-tiny "why did portfolio.value move?" "...passages"',
  generate:
    'inference generate openai:gpt-4o-mini "Answer from ranked portfolio context." --max-tokens 80',
  tokenize: 'inference tokenize tinyllama "portfolio.value moved"',
  cache: 'inference cache-status',
};

const PHASES = [
  {
    label: 'capability',
    title: 'Know what can run here.',
    detail: 'Capability checks tell the app which model can generate, embed, rank, or tokenize.',
  },
  {
    label: 'records',
    title: 'Gather records in place.',
    detail: 'KV, JSON, events, and vectors stay in the same embedded database file.',
  },
  {
    label: 'embed',
    title: 'Turn the question into a vector.',
    detail: 'A local model embeds the query without moving the app state out of process.',
  },
  {
    label: 'rank',
    title: 'Rank the useful context.',
    detail: 'A reranker scores the candidate records before generation starts.',
  },
  {
    label: 'generate',
    title: 'Return a grounded answer.',
    detail: 'Generation runs through the same inference layer, local or hosted.',
  },
] as const;

const DATA_ROWS = [
  {
    kind: 'KV',
    name: 'portfolio.value',
    value: '111080',
    meta: 'current value',
    tone: 'var(--color-strata-kv)',
  },
  {
    kind: 'JSON',
    name: 'portfolio',
    value: 'stocks 80 / bonds 15 / cash 5',
    meta: 'allocation',
    tone: 'var(--color-strata-json)',
  },
  {
    kind: 'Event',
    name: 'branch.merge',
    value: 'portfolio.value 111080',
    meta: '16:55:03',
    tone: 'var(--color-strata-event)',
  },
  {
    kind: 'Vector',
    name: 'notes.d1',
    value: 'risky allocation merged',
    meta: '384 dims',
    tone: 'var(--color-strata-vector)',
  },
];

const CAPABILITIES = [
  { label: 'capability', detail: 'no request', phase: 0 },
  { label: 'embed', detail: '384 dims', phase: 2 },
  { label: 'rank', detail: 'scores', phase: 3 },
  { label: 'generate', detail: 'stream', phase: 4 },
  { label: 'tokenize', detail: 'local vocab', phase: 0 },
  { label: 'cache', detail: 'loaded models', phase: 0 },
];

const CONTEXT_ROWS = [
  { source: 'event', label: 'branch.merge', score: 0.94 },
  { source: 'json', label: 'portfolio allocation', score: 0.88 },
  { source: 'kv', label: 'portfolio.value', score: 0.83 },
];

const PROVIDERS = [
  { label: 'Local GGUF', detail: 'miniLM / tinyllama', active: [0, 2, 3] },
  { label: 'OpenAI', detail: 'generate / embed', active: [0, 4] },
  { label: 'Anthropic', detail: 'generate', active: [0, 4] },
  { label: 'Google', detail: 'embed / generate', active: [0, 2, 4] },
];

const OPERATIONS = [
  'check model capability',
  'read database context',
  'embed the question',
  'rank candidate records',
  'generate from ranked context',
];

const ANSWER =
  'The portfolio value moved from 98400 to 111080 after the no-conflict merge. Ranked context shows stocks 80%, bonds 15%, cash 5%.';
const ANSWER_WORDS = ANSWER.split(' ');

function phaseFor(beat: number) {
  return Math.min(beat, PHASES.length - 1);
}

function Panel({
  title,
  note,
  children,
  className = '',
}: {
  title: string;
  note: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`relative overflow-hidden rounded-lg border border-line bg-panel/80 ${className}`}
    >
      <div className="flex min-h-9 items-center gap-3 border-b border-line px-4 xl:min-h-10">
        <span className="whitespace-nowrap font-mono text-mono-sm text-ink-hi">{title}</span>
        <span className="ml-auto whitespace-nowrap font-mono text-mono-sm text-ink-low">
          {note}
        </span>
      </div>
      <div className="p-3 xl:p-4">{children}</div>
    </section>
  );
}

function FlowField({ phase }: { phase: number }) {
  const fromData = phase >= 1 ? 1 : 0;
  const toRank = phase >= 2 ? 1 : 0;
  const toAnswer = phase >= 4 ? 1 : 0;

  return (
    <svg
      className="pointer-events-none absolute inset-0 hidden h-full w-full md:block"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <motion.path
        d="M 30 38 C 38 30 43 32 49 42"
        fill="none"
        stroke={EMBER(0.5)}
        strokeWidth="0.32"
        strokeLinecap="round"
        initial={false}
        animate={{ pathLength: fromData, opacity: fromData ? 1 : 0 }}
        transition={{ duration: 0.58, ease: EASE }}
      />
      <motion.path
        d="M 30 62 C 38 70 43 68 49 58"
        fill="none"
        stroke={COOL(0.46)}
        strokeWidth="0.26"
        strokeLinecap="round"
        initial={false}
        animate={{ pathLength: toRank, opacity: toRank ? 1 : 0 }}
        transition={{ duration: 0.58, ease: EASE }}
      />
      <motion.path
        d="M 56 50 C 64 50 66 50 72 50"
        fill="none"
        stroke={EMBER(0.56)}
        strokeWidth="0.32"
        strokeLinecap="round"
        initial={false}
        animate={{ pathLength: toAnswer, opacity: toAnswer ? 1 : 0 }}
        transition={{ duration: 0.58, ease: EASE }}
      />
      <motion.circle
        r="0.8"
        fill={EMBER(0.95)}
        initial={false}
        animate={{
          cx: phase >= 1 ? 49 : 30,
          cy: phase >= 1 ? 42 : 38,
          opacity: phase >= 1 && phase < 4 ? 1 : 0,
        }}
        transition={{ duration: 0.7, ease: EASE }}
      />
      <motion.circle
        r="0.72"
        fill={COOL(0.9)}
        initial={false}
        animate={{
          cx: phase >= 2 ? 49 : 30,
          cy: phase >= 2 ? 58 : 62,
          opacity: phase >= 2 && phase < 4 ? 1 : 0,
        }}
        transition={{ duration: 0.7, ease: EASE }}
      />
      <motion.circle
        r="0.82"
        fill={EMBER(0.98)}
        initial={false}
        animate={{
          cx: phase >= 4 ? 72 : 56,
          cy: 50,
          opacity: phase >= 4 ? 1 : 0,
        }}
        transition={{ duration: 0.7, ease: EASE }}
      />
    </svg>
  );
}

function DataColumn({ phase }: { phase: number }) {
  const active = phase >= 1;

  return (
    <Panel title="database context" note="same file" className="min-h-[26rem] xl:min-h-[28rem]">
      <div className="space-y-2.5">
        {DATA_ROWS.map((row, i) => {
          const on = active || phase >= i + 1;
          return (
            <motion.div
              key={row.name}
              className="rounded-md border px-3 py-2"
              style={{
                borderColor: on ? row.tone : 'var(--color-line)',
                background: on
                  ? `color-mix(in srgb, ${row.tone} 10%, var(--color-panel))`
                  : 'var(--color-panel)',
              }}
              initial={false}
              animate={{ opacity: on ? 1 : 0.5, x: on ? 0 : -8 }}
              transition={{ duration: 0.34, delay: active ? i * 0.06 : 0, ease: EASE }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="rounded px-1.5 font-mono text-mono-sm"
                  style={{ background: row.tone, color: 'var(--color-void)' }}
                >
                  {row.kind}
                </span>
                <span className="min-w-0 truncate font-mono text-mono-sm text-ink-hi">
                  {row.name}
                </span>
                <span className="ml-auto whitespace-nowrap font-mono text-mono-sm text-ink-low">
                  {row.meta}
                </span>
              </div>
              <div className="mt-2 truncate font-mono text-mono-sm text-ink-mid">{row.value}</div>
            </motion.div>
          );
        })}
      </div>
      <div className="mt-4 border-t border-line pt-3 font-mono text-mono-sm text-ink-low">
        query: <span className="text-ink-hi">why did portfolio.value move?</span>
      </div>
    </Panel>
  );
}

function InferenceCore({ phase }: { phase: number }) {
  const activeCapability =
    phase <= 1 ? 'capability' : phase === 2 ? 'embed' : phase === 3 ? 'rank' : 'generate';

  return (
    <div className="flex min-h-[26rem] flex-col justify-between rounded-lg border border-line bg-raised/70 p-3 xl:min-h-[28rem] xl:p-4">
      <div className="text-center">
        <div className="font-mono text-mono-sm uppercase text-ink-low">native layer</div>
        <motion.div
          className="mx-auto mt-3 flex h-28 w-full max-w-48 flex-col items-center justify-center rounded-lg border px-4 text-center xl:h-32"
          style={{
            borderColor: EMBER(0.34),
            background: `radial-gradient(70% 90% at 50% 0%, ${EMBER(0.16)}, transparent 70%), var(--color-inset)`,
            boxShadow: `0 0 72px -28px ${EMBER(0.62)}`,
          }}
          initial={false}
          animate={{ scale: phase >= 1 && phase <= 4 ? 1.03 : 1 }}
          transition={{ duration: 0.4, ease: EASE }}
        >
          <span className="font-mono text-mono-body text-ink-hi">inference</span>
          <span className="mt-1 text-small text-ink-mid">runs beside storage</span>
        </motion.div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {CAPABILITIES.map((cap) => {
          const on = cap.label === activeCapability || (phase === 0 && cap.phase === 0);
          return (
            <motion.div
              key={cap.label}
              className="rounded-md border px-2.5 py-2"
              style={{
                borderColor: on ? EMBER(0.4) : 'var(--color-line)',
                background: on ? EMBER(0.1) : 'var(--color-panel)',
              }}
              initial={false}
              animate={{ opacity: on ? 1 : 0.56, y: on ? 0 : 3 }}
              transition={{ duration: 0.26, ease: EASE }}
            >
              <div className="font-mono text-mono-sm text-ink-hi">{cap.label}</div>
              <div className="mt-0.5 font-mono text-mono-sm text-ink-low">{cap.detail}</div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 rounded-md border border-line bg-inset px-3 py-2 font-mono text-mono-sm">
        <span className="text-terracotta-400">operation</span>
        <div className="mt-1 text-ink-hi">{OPERATIONS[phase]}</div>
      </div>
    </div>
  );
}

function AnswerStream({
  started,
  complete,
  live,
}: {
  started: boolean;
  complete: boolean;
  live: boolean;
}) {
  const [n, setN] = useState(() => (live ? 0 : ANSWER_WORDS.length));

  useEffect(() => {
    if (!live || complete) {
      setN(ANSWER_WORDS.length);
      return;
    }
    if (!started) {
      setN(0);
      return;
    }
    setN(0);
    let i = 0;
    let timer: number;
    const tick = () => {
      i += 1;
      setN(i);
      if (i < ANSWER_WORDS.length) timer = window.setTimeout(tick, 34 + Math.random() * 46);
    };
    timer = window.setTimeout(tick, 160);
    return () => window.clearTimeout(timer);
  }, [started, complete, live]);

  const streaming = live && started && !complete && n < ANSWER_WORDS.length;

  return (
    <div className="min-h-[5.75rem] text-body text-ink-mid xl:min-h-[7rem]">
      {ANSWER_WORDS.slice(0, n).join(' ')}
      {streaming && (
        <span
          className="ml-1 inline-block h-[1.05em] w-[0.55ch] translate-y-[3px] bg-ink-mid/70"
          aria-hidden="true"
        />
      )}
    </div>
  );
}

function AnswerColumn({ phase, live }: { phase: number; live: boolean }) {
  const ranked = phase >= 3;
  const generating = phase >= 4;

  return (
    <Panel title="grounded answer" note="ranked context" className="min-h-[26rem] xl:min-h-[28rem]">
      <div className="rounded-md border border-line bg-inset p-3">
        <div className="font-mono text-mono-sm text-ink-low">ask</div>
        <div className="mt-1 text-body text-ink-hi">Why did portfolio.value move?</div>
      </div>

      <div className="mt-4 space-y-2.5">
        {CONTEXT_ROWS.map((row, i) => {
          const on = ranked;
          return (
            <motion.div
              key={row.label}
              className="rounded-md border border-line bg-panel px-3 py-2"
              initial={false}
              animate={{ opacity: on ? 1 : 0.42, y: on ? 0 : 8 }}
              transition={{ duration: 0.34, delay: on ? i * 0.08 : 0, ease: EASE }}
            >
              <div className="flex items-center gap-2 font-mono text-mono-sm">
                <span className="text-terracotta-300">{row.source}</span>
                <span className="min-w-0 truncate text-ink-hi">{row.label}</span>
                <span className="ml-auto text-ink-low">{row.score.toFixed(2)}</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-raised">
                <motion.div
                  className="h-full rounded-full bg-terracotta-500"
                  initial={false}
                  animate={{ width: on ? `${row.score * 100}%` : '8%' }}
                  transition={{ duration: 0.56, delay: on ? i * 0.08 : 0, ease: EASE }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 rounded-md border border-line bg-panel p-3">
        <div className="mb-2 flex items-center gap-2 font-mono text-mono-sm">
          <span className="text-terracotta-300">generate</span>
          <span className="text-ink-low">openai:gpt-4o-mini</span>
        </div>
        <AnswerStream started={generating} complete={!live || phase > 4} live={live} />
      </div>
    </Panel>
  );
}

function ProviderRail({ phase }: { phase: number }) {
  return (
    <div className="mt-3 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-4 xl:mt-4">
      {PROVIDERS.map((provider) => {
        const on = provider.active.includes(phase);
        return (
          <motion.div
            key={provider.label}
            className="bg-panel px-3 py-1.5 xl:py-3"
            initial={false}
            animate={{ opacity: on ? 1 : 0.58 }}
            transition={{ duration: 0.28, ease: EASE }}
          >
            <div className="font-mono text-mono-sm text-ink-hi">{provider.label}</div>
            <div className="mt-0.5 hidden font-mono text-mono-sm text-ink-low xl:block">
              {provider.detail}
            </div>
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
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  const live = seen && !reduced;
  const beat = useBeats([520, 900, 980, 1040 + T(COMMANDS.generate) / 5], live);
  const phase = phaseFor(beat);
  const phaseInfo = PHASES[phase];

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
          className="flex min-h-11 flex-wrap items-center gap-x-4 gap-y-1 border-b border-line px-5 py-2 xl:min-h-12 xl:py-3"
          style={{ background: EMBER(0.04) }}
        >
          <span className="font-mono text-mono-body text-ink-hi">native inference pipeline</span>
          <span className="font-mono text-mono-sm text-ink-low">
            embed · rank · generate · tokenize
          </span>
          <span className="font-mono text-mono-sm text-terracotta-400">{phaseInfo.label}</span>
          <span className="ml-auto font-mono text-mono-sm text-ink-low">strata · main</span>
        </div>

        <div
          className="relative overflow-hidden p-3 xl:p-5"
          style={{
            backgroundColor: 'var(--color-inset)',
            backgroundImage: `radial-gradient(circle at 1px 1px, ${INK(0.04)} 1px, transparent 1.6px), radial-gradient(58% 68% at 55% 42%, ${EMBER(0.08)}, transparent 72%)`,
            backgroundSize: '22px 22px, 100% 100%',
          }}
        >
          <FlowField phase={phase} />
          <div className="relative grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(11rem,0.7fr)_minmax(0,1.1fr)] xl:grid-cols-[minmax(0,1fr)_minmax(14rem,0.82fr)_minmax(0,1.1fr)]">
            <DataColumn phase={phase} />
            <InferenceCore phase={phase} />
            <AnswerColumn phase={phase} live={live} />
          </div>
          <ProviderRail phase={phase} />
        </div>
      </div>
    </div>
  );
}
