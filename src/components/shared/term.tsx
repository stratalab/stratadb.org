// The shared terminal kit (05 §5, extracted 2026-06-12): one beat clock,
// one typing law (03 §2: commands are typed, output is printed), one card
// material (ember border, bloom, header wash, dot-grid body). Used by the
// primitives tabs and the inference demo so every terminal on the page
// speaks identical language.
import { useEffect, useState, type ReactNode } from 'react';
import { motion } from 'motion/react';

export const EASE = [0.16, 1, 0.3, 1] as const;
export const EMBER = (a: number) => `rgba(255, 122, 82, ${a})`;
export const COOL = (a: number) => `rgba(124, 170, 255, ${a})`;

// Typing time for a command (03 §2: 24–40ms jittered) + a settle beat.
export const T = (cmd: string) => Math.round(cmd.length * 30) + 500;

// ---- beats: a per-demo step clock ----------------------------------------
// live=false (SSR, reduced motion, out of view) pins the final frame; when
// live flips true the sequence replays from zero.
export function useBeats(delays: number[], live: boolean) {
  const [beat, setBeat] = useState(live ? 0 : delays.length);
  useEffect(() => {
    if (!live) {
      setBeat(delays.length);
      return;
    }
    setBeat(0);
    const timers: number[] = [];
    let acc = 0;
    delays.forEach((d, i) => {
      acc += d;
      timers.push(window.setTimeout(() => setBeat(i + 1), acc));
    });
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [live]);
  return beat;
}

// ---- typed commands --------------------------------------------------------
export function useTyped(text: string, live: boolean, start: boolean) {
  const [n, setN] = useState(() => (live ? 0 : text.length));
  useEffect(() => {
    if (!live) {
      setN(text.length);
      return;
    }
    if (!start) {
      setN(0);
      return;
    }
    setN(0);
    let i = 0;
    let t: number;
    const tick = () => {
      i += 1;
      setN(i);
      if (i < text.length) t = window.setTimeout(tick, 24 + Math.random() * 16);
    };
    t = window.setTimeout(tick, 120);
    return () => window.clearTimeout(t);
  }, [live, start]);
  return n;
}

export function Cmd({ branch = 'main', cmd, on, live }: { branch?: string; cmd: string; on: boolean; live: boolean }) {
  const n = useTyped(cmd, live, on);
  const typing = live && on && n < cmd.length;
  return (
    // invisible (not display:none) — the line reserves its height, so
    // nothing below shifts when it lands; hidden lines stay out of the
    // a11y tree.
    <div className={on ? '' : 'invisible'}>
      <span className="text-ink-low">strata:{branch} </span>
      <span className="text-terracotta-500">›</span>
      <span className="text-ink-hi"> {cmd.slice(0, n)}</span>
      {typing && (
        <span className="ml-px inline-block h-[1.05em] w-[0.55ch] translate-y-[3px] bg-ink-hi/80" aria-hidden="true" />
      )}
    </div>
  );
}

// One enter treatment for every OUTPUT line: flash in, settle.
export function Line({ on, children, className = '' }: { on: boolean; children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial={false}
      animate={{ opacity: on ? 1 : 0, y: on ? 0 : 6, visibility: on ? 'visible' : 'hidden' }}
      transition={{ duration: 0.32, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// The card material: neutral panel, the page's one temperature — ember dot,
// ember header wash, ember bloom, graph-paper body.
export function TermCard({
  title,
  children,
  bodyClassName = '',
}: {
  title: string;
  children: ReactNode;
  bodyClassName?: string;
}) {
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
        <span className="font-mono text-mono-body text-ink-hi">{title}</span>
        <span className="ml-auto font-mono text-mono-sm text-ink-low">strata · main</span>
      </div>
      <div
        className={`p-6 font-mono text-mono-body leading-8 md:p-8 md:text-[1.0625rem] md:leading-9 ${bodyClassName}`}
        style={{
          backgroundColor: 'var(--color-inset)',
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.04) 1px, transparent 1.6px), linear-gradient(180deg, ${EMBER(0.035)}, transparent 38%)`,
          backgroundSize: '22px 22px, 100% 100%',
        }}
      >
        {children}
      </div>
    </div>
  );
}
