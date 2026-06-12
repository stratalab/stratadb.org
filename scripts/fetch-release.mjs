// Build-time version source (06 §4): GitHub releases → tags → committed fallback.
// Never fails the build; the committed src/data/release.json is the floor.
import { readFile, writeFile } from 'node:fs/promises';

const FILE = new URL('../src/data/release.json', import.meta.url);
const API = 'https://api.github.com/repos/stratalab/strata-core';

async function gh(path) {
  const res = await fetch(`${API}${path}`, {
    headers: { Accept: 'application/vnd.github+json' },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`${path}: ${res.status}`);
  return res.json();
}

try {
  let version, source;
  try {
    const rel = await gh('/releases/latest');
    version = rel.tag_name.replace(/^v/, '');
    source = `GitHub release ${rel.tag_name}`;
  } catch {
    const tags = await gh('/tags?per_page=1');
    version = tags[0].name.replace(/^v/, '');
    source = `GitHub tag ${tags[0].name} (no releases published)`;
  }
  await writeFile(
    FILE,
    JSON.stringify({ version, source, fetched_at: new Date().toISOString().slice(0, 10) }, null, 2) + '\n'
  );
  console.log(`release.json: ${version} (${source})`);
} catch (err) {
  const current = JSON.parse(await readFile(FILE, 'utf8'));
  console.warn(`release.json: fetch failed (${err.message}); keeping committed ${current.version}`);
}
