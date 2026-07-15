// Build-time reference pipeline (Doc 11 §7.2): stage the IDL-generated command
// reference from strata-core into the `docs` collection under `reference/`.
//
// Source of truth is strata-core (docs sourcing policy §1: reference is
// generated in the code repo). We consume the RELEASED version's bundle, never
// `main` — the site documents the binary users actually install.
//
// Source resolution (first that succeeds; never fails the build):
//   1. STRATA_DOCS_DIR  — a local strata-core `.../idl/v1/generated` dir (dev).
//   2. Release asset    — strata-idl-docs.tar.gz from the release tag in
//                         src/data/release.json (CI / prod). strata-core is
//                         public, so this is unauthenticated.
//   3. Committed floor  — whatever was last staged; a fetch failure keeps it.
//
// Output:
//   src/content/docs/reference/<family>/<op>.md   (git-ignored; regenerated)
//   src/data/command-index.json                   (git-ignored; sidebar + machine)

import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

const exec = promisify(execFile);

const ROOT = new URL('..', import.meta.url).pathname;
const REFERENCE_DIR = join(ROOT, 'src/content/docs/reference');
const INDEX_OUT = join(ROOT, 'src/data/command-index.json');
const RELEASE_JSON = join(ROOT, 'src/data/release.json');
const ASSET = 'strata-idl-docs.tar.gz';
const REPO = 'https://github.com/stratalab/strata-core';

// The generated command families (top-level dirs under generated/docs/). Their
// pages ship links as `/docs/<family>/...`; we render them under the Reference
// section, so rewrite to `/docs/reference/<family>/...`.
const FAMILIES = [
  'kv', 'json', 'vector', 'event', 'graph',
  'branch', 'space', 'admin', 'arrow', 'inference',
];

async function version() {
  try {
    return JSON.parse(await readFile(RELEASE_JSON, 'utf8')).version;
  } catch {
    return null;
  }
}

// Resolve a `.../idl/v1/generated` directory to consume, or null to keep the floor.
async function resolveSource() {
  const local = process.env.STRATA_DOCS_DIR;
  if (local && existsSync(join(local, 'docs'))) {
    return { dir: local, label: `local ${local}` };
  }
  const v = await version();
  if (!v) return null;
  const url = `${REPO}/releases/download/v${v}/${ASSET}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
    if (!res.ok) throw new Error(`${res.status}`);
    const staging = join(tmpdir(), `strata-idl-docs-${v}`);
    await rm(staging, { recursive: true, force: true });
    await mkdir(staging, { recursive: true });
    const tgz = join(staging, ASSET);
    await writeFile(tgz, Buffer.from(await res.arrayBuffer()));
    await exec('tar', ['xzf', tgz, '-C', staging]); // system tar; no npm dep
    // The tar roots at `generated/`; find the dir that holds `docs/`.
    const dir = existsSync(join(staging, 'generated', 'docs'))
      ? join(staging, 'generated')
      : staging;
    return { dir, label: `release v${v} asset` };
  } catch (err) {
    return { error: `release v${v}: ${err.message}` };
  }
}

// Rewrite generated `/docs/<family>/` links to the Reference section.
function rewriteLinks(md) {
  return md.replace(
    /\]\(\/docs\/(kv|json|vector|event|graph|branch|space|admin|arrow|inference)\//g,
    '](/docs/reference/$1/'
  );
}

async function stageFamily(srcDocs, family) {
  const srcDir = join(srcDocs, family);
  if (!existsSync(srcDir)) return 0;
  const outDir = join(REFERENCE_DIR, family);
  await mkdir(outDir, { recursive: true });
  let count = 0;
  for (const name of await readdir(srcDir, { recursive: true })) {
    const srcPath = join(srcDir, name);
    if (!name.endsWith('.md') || !(await stat(srcPath)).isFile()) continue;
    const outPath = join(outDir, name);
    await mkdir(join(outPath, '..'), { recursive: true });
    await writeFile(outPath, rewriteLinks(await readFile(srcPath, 'utf8')));
    count += 1;
  }
  return count;
}

async function main() {
  const source = await resolveSource();
  if (!source || source.error) {
    console.warn(
      `fetch-docs: ${source?.error ?? 'no source'}; keeping the staged reference floor`
    );
    return;
  }
  const srcDocs = join(source.dir, 'docs');

  // Clean-rebuild only the generated families (leave interim hand-written pages).
  for (const family of FAMILIES) {
    await rm(join(REFERENCE_DIR, family), { recursive: true, force: true });
  }
  await mkdir(REFERENCE_DIR, { recursive: true });

  let total = 0;
  for (const family of FAMILIES) total += await stageFamily(srcDocs, family);

  const indexSrc = join(source.dir, 'command-index.json');
  if (existsSync(indexSrc)) {
    await mkdir(join(INDEX_OUT, '..'), { recursive: true });
    await cp(indexSrc, INDEX_OUT);
  }

  console.log(`fetch-docs: staged ${total} reference pages from ${source.label}`);
}

await main();
