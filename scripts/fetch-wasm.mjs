// Build-time: stage the browser wasm playground bundle from the released
// strata-core into public/playground/pkg/. We consume the RELEASED version's
// asset (never `main`) - the playground runs the engine users can install.
//
// Source resolution (first that succeeds; never fails the build):
//   1. STRATA_WASM_DIR - a local prebuilt pkg dir (dev).
//   2. Release asset    - strata-wasm-web.tar.gz from the release tag in
//                         src/data/release.json. strata-core is public, so
//                         this is unauthenticated.
// On failure the build still succeeds; /playground shows a load error until the
// asset is reachable. The bundle is git-ignored, never committed.

import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

const exec = promisify(execFile);

const ROOT = new URL('..', import.meta.url).pathname;
const PKG_DIR = join(ROOT, 'public/playground/pkg');
const RELEASE_JSON = join(ROOT, 'src/data/release.json');
const ASSET = 'strata-wasm-web.tar.gz';
const REPO = 'https://github.com/stratalab/strata-core';
const FILES = ['strata_wasm.js', 'strata_wasm_bg.wasm'];

function normalizeCopy(text) {
  return text.replaceAll('\u2014', '-');
}

async function version() {
  try {
    return JSON.parse(await readFile(RELEASE_JSON, 'utf8')).version;
  } catch {
    return null;
  }
}

async function stageFrom(dir, label) {
  await mkdir(PKG_DIR, { recursive: true });
  for (const file of FILES) {
    const src = join(dir, file);
    const out = join(PKG_DIR, file);
    if (file.endsWith('.js')) {
      await writeFile(out, normalizeCopy(await readFile(src, 'utf8')));
    } else {
      await cp(src, out);
    }
  }
  console.log(`fetch-wasm: staged the playground bundle from ${label}`);
}

async function main() {
  const local = process.env.STRATA_WASM_DIR;
  if (local && existsSync(join(local, FILES[0]))) {
    await stageFrom(local, `local ${local}`);
    return;
  }

  const v = await version();
  if (!v) {
    console.warn(
      'fetch-wasm: no release version in release.json; skipping (playground bundle absent).',
    );
    return;
  }

  const url = `${REPO}/releases/download/v${v}/${ASSET}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const staging = join(tmpdir(), `strata-wasm-${v}`);
    await rm(staging, { recursive: true, force: true });
    await mkdir(staging, { recursive: true });
    const tarPath = join(staging, ASSET);
    await writeFile(tarPath, Buffer.from(await res.arrayBuffer()));
    await exec('tar', ['xzf', tarPath, '-C', staging]);
    await stageFrom(staging, `${ASSET} @ v${v}`);
  } catch (err) {
    console.warn(
      `fetch-wasm: could not fetch ${ASSET} for v${v} (${err.message}); /playground will show a load error.`,
    );
  }
}

main();
