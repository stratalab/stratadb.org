// Which generated command pages exist.
//
// The reference is restored one family at a time, so this is the single switch
// that controls it: add a family here and its pages, its markdown twins, its
// family index and its sidebar links all appear together. Nothing else needs
// editing.
//
// Everything downstream reads from here, which is what keeps the sidebar, the
// routes and the cross-links from disagreeing about what exists.
import index from '../data/command-index.json';

export const PUBLISHED_FAMILIES = [
  'kv',
  'json',
  'vector',
  'graph',
  'event',
  'branch',
  'space',
  'arrow',
  'admin',
  'inference',
  'hub',
] as const;

export interface CommandEntry {
  id: string;
  family: string;
  op: string;
  title: string;
  summary: string;
  docs: string;
  /** Path segments below the family, e.g. ["collection","create"]. */
  segments: string[];
}

const entries: CommandEntry[] = index.commands.map((command) => ({
  id: command.id,
  family: command.family,
  op: command.op,
  title: command.title,
  summary: command.summary,
  docs: command.docs,
  segments: command.docs.replace(/^\/docs\/reference\/[^/]+\//, '').split('/'),
}));

const published = new Set<string>(PUBLISHED_FAMILIES);

export const isFamilyPublished = (family: string): boolean => published.has(family);
export const isPublished = (id: string): boolean => {
  const entry = entries.find((e) => e.id === id);
  return entry ? published.has(entry.family) : false;
};

export const allCommands = (): CommandEntry[] => entries;
export const publishedCommands = (): CommandEntry[] =>
  entries.filter((entry) => published.has(entry.family));
export const commandsInFamily = (family: string): CommandEntry[] =>
  entries.filter((entry) => entry.family === family);

/** Families in the order the sidebar and the reference landing present them. */
export const FAMILY_ORDER = [
  'kv',
  'json',
  'vector',
  'event',
  'graph',
  'branch',
  'space',
  'inference',
  'admin',
  'arrow',
  'hub',
] as const;

export const FAMILY_TITLES: Record<string, string> = {
  kv: 'Key-value',
  json: 'JSON',
  vector: 'Vectors',
  event: 'Events',
  graph: 'Graph',
  branch: 'Branches',
  space: 'Spaces',
  inference: 'Inference',
  admin: 'Admin',
  arrow: 'Arrow',
  hub: 'Hub',
};

const GROUP_TITLES: Record<string, string> = {
  collection: 'Collections',
  index: 'Indexes',
  metadata: 'Metadata',
  node: 'Nodes',
  edge: 'Edges',
  ontology: 'Ontology',
  analytics: 'Analytics',
  models: 'Models',
};

export const groupTitle = (segment: string): string =>
  GROUP_TITLES[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1);
