import { readFile, readdir } from 'node:fs/promises';
import { extname, join, relative, sep } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const REGISTRY = join(ROOT, 'src/data/error-registry.json');
const SCAN_ROOTS = ['src/content', 'src/pages', 'src/components', 'src/data'].map((p) =>
  join(ROOT, p),
);
const CODE_LINK = /(?:https:\/\/stratadb\.org)?\/e\/([A-Za-z0-9_.-]+)/g;

function toPosix(path) {
  return path.split(sep).join('/');
}

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(path)));
    else out.push(path);
  }
  return out;
}

const registry = JSON.parse(await readFile(REGISTRY, 'utf8'));
const errors = registry.errors ?? [];
const failures = [];

if (registry.count !== errors.length) {
  failures.push(`registry count ${registry.count} does not match errors length ${errors.length}`);
}

const codes = new Set();
for (const entry of errors) {
  if (codes.has(entry.code)) failures.push(`duplicate error code ${entry.code}`);
  codes.add(entry.code);
  if (entry.ref !== `https://stratadb.org/e/${entry.code}`) {
    failures.push(`${entry.code}: invalid ref ${entry.ref}`);
  }
}

for (const root of SCAN_ROOTS) {
  for (const file of await walk(root)) {
    if (!['.astro', '.tsx', '.ts', '.md', '.json'].includes(extname(file))) continue;
    const rel = toPosix(relative(ROOT, file));
    const text = await readFile(file, 'utf8');
    for (const match of text.matchAll(CODE_LINK)) {
      const code = match[1];
      if (!codes.has(code)) failures.push(`${rel}: unknown /e/ link ${code}`);
    }
  }
}

if (failures.length > 0) {
  console.error(`verify-errors: ${failures.length} failure(s)`);
  for (const failure of failures.slice(0, 100)) console.error(`- ${failure}`);
  if (failures.length > 100) console.error(`... ${failures.length - 100} more`);
  process.exit(1);
}

console.log(`verify-errors: ${errors.length} error code(s) verified`);
