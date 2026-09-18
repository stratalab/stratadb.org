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

const ORIGINS = new Set(['engine', 'sdk']);
const codes = new Set();
let sdkCount = 0;
for (const entry of errors) {
  if (codes.has(entry.code)) failures.push(`duplicate error code ${entry.code}`);
  codes.add(entry.code);
  if (entry.ref !== `https://stratadb.org/e/${entry.code}`) {
    failures.push(`${entry.code}: invalid ref ${entry.ref}`);
  }
  // `origin` arrives with the SDK merge. A registry predating it has engine
  // rows and no field at all, which stays valid; a row carrying anything other
  // than the two known origins does not, because the page renders a claim
  // about which side raised the error from it.
  if (entry.origin !== undefined) {
    if (!ORIGINS.has(entry.origin)) {
      failures.push(`${entry.code}: unknown origin '${entry.origin}'`);
    }
    if (entry.origin === 'sdk') sdkCount += 1;
  }
}

// The registry must say where the SDK rows came from, and must not claim a
// second source it has no rows for. Either way round is a merge that half ran.
if (sdkCount > 0 && !registry.sdk_source) {
  failures.push(`${sdkCount} sdk code(s) present but the registry names no sdk_source`);
}
if (sdkCount === 0 && registry.sdk_source) {
  failures.push(`registry names sdk_source '${registry.sdk_source}' but carries no sdk code(s)`);
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

console.log(
  `verify-errors: ${errors.length} error code(s) verified` +
    (sdkCount ? ` (${errors.length - sdkCount} engine, ${sdkCount} sdk)` : ''),
);
