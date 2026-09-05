import { access, readFile, readdir } from 'node:fs/promises';
import { constants } from 'node:fs';
import { extname, join, relative, sep } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const DOCS_ROOT = join(ROOT, 'src/content/docs');
const COMMAND_INDEX = join(ROOT, 'src/data/command-index.json');
const SCAN_ROOTS = [
  'src/content/docs',
  'src/content/architecture',
  'src/pages',
  'src/components',
  'src/lib',
];
const EXTENSIONS = new Set(['.astro', '.md', '.mdx', '.ts', '.tsx']);
const TOP_LEVEL_REFERENCE = [
  'index.md',
  'cli.md',
  'command-reference.md',
  'api-quick-reference.md',
  'configuration-reference.md',
  'error-reference.md',
  'value-type-reference.md',
];
const STALE_DOC_PATHS = [
  '/docs/key-value',
  '/docs/events',
  '/docs/vectors',
  '/docs/graph',
  '/docs/branches',
  '/docs/mcp',
  '/docs/errors',
  '/docs/configuration',
  '/docs/quickstart',
  '/docs/install',
  '/docs/search',
  '/docs/primitives',
  '/docs/recipes',
];
const MANUAL_FACTS = [
  { label: 'manual command total', pattern: /\b\d+\s+(?:generated\s+)?commands?\b/i },
  { label: 'manual command catalog count', pattern: /\bcommand_count\b/i },
  {
    label: 'manual error total',
    pattern: /\b(?:there are\s+)?\d+\s+(?:public\s+)?(?:error[-\s])?codes?\b/i,
  },
  { label: 'manual MCP tool count', pattern: /\b(?:roughly\s+)?\d+\s+curated tools?\b/i },
  {
    label: 'stale interim reference disclaimer',
    pattern:
      /Interim page|Maintained by hand until|Where this page and `strata agents commands --json` disagree/i,
  },
];

function toPosix(path) {
  return path.split(sep).join('/');
}

async function exists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function walk(path) {
  const absolute = join(ROOT, path);
  if (!(await exists(absolute))) return [];
  const out = [];
  for (const entry of await readdir(absolute, { withFileTypes: true })) {
    const child = join(absolute, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(toPosix(relative(ROOT, child)))));
    else if (EXTENSIONS.has(extname(entry.name))) out.push(child);
  }
  return out;
}

function hasStalePath(text, stalePath) {
  const escaped = stalePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`${escaped}(?:[\\s"')#?]|$)`).test(text);
}

const commandIndex = JSON.parse(await readFile(COMMAND_INDEX, 'utf8'));
const commands = commandIndex.commands ?? [];
const families = [...new Set(commands.map((command) => command.family).filter(Boolean))].sort();
const familySet = new Set(families);
const generatedCommandLink = new RegExp(
  `/docs/reference/(${families.join('|')})/[A-Za-z0-9_/-]+`,
  'g',
);
const failures = [];

// Docs rebuild: reference/ returns family by family. While it is absent the
// structural checks below have nothing to assert, but the source scans still
// guard live pages against manual command facts and retired paths.
const referenceStaged = await exists(join(DOCS_ROOT, 'reference'));

for (const page of referenceStaged ? TOP_LEVEL_REFERENCE : []) {
  const file = join(DOCS_ROOT, 'reference', page);
  if (!(await exists(file)))
    failures.push(`src/content/docs/reference/${page}: missing top-level reference page`);
}

for (const family of referenceStaged ? families : []) {
  const index = join(DOCS_ROOT, 'reference', family, 'index.md');
  if (!(await exists(index)))
    failures.push(`src/content/docs/reference/${family}/index.md: missing generated family index`);
}

for (const command of referenceStaged ? commands : []) {
  if (!command.docs?.startsWith('/docs/reference/')) continue;
  const file = join(DOCS_ROOT, `${command.docs.replace(/^\/docs\//, '')}.md`);
  if (!(await exists(file)))
    failures.push(`${command.id}: missing generated docs page ${command.docs}`);
}

for (const root of SCAN_ROOTS) {
  for (const file of await walk(root)) {
    const rel = toPosix(relative(ROOT, file));
    const generatedMatch = rel.match(/^src\/content\/docs\/reference\/([^/]+)\//);
    // src/pages/docs/reference is the renderer for generated commands, so it
    // legitimately carries their URLs. The rule exists to keep command facts
    // and links out of NARRATIVE pages, not out of the reference surface.
    const isGeneratedReference =
      (generatedMatch && familySet.has(generatedMatch[1])) ||
      rel.startsWith('src/pages/docs/reference/');
    const text = await readFile(file, 'utf8');

    if (!isGeneratedReference) {
      for (const fact of MANUAL_FACTS) {
        if (fact.pattern.test(text)) failures.push(`${rel}: ${fact.label}`);
      }
      for (const match of text.matchAll(generatedCommandLink)) {
        failures.push(`${rel}: manual generated command URL ${match[0]}`);
      }
    }

    for (const stalePath of STALE_DOC_PATHS) {
      if (hasStalePath(text, stalePath)) failures.push(`${rel}: stale docs path ${stalePath}`);
    }

    const staleFamilyPath = text.match(
      /\/docs\/(?:kv|json|vector|event|graph|branch|space|admin|arrow)\/[A-Za-z0-9_/-]+/,
    );
    if (staleFamilyPath) failures.push(`${rel}: stale direct command path ${staleFamilyPath[0]}`);
  }
}

if (failures.length > 0) {
  console.error(`verify-reference-ia: ${failures.length} failure(s)`);
  for (const failure of failures.slice(0, 100)) console.error(`- ${failure}`);
  if (failures.length > 100) console.error(`... ${failures.length - 100} more`);
  process.exit(1);
}

console.log(
  referenceStaged
    ? `verify-reference-ia: ${commands.length} command docs route(s) and ${families.length} family index(es) verified`
    : `verify-reference-ia: reference pages not restored yet; scanned live source for retired paths and manual command facts`,
);
