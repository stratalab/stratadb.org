// Colonies runs the same engine as the rest of the site.
//
// It used to pin its own: a wasm-manifest.json naming an exact version with
// byte counts and SHA-256 digests, and its own download path to that release.
// The intent was good, to stop the demo drifting onto an engine it had not been
// tested against, but the cost is that the site then ships two engines and
// upgrades them on two schedules. They were byte-identical anyway.
//
// So the engine now comes from one place: scripts/fetch-wasm.mjs stages the
// release named in src/data/release.json into public/playground/pkg, and this
// copies it where the game's worker expects it. One version, one fetch, one
// thing to upgrade.
//
// What replaces the pin is a better check than a hash. scripts/visual-smoke.mjs
// loads /demos/colonies/, waits for the worker to report six colonies, presses
// play, and requires a generation to actually advance, on three viewports, with
// any console error failing the run. A bad engine fails the build by breaking
// the game rather than by mismatching a digest.
//
// The game's own files are still hash-guarded by verify-colonies.mjs against
// source-manifest.json. That contract is unchanged.
import { copyFile, mkdir, readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = join(root, 'public/playground/pkg');
const destination = join(root, 'public/demos/colonies/assets/pkg');
const FILES = ['strata_wasm.js', 'strata_wasm_bg.wasm'];

const release = JSON.parse(await readFile(join(root, 'src/data/release.json'), 'utf8'));

for (const name of FILES) {
  try {
    await stat(join(source, name));
  } catch {
    throw new Error(
      `stage-colonies: ${join('public/playground/pkg', name)} is missing. ` +
        'It is staged by scripts/fetch-wasm.mjs, which runs before this in prebuild. ' +
        'Colonies cannot run without the engine.',
    );
  }
}

await mkdir(destination, { recursive: true });
let bytes = 0;
for (const name of FILES) {
  await copyFile(join(source, name), join(destination, name));
  bytes += (await stat(join(destination, name))).size;
}

console.log(
  `stage-colonies: Strata ${release.version} staged for /demos/colonies/ ` +
    `from the playground bundle (${(bytes / 1024 / 1024).toFixed(1)} MB)`,
);
