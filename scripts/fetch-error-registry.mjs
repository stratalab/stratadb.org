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
//
// Two sources, because there are two things that raise errors. The engine's
// catalog comes from the binary. The Python SDK raises thirteen codes of its
// own that the engine has never heard of, and every one of them carried a
// `ref` to a page this site did not publish (strata-python#87). The SDK now
// ships `_data/sdk-errors.json` in the wheel, in the same row shape, so they
// merge here rather than being special-cased downstream.
//
// The SDK half is a floor in the stronger sense: CI installs the CLI but not
// the wheel, so nothing refreshes it there and the committed rows are what
// ships. That is the same arrangement as python-sdk.json.
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { join } from 'node:path';

const exec = promisify(execFile);
const ROOT = new URL('..', import.meta.url).pathname;
const FILE = new URL('../src/data/error-registry.json', import.meta.url);
const STRATA = process.env.STRATA_BIN || 'strata';

/** Codes the SDK raises, read from the installed wheel. Empty when absent. */
async function sdkErrors() {
  // An explicit file wins, so the catalog can be checked against a branch
  // before it is released.
  const override = process.env.STRATA_SDK_ERRORS;
  if (override) {
    if (!existsSync(override)) {
      console.warn(`error-registry.json: STRATA_SDK_ERRORS=${override} does not exist; ignoring`);
      return [];
    }
    return JSON.parse(await readFile(override, 'utf8')).errors ?? [];
  }

  const venv = join(ROOT, '.venv/bin/python');
  const python = process.env.STRATA_PYTHON || (existsSync(venv) ? venv : 'python3');
  try {
    const { stdout } = await exec(python, [
      '-c',
      "import importlib.resources as r,sys;sys.stdout.write((r.files('stratadb')/'_data'/'sdk-errors.json').read_text())",
    ]);
    return JSON.parse(stdout).errors ?? [];
  } catch {
    // No wheel, or a wheel from before the catalog shipped. Both are ordinary.
    return [];
  }
}

/**
 * Sort so a reordering upstream does not show up as a diff here, and stamp
 * each row with what raised it. A reader who hits `invalid_argument.sdk.limit`
 * needs to know the engine never saw their call.
 */
function normalize(payload, sdk = []) {
  const stamp = (entry, origin) => ({ ...entry, origin });
  const errors = [
    ...(payload.errors ?? []).map((e) => stamp(e, 'engine')),
    ...sdk.map((e) => stamp(e, 'sdk')),
  ].sort((a, b) => a.code.localeCompare(b.code));
  return {
    count: errors.length,
    errors,
    source: payload.source ?? 'strata agents errors',
    sdk_source: sdk.length ? 'stratadb wheel _data/sdk-errors.json' : undefined,
  };
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
  const next = normalize(payload, await sdkErrors());
  const before = new Set(current.errors.map((e) => e.code));
  const after = new Set(next.errors.map((e) => e.code));
  const added = [...after].filter((c) => !before.has(c));
  const removed = [...before].filter((c) => !after.has(c));

  await writeFile(FILE, `${JSON.stringify(next, null, 2)}\n`);
  const churn = added.length || removed.length ? ` (+${added.length} -${removed.length})` : '';
  const fromSdk = next.errors.filter((e) => e.origin === 'sdk').length;
  const origin = fromSdk ? `binary + ${fromSdk} from the SDK` : 'installed binary';
  console.log(`error-registry.json: ${next.count} code(s) from the ${origin}${churn}`);
  // Name them: a reclassified code is the kind of change that breaks a consumer
  // quietly, and this is the one place it is cheap to notice.
  for (const code of added) console.log(`  + ${code}`);
  for (const code of removed) console.log(`  - ${code}`);
} catch (err) {
  const current = JSON.parse(await readFile(FILE, 'utf8'));
  console.warn(
    `error-registry.json: could not read the binary (${err.message}); keeping the committed ${current.count} code(s)`,
  );
  // Deliberately keeps the file as-is rather than rewriting it from the SDK
  // alone: a partial registry would drop every engine code and the build would
  // then fail on links that are perfectly valid.
}
