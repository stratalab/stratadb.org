export const resourceNavItems = [
  {
    slug: 'documentation',
    label: 'Documentation',
    href: '/resources/documentation',
    summary: 'Guides, generated reference, SDKs, and agent setup.',
  },
  {
    slug: 'blogs',
    label: 'Blogs',
    href: '/resources/blogs',
    summary: 'Product essays and technical notes as they publish.',
  },
  {
    slug: 'about',
    label: 'About',
    href: '/resources/about',
    summary: 'What StrataDB is, what ships today, and where the source lives.',
  },
  {
    slug: 'architecture',
    label: 'Architecture',
    href: '/resources/architecture',
    summary: 'Storage, MVCC, durability, internals, and implementation notes.',
  },
  {
    slug: 'demos',
    label: 'Demos',
    href: '/resources/demos',
    summary: 'Interactive demos now, video walkthroughs when they go live.',
  },
  {
    slug: 'whitepapers',
    label: 'Whitepapers',
    href: '/resources/whitepapers',
    summary: 'Long-form technical papers and design documents.',
  },
  {
    slug: 'benchmarks',
    label: 'Benchmarks',
    href: '/resources/benchmarks',
    summary: 'Evaluation reports, harness notes, and reproducible results.',
  },
] as const;

// Documentation is promoted to the primary navigation, so it is left out of the
// Resources dropdown. It stays a Resources page: the section sidebar and the
// /resources index still list it, and /resources/documentation still resolves.
export const resourceMenuItems = resourceNavItems.filter((item) => item.slug !== 'documentation');

export type ResourceSlug = (typeof resourceNavItems)[number]['slug'];
