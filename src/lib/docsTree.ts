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
      { label: 'Installation' },
      { label: 'Quickstart' },
      { label: 'Python quickstart' },
      { label: 'AI agent quickstart' },
    ],
  },
  {
    label: 'Learn',
    children: [
      {
        label: 'How Strata works',
        children: [
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
        children: [
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
    children: [
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
      {
        // One page per command, generated. Middle levels keep their own group
        // and index rather than being flattened, so a reader drills toward an
        // operation. Only `branch` is spelled out below: the rest render from
        // the command index when the pages are restored.
        label: 'Commands',
        generated: true,
        children: [
          {
            label: 'Branches',
            generated: true,
            children: [
              { label: 'Create empty branch' },
              { label: 'Fork branch from current head' },
              { label: 'Fork branch at version' },
              { label: 'Fork branch at timestamp' },
              { label: 'Compare branches' },
              { label: 'Preview branch promotion' },
              { label: 'Promote branch' },
              { label: 'Read one branch' },
              { label: 'List branches' },
              { label: 'Delete branch' },
            ],
          },
          { label: 'Key-value', generated: true },
          { label: 'JSON', generated: true, children: [{ label: 'Indexes' }] },
          {
            label: 'Vectors',
            generated: true,
            children: [{ label: 'Collections' }, { label: 'Indexes' }, { label: 'Metadata' }],
          },
          { label: 'Events', generated: true },
          {
            label: 'Graph',
            generated: true,
            children: [
              { label: 'Nodes' },
              { label: 'Edges' },
              { label: 'Ontology' },
              { label: 'Analytics' },
            ],
          },
          { label: 'Spaces', generated: true },
          { label: 'Inference', generated: true, children: [{ label: 'Models' }] },
          { label: 'Admin', generated: true },
          { label: 'Arrow', generated: true },
          { label: 'Hub', generated: true },
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
