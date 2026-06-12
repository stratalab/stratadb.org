// The act surface, v3 (04 §8, 2026-06-12) — the mem0.ai steal, by Ani's
// call: INTEGRATION MODES first (Library · CLI · Desktop app · For
// agents), language pills inside the window chrome, and the code is a
// COMPLETE numbered quickstart with step comments — a script you paste
// and run, not a fragment. Copy-all in the corner; CLI keeps per-command
// copy buttons. Selection persists in sessionStorage (05 §3). Every
// command string is subject to build-time transcript verification.
import { useEffect, useState, type KeyboardEvent, type ReactNode } from 'react';
import { EMBER } from '../../shared/term';

// ---- hand-tokenized quickstarts (one world: the portfolio story) ----------
// tok classes: c=comment k=keyword s=string i=ink-hi (identifiers/calls)
type Tok = [cls: 'c' | 'k' | 's' | 'i' | null, text: string];
type Script = Tok[][];

const PY: Script = [
  [['c', '# Step 1 — install (run in your terminal, not in Python):']],
  [['c', '#   pip install stratadb']],
  [],
  [['c', '# Step 2 — save as quickstart.py and run: python quickstart.py']],
  [['k', 'from'], [null, ' stratadb '], ['k', 'import'], [null, ' Strata']],
  [],
  [[null, 'db = Strata.'], ['i', 'open'], [null, '('], ['s', '"./quickstart.strata"'], [null, ')  '], ['c', '# one file, no server']],
  [],
  [[null, 'db.kv.'], ['i', 'put'], [null, '('], ['s', '"portfolio.value"'], [null, ', 98400)']],
  [[null, 'db.kv.'], ['i', 'put'], [null, '('], ['s', '"portfolio.value"'], [null, ', 111080)  '], ['c', '# every write keeps its past']],
  [],
  [['i', 'print'], [null, '(db.kv.'], ['i', 'get'], [null, '('], ['s', '"portfolio.value"'], [null, '))      '], ['c', '# 111080']],
  [['i', 'print'], [null, '(db.kv.'], ['i', 'history'], [null, '('], ['s', '"portfolio.value"'], [null, '))  '], ['c', '# v2: 111080 · v1: 98400']],
];

const JS: Script = [
  [['c', '// Step 1 — install (run in your terminal):']],
  [['c', '//   npm install @stratadb/core']],
  [],
  [['c', '// Step 2 — save as quickstart.mjs and run: node quickstart.mjs']],
  [['k', 'import'], [null, ' { Strata } '], ['k', 'from'], [null, ' '], ['s', '"@stratadb/core"'], [null, ';']],
  [],
  [['k', 'const'], [null, ' db = '], ['k', 'await'], [null, ' Strata.'], ['i', 'open'], [null, '('], ['s', '"./quickstart.strata"'], [null, ');  '], ['c', '// one file']],
  [],
  [['k', 'await'], [null, ' db.kv.'], ['i', 'put'], [null, '('], ['s', '"portfolio.value"'], [null, ', 98400);']],
  [['k', 'await'], [null, ' db.kv.'], ['i', 'put'], [null, '('], ['s', '"portfolio.value"'], [null, ', 111080);  '], ['c', '// history kept']],
  [],
  [['i', 'console.log'], [null, '('], ['k', 'await'], [null, ' db.kv.'], ['i', 'get'], [null, '('], ['s', '"portfolio.value"'], [null, '));      '], ['c', '// 111080']],
  [['i', 'console.log'], [null, '('], ['k', 'await'], [null, ' db.kv.'], ['i', 'history'], [null, '('], ['s', '"portfolio.value"'], [null, '));  '], ['c', '// v2 · v1']],
];

const CLI_LINES = [
  { text: '$ cargo install strata-cli', cmd: true },
  { text: '$ curl -fsSL stratadb.org/install.sh | sh', cmd: true, dim: true },
  { text: '' },
  { text: '$ strata --cache', cmd: true },
  { text: 'strata:main › kv put hello world' },
  { text: '(version) 1', dim: true },
  { text: 'strata:main › kv get hello' },
  { text: '"world"', dim: true },
];

const MCP_JSON = [
  '{',
  '  "mcpServers": {',
  '    "stratadb": {',
  '      "command": "strata-mcp",',
  '      "args": ["/path/to/data"]',
  '    }',
  '  }',
  '}',
];

const AGENT_INSTRUCTION =
  'Set up StrataDB in this project by following the instructions at https://stratadb.org/docs/getting-started/for-agents.md — report the verification output when done.';

const scriptText = (s: Script) => s.map((line) => line.map(([, t]) => t).join('')).join('\n');

const TOK_CLS: Record<string, string> = {
  c: 'text-ink-low',
  k: 'text-terracotta-300',
  s: 'text-strata-json',
  i: 'text-ink-hi',
};

const MODES = [
  { id: 'library', label: 'Library' },
  { id: 'cli', label: 'CLI' },
  { id: 'foundry', label: 'Desktop app' },
  { id: 'agents', label: 'For agents' },
] as const;
type ModeId = (typeof MODES)[number]['id'];

const MODE_ICONS: Record<ModeId, ReactNode> = {
  library: <path d="M8 6 4 12l4 6M16 6l4 6-4 6" />,
  cli: <path d="M4 17l6-5-6-5M13 19h7" />,
  foundry: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18M7 6.5h.01" />
    </>
  ),
  agents: <path d="M12 3v3m0 12v3M3 12h3m12 0h3M7 7l2 2m6 6 2 2m0-10-2 2m-6 6-2 2" />,
};

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </svg>
  );
}

function useCopied(): [boolean, (text: string) => void] {
  const [done, setDone] = useState(false);
  const copy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setDone(true);
    window.setTimeout(() => setDone(false), 1600);
  };
  return [done, copy];
}

function CopyAllButton({ text, label = 'copy' }: { text: string; label?: string }) {
  const [done, copy] = useCopied();
  return (
    <button
      type="button"
      onClick={() => copy(text)}
      className="flex items-center gap-1.5 rounded-(--radius-control) border border-line px-2 py-1 font-mono text-mono-sm text-ink-mid transition-colors duration-200 hover:border-line-hover hover:text-ink-hi"
      aria-label={`Copy ${label}`}
    >
      {done ? <span className="text-ok">✓</span> : <CopyIcon />}
      <span className="max-sm:hidden">{done ? 'copied' : label}</span>
    </button>
  );
}

// A command line carrying its own copy button (hover/focus reveal).
function CmdLine({ text, dim }: { text: string; dim?: boolean }) {
  const [done, copy] = useCopied();
  const cmd = text.replace(/^\$\s*/, '');
  return (
    <div className="group -mx-2 flex items-baseline justify-between gap-3 rounded px-2 transition-colors duration-200 hover:bg-raised/60">
      <span className={dim ? 'text-ink-mid' : 'text-ink-hi'}>{text}</span>
      <button
        type="button"
        onClick={() => copy(cmd)}
        className="self-center text-ink-low opacity-0 transition-opacity duration-200 hover:text-ink-hi focus-visible:opacity-100 group-hover:opacity-100"
        aria-label={`Copy: ${cmd}`}
      >
        {done ? <span className="font-mono text-mono-sm text-ok">✓</span> : <CopyIcon />}
      </button>
    </div>
  );
}

// The numbered quickstart (the mem0 pattern): line numbers, step comments,
// a script you paste and run.
function NumberedScript({ script }: { script: Script }) {
  return (
    <pre className="overflow-x-auto font-mono text-mono-sm leading-7">
      {script.map((line, i) => (
        <div key={i} className="grid grid-cols-[2.25rem_1fr]">
          <span className="select-none pr-3 text-right text-ink-low" aria-hidden="true">
            {i + 1}
          </span>
          <code>
            {line.length === 0
              ? ' '
              : line.map(([cls, text], j) => (
                  <span key={j} className={cls ? TOK_CLS[cls] : 'text-ink-mid'}>
                    {text}
                  </span>
                ))}
          </code>
        </div>
      ))}
    </pre>
  );
}

export default function InstallTabs() {
  const [mode, setMode] = useState<ModeId>('library');
  const [lang, setLang] = useState<'py' | 'js'>('py');

  useEffect(() => {
    const m = sessionStorage.getItem('install-mode') as ModeId | null;
    if (m && MODES.some((t) => t.id === m)) setMode(m);
    const l = sessionStorage.getItem('install-lang');
    if (l === 'py' || l === 'js') setLang(l);
  }, []);

  const selectMode = (id: ModeId) => {
    setMode(id);
    sessionStorage.setItem('install-mode', id);
  };
  const selectLang = (l: 'py' | 'js') => {
    setLang(l);
    sessionStorage.setItem('install-lang', l);
  };

  const onModeKeys = (e: KeyboardEvent) => {
    const i = MODES.findIndex((t) => t.id === mode);
    if (e.key === 'ArrowRight') selectMode(MODES[(i + 1) % MODES.length].id);
    if (e.key === 'ArrowLeft') selectMode(MODES[(i - 1 + MODES.length) % MODES.length].id);
  };

  const script = lang === 'py' ? PY : JS;
  const windowTitle =
    mode === 'library' ? (lang === 'py' ? 'quickstart.py' : 'quickstart.mjs') : mode === 'cli' ? 'terminal' : mode === 'foundry' ? 'Strata Foundry' : 'mcp.json';

  return (
    <div>
      {/* the integration modes — how you want in, not just which language */}
      <div
        role="tablist"
        aria-label="How do you want to install?"
        onKeyDown={onModeKeys}
        className="mb-4 flex w-fit max-w-full gap-1 overflow-x-auto rounded-(--radius-frame) border border-line bg-panel p-1"
      >
        {MODES.map((m) => (
          <button
            key={m.id}
            role="tab"
            id={`mode-${m.id}`}
            aria-selected={mode === m.id}
            aria-controls="install-panel"
            tabIndex={mode === m.id ? 0 : -1}
            onClick={() => selectMode(m.id)}
            className={`flex shrink-0 items-center gap-2 rounded-(--radius-card) px-4 py-2 text-small font-medium transition-colors duration-200 max-[480px]:px-3 ${
              mode === m.id ? 'bg-raised text-ink-hi' : 'text-ink-mid hover:text-ink-hi'
            }`}
            style={mode === m.id ? { boxShadow: `inset 0 0 0 1px ${EMBER(0.3)}` } : undefined}
          >
            <svg
              className="h-4 w-4 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke={mode === m.id ? 'var(--color-terracotta-400)' : 'currentColor'}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {MODE_ICONS[m.id]}
            </svg>
            {m.label}
          </button>
        ))}
      </div>

      {/* the window */}
      <div
        id="install-panel"
        role="tabpanel"
        aria-labelledby={`mode-${mode}`}
        className="overflow-hidden rounded-(--radius-frame)"
        style={{
          background: 'var(--color-panel)',
          border: `1px solid ${EMBER(0.22)}`,
          boxShadow: `var(--shadow-float), 0 0 110px -28px ${EMBER(0.35)}`,
        }}
      >
        <div
          className="flex h-12 items-center gap-2.5 px-4"
          style={{ borderBottom: `1px solid ${EMBER(0.14)}`, background: EMBER(0.04) }}
        >
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-ink-low/40" />
            <span className="h-2.5 w-2.5 rounded-full bg-ink-low/40" />
            <span className="h-2.5 w-2.5 rounded-full bg-ink-low/40" />
          </span>
          <span className="font-mono text-mono-sm text-ink-mid">{windowTitle}</span>
          <span className="ml-auto flex items-center gap-2">
            {mode === 'library' && (
              <span role="tablist" aria-label="Language" className="flex gap-1 rounded-(--radius-control) border border-line bg-inset p-0.5">
                {(['py', 'js'] as const).map((l) => (
                  <button
                    key={l}
                    role="tab"
                    aria-selected={lang === l}
                    onClick={() => selectLang(l)}
                    className={`rounded px-2.5 py-1 font-mono text-mono-sm transition-colors duration-200 ${
                      lang === l ? 'bg-raised text-ink-hi' : 'text-ink-low hover:text-ink-mid'
                    }`}
                  >
                    {l === 'py' ? 'Python' : 'Node.js'}
                  </button>
                ))}
              </span>
            )}
            {mode === 'library' && <CopyAllButton text={scriptText(script)} label="copy script" />}
            {mode === 'agents' && <CopyAllButton text={MCP_JSON.join('\n')} label="copy config" />}
          </span>
        </div>

        <div
          className="p-6"
          style={{
            backgroundColor: 'var(--color-inset)',
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.04) 1px, transparent 1.6px), linear-gradient(180deg, ${EMBER(0.03)}, transparent 38%)`,
            backgroundSize: '22px 22px, 100% 100%',
          }}
        >
          {mode === 'library' && <NumberedScript script={script} />}

          {mode === 'cli' && (
            <pre className="overflow-x-auto font-mono text-mono-sm leading-7">
              {CLI_LINES.map((l, i) =>
                'cmd' in l && l.cmd ? (
                  <CmdLine key={i} text={l.text} dim={'dim' in l && l.dim} />
                ) : (
                  <div key={i} className={'dim' in l && l.dim ? 'text-ink-low' : 'text-ink-mid'}>
                    {l.text || ' '}
                  </div>
                )
              )}
            </pre>
          )}

          {mode === 'foundry' && (
            <div className="space-y-4">
              <p className="max-w-[36rem] text-body text-ink-mid">
                The desktop studio — browse keys, switch branches, diff and merge visually. It is the window in
                section 03, the one the primitives live in. macOS first; Windows and Linux follow.
              </p>
              <a
                href="https://github.com/stratalab/strata-foundry"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-(--radius-control) border border-line px-4 py-2 text-small text-ink-hi transition-colors duration-200 hover:border-line-hover hover:bg-raised"
              >
                Star strata-foundry →
              </a>
              <p className="text-small text-ink-low">Release builds are coming; watching the repo gets you notified.</p>
            </div>
          )}

          {mode === 'agents' && (
            <div>
              <pre className="overflow-x-auto font-mono text-mono-sm leading-7">
                {MCP_JSON.map((l, i) => (
                  <div key={i} className="text-ink-mid">
                    {l}
                  </div>
                ))}
              </pre>
              <div className="mt-5 space-y-3 border-t border-line pt-4">
                <p className="text-small text-ink-mid">
                  Or skip the config — paste one instruction into your agent and it sets everything up itself:
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <CopyAllButton text={AGENT_INSTRUCTION} label="copy agent instructions" />
                  <span className="font-mono text-mono-sm text-ink-low">
                    points at <span className="text-ink-mid">stratadb.org/docs/getting-started/for-agents.md</span>
                  </span>
                </div>
                <p className="text-small text-ink-low">
                  Agents can also read{' '}
                  <span className="font-mono text-mono-sm text-ink-mid">stratadb.org/llms.txt</span> or the{' '}
                  <a href="/docs/getting-started/for-agents" className="text-terracotta-500 hover:text-terracotta-400">
                    For AI agents
                  </a>{' '}
                  recipe directly.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
