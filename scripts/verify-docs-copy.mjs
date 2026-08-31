import { readFile, readdir, stat } from 'node:fs/promises';
import { extname, join, relative, sep } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const TARGETS = [
  'src/content/docs',
  'src/content/architecture',
  'src/pages/docs',
  'src/pages/architecture',
  'src/pages/llms.txt.ts',
  'src/pages/llms-full.txt.ts',
  'src/pages/specimen.astro',
];
const EXTENSIONS = new Set(['.astro', '.md', '.ts']);

const FORBIDDEN = [
  { label: 'old AI-era positioning', pattern: /\bAI era\b/i },
  { label: 'frozen Foundry acquisition copy', pattern: /\bstrata-foundry\b|\bDesktop app\b/i },
  { label: 'unsupported cherry-pick claim', pattern: /\bcherry-pick\b/i },
  {
    label: 'broad unverified example guarantee',
    pattern:
      /every command and output shown was|each verified end to end|exact output you should see|can never drift|cannot drift/i,
  },
  {
    label: 'old six-capability model',
    pattern: /\bsix (?:data )?capabilities\b|\bsix primitives\b/i,
  },
  { label: 'old whitepaper label', pattern: /\bwhitepapers?\b/i },
  { label: 'stale SDK plan', pattern: /Node and Python SDKs are in progress/i },
];

function toPosix(path) {
  return path.split(sep).join('/');
}

async function walk(path) {
  const absolute = join(ROOT, path);
  const info = await stat(absolute);
  if (info.isFile()) return EXTENSIONS.has(extname(absolute)) ? [absolute] : [];

  const files = [];
  for (const entry of await readdir(absolute, { withFileTypes: true })) {
    const child = join(path, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(child)));
    else if (EXTENSIONS.has(extname(entry.name))) files.push(join(ROOT, child));
  }
  return files;
}

const files = [];
for (const target of TARGETS) files.push(...(await walk(target)));

const failures = [];
for (const file of files) {
  const rel = toPosix(relative(ROOT, file));
  const text = await readFile(file, 'utf8');
  for (const check of FORBIDDEN) {
    if (check.pattern.test(text)) failures.push(`${rel}: ${check.label}`);
  }
}

if (failures.length > 0) {
  console.error(`verify-docs-copy: ${failures.length} failure(s)`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('verify-docs-copy: docs copy avoids Phase 4 stale claims');
