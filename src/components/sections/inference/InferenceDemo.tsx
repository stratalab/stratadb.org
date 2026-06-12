// Section 5 demo (04 §6 v2, 2026-06-12): the unified inference layer,
// demonstrated. Ani: databases usually don't have this — one built-in
// primitive for embeddings and generation, models from Hugging Face or
// OpenAI / Anthropic / Google, useful because an app that needs LLMs gets
// deployed in a bunch of places and the layer travels with the file.
// Three beats: embed (local HF model) → generate (data-aware, streamed
// from the seed world's deploy story) → switch provider, same call.
// Plays once per view; SSR renders the completed state; reduced motion
// shows final frames.
import { useEffect, useRef, useState } from 'react';
import { Cmd, Line, T, TermCard, useBeats } from '../../shared/term';

const C1 = 'infer embed "why did the deploy fail?"';
const C2 = 'infer generate "What changed before the deploy failed?" --model anthropic/claude';
const C3 = 'infer use openai/gpt-4o';

// Seed-true: config.update at 09:30:02, deploy.fail v2.3 healthcheck —
// the generation reads the world it lives in.
const GEN =
  'config.theme changed to "dusk" at 09:30:02 — ninety seconds before deploy v2.3 failed its healthcheck.';
const GEN_WORDS = GEN.split(' ');

// LLM output streams in word chunks — output printing (03 §2), at token
// rhythm. Height reserved: nothing below shifts while it streams.
function Stream({ on, live }: { on: boolean; live: boolean }) {
  const [n, setN] = useState(() => (live ? 0 : GEN_WORDS.length));
  useEffect(() => {
    if (!live) {
      setN(GEN_WORDS.length);
      return;
    }
    if (!on) {
      setN(0);
      return;
    }
    setN(0);
    let i = 0;
    let t: number;
    const tick = () => {
      i += 1;
      setN(i);
      if (i < GEN_WORDS.length) t = window.setTimeout(tick, 40 + Math.random() * 55);
    };
    t = window.setTimeout(tick, 260);
    return () => window.clearTimeout(t);
  }, [live, on]);
  const streaming = live && on && n < GEN_WORDS.length;
  return (
    <div className={`min-h-[4.5rem] text-ink-mid ${on ? '' : 'invisible'}`}>
      {GEN_WORDS.slice(0, n).join(' ')}
      {streaming && (
        <span className="ml-1 inline-block h-[1.05em] w-[0.55ch] translate-y-[3px] bg-ink-mid/70" aria-hidden="true" />
      )}
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
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  const live = seen && !reduced;
  const beat = useBeats([350, T(C1), 650, T(C2), 1900, T(C3)], live);

  return (
    <div ref={ref}>
      <TermCard title="infer" bodyClassName="min-h-[24rem]">
        <Cmd cmd={C1} on={beat >= 1} live={live} />
        <Line on={beat >= 2} className="[overflow-wrap:anywhere]">
          <span className="text-ink-hi">[ 0.0182, −0.0441, 0.0976, … ]</span>
          <span className="text-ink-mid"> · 384 dims · </span>
          <span className="text-terracotta-300">bge-small-en</span>
          <span className="text-ink-low"> (local)</span>
        </Line>
        <div className="mt-4">
          <Cmd cmd={C2} on={beat >= 3} live={live} />
        </div>
        <Stream on={beat >= 4} live={live} />
        <div className="mt-4">
          <Cmd cmd={C3} on={beat >= 5} live={live} />
        </div>
        <Line on={beat >= 6} className="text-ok">
          OK — same call, new model
        </Line>
        <Line on={beat >= 6} className="mt-4 text-mono-sm text-ink-low">
          wire it once — inference runs wherever the file does
        </Line>
      </TermCard>
      {/* the ruled footer, drafting voice */}
      <div className="mt-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-line pt-3 font-mono text-mono-sm text-ink-low">
        <span>
          <span className="text-terracotta-400">one layer</span> · embed, generate, search
        </span>
        <span>hugging face · openai · anthropic · google</span>
      </div>
    </div>
  );
}
