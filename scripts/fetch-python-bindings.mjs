// Build-time: describe the Python SDK surface by introspecting the RELEASED
// wheel, never by hand. Same contract as the rest of the reference: the package
// is the source of truth and the site only renders it.
//
// Each namespace method names the wire command it wraps in its own body
// (`self._c.json_set(...)`), so the binding can be tied to a command without
// guessing. Signatures and the first docstring line come from inspect, and the
// doctest in the docstring is a real, runnable example.
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

const PROBE = `
import inspect, json, re, stratadb

db = stratadb.open(cache=True)
NAMESPACES = ["kv","json","vectors","events","graphs","branches","spaces","admin","arrow","ai","hub"]
out = {}
for ns_name in NAMESPACES:
    ns = getattr(db, ns_name, None)
    if ns is None:
        continue
    for name in sorted(dir(ns)):
        if name.startswith("_"):
            continue
        fn = getattr(ns, name, None)
        if not callable(fn):
            continue
        try:
            src = inspect.getsource(fn)
        except Exception:
            continue
        match = re.search(r"self\\._c\\.([a-z0-9_]+)\\(", src)
        if not match:
            continue
        doc = inspect.getdoc(fn) or ""
        try:
            signature = str(inspect.signature(fn))
        except Exception:
            signature = "()"
        example = [line.strip()[4:] for line in doc.splitlines() if line.strip().startswith(">>> ")]
        out.setdefault(match.group(1), {
            "call": "db.%s.%s" % (ns_name, name),
            "signature": signature,
            "summary": doc.split("\\n")[0].strip(),
            "example": example,
        })
print(json.dumps(out))
`;

async function main() {
  const python = process.env.STRATA_PYTHON || 'python3';
  let byWire;
  try {
    const { stdout } = await exec(python, ['-c', PROBE], { maxBuffer: 8 * 1024 * 1024 });
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
