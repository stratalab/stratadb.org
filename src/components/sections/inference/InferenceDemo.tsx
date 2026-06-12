// Section 5 demo (04 §6): the H2's question, typed and answered. Plays once.
// Choreographed permanently (scoped 2026-06-11); authored against the seed world,
// so the answer shown is the answer the engine gives (transcript-verified at cutover).
import { useEffect, useRef, useState } from 'react';
import { useInView } from 'motion/react';

const QUERY = 'What changed before the deploy failed?';

// Each result is true in src/data/seed.ts — the deploy-failure narrative.
// Ticks wear the page's one temperature (five-hue coding retired
// 2026-06-12); the primitive NAME does the differentiating.
const RESULTS = [
  {
    primitive: 'event',
    color: 'var(--color-terracotta-400)',
    title: 'deploys · config.update',
    body: 'config.theme → "dusk" · 2026-06-10 09:30:02 — 90s before deploy.fail',
  },
  {
    primitive: 'kv',
    color: 'var(--color-terracotta-400)',
    title: 'config.theme · v2',
    body: '"dusk" — written 2026-06-10 09:31:47, the last write before the failure',
  },
  {
    primitive: 'vector',
    color: 'var(--color-terracotta-400)',
    title: 'docs · d1 (0.91)',
    body: 'Deploys read config.theme at startup; invalid values fail the healthcheck.',
  },
];

const KEY_MIN = 24;
const KEY_JITTER = 16;

export default function InferenceDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.5 });
  const [typed, setTyped] = useState(QUERY); // SSR first frame: completed
  const [shown, setShown] = useState(RESULTS.length);
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current) return;
    if (document.documentElement.dataset.motion === 'reduced') return; // stay completed
    started.current = true;
    let cancelled = false;
    (async () => {
      const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
      setTyped('');
      setShown(0);
      await sleep(400);
      for (let i = 1; i <= QUERY.length; i++) {
        if (cancelled) return;
        setTyped(QUERY.slice(0, i));
        await sleep(KEY_MIN + Math.random() * KEY_JITTER);
      }
      await sleep(300);
      for (let i = 1; i <= RESULTS.length; i++) {
        if (cancelled) return;
        setShown(i);
        await sleep(120);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [inView]);

  return (
    <div ref={ref}>
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
          <span className="ml-2 font-mono text-mono-sm text-ink-low">db.search</span>
        </div>
        <div className="bg-inset p-4">
          <div className="flex items-center gap-2 rounded-(--radius-control) border border-line bg-panel px-3 py-2.5">
            <svg className="h-4 w-4 shrink-0 text-ink-low" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" strokeLinecap="round" />
            </svg>
            <span className="font-mono text-mono-sm text-ink-hi">
              {typed}
              {typed.length < QUERY.length && <span className="term-cursor" aria-hidden="true" />}
            </span>
          </div>
          <ul className="mt-3 space-y-2" role="list" aria-live="polite">
            {RESULTS.slice(0, shown).map((r) => (
              <li
                key={r.primitive}
                className="rounded-(--radius-control) border border-line bg-panel p-3"
                style={{ borderLeft: `2px solid ${r.color}` }}
              >
                <p className="font-mono text-mono-sm text-ink-hi">
                  <span className="text-ink-low">{r.primitive}</span> · {r.title}
                </p>
                <p className="mt-1 text-small text-ink-mid">{r.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
