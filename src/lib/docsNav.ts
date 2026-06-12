// Sidebar tree generated FROM the content collections (01 §6 done-criterion:
// no dead links — the nav can only point at entries that exist).
import { getCollection } from 'astro:content';

export interface NavItem {
  title: string;
  href: string;
}
export interface NavSection {
  title: string;
  items: NavItem[];
}

const SECTION_ORDER = ['getting-started', 'concepts', 'guides', 'cookbook', 'reference'];
const SECTION_TITLES: Record<string, string> = {
  'getting-started': 'Getting Started',
  concepts: 'Concepts',
  guides: 'Guides',
  cookbook: 'Cookbook',
  reference: 'Reference',
};
// Curated ordering where narrative order matters; everything else alphabetical.
const PREFERRED: Record<string, string[]> = {
  // NB: Astro collapses "<dir>/index" slugs to "<dir>"
  'getting-started': ['getting-started', 'getting-started/installation', 'getting-started/first-database', 'getting-started/for-agents'],
};

export async function docsNav(): Promise<NavSection[]> {
  const docs = await getCollection('docs');
  const sections: NavSection[] = [];

  for (const dir of SECTION_ORDER) {
    const entries = docs.filter((d) => d.slug.startsWith(`${dir}/`) || d.slug === dir);
    if (!entries.length) continue;
    const preferred = PREFERRED[dir] ?? [];
    entries.sort((a, b) => {
      const pa = preferred.indexOf(a.slug);
      const pb = preferred.indexOf(b.slug);
      if (pa !== -1 || pb !== -1) return (pa === -1 ? 99 : pa) - (pb === -1 ? 99 : pb);
      return (a.data.order ?? 99) - (b.data.order ?? 99) || a.data.title.localeCompare(b.data.title);
    });
    sections.push({
      title: SECTION_TITLES[dir] ?? dir,
      items: entries.map((e) => ({
        title: e.data.title,
        href: e.slug.endsWith('/index') || e.slug === 'index' ? `/docs/${dir}` : `/docs/${e.slug}`,
      })),
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
