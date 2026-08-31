import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();

const SKIP_DIRS = new Set([
  '.astro',
  '.git',
  '.claude',
  'dist',
  'node_modules',
  'public/playground/pkg',
]);

const LIVE_SOURCE_DIRS = ['src/components', 'src/layouts', 'src/lib', 'src/pages', 'src/styles'];
const LIVE_SOURCE_EXTS = new Set(['.astro', '.css', '.ts', '.tsx']);
const EM_DASH_EXEMPTIONS = new Set(['public/fonts/GeneralSans-LICENSE.txt']);

const CLAIM_PATTERNS = [
  { label: 'unsupported production claim', pattern: /\bproduction-ready\b/i },
  { label: 'unsupported durability claim', pattern: /\bbattle-tested\b/i },
  { label: 'generic speed claim', pattern: /\bblazingly\b/i },
  { label: 'unsupported enterprise claim', pattern: /\benterprise-grade\b/i },
  { label: 'generic category claim', pattern: /\bnext-generation\b/i },
];

const STALE_SOURCE_PATTERNS = [
  {
    label: 'stale Foundry acquisition path',
    pattern: /\bDownload Foundry\b|\bStar strata-foundry\b|\bstrata-foundry\b/i,
  },
  {
    label: 'old playground retirement claim',
    pattern: /\/playground.*\b(?:retired|301|permanently retired)\b/i,
  },
  { label: 'AI-coded placeholder language', pattern: /\bvibecoded\b|\bAI[- ]coded\b/i },
];

const RAW_COLOR_PATTERN = /(?<!&)#[0-9a-fA-F]{3,8}\b|(?:rgba?|hsla?)\(\s*\d/gi;
const OLD_VERSION_PATTERN = /\bv?0\.(?:6|12)\.[0-9]+\b/g;

const failures = [];

const emDashGrep = spawnSync('git', ['grep', '-n', '\u2014'], {
  cwd: ROOT,
  encoding: 'utf8',
});

if (emDashGrep.status === 0) {
  for (const line of emDashGrep.stdout.trim().split('\n')) {
    const rel = line.slice(0, line.indexOf(':'));
    if (!EM_DASH_EXEMPTIONS.has(rel)) failures.push(`${line}: replace em dash punctuation`);
  }
} else if (emDashGrep.status !== 1) {
  failures.push(`git grep for em dashes failed: ${emDashGrep.stderr.trim()}`);
}

function walk(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir)) {
    const abs = join(dir, entry);
    const rel = relative(ROOT, abs);
    if (SKIP_DIRS.has(rel) || SKIP_DIRS.has(entry)) continue;
    const stat = statSync(abs);
    if (stat.isDirectory()) out.push(...walk(abs));
    else out.push(abs);
  }
  return out;
}

function extname(file) {
  const match = file.match(/(\.[^.]+)$/);
  return match ? match[1] : '';
}

const sourceFiles = LIVE_SOURCE_DIRS.flatMap((dir) => walk(join(ROOT, dir))).filter((file) =>
  LIVE_SOURCE_EXTS.has(extname(file)),
);

for (const file of sourceFiles) {
  const rel = relative(ROOT, file);
  const text = readFileSync(file, 'utf8');

  if (rel !== 'src/styles/tokens.css') {
    const colors = [...text.matchAll(RAW_COLOR_PATTERN)].map((m) => m[0]);
    if (colors.length > 0) {
      failures.push(
        `${rel}: raw color literal(s) outside tokens.css: ${[...new Set(colors)].join(', ')}`,
      );
    }
  }

  for (const { label, pattern } of CLAIM_PATTERNS) {
    if (pattern.test(text)) failures.push(`${rel}: ${label}`);
  }

  for (const { label, pattern } of STALE_SOURCE_PATTERNS) {
    if (pattern.test(text)) failures.push(`${rel}: ${label}`);
  }

  const oldVersions = [...text.matchAll(OLD_VERSION_PATTERN)].map((m) => m[0]);
  if (oldVersions.length > 0) {
    failures.push(
      `${rel}: old release literal(s) should come from generated data: ${[...new Set(oldVersions)].join(', ')}`,
    );
  }
}

if (existsSync(join(ROOT, 'tailwind.config.mjs'))) {
  failures.push(
    'tailwind.config.mjs: duplicate design-token source; keep tokens in src/styles/tokens.css',
  );
}

if (existsSync(join(ROOT, 'src/components/layout'))) {
  failures.push('src/components/layout: old layout component directory should stay deleted');
}

if (existsSync(join(ROOT, 'DESIGN.md'))) {
  const head = readFileSync(join(ROOT, 'DESIGN.md'), 'utf8').split('\n').slice(0, 12).join('\n');
  if (!/Status:\s*historical/i.test(head)) {
    failures.push('DESIGN.md: historical design draft needs a clear status banner at the top');
  }
}

const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
if (pkg.dependencies && Object.keys(pkg.dependencies).length > 0) {
  failures.push(
    'package.json: static site runtime dependencies should stay empty; build inputs belong in devDependencies',
  );
}
if (!pkg.engines?.node?.includes('22.19')) {
  failures.push('package.json: Node engine must record the verified Astro 7 baseline');
}
for (const script of ['check', 'format:check', 'lint', 'visual:smoke', 'audit:runtime']) {
  if (!pkg.scripts?.[script]) failures.push(`package.json: missing npm script "${script}"`);
}

if (failures.length > 0) {
  console.error('verify-source-hygiene: failed');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`verify-source-hygiene: ${sourceFiles.length} live source file(s) checked`);
