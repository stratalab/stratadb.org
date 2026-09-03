// Build-time reference pipeline (Doc 11 §7.2): stage the IDL-generated command
// reference from strata-core into the `docs` collection under `reference/`.
//
// Source of truth is strata-core (docs sourcing policy §1: reference is
// generated in the code repo). We consume the RELEASED version's bundle, never
// `main` - the site documents the binary users actually install.
//
// Source resolution (first that succeeds; never fails the build):
//   1. STRATA_DOCS_DIR  - a local strata-core `.../idl/v1/generated` dir (dev).
//   2. Release asset    - strata-idl-docs.tar.gz from the release tag in
//                         src/data/release.json (CI / prod). strata-core is
//                         public, so this is unauthenticated.
//   3. Committed floor  - whatever was last staged; a fetch failure keeps it.
//
// Output:
//   src/content/docs/reference/<family>/<op>.md   (committed floor; restaged)
//   src/data/command-index.json                   (committed floor; restaged)
//
// Docs rebuild: staging is opt-in. The markdown is written only when
// src/content/docs/reference/ already exists, so the archived tree is not
// resurrected into the zero-state docs directory. Create that directory to
// bring the generated reference back. The command index is always refreshed;
// it is data, not documentation.

import { mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

const exec = promisify(execFile);

const ROOT = new URL('..', import.meta.url).pathname;
const REFERENCE_DIR = join(ROOT, 'src/content/docs/reference');
const INDEX_OUT = join(ROOT, 'src/data/command-index.json');
const SCHEMAS_OUT = join(ROOT, 'src/data/command-schemas.json');
const EXAMPLES_OUT = join(ROOT, 'src/data/command-examples.json');
const RELEASE_JSON = join(ROOT, 'src/data/release.json');
const ASSET = 'strata-idl-docs.tar.gz';
const REPO = 'https://github.com/stratalab/strata-core';

function normalizeCopy(text) {
  return text.replaceAll('\u2014', '-');
}

// The generated command families are DISCOVERED from the bundle (every
// top-level dir under generated/docs/), so a family added in strata-core
// flows through with no edit here. Their pages ship links as
// `/docs/<family>/...`; we render them under the Reference section, so
// rewrite to `/docs/reference/<family>/...`.
async function discoverFamilies(srcDocs) {
  const entries = await readdir(srcDocs, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

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
function makeLinkRewriter(families) {
  const pattern = new RegExp(`\\]\\(/docs/(${families.join('|')})/`, 'g');
  return (md) => {
    return normalizeCopy(md.replace(pattern, '](/docs/reference/$1/'));
  };
}

function normalizeCommandIndexDocs(index, families) {
  const familySet = new Set(families);
  for (const command of index.commands ?? []) {
    if (typeof command.docs !== 'string') continue;
    const match = command.docs.match(/^\/docs\/([^/]+)\/(.+)$/);
    if (match && familySet.has(match[1])) {
      command.docs = `/docs/reference/${match[1]}/${match[2]}`;
    }
  }
  return index;
}

async function stageFamily(srcDocs, family, rewriteLinks) {
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

// The command index carries every fact about a command except its examples,
// which live only in the generated markdown. Lift them out as data so the site
// can compose reference pages without rendering the markdown at all (sourcing
// policy §4.2: the repo ships data, the site owns presentation).
async function collectExamples(srcDocs, commands) {
  const examples = {};
  for (const command of commands) {
    const route = typeof command.docs === 'string' ? command.docs : '';
    const rel = route.replace(/^\/docs\/reference\//, '');
    if (!rel) continue;
    const file = join(srcDocs, `${rel}.md`);
    if (!existsSync(file)) continue;
    const md = await readFile(file, 'utf8');
    const block = md.split('## Examples')[1]?.split('\n## ')[0];
    if (!block) continue;
    const intro = block.split('### ')[0].trim();
    const cli = block.match(/### CLI\n+```console\n([\s\S]*?)```/)?.[1]?.trim();
    const wire = block.match(/### Wire\n+```json\n([\s\S]*?)```/)?.[1]?.trim();
    examples[command.id] = {
      intro: normalizeCopy(intro),
      cli: cli ? normalizeCopy(cli) : cli,
      wire: wire ? normalizeCopy(wire) : wire,
    };
  }
  return examples;
}

// Request and response shapes, with shared $defs. The markdown reduces a return
// type to its name; the schema has the actual shape.
async function collectSchemas(dir) {
  const schemaDir = join(dir, 'schemas');
  if (!existsSync(schemaDir)) return null;
  const out = {};
  for (const name of await readdir(schemaDir)) {
    if (!name.endsWith('.json')) continue;
    out[name.replace(/\.json$/, '')] = JSON.parse(await readFile(join(schemaDir, name), 'utf8'));
  }
  return out;
}

async function main() {
  const source = await resolveSource();
  if (!source || source.error) {
    console.warn(
      `fetch-docs: ${source?.error ?? 'no source'}; keeping the committed reference floor`,
    );
    return;
  }
  const srcDocs = join(source.dir, 'docs');
  const families = await discoverFamilies(srcDocs);
  const rewriteLinks = makeLinkRewriter(families);

  // Clean-rebuild the generated families. Every directory under reference/ is
  // staged (hand-written interim pages are top-level files), so removing all
  // directories also drops a family the bundle no longer ships.
  const stagingEnabled = existsSync(REFERENCE_DIR);
  let total = 0;
  if (stagingEnabled) {
    for (const entry of await readdir(REFERENCE_DIR, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        await rm(join(REFERENCE_DIR, entry.name), { recursive: true, force: true });
      }
    }
    for (const family of families) total += await stageFamily(srcDocs, family, rewriteLinks);
  }

  const indexSrc = join(source.dir, 'command-index.json');
  let commands = [];
  if (existsSync(indexSrc)) {
    await mkdir(join(INDEX_OUT, '..'), { recursive: true });
    const index = normalizeCommandIndexDocs(JSON.parse(await readFile(indexSrc, 'utf8')), families);
    commands = index.commands ?? [];

    // The docs index omits the wire name; the CLI index has it. Joining them
    // here is what lets other generators key off a command without guessing,
    // since the wire name is not derivable from the id (admin.config is
    // config_get on the wire).
    const cliIndexSrc = join(source.dir, 'cli-command-index.json');
    if (existsSync(cliIndexSrc)) {
      const cli = JSON.parse(await readFile(cliIndexSrc, 'utf8'));
      const wireById = new Map((cli.commands ?? []).map((c) => [c.id, c.wire]));
      for (const command of commands) {
        const wire = wireById.get(command.id);
        if (wire) command.wire = wire;
      }
    }
    await writeFile(INDEX_OUT, `${normalizeCopy(JSON.stringify(index, null, 2))}\n`);
  }

  // Data the site composes reference pages from. Written whether or not the
  // markdown is staged, because the pages are rendered from these, not from it.
  const examples = await collectExamples(srcDocs, commands);
  await writeFile(EXAMPLES_OUT, `${JSON.stringify(examples, null, 2)}\n`);

  const schemas = await collectSchemas(source.dir);
  if (schemas) await writeFile(SCHEMAS_OUT, `${normalizeCopy(JSON.stringify(schemas, null, 2))}\n`);

  console.log(
    `fetch-docs: ${Object.keys(examples).length} example set(s) and ${schemas ? Object.keys(schemas).length : 0} schema(s) written`,
  );
  console.log(
    stagingEnabled
      ? `fetch-docs: staged ${total} reference pages from ${source.label}`
      : `fetch-docs: refreshed the command index from ${source.label}; reference staging is off until src/content/docs/reference/ exists`,
  );
}

await main();
