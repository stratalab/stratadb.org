import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, join, relative, sep } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const DOCS_DIR = join(ROOT, 'src/content/docs');
const RELEASE_JSON = join(ROOT, 'src/data/release.json');
const SOURCE_VERSION = /^(strata-(?:core|python))@v?(\d+\.\d+\.\d+)$/;

function toPosix(path) {
  return path.split(sep).join('/');
}

async function walk(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(path)));
    // .mdx as well: the prose pages written since the rebuild are MDX, and a
    // walker that only knew .md silently excluded every one of them.
    else if (extname(path) === '.md' || extname(path) === '.mdx') out.push(path);
  }
  return out;
}

function frontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---/);
  return match?.[1] ?? '';
}

function sourceValue(fm) {
  // YAML quotes are part of the line, not part of the value. Leaving them on
  // made the version pattern below never match, so every page fell through the
  // `!match` escape and this check passed without checking anything.
  const match = fm.match(/^source:\s*(.+)$/m);
  return match?.[1]?.trim().replace(/^["']|["']$/g, '') ?? null;
}

const release = JSON.parse(await readFile(RELEASE_JSON, 'utf8'));
const expected = release.version;
if (!/^\d+\.\d+\.\d+$/.test(expected)) {
  console.error(`verify-versions: release.json has invalid version '${expected}'`);
  process.exit(1);
}

const failures = [];
for (const file of await walk(DOCS_DIR)) {
  const rel = toPosix(relative(ROOT, file));
  const source = sourceValue(frontmatter(await readFile(file, 'utf8')));
  if (!source) {
    failures.push(`${rel}: missing source frontmatter`);
    continue;
  }

  const match = source.match(SOURCE_VERSION);
  if (!match) continue;
  if (match[2] !== expected) {
    failures.push(`${rel}: ${source} does not match release.json ${expected}`);
  }
}

if (failures.length > 0) {
  console.error(`verify-versions: ${failures.length} failure(s)`);
  for (const failure of failures.slice(0, 100)) console.error(`- ${failure}`);
  if (failures.length > 100) console.error(`... ${failures.length - 100} more`);
  process.exit(1);
}

console.log(`verify-versions: docs source frontmatter matches ${expected}`);
