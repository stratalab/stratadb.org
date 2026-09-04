// Build-time: describe the Python SDK surface by introspecting the RELEASED
// wheel, never by hand. Same contract as the rest of the reference: the package
// is the source of truth and the site only renders it.
//
// The probe lives in scripts/python-bindings-probe.py. It ties each method to
// the wire type the SDK actually sends, read from the client method's body,
// because the client's method NAME is not a reliable key. Signatures and the
// first docstring line come from inspect, and the doctest is a runnable example.
//
// Resolution: STRATA_PYTHON, else python3. If stratadb is not importable the
// build keeps whatever was last written, exactly like the other fetchers.
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

async function main() {
  const python = process.env.STRATA_PYTHON || 'python3';
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
  console.log(
    `fetch-python-bindings: ${Object.keys(bindings).length} binding(s) written, ${unmatched} command(s) with no Python method`,
  );
}

await main();
