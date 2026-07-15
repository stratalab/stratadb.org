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

const SECTION_ORDER = ['getting-started', 'concepts', 'data', 'inference', 'guides', 'cookbook', 'reference'];
const SECTION_TITLES: Record<string, string> = {
  'getting-started': 'Getting Started',
  concepts: 'Concepts',
  data: 'Working with Data',
  inference: 'Inference',
  guides: 'Guides',
  cookbook: 'Cookbook',
  reference: 'Reference',
};
// Curated ordering where narrative order matters; everything else alphabetical.
const PREFERRED: Record<string, string[]> = {
  // NB: Astro collapses "<dir>/index" slugs to "<dir>"
  'getting-started': ['getting-started', 'getting-started/installation', 'getting-started/first-database', 'getting-started/for-agents'],
  // Working with Data: the five primitives in substrate order, then the cross-cutting spine.
  data: ['data/key-value', 'data/json', 'data/vectors', 'data/events', 'data/graph', 'data/combining-primitives'],
  // Inference: the model overview, then the cloud and local enabling pages.
  inference: ['inference', 'inference/providers-and-keys', 'inference/local-models'],
};

// Generated command-reference families (staged under reference/<family>/ by
// scripts/fetch-docs.mjs). Order = the IDL family order; titles are readable.
const REFERENCE_FAMILIES = ['kv', 'json', 'vector', 'event', 'graph', 'branch', 'space', 'admin', 'arrow', 'inference'];
const FAMILY_TITLES: Record<string, string> = {
  kv: 'Key-Value', json: 'JSON', vector: 'Vectors', event: 'Events', graph: 'Graph',
  branch: 'Branches', space: 'Spaces', admin: 'Admin', arrow: 'Arrow', inference: 'Inference',
};

const hrefFor = (slug: string, dir: string) =>
  slug.endsWith('/index') || slug === 'index' ? `/docs/${dir}` : `/docs/${slug}`;

type Doc = Awaited<ReturnType<typeof getCollection<'docs'>>>[number];

// Reference nests: hand-written cross-cutting pages (CLI, errors, …) as flat
// items; each generated command family as a sub-group.
function referenceSection(entries: Doc[]): NavSection {
  const family = new Set(REFERENCE_FAMILIES);
  const topLevel = entries.filter((e) => {
    const parts = e.slug.split('/');
    return parts.length === 1 || (parts.length === 2 && !family.has(parts[1]));
  });
  const groups: NavGroup[] = [];
  for (const fam of REFERENCE_FAMILIES) {
    const commands = entries
      .filter((e) => e.slug.startsWith(`reference/${fam}/`))
      .sort((a, b) => a.data.title.localeCompare(b.data.title));
    const index = entries.find((e) => e.slug === `reference/${fam}`);
    if (!commands.length && !index) continue;
    groups.push({
      title: FAMILY_TITLES[fam] ?? fam,
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
