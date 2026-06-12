// The five doors (04 §8 v2): humans and agents install in the same place.
// tablist/tab/tabpanel + arrow keys; selection persists in sessionStorage
// (05 §3). v2 (2026-06-12): the page's material (ember border, bloom,
// graph-paper wells) and every command line carries its own copy button —
// the act surface acts. Every command string is subject to build-time
// transcript verification.
import { useEffect, useState, type KeyboardEvent } from 'react';
import { EMBER } from '../../shared/term';

const TABS = [
  {
    id: 'python',
    label: 'Python',
    lines: [
      { text: '$ pip install stratadb', cmd: true },
      { text: '' },
      { text: 'from stratadb import Strata' },
      { text: 'db = Strata.open("./mydb")' },
      { text: 'db.kv.put("hello", "world")' },
      { text: 'db.kv.get("hello")          # "world"', dim: true },
    ],
  },
  {
    id: 'cli',
    label: 'CLI',
    lines: [
      { text: '$ cargo install strata-cli', cmd: true },
      { text: '$ curl -fsSL stratadb.org/install.sh | sh', cmd: true, dim: true },
      { text: '' },
      { text: '$ strata --cache', cmd: true },
      { text: 'strata:main › kv put hello world' },
      { text: '(version) 1', dim: true },
      { text: 'strata:main › kv get hello' },
      { text: '"world"', dim: true },
    ],
  },
  {
    id: 'node',
    label: 'Node.js',
    lines: [
      { text: '$ npm install @stratadb/core', cmd: true },
      { text: '' },
      { text: 'import { Strata } from "@stratadb/core";' },
      { text: 'const db = await Strata.open("./mydb");' },
      { text: 'await db.kv.put("hello", "world");' },
      { text: 'await db.kv.get("hello"); // "world"', dim: true },
    ],
  },
  {
    id: 'foundry',
    label: 'Foundry',
    body: {
      text: 'The desktop studio — browse keys, switch branches, diff and merge visually. It is the window in section 03, the one the primitives live in. macOS first; Windows and Linux follow.',
      cta: { label: 'Star strata-foundry →', href: 'https://github.com/stratalab/strata-foundry' },
      note: 'Release builds are coming; watching the repo gets you notified.',
    },
  },
  {
    id: 'mcp',
    label: 'MCP',
    lines: [
      { text: '{' },
      { text: '  "mcpServers": {' },
      { text: '    "stratadb": {' },
      { text: '      "command": "strata-mcp",' },
      { text: '      "args": ["/path/to/data"]' },
      { text: '    }' },
      { text: '  }' },
      { text: '}' },
    ],
    copyAll: true,
    agent: true,
  },
] as const;

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

// A command line that carries its own copy button (hover/focus reveal).
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

export default function InstallTabs() {
  const [active, setActive] = useState('python');
  const [allDone, copyAll] = useCopied();

  useEffect(() => {
    const saved = sessionStorage.getItem('install-tab');
    if (saved && TABS.some((t) => t.id === saved)) setActive(saved);
  }, []);

  const select = (id: string) => {
    setActive(id);
    sessionStorage.setItem('install-tab', id);
  };

  const onKey = (e: KeyboardEvent) => {
    const i = TABS.findIndex((t) => t.id === active);
    if (e.key === 'ArrowRight') select(TABS[(i + 1) % TABS.length].id);
    if (e.key === 'ArrowLeft') select(TABS[(i - 1 + TABS.length) % TABS.length].id);
  };

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
        role="tablist"
        aria-label="Install"
        className="flex overflow-x-auto"
        style={{ borderBottom: `1px solid ${EMBER(0.14)}`, background: EMBER(0.04) }}
        onKeyDown={onKey}
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={active === t.id}
            aria-controls={`panel-${t.id}`}
            tabIndex={active === t.id ? 0 : -1}
            onClick={() => select(t.id)}
            className={`px-5 py-3 text-small font-medium transition-colors duration-200 max-[480px]:px-3 ${
              active === t.id
                ? 'text-ink-hi underline decoration-terracotta-500 decoration-2 underline-offset-[14px]'
                : 'text-ink-low hover:text-ink-mid'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {TABS.map((t) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`panel-${t.id}`}
          aria-labelledby={`tab-${t.id}`}
          hidden={active !== t.id}
          className="p-6"
          style={{
            backgroundColor: 'var(--color-inset)',
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.04) 1px, transparent 1.6px), linear-gradient(180deg, ${EMBER(0.03)}, transparent 38%)`,
            backgroundSize: '22px 22px, 100% 100%',
          }}
        >
          {'copyAll' in t && t.copyAll && 'lines' in t && t.lines ? (
            <div className="mb-2 flex justify-end">
              <button
                type="button"
                onClick={() => copyAll(t.lines.map((l) => l.text).join('\n'))}
                className="flex items-center gap-2 rounded-(--radius-control) border border-line px-2.5 py-1 font-mono text-mono-sm text-ink-mid transition-colors duration-200 hover:border-line-hover hover:text-ink-hi"
              >
                {allDone ? <span className="text-ok">✓ copied</span> : <>copy config <CopyIcon /></>}
              </button>
            </div>
          ) : null}
          {'lines' in t && t.lines ? (
            <pre className="overflow-x-auto font-mono text-mono-sm leading-7">
              {t.lines.map((l, i) =>
                'cmd' in l && l.cmd ? (
                  <CmdLine key={i} text={l.text} dim={'dim' in l && l.dim} />
                ) : (
                  <div key={i} className={'dim' in l && l.dim ? 'text-ink-low' : 'text-ink-mid'}>
                    {l.text || ' '}
                  </div>
                )
              )}
            </pre>
          ) : null}
          {'body' in t && t.body ? (
            <div className="space-y-4">
              <p className="max-w-[36rem] text-body text-ink-mid">{t.body.text}</p>
              <a
                href={t.body.cta.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-(--radius-control) border border-line px-4 py-2 text-small text-ink-hi transition-colors duration-200 hover:border-line-hover hover:bg-raised"
              >
                {t.body.cta.label}
              </a>
              <p className="text-small text-ink-low">{t.body.note}</p>
            </div>
          ) : null}
          {'agent' in t && t.agent ? (
            <div className="mt-4 border-t border-line pt-4">
              <p className="text-small text-ink-mid">
                Agents integrate StrataDB themselves — point yours at{' '}
                <span className="font-mono text-mono-sm text-ink-hi">stratadb.org/llms.txt</span> or the{' '}
                <a href="/docs/getting-started/for-agents" className="text-terracotta-500 hover:text-terracotta-400">
                  For AI agents
                </a>{' '}
                recipe.
              </p>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
