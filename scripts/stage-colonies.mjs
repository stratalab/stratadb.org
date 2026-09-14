// Colonies pins the engine it was verified against independently of the site's
// latest playground release. Missing or altered artifacts must fail the build.
import { readFile, writeFile, mkdir, mkdtemp, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const manifest = JSON.parse(
  await readFile(join(root, 'src/demos/colonies/wasm-manifest.json'), 'utf8'),
);
const destination = join(root, 'public/demos/colonies/assets/pkg');
async function verified(dir) {
  const files = new Map();
  for (const [name, expected] of Object.entries(manifest.files)) {
    let data = await readFile(join(dir, name));
    if (name.endsWith('.js')) data = Buffer.from(data.toString('utf8').replaceAll('\u2014', '-'));
    if (
      data.length !== expected.bytes ||
      createHash('sha256').update(data).digest('hex') !== expected.sha256
    )
      throw new Error(`${name} does not match the verified Colonies bundle`);
    files.set(name, data);
  }
  return files;
}
async function stage(files) {
  await mkdir(destination, { recursive: true });
  for (const [name, data] of files) await writeFile(join(destination, name), data);
}
let files;
if (process.env.COLONIES_WASM_DIR) {
  files = await verified(process.env.COLONIES_WASM_DIR);
} else {
  for (const dir of [destination, join(root, 'public/playground/pkg')]) {
    try {
      files = await verified(dir);
      break;
    } catch {
      /* Try the next verified source. */
    }
  }
}
if (!files) {
  const staging = await mkdtemp(join(tmpdir(), 'strata-colonies-'));
  try {
    const url = `https://github.com/stratalab/strata-core/releases/download/v${manifest.expectedVersion}/strata-wasm-web.tar.gz`;
    const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error(`Could not fetch Colonies engine: HTTP ${response.status}`);
    const archive = join(staging, 'bundle.tar.gz');
    await writeFile(archive, Buffer.from(await response.arrayBuffer()));
    execFileSync('tar', ['xzf', archive, '-C', staging]);
    files = await verified(staging);
  } finally {
    await rm(staging, { recursive: true, force: true });
  }
}
await stage(files);
console.log(
  `stage-colonies: verified Strata ${manifest.expectedVersion} staged for /demos/colonies/`,
);
