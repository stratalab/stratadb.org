// Set-piece A: the forking terminal (04 §2). Scripted executor at launch;
// the WasmExecutor swap (R8) replaces the runner, not this view.
// Panel chrome MUST stay visually identical to chrome/TerminalFrame.astro.
import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence, useInView } from 'motion/react';
import {
  completedState,
  type ScriptEvent,
  type TerminalState,
  type TermLineData,
  type PanelId,
} from '../../../lib/engine/types';
import { HERO_SCRIPT, HERO_HOLD_MS } from '../../../lib/engine/heroScript';

// 03 §1 spring-settle — panels splitting/joining
const springSettle = { type: 'spring' as const, stiffness: 260, damping: 26 };
// 03 §2 typing clock
const KEY_MIN = 24;
const KEY_JITTER = 16;
const OUTPUT_BEAT = 300;

const EMPTY: TerminalState = { main: [], fork: [], split: false, merged: false };
const DONE = completedState(HERO_SCRIPT);

function Line({ line }: { line: TermLineData }) {
  if (line.kind === 'cmd')
    return (
      <div className="whitespace-pre-wrap">
        <span className="text-ink-low">strata:{line.branch} </span>
        <span className="text-terracotta-500">›</span>
        <span className="text-ink-hi"> {line.text}</span>
      </div>
    );
  const tone =
    line.tone === 'ok'
      ? 'text-ok'
      : line.tone === 'nil'
        ? 'text-ink-low'
        : line.tone === 'err'
          ? 'text-err'
          : 'text-ink-mid';
  return <div className={`whitespace-pre-wrap ${tone}`}>{line.text}</div>;
}

function Panel({
  title,
  status,
  lines,
  cursorBranch,
  typed,
}: {
  title: string;
  status?: string;
  lines: TermLineData[];
  cursorBranch?: string;
  typed?: string;
}) {
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
        <span className="ml-2 font-mono text-mono-sm text-ink-low">{title}</span>
        {status && <span className="ml-auto font-mono text-mono-sm text-ink-low">{status}</span>}
      </div>
      <div
        className="min-h-56 bg-inset p-4 font-mono text-mono-body text-ink-mid"
        role="log"
        aria-live="polite"
      >
        {lines.map((line, i) => (
          <Line key={i} line={line} />
        ))}
        {typed !== undefined && (
          <div className="whitespace-pre-wrap">
            <span className="text-ink-low">strata:{cursorBranch} </span>
            <span className="text-terracotta-500">›</span>
            <span className="text-ink-hi"> {typed}</span>
            <span className="term-cursor" aria-hidden="true" />
          </div>
        )}
      </div>
    </div>
  );
}

export default function ForkingTerminal() {
  // SSR first frame = completed state (03 §7); hydration resets and plays.
  const [state, setState] = useState<TerminalState>(DONE);
  const [typing, setTyping] = useState<{ panel: PanelId; branch: string; text: string } | null>(null);
  const [playing, setPlaying] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [fading, setFading] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { amount: 0.5 });
  const runToken = useRef(0);
  const playingRef = useRef(true);
  const inViewRef = useRef(false);
  playingRef.current = playing;
  inViewRef.current = inView;

  useEffect(() => {
    setReduced(document.documentElement.dataset.motion === 'reduced');
  }, []);

  const sleep = useCallback(async (ms: number, token: number) => {
    const step = 40;
    let waited = 0;
    while (waited < ms) {
      if (runToken.current !== token) throw new Error('cancelled');
      await new Promise((r) => setTimeout(r, step));
      if (playingRef.current && inViewRef.current) waited += step;
    }
  }, []);

  const run = useCallback(
    async (token: number) => {
      try {
        setFading(true);
        await sleep(320, token);
        setState(EMPTY);
        setTyping(null);
        setFading(false);
        await sleep(400, token);

        for (const e of HERO_SCRIPT) {
          if (runToken.current !== token) return;
          if (e.type === 'cmd') {
            for (let i = 1; i <= e.text.length; i++) {
              setTyping({ panel: e.panel, branch: e.branch, text: e.text.slice(0, i) });
              await sleep(KEY_MIN + Math.random() * KEY_JITTER, token);
            }
            await sleep(OUTPUT_BEAT, token);
            setTyping(null);
            setState((s) => ({
              ...s,
              [e.panel]: [...s[e.panel], { kind: 'cmd', text: e.text, branch: e.branch }],
            }));
          } else if (e.type === 'output') {
            setState((s) => ({
              ...s,
              [e.panel]: [...s[e.panel], { kind: 'output', text: e.text, tone: e.tone }],
            }));
            await sleep(OUTPUT_BEAT, token);
          } else if (e.type === 'split') {
            setState((s) => ({ ...s, split: true }));
          } else if (e.type === 'merge') {
            setState((s) => ({ ...s, merged: true, split: false }));
          } else if (e.type === 'pause') {
            await sleep(e.ms, token);
          }
        }
        await sleep(HERO_HOLD_MS, token);
        if (runToken.current === token) run(++runToken.current);
      } catch {
        /* cancelled */
      }
    },
    [sleep]
  );

  // Start the loop once: first time in view, non-reduced.
  const started = useRef(false);
  useEffect(() => {
    if (started.current || reduced || !inView) return;
    started.current = true;
    run(++runToken.current);
    return () => {
      runToken.current++;
    };
  }, [inView, reduced, run]);

  const showFork = state.split || (reduced && DONE.split);
  const typedFor = (panel: PanelId) =>
    typing?.panel === panel ? { typed: typing.text, cursorBranch: typing.branch } : {};

  return (
    <div ref={rootRef} className="relative">
      <motion.div
        layout
        animate={{ opacity: fading ? 0 : 1 }}
        transition={{ duration: 0.32 }}
        className={`grid items-start gap-6 ${showFork ? 'md:grid-cols-2' : 'grid-cols-1'}`}
      >
        <motion.div layout transition={springSettle}>
          <Panel
            title="strata"
            status="engine: scripted replay"
            lines={state.main}
            {...typedFor('main')}
          />
        </motion.div>
        <AnimatePresence>
          {showFork && (
            <motion.div
              layout
              initial={{ opacity: 0, x: 24, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24, scale: 0.98 }}
              transition={springSettle}
            >
              <Panel title="experiment" lines={state.fork} {...typedFor('fork')} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* branch line: spans the gap while forked (desktop) */}
      <AnimatePresence>
        {showFork && (
          <motion.svg
            className="pointer-events-none absolute left-1/2 top-10 hidden h-12 w-12 -translate-x-1/2 md:block"
            viewBox="0 0 48 48"
            fill="none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-hidden="true"
          >
            <motion.path
              d="M 2 40 C 18 40 30 8 46 8"
              stroke="var(--color-terracotta-500)"
              strokeWidth="1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6 }}
            />
          </motion.svg>
        )}
      </AnimatePresence>

      {!reduced && (
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          className="absolute -bottom-10 right-0 rounded-(--radius-control) border border-line px-3 py-1.5 font-mono text-mono-sm text-ink-low transition-colors duration-200 hover:border-line-hover hover:text-ink-mid"
          aria-pressed={!playing}
        >
          {playing ? 'pause' : 'play'}
        </button>
      )}
    </div>
  );
}
