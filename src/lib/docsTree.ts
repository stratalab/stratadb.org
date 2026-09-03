// The documentation tree, as an intention rather than a rendering of what
// exists. It is written down here so the shape can be reviewed before any of
// the pages are restored, and so the sidebar has something to depict while the
// content collection is still empty.
//
// Source: docs/product/14-docs-ia-redesign.md §5. Keep the two in step.
//
// Nothing here links anywhere. Items gain an `href` as their page lands, and
// the sidebar starts linking them at that point.

export interface TreeItem {
  label: string;
  href?: string;
}

export interface TreeGroup {
  label: string;
  items: TreeItem[];
}

export interface TreeSection {
  label: string;
  items?: TreeItem[];
  groups?: TreeGroup[];
}

export const docsTree: TreeSection[] = [
  {
    label: 'Get Started',
    items: [
      { label: 'Overview' },
      { label: 'Installation' },
      { label: 'Quickstart' },
      { label: 'Python quickstart' },
      { label: 'AI agent quickstart' },
    ],
  },
  {
    label: 'Learn',
    groups: [
      {
        label: 'How Strata works',
        items: [
          { label: 'Embedded databases' },
          { label: 'Databases and storage' },
          { label: 'Branches' },
          { label: 'Commits and versions' },
          { label: 'Time travel' },
          { label: 'Spaces' },
          { label: 'Durability' },
          { label: 'Errors and retries' },
        ],
      },
      {
        label: 'Working with data',
        items: [
          { label: 'Overview' },
          { label: 'Key-value' },
          { label: 'JSON' },
          { label: 'Events' },
          { label: 'Vectors' },
          { label: 'Graph' },
        ],
      },
      {
        label: 'Inference',
        items: [
          { label: 'Overview' },
          { label: 'Models' },
          { label: 'Generation' },
          { label: 'Embeddings' },
          { label: 'Reranking' },
        ],
      },
      {
        label: 'Distribution',
        items: [{ label: 'Strata Hub' }, { label: 'Cloning databases' }],
      },
    ],
  },
  {
    label: 'Guides',
    groups: [
      {
        label: 'Branching and history',
        items: [
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
        items: [
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
        items: [
          { label: 'Give each run a branch' },
          { label: 'Persist agent memory' },
          { label: 'Record tool activity' },
          { label: 'Replay an agent run' },
        ],
      },
      {
        label: 'Data',
        items: [
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
        items: [
          { label: 'Configure Strata' },
          { label: 'Inspect database health' },
          { label: 'Back up a database' },
          { label: 'Recover from errors' },
          { label: 'Troubleshoot failures' },
        ],
      },
      {
        label: 'Deployment',
        items: [
          { label: 'Embed in an application' },
          { label: 'Package with an application' },
          { label: 'Run in the browser' },
        ],
      },
    ],
  },
  {
    label: 'Develop',
    groups: [
      {
        label: 'Python',
        items: [
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
        items: [
          { label: 'Overview' },
          { label: 'Targeting databases' },
          { label: 'Interactive shell' },
          { label: 'Output formats' },
          { label: 'Scripting' },
        ],
      },
      {
        label: 'AI agents',
        items: [
          { label: 'Overview' },
          { label: 'Agent skills' },
          { label: 'Machine-readable docs' },
          { label: 'Command discovery' },
          { label: 'Error handling' },
        ],
      },
      {
        label: 'MCP',
        items: [
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
    items: [
      { label: 'MCP tools' },
      { label: 'Configuration' },
      { label: 'Error codes' },
      { label: 'Data types' },
      { label: 'Compatibility and versioning' },
    ],
    groups: [
      {
        label: 'CLI',
        items: [
          { label: 'Global options' },
          { label: 'init' },
          { label: 'doctor' },
          { label: 'agents' },
          { label: 'mcp' },
          { label: 'start / stop' },
          { label: 'ipc' },
          { label: 'remote' },
          { label: 'command' },
        ],
      },
      {
        // Generated, one page per command. Families only here: the operations
        // stay collapsed until a family is opened, per the progressive
        // disclosure rule.
        label: 'Commands',
        items: [
          { label: 'Key-value' },
          { label: 'JSON' },
          { label: 'Vectors' },
          { label: 'Events' },
          { label: 'Graph' },
          { label: 'Branches' },
          { label: 'Spaces' },
          { label: 'Inference' },
          { label: 'Admin' },
          { label: 'Arrow' },
          { label: 'Hub' },
        ],
      },
    ],
  },
];

export function countItems(section: TreeSection): number {
  return (
    (section.items?.length ?? 0) +
    (section.groups ?? []).reduce((total, group) => total + group.items.length, 0)
  );
}
