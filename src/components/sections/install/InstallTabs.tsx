// The five doors (04 §8): humans and agents install in the same place.
// tablist/tab/tabpanel + arrow keys; selection persists in sessionStorage (05 §3).
// Every command string is subject to build-time transcript verification.
import { useEffect, useState } from 'react';

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
      text: 'The desktop studio — browse keys, switch branches, diff and merge visually. macOS first; Windows and Linux follow.',
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
    agent: true,
  },
] as const;

export default function InstallTabs() {
  const [active, setActive] = useState('python');

  useEffect(() => {
    const saved = sessionStorage.getItem('install-tab');
    if (saved && TABS.some((t) => t.id === saved)) setActive(saved);
  }, []);

  const select = (id: string) => {
    setActive(id);
    sessionStorage.setItem('install-tab', id);
  };

  const onKey = (e: React.KeyboardEvent) => {
    const i = TABS.findIndex((t) => t.id === active);
    if (e.key === 'ArrowRight') select(TABS[(i + 1) % TABS.length].id);
    if (e.key === 'ArrowLeft') select(TABS[(i - 1 + TABS.length) % TABS.length].id);
  };

  const tab = TABS.find((t) => t.id === active)!;

  return (
    <div className="overflow-hidden rounded-(--radius-frame) border border-line bg-panel" style={{ boxShadow: 'var(--shadow-float)' }}>
      <div role="tablist" aria-label="Install" className="flex border-b border-line" onKeyDown={onKey}>
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
          className="bg-inset p-5"
        >
          {'lines' in t && t.lines ? (
            <pre className="overflow-x-auto font-mono text-mono-sm leading-7">
              {t.lines.map((l: any, i: number) => (
                <div key={i} className={l.cmd ? 'text-ink-hi' : l.dim ? 'text-ink-low' : 'text-ink-mid'}>
                  {l.text || ' '}
                </div>
              ))}
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
                <span className="font-mono text-mono-sm text-ink-hi">stratadb.org/llms.txt</span>{' '}
                or the{' '}
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
