// Build-time: stage the browser build of strata-paint into public/demos/paint/.
//
// Same shape as fetch-ksp.mjs, and for the same reason: Paint is a Rust app
// with the engine linked into it, compiled to wasm32, and this site's build has
// no Rust toolchain. So the bundle is fetched from a release of the app rather
// than built here.
//
// Source resolution (first that succeeds; never fails the build):
//   1. STRATA_PAINT_DIR - a local pkg/ from strata-paint/build-wasm.sh (dev).
//   2. Release asset    - strata-paint-web.tar.gz from the pinned tag below.
//
// On failure the build still succeeds and /demos/paint/ 404s. The hero door
// that points there is checked by verify-links against the built site, so a
// missing bundle fails the build there rather than shipping a dead door.
// The bundle is git-ignored and never committed.
import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

const exec = promisify(execFile);

const ROOT = new URL('..', import.meta.url).pathname;
const OUT_DIR = join(ROOT, 'public/demos/paint');
const ASSET = 'strata-paint-web.tar.gz';
const REPO = 'https://github.com/stratalab/strata-apps';
// Pinned, not "latest": the demo the site ships is one somebody ran, and a
// floating tag would change what is deployed without a commit here.
const TAG = 'strata-paint-v0.1.0';
const FILES = [
  'index.html',
  'app.js',
  'bridge.js',
  'style.css',
  'strata_paint.js',
  'strata_paint_bg.wasm',
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
  console.log(`fetch-paint: staged the Paint browser build from ${label}`);
}

async function main() {
  const local = process.env.STRATA_PAINT_DIR;
  if (local && existsSync(join(local, 'strata_paint_bg.wasm'))) {
    await stageFrom(local, `local ${local}`);
    return;
  }

  const url = `${REPO}/releases/download/${TAG}/${ASSET}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(60000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const staging = join(tmpdir(), `strata-paint-${TAG}`);
    await rm(staging, { recursive: true, force: true });
    await mkdir(staging, { recursive: true });
    const tarPath = join(staging, ASSET);
    await writeFile(tarPath, Buffer.from(await res.arrayBuffer()));
    await exec('tar', ['xzf', tarPath, '-C', staging]);
    await stageFrom(staging, `${ASSET} @ ${TAG}`);
  } catch (err) {
    console.warn(
      `fetch-paint: could not stage ${ASSET} for ${TAG} (${err.message}); /demos/paint/ will 404.`,
    );
  }
}

main();
