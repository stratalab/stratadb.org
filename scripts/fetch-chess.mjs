// Build-time: stage the browser build of strata-chess into public/demos/chess/.
//
// Same shape as fetch-ksp.mjs and fetch-paint.mjs. What is different is the
// stockfish/ directory: the demo ships Stockfish unmodified under GPL-3.0, and
// its licence text and the notice naming the Corresponding Source have to be
// served beside the binary, not left in the app's repository. They are staged
// here for that reason, and the build fails loudly if they are missing rather
// than quietly publishing a GPL binary with no licence next to it.
//
// Source resolution (first that succeeds; never fails the build):
//   1. STRATA_CHESS_DIR - a local pkg/ from strata-chess/build-wasm.sh (dev).
//   2. Release asset    - strata-chess-web.tar.gz from the pinned tag below.
import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

const exec = promisify(execFile);

const ROOT = new URL('..', import.meta.url).pathname;
const OUT_DIR = join(ROOT, 'public/demos/chess');
const ASSET = 'strata-chess-web.tar.gz';
const REPO = 'https://github.com/stratalab/strata-apps';
// Pinned, not "latest": the demo the site ships is one somebody ran, and a
// floating tag would change what is deployed without a commit here.
const TAG = 'strata-chess-v0.2.0';
const FILES = [
  'index.html',
  'app.js',
  'bridge.js',
  'engine.js',
  'generate.js',
  'style.css',
  'strata_chess.js',
  'strata_chess_bg.wasm',
];
// Stockfish, and the two files GPLv3 wants beside it.
const STOCKFISH = [
  'stockfish/stockfish-19-lite-single.js',
  'stockfish/stockfish-19-lite-single.wasm',
  'stockfish/Copying.txt',
  'stockfish/README.md',
];

async function stageFrom(dir, label) {
  const wanted = [...FILES, ...STOCKFISH];
  for (const file of wanted) {
    if (!existsSync(join(dir, file))) {
      throw new Error(`${file} is missing from ${label}`);
    }
  }
  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(join(OUT_DIR, 'stockfish'), { recursive: true });
  for (const file of wanted) await cp(join(dir, file), join(OUT_DIR, file));
  console.log(`fetch-chess: staged the chess browser build from ${label}`);
}

async function main() {
  const local = process.env.STRATA_CHESS_DIR;
  if (local && existsSync(join(local, 'strata_chess_bg.wasm'))) {
    await stageFrom(local, `local ${local}`);
    return;
  }

  const url = `${REPO}/releases/download/${TAG}/${ASSET}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(60000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const staging = join(tmpdir(), `strata-chess-${TAG}`);
    await rm(staging, { recursive: true, force: true });
    await mkdir(staging, { recursive: true });
    const tarPath = join(staging, ASSET);
    await writeFile(tarPath, Buffer.from(await res.arrayBuffer()));
    await exec('tar', ['xzf', tarPath, '-C', staging]);
    await stageFrom(staging, `${ASSET} @ ${TAG}`);
  } catch (err) {
    console.warn(
      `fetch-chess: could not stage ${ASSET} for ${TAG} (${err.message}); /demos/chess/ will 404.`,
    );
  }
}

main();
