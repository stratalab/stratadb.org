// Build-time hub catalog source: live StrataHub V1 API → committed fallback.
// Mirrors fetch-release.mjs semantics - never fails the build; the committed
// src/data/hub-catalog.json is the floor (curated from stratalab/stratahub's
// docs/curated-datasets, the same source the hub serves).
//
// Live wins for API-owned facts (description, tasks, tags, license, primitives,
// branches, sizes, downloads, ordering). The committed file's hand-tuned
// `includes` and `quickstart` prose is kept for datasets that already have it;
// datasets new to the hub get a minimal card until curated copy lands.
import { readFile, writeFile } from 'node:fs/promises';

const FILE = new URL('../src/data/hub-catalog.json', import.meta.url);

const committed = JSON.parse(await readFile(FILE, 'utf8'));
const HUB = process.env.STRATA_HUB_URL?.replace(/\/$/, '') ?? committed.hub;

async function hub(path) {
  const res = await fetch(`${HUB}${path}`, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`${path}: ${res.status}`);
  return res.json();
}

function titleFromReadme(readme, fallback) {
  const heading = readme?.match(/^#\s+(.+)$/m)?.[1]?.trim();
  return heading || fallback;
}

try {
  const list = await hub('/v1/datasets?limit=200');
  if (!Array.isArray(list.items) || list.items.length === 0) {
    throw new Error('/v1/datasets returned no items');
  }

  const bySlug = new Map(committed.datasets.map((d) => [d.slug, d]));
  const datasets = [];
  for (const item of list.items) {
    // Card fetch failure degrades that entry to summary + committed copy.
    const card = await hub(`/v1/datasets/${item.name}`).catch(() => null);
    const prior = bySlug.get(item.name);
    const branches = card?.strata_features?.branches?.map((b) => b.name) ??
      prior?.branches ?? [item.default_branch];
    datasets.push({
      slug: item.name,
      title: prior?.title ?? titleFromReadme(card?.readme, item.name),
      description: item.description,
      tasks: item.tasks,
      tags: item.tags,
      license: item.license,
      size_category: prior?.size_category ?? 'small',
      size_bytes: item.size_bytes,
      downloads: item.downloads,
      last_updated: item.last_updated,
      primitives: item.primitives.filter((p) => p !== 'branches'),
      branches,
      includes: prior?.includes ?? [],
      quickstart: prior?.quickstart ?? [`strata clone ${item.name} ./${item.name}`],
    });
  }

  await writeFile(
    FILE,
    JSON.stringify(
      {
        hub: committed.hub,
        source: `${HUB}/v1/datasets`,
        fetched_at: new Date().toISOString().slice(0, 10),
        datasets,
      },
      null,
      2,
    ) + '\n',
  );
  console.log(`hub-catalog.json: ${datasets.length} datasets (live from ${HUB})`);
} catch (err) {
  console.warn(
    `hub-catalog.json: hub fetch failed (${err.message}); keeping committed snapshot of ${committed.datasets.length} datasets`,
  );
}
