// The documentation tree, as an intention rather than a rendering of what
// exists. Written down here so the shape can be reviewed before the pages are
// restored, and so the sidebar has something to depict while the content
// collection is empty.
//
// Source: docs/product/14-docs-ia-redesign.md §5. Keep the two in step.
//
// It is deliberately a manifest rather than a walk of the filesystem. Reference
// is generated, so it is the part that grows without anyone deciding to grow
// it; if it ever outruns a single tree, switching to a per-section switcher
// becomes a rendering change here rather than an IA change.
//
// Nothing links anywhere yet. A node gains an `href` as its page lands.

import {
  FAMILY_ORDER,
  FAMILY_TITLES,
  commandsInFamily,
  groupTitle,
  isFamilyPublished,
} from './publishedCommands';

export interface TreeNode {
  label: string;
  href?: string;
  children?: TreeNode[];
  /** Emitted from the IDL in strata-core. Never authored or edited here. */
  generated?: boolean;
}

export const docsTree: TreeNode[] = [
  {
    label: 'Get Started',
    children: [
      { label: 'Overview' },
      { label: 'Installation', href: '/docs/get-started/installation' },
      { label: 'Quickstart' },
      { label: 'Python quickstart' },
      { label: 'AI agent quickstart', href: '/docs/get-started/agents' },
    ],
  },
  {
    label: 'Learn',
    children: [
      { label: 'Introduction to StrataDB', href: '/docs/learn/introduction' },
      {
        label: 'How Strata works',
        children: [
          { label: 'Embedded databases', href: '/docs/learn/embedded-databases' },
          { label: 'Databases and storage' },
          { label: 'Branches', href: '/docs/learn/branches' },
          { label: 'Commits and versions', href: '/docs/learn/commits-and-versions' },
          { label: 'Time travel', href: '/docs/learn/time-travel' },
          { label: 'Spaces', href: '/docs/learn/spaces' },
          { label: 'Durability' },
        ],
      },
      {
        label: 'Working with data',
        href: '/docs/learn/working-with-data',
        children: [
          { label: 'Key-value', href: '/docs/learn/key-value' },
          { label: 'JSON', href: '/docs/learn/json' },
          { label: 'Events', href: '/docs/learn/events' },
          { label: 'Vectors', href: '/docs/learn/vectors' },
          { label: 'Graph', href: '/docs/learn/graph' },
        ],
      },
      {
        label: 'Inference',
        children: [
          { label: 'Overview' },
          { label: 'Models' },
          { label: 'Generation' },
          { label: 'Embeddings' },
          { label: 'Reranking' },
        ],
      },
      {
        label: 'Distribution',
        children: [{ label: 'Strata Hub' }, { label: 'Cloning databases' }],
      },
    ],
  },
  {
    label: 'Guides',
    children: [
      {
        label: 'Branching and history',
        children: [
          { label: 'Isolate an experiment' },
          { label: 'Compare two branches' },
          { label: 'Preview a merge' },
          { label: 'Merge changes' },
          { label: 'Resolve merge conflicts' },
          { label: 'Fork from historical state' },
          { label: 'Read historical state' },
        ],
      },
      {
        label: 'AI and retrieval',
        children: [
          { label: 'Build semantic search' },
          { label: 'Build RAG' },
          { label: 'Embed and store documents' },
          { label: 'Rerank search results' },
          { label: 'Use local models' },
          { label: 'Use cloud providers' },
        ],
      },
      {
        label: 'Agent applications',
        children: [
          { label: 'Give each run a branch' },
          { label: 'Persist agent memory' },
          { label: 'Record tool activity' },
          { label: 'Replay an agent run' },
        ],
      },
      {
        label: 'Data',
        children: [
          { label: 'Import data' },
          { label: 'Export data' },
          { label: 'Migrate from SQLite' },
          { label: 'Combine data models' },
          { label: 'Clone a dataset' },
          { label: 'Organize with spaces' },
        ],
      },
      {
        label: 'Operations',
        children: [
          { label: 'Configure Strata' },
          { label: 'Inspect database health' },
          { label: 'Back up a database' },
          { label: 'Recover from errors' },
          { label: 'Troubleshoot failures' },
        ],
      },
      {
        label: 'Deployment',
        children: [
          { label: 'Embed in an application' },
          { label: 'Package with an application' },
          { label: 'Run in the browser' },
        ],
      },
    ],
  },
  {
    label: 'Develop',
    children: [
      {
        label: 'Python',
        children: [
          { label: 'Overview' },
          { label: 'Installation' },
          { label: 'Opening databases' },
          { label: 'Key-value' },
          { label: 'JSON' },
          { label: 'Events' },
          { label: 'Vectors' },
          { label: 'Graph' },
          { label: 'Branches' },
          { label: 'Time travel' },
          { label: 'Inference' },
          { label: 'Error handling' },
        ],
      },
      {
        label: 'CLI',
        children: [
          { label: 'Overview' },
          { label: 'Targeting databases' },
          { label: 'Interactive shell' },
          { label: 'Output formats' },
          { label: 'Scripting' },
        ],
      },
      {
        label: 'AI agents',
        children: [
          { label: 'Overview' },
          { label: 'Agent skills' },
          { label: 'Machine-readable docs' },
          { label: 'Command discovery' },
          { label: 'Error handling' },
        ],
      },
      {
        label: 'MCP',
        children: [
          { label: 'Overview' },
          { label: 'Setup' },
          { label: 'Clients' },
          { label: 'Tool model' },
        ],
      },
    ],
  },
  {
    label: 'Reference',
    href: '/docs/reference',
    children: [
      // Commands leads. It is 135 of the roughly 150 pages in this section, and
      // it is what someone opening Reference came for. It also disambiguates
      // the node below it: with Commands first, "CLI" reads as the binary's own
      // surface rather than as the way to run a command, which is the reading a
      // reader after `strata kv put` would otherwise take.
      commandsNode(),
      {
        label: 'CLI',
        children: [
          { label: 'Global options' },
          { label: 'init' },
          { label: 'doctor' },
          { label: 'agents' },
          { label: 'mcp' },
          { label: 'start and stop' },
          { label: 'ipc' },
          { label: 'remote' },
          { label: 'command' },
        ],
      },
      { label: 'MCP tools', generated: true },
      { label: 'Configuration' },
      { label: 'Error codes' },
      { label: 'Data types' },
      { label: 'Compatibility and versioning' },
    ],
  },
];

// The generated half of the tree. Families keep their middle levels rather than
// flattening, and only published entries carry an href, so the sidebar can
// never link a page that has not been restored.
function commandsNode(): TreeNode {
  const families = FAMILY_ORDER.map((family) => {
    const commands = commandsInFamily(family);
    const live = isFamilyPublished(family);

    // Group by the segment below the family, e.g. vector/collection/create.
    const direct: TreeNode[] = [];
    const groups = new Map<string, TreeNode[]>();
    for (const command of commands) {
      // The operation name, not the prose title. A sidebar is a scanning
      // surface: someone after `kv put` looks for `put`, and thirteen titles
      // that all start with "Batch ..." bury the distinguishing word at the
      // end. The engine operation is also the one name stable across CLI,
      // wire, MCP and Python, and it matches the URL. Prose lives one level
      // up, on the family landing, which lists every command with its summary.
      const node: TreeNode = {
        label: command.segments[command.segments.length - 1],
        // The family page, at this command's anchor, rather than the command's
        // own page. The family page carries every command in full, so landing
        // there keeps the rest of the family one Ctrl-F away instead of one
        // navigation. The detail page is still a click on "View details".
        href: live ? `/docs/reference/${family}#${command.segments.join('-')}` : undefined,
        generated: true,
      };
      if (command.segments.length > 1) {
        const key = command.segments[0];
        groups.set(key, [...(groups.get(key) ?? []), node]);
      } else {
        direct.push(node);
      }
    }

    const children = [
      ...direct,
      ...[...groups.entries()].map(([key, items]) => ({
        label: groupTitle(key),
        children: items,
      })),
    ];

    return {
      label: FAMILY_TITLES[family] ?? family,
      href: live ? `/docs/reference/${family}` : undefined,
      generated: true,
      children: children.length ? children : undefined,
    };
  });

  return { label: 'Commands', generated: true, children: families };
}
