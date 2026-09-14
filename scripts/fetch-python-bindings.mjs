// Build-time: describe the Python SDK surface by introspecting the RELEASED
// wheel, never by hand. Same contract as the rest of the reference: the package
// is the source of truth and the site only renders it.
//
// The probe lives in scripts/python-bindings-probe.py. It ties each method to
// the wire type the SDK actually sends, read from the client method's body,
// because the client's method NAME is not a reliable key. Signatures and the
// first docstring line come from inspect, and the doctest is a runnable example.
//
// Resolution: STRATA_PYTHON, else a repo-local .venv, else python3. The venv
// step matters because stratadb is not a site dependency and will not be on the
// system python: without it every build on a fresh machine silently kept the
// floor, which is how the committed data sat a version behind while the CLI
// data moved to 1.2.1. If stratadb is importable nowhere the build keeps
// whatever was last written, exactly like the other fetchers.
//
// Output: src/data/python-bindings.json, keyed by command id (git-ignored? no -
// committed as the clean-checkout floor, like command-index.json).

import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { join } from 'node:path';
import { promisify } from 'node:util';

const exec = promisify(execFile);
const ROOT = new URL('..', import.meta.url).pathname;
const INDEX = join(ROOT, 'src/data/command-index.json');
const OUT = join(ROOT, 'src/data/python-bindings.json');
// The wheel's own version, recorded beside the bindings. Without it the site
// could render 137 commands from a 1.2.2 core against bindings probed from a
// 1.2.1 wheel and say nothing, which is exactly what happened for the several
// days PyPI trailed the engine. Reference / Compatibility renders from this.
const SDK_OUT = join(ROOT, 'src/data/python-sdk.json');

async function main() {
  const venv = join(ROOT, '.venv/bin/python');
  const python = process.env.STRATA_PYTHON || (existsSync(venv) ? venv : 'python3');
  let byWire;
  try {
    const probe = join(ROOT, 'scripts/python-bindings-probe.py');
    const { stdout } = await exec(python, [probe], { maxBuffer: 8 * 1024 * 1024 });
    byWire = JSON.parse(stdout);
  } catch (err) {
    console.warn(
      `fetch-python-bindings: could not introspect stratadb via ${python} (${err.message.split('\n')[0]}); keeping the committed floor`,
    );
    return;
  }

  if (!existsSync(INDEX)) {
    console.warn('fetch-python-bindings: no command index to join against; skipping');
    return;
  }
  const commands = JSON.parse(await readFile(INDEX, 'utf8')).commands ?? [];

  const bindings = {};
  let unmatched = 0;
  for (const command of commands) {
    const binding = command.wire ? byWire[command.wire] : undefined;
    if (binding) bindings[command.id] = binding;
    else unmatched += 1;
  }

  // Same copy rule as every other staged artifact: no em dashes reach the repo.
  const normalized = JSON.stringify(bindings, null, 2).replaceAll('\u2014', '-');
  await writeFile(OUT, `${normalized}\n`);

  let sdkVersion = null;
  try {
    const { stdout } = await exec(python, [
      '-c',
      'import stratadb, sys; sys.stdout.write(stratadb.__version__)',
    ]);
    sdkVersion = stdout.trim() || null;
  } catch {
    // The probe already succeeded, so this only fails if __version__ is gone.
    sdkVersion = null;
  }
  await writeFile(
    SDK_OUT,
    `${JSON.stringify(
      {
        version: sdkVersion,
        probed_at: new Date().toISOString().slice(0, 10),
        bindings: Object.keys(bindings).length,
        commands_without_binding: unmatched,
      },
      null,
      2,
    )}\n`,
  );

  console.log(
    `fetch-python-bindings: ${Object.keys(bindings).length} binding(s) written from stratadb ${sdkVersion ?? 'unknown'}, ${unmatched} command(s) with no Python method`,
  );
}

await main();
