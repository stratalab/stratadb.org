// Build-time version source (06 §4): GitHub releases → tags → committed fallback.
// Never fails the build; the committed src/data/release.json is the floor.
//
// Also records which platforms the release actually ships a binary for. The
// site claimed Windows support in its structured data while the release shipped
// no Windows build at all; a claim derived from the assets cannot say that.
// Target strings are recorded raw here, since naming platforms is presentation
// and belongs in src/lib/platforms.ts.
import { readFile, writeFile } from 'node:fs/promises';

const FILE = new URL('../src/data/release.json', import.meta.url);
const API = 'https://api.github.com/repos/stratalab/strata-core';

async function gh(path) {
  const headers = { Accept: 'application/vnd.github+json' };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const res = await fetch(`${API}${path}`, {
    headers,
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`${path}: ${res.status}`);
  return res.json();
}

// Release assets are named strata-v<version>-<target>.tar.gz. Anything else in
// the release (the docs bundle, the wasm build, checksums) is not a platform.
function releaseTargets(assets) {
  return assets
    .map((a) => ({ asset: a.name, url: a.browser_download_url, size: a.size }))
    .map((a) => ({ ...a, target: /^strata-v[\d.]+-(.+)\.tar\.gz$/.exec(a.asset)?.[1] }))
    .filter((a) => a.target)
    .map(({ target, asset, url, size }) => ({ target, asset, url, size }))
    .sort((a, b) => a.target.localeCompare(b.target));
}

// The release publishes one sha256 manifest for every asset. install.sh refuses
// to install without it, so the site can show the same digest a reader would
// check by hand.
async function attachChecksums(rel, targets) {
  const manifest = (rel.assets ?? []).find((a) => a.name === 'checksums-sha256.txt');
  if (!manifest) return;
  try {
    const res = await fetch(manifest.browser_download_url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return;
    const byAsset = new Map(
      (await res.text())
        .split('\n')
        .map((line) => line.trim().split(/\s+/))
        .filter((parts) => parts.length === 2)
        .map(([sha, name]) => [name, sha]),
    );
    for (const t of targets) {
      const sha = byAsset.get(t.asset);
      if (sha) t.sha256 = sha;
    }
  } catch {
    /* the digests are a nicety; a release without them still builds */
  }
}

try {
  let version,
    source,
    targets = [];
  try {
    const rel = await gh('/releases/latest');
    version = rel.tag_name.replace(/^v/, '');
    source = `GitHub release ${rel.tag_name}`;
    targets = releaseTargets(rel.assets ?? []);
    await attachChecksums(rel, targets);
  } catch {
    const tags = await gh('/tags?per_page=1');
    version = tags[0].name.replace(/^v/, '');
    source = `GitHub tag ${tags[0].name} (no releases published)`;
  }
  await writeFile(
    FILE,
    JSON.stringify(
      { version, source, fetched_at: new Date().toISOString().slice(0, 10), targets },
      null,
      2,
    ) + '\n',
  );
  console.log(`release.json: ${version} (${source}); ${targets.length} platform target(s)`);
} catch (err) {
  const current = JSON.parse(await readFile(FILE, 'utf8'));
  console.warn(`release.json: fetch failed (${err.message}); keeping committed ${current.version}`);
}
