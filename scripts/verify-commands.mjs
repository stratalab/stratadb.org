import { access, readFile } from 'node:fs/promises';
import { constants, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const INDEX = join(ROOT, 'src/data/command-index.json');
const DOCS_ROOT = join(ROOT, 'src/content/docs');
const ERROR_REGISTRY = join(ROOT, 'src/data/error-registry.json');

async function exists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function docsFile(route) {
  return join(DOCS_ROOT, `${route.replace(/^\/docs\//, '')}.md`);
}

const index = JSON.parse(await readFile(INDEX, 'utf8'));
const registry = JSON.parse(await readFile(ERROR_REGISTRY, 'utf8'));
const knownErrors = new Set((registry.errors ?? []).map((entry) => entry.code));
const commands = index.commands ?? [];
const failures = [];

// The generated reference is restored family by family during the docs rebuild.
// Until reference/ exists, validate the catalog itself and skip route checks.
const referenceStaged = existsSync(join(DOCS_ROOT, 'reference'));

if (!Array.isArray(commands) || commands.length === 0) {
  failures.push('command-index.json has no commands array');
}

const ids = new Set();
for (const command of commands) {
  const id = command.id ?? '<missing id>';
  if (!command.id) failures.push('command missing id');
  else if (ids.has(command.id)) failures.push(`${id}: duplicate command id`);
  else ids.add(command.id);

  if (!command.family) failures.push(`${id}: missing family`);
  if (!command.op) failures.push(`${id}: missing op`);
  if (!command.title) failures.push(`${id}: missing title`);

  if (typeof command.docs !== 'string') {
    failures.push(`${id}: missing docs route`);
  } else if (!command.docs.startsWith('/docs/reference/')) {
    failures.push(`${id}: docs route must start with /docs/reference/ (${command.docs})`);
  } else if (referenceStaged && !(await exists(docsFile(command.docs)))) {
    failures.push(`${id}: docs route has no source markdown (${command.docs})`);
  }

  for (const err of command.errors ?? []) {
    const code = err.code;
    const docs = err.docs;
    if (!knownErrors.has(code)) failures.push(`${id}: unknown error code ${code}`);
    if (docs !== `https://stratadb.org/e/${code}`) {
      failures.push(`${id}: invalid docs URL for ${code}: ${docs}`);
    }
  }
}

if (failures.length > 0) {
  console.error(`verify-commands: ${failures.length} failure(s)`);
  for (const failure of failures.slice(0, 100)) console.error(`- ${failure}`);
  if (failures.length > 100) console.error(`... ${failures.length - 100} more`);
  process.exit(1);
}

console.log(
  referenceStaged
    ? `verify-commands: ${commands.length} generated command(s) verified`
    : `verify-commands: ${commands.length} command(s) in the catalog; reference pages not restored yet`,
);
