// The public error registry, from the installed binary (06 §4).
//
// This file used to be refreshed by hand at release time, and so it went stale
// the moment a release changed a code. 1.2.0 reclassified the hub and arrow
// feature-disabled errors from `invalid_argument.executor.*` to
// `unsupported.executor.*`; the catalog moved, the committed registry did not,
// and the build failed on eight commands referencing codes it had never heard
// of. The changelog had said so plainly, but nothing here was reading it.
//
// So the registry is fetched like everything else now. The binary is the source
// because the binary is what answers `/e/<code>` questions in the field, and it
// is version-matched by construction: whatever `strata` is installed is what
// gets documented.
//
// Never fails the build. The committed registry is the floor, exactly as
// release.json and python-bindings.json are.
import { readFile, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const exec = promisify(execFile);
const FILE = new URL('../src/data/error-registry.json', import.meta.url);
const STRATA = process.env.STRATA_BIN || 'strata';

/** Sort so a reordering upstream does not show up as a diff here. */
function normalize(payload) {
  const errors = [...(payload.errors ?? [])].sort((a, b) => a.code.localeCompare(b.code));
  return { count: errors.length, errors, source: payload.source ?? 'strata agents errors' };
}

try {
  const { stdout } = await exec(STRATA, ['agents', 'errors', '--json'], {
    maxBuffer: 32 * 1024 * 1024,
    timeout: 30000,
  });
  const parsed = JSON.parse(stdout);
  // The CLI wraps payloads as {type, data}; older builds emitted the bare shape.
  const payload = parsed.data ?? parsed;
  if (!Array.isArray(payload.errors) || payload.errors.length === 0) {
    throw new Error('no errors array in the binary output');
  }

  const current = JSON.parse(await readFile(FILE, 'utf8'));
  const next = normalize(payload);
  const before = new Set(current.errors.map((e) => e.code));
  const after = new Set(next.errors.map((e) => e.code));
  const added = [...after].filter((c) => !before.has(c));
  const removed = [...before].filter((c) => !after.has(c));

  await writeFile(FILE, `${JSON.stringify(next, null, 2)}\n`);
  const churn = added.length || removed.length ? ` (+${added.length} -${removed.length})` : '';
  console.log(`error-registry.json: ${next.count} code(s) from the installed binary${churn}`);
  // Name them: a reclassified code is the kind of change that breaks a consumer
  // quietly, and this is the one place it is cheap to notice.
  for (const code of added) console.log(`  + ${code}`);
  for (const code of removed) console.log(`  - ${code}`);
} catch (err) {
  const current = JSON.parse(await readFile(FILE, 'utf8'));
  console.warn(
    `error-registry.json: could not read the binary (${err.message}); keeping the committed ${current.count} code(s)`,
  );
}
