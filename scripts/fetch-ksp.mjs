// Build-time: stage the browser build of strata-ksp into public/demos/ksp/.
//
// Unlike Colonies, KSP is not JavaScript driving the released engine bindings:
// the simulation, the persistence and the branch work are Rust, so the app
// itself is compiled to wasm32 with the engine linked into it (strata-core
// #3536, released in 1.2.4). That bundle cannot be built here - this site's
// build has no Rust toolchain - so it is fetched from a release of the app,
// exactly as scripts/fetch-wasm.mjs fetches the playground engine.
//
// Source resolution (first that succeeds; never fails the build):
//   1. STRATA_KSP_DIR - a local pkg/ from strata-ksp/build-wasm.sh (dev).
//   2. Release asset  - strata-ksp-web.tar.gz from the pinned tag below.
//
// On failure the build still succeeds and /demos/ksp/ 404s, which is why the
// demos page links it from data that this script does not write. The bundle is
// git-ignored and never committed.
import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

const exec = promisify(execFile);

const ROOT = new URL('..', import.meta.url).pathname;
const OUT_DIR = join(ROOT, 'public/demos/ksp');
const ASSET = 'strata-ksp-web.tar.gz';
const REPO = 'https://github.com/stratalab/strata-apps';
// Pinned, not "latest": the demo the site ships is one somebody ran, and a
// floating tag would change what is deployed without a commit here.
const TAG = 'strata-ksp-v0.4.1';
const FILES = [
  'index.html',
  'app.js',
  'bridge.js',
  'style.css',
  'strata_ksp.js',
  'strata_ksp_bg.wasm',
];

async function stageFrom(dir, label) {
  for (const file of FILES) {
    if (!existsSync(join(dir, file))) {
      throw new Error(`${file} is missing from ${label}`);
    }
  }
  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });
  for (const file of FILES) await cp(join(dir, file), join(OUT_DIR, file));
  console.log(`fetch-ksp: staged the KSP browser build from ${label}`);
}

async function main() {
  const local = process.env.STRATA_KSP_DIR;
  if (local && existsSync(join(local, 'strata_ksp_bg.wasm'))) {
    await stageFrom(local, `local ${local}`);
    return;
  }

  const url = `${REPO}/releases/download/${TAG}/${ASSET}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(60000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const staging = join(tmpdir(), `strata-ksp-${TAG}`);
    await rm(staging, { recursive: true, force: true });
    await mkdir(staging, { recursive: true });
    const tarPath = join(staging, ASSET);
    await writeFile(tarPath, Buffer.from(await res.arrayBuffer()));
    await exec('tar', ['xzf', tarPath, '-C', staging]);
    await stageFrom(staging, `${ASSET} @ ${TAG}`);
  } catch (err) {
    console.warn(
      `fetch-ksp: could not stage ${ASSET} for ${TAG} (${err.message}); /demos/ksp/ will 404.`,
    );
  }
}

main();
