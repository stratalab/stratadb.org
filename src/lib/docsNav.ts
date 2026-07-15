// Sidebar tree generated FROM the content collections (01 §6 done-criterion:
// no dead links — the nav can only point at entries that exist).
import { getCollection } from 'astro:content';

export interface NavItem {
  title: string;
  href: string;
}
// A nested group within a section — used for the generated command reference,
// where each family (kv, vector, …) is a sub-tree (Doc 11 §7.1).
export interface NavGroup {
  title: string;
  href?: string;
  items: NavItem[];
}
export interface NavSection {
  title: string;
  items: NavItem[];
  groups?: NavGroup[];
}

const SECTION_ORDER = ['why-strata', 'getting-started', 'concepts', 'data', 'inference', 'guides', 'python', 'cookbook', 'reference', 'agents'];
const SECTION_TITLES: Record<string, string> = {
  'why-strata': 'Why Strata',
  'getting-started': 'Getting Started',
  concepts: 'Concepts',
  data: 'Working with Data',
  inference: 'Inference',
  guides: 'Guides',
  python: 'Python SDK',
  cookbook: 'Cookbook',
  reference: 'Reference',
  agents: 'For AI Agents',
};
// Curated ordering where narrative order matters; everything else alphabetical.
const PREFERRED: Record<string, string[]> = {
  // NB: Astro collapses "<dir>/index" slugs to "<dir>"
  'why-strata': ['why-strata', 'why-strata/when-to-use', 'why-strata/comparisons'],
  'getting-started': ['getting-started', 'getting-started/installation', 'getting-started/first-database', 'getting-started/quickstart-agents'],
  // Concepts in pedagogical order: the model, then history/isolation, organizing, the contract.
  concepts: [
    'concepts', 'concepts/embedded-architecture', 'concepts/primitives', 'concepts/value-types',
    'concepts/branches', 'concepts/commits', 'concepts/time-travel', 'concepts/durability',
    'concepts/spaces', 'concepts/hub-and-clone', 'concepts/errors',
  ],
  // Working with Data: the five primitives in substrate order, then the cross-cutting spine.
  data: ['data/key-value', 'data/json', 'data/vectors', 'data/events', 'data/graph', 'data/combining-primitives'],
  // Inference: the model overview, then the cloud and local enabling pages.
  inference: ['inference', 'inference/providers-and-keys', 'inference/local-models'],
  // Python SDK: overview → install → the API surface → integration.
  python: ['python', 'python/installation', 'python/namespaces', 'python/inference', 'python/errors', 'python/agents'],
  // Guides: cross-cutting how-to, grouped history → operating → moving data → shipping.
  guides: [
    'guides', 'guides/branching-workflows', 'guides/time-travel', 'guides/spaces',
    'guides/configuration', 'guides/error-handling', 'guides/observability',
    'guides/import-export', 'guides/cloning-datasets', 'guides/migrating', 'guides/deploying',
  ],
  // For AI Agents: the front door, then guide/index/mcp/machine-docs.
  agents: ['agents', 'agents/agents-guide', 'agents/command-index', 'agents/mcp-server', 'agents/machine-docs'],
};

// Generated command-reference families (staged under reference/<family>/ by
// scripts/fetch-docs.mjs). The list is DISCOVERED from the staged content so a
// new family can never silently vanish from the sidebar; this order ranks the
// known ones, and anything undiscovered-but-staged appends alphabetically.
const FAMILY_ORDER = ['kv', 'json', 'vector', 'event', 'graph', 'branch', 'space', 'admin', 'arrow', 'inference'];
const FAMILY_TITLES: Record<string, string> = {
  kv: 'Key-Value', json: 'JSON', vector: 'Vectors', event: 'Events', graph: 'Graph',
  branch: 'Branches', space: 'Spaces', admin: 'Admin', arrow: 'Arrow', inference: 'Inference',
};
const familyTitle = (family: string) =>
  FAMILY_TITLES[family] ?? family.charAt(0).toUpperCase() + family.slice(1);

const hrefFor = (slug: string, dir: string) =>
  slug.endsWith('/index') || slug === 'index' ? `/docs/${dir}` : `/docs/${slug}`;

type Doc = Awaited<ReturnType<typeof getCollection<'docs'>>>[number];

// Reference nests: hand-written cross-cutting pages (CLI, errors, …) as flat
// items; each generated command family as a sub-group. Families are whatever
// the staged content actually contains (slug depth ≥ 2 under reference/).
function referenceSection(entries: Doc[]): NavSection {
  const discovered = new Set<string>();
  for (const entry of entries) {
    const parts = entry.slug.split('/');
    // reference/<family>/<op...> — a family index alone (depth 2) does not
    // make a family; only real command pages (depth ≥ 3) do.
    if (parts.length >= 3) discovered.add(parts[1]);
  }
  const families = [
    ...FAMILY_ORDER.filter((fam) => discovered.has(fam)),
    ...[...discovered].filter((fam) => !FAMILY_ORDER.includes(fam)).sort(),
  ];
  const familySet = new Set(families);

  const topLevel = entries.filter((e) => {
    const parts = e.slug.split('/');
    return parts.length === 1 || (parts.length === 2 && !familySet.has(parts[1]));
  });
  const groups: NavGroup[] = [];
  for (const fam of families) {
    const commands = entries
      .filter((e) => e.slug.startsWith(`reference/${fam}/`))
      .sort((a, b) => a.data.title.localeCompare(b.data.title));
    const index = entries.find((e) => e.slug === `reference/${fam}`);
    groups.push({
      title: familyTitle(fam),
      href: index ? `/docs/reference/${fam}` : undefined,
      items: commands.map((e) => ({ title: e.data.title, href: `/docs/${e.slug}` })),
    });
  }
  return {
    title: SECTION_TITLES.reference,
    items: topLevel
      .sort((a, b) => a.data.title.localeCompare(b.data.title))
      .map((e) => ({ title: e.data.title, href: hrefFor(e.slug, 'reference') })),
    groups: groups.length ? groups : undefined,
  };
}

export async function docsNav(): Promise<NavSection[]> {
  const docs = await getCollection('docs');
  const sections: NavSection[] = [];

  for (const dir of SECTION_ORDER) {
    const entries = docs.filter((d) => d.slug.startsWith(`${dir}/`) || d.slug === dir);
    if (!entries.length) continue;

    if (dir === 'reference') {
      sections.push(referenceSection(entries));
      continue;
    }

    const preferred = PREFERRED[dir] ?? [];
    entries.sort((a, b) => {
      const pa = preferred.indexOf(a.slug);
      const pb = preferred.indexOf(b.slug);
      if (pa !== -1 || pb !== -1) return (pa === -1 ? 99 : pa) - (pb === -1 ? 99 : pb);
      return (a.data.order ?? 99) - (b.data.order ?? 99) || a.data.title.localeCompare(b.data.title);
    });
    sections.push({
      title: SECTION_TITLES[dir] ?? dir,
      items: entries.map((e) => ({ title: e.data.title, href: hrefFor(e.slug, dir) })),
    });
  }

  // top-level singles (faq, troubleshooting, …)
  const singles = docs.filter((d) => !d.slug.includes('/') && d.slug !== 'index');
  if (singles.length)
    sections.push({
      title: 'More',
      items: singles
        .sort((a, b) => a.data.title.localeCompare(b.data.title))
        .map((e) => ({ title: e.data.title, href: `/docs/${e.slug}` })),
    });

  return sections;
}
