import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const manifest = JSON.parse(await readFile('src/demos/colonies/source-manifest.json', 'utf8'));
for (const [name, expected] of Object.entries(manifest.files)) {
  const path =
    name === 'index.html'
      ? 'src/demos/colonies/index.html'
      : join('public/demos/colonies/assets', name);
  const actual = createHash('sha256')
    .update(await readFile(path))
    .digest('hex');
  if (actual !== expected)
    throw new Error(`${path}: out of sync. Run website:sync in strata-colonies.`);
}
const route = await readFile('src/pages/demos/colonies.astro', 'utf8');
if (
  !route.includes('../../styles/tokens.css?raw') ||
  !route.includes('../../demos/colonies/index.html?raw')
)
  throw new Error('Colonies must use the synced game and current website tokens.');
const listing = await readFile('src/pages/resources/demos.astro', 'utf8');
if (!listing.includes('/demos/colonies/'))
  throw new Error('Colonies is missing from the demos listing.');
console.log(
  `verify-colonies: ${Object.keys(manifest.files).length} synced sources verified; route and listing present`,
);
