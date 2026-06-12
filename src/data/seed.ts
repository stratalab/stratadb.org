// The curated fictional seed world (Doc 04 decision, 2026-06-11).
// ONE world feeds every demo on the page — and, when R8 lands, the live hero
// engine. Authored so each demo beat has a true answer in the data
// (the deploy-failure query in section 5 resolves against these events).

export interface SeedWorld {
  kv: Record<string, { value: unknown; history?: { value: unknown; version: number; at: string }[] }>;
  events: Record<string, { at: string; payload: Record<string, unknown> }[]>;
  json: Record<string, unknown>;
  vectors: { collection: string; dimension: number; docs: { id: string; text: string }[] };
  graph: { nodes: { id: string; type: string }[]; edges: { from: string; rel: string; to: string }[] };
}

export const SEED: SeedWorld = {
  kv: {
    'config.theme': {
      value: 'midnight',
      history: [
        { value: 'dark', version: 1, at: '2026-06-09T14:02:11Z' },
        { value: 'dusk', version: 2, at: '2026-06-10T09:31:47Z' },
        { value: 'midnight', version: 3, at: '2026-06-11T16:55:03Z' },
      ],
    },
    'user:1': { value: { name: 'Alice', role: 'engineer' } },
    greeting: { value: 'hello' },
  },
  events: {
    deploys: [
      { at: '2026-06-10T09:30:02Z', payload: { action: 'config.update', key: 'config.theme', to: 'dusk' } },
      { at: '2026-06-10T09:31:47Z', payload: { action: 'deploy.start', version: 'v2.3' } },
      { at: '2026-06-10T09:33:12Z', payload: { action: 'deploy.fail', version: 'v2.3', reason: 'healthcheck timeout' } },
    ],
  },
  json: {
    profile: { user: { name: 'Alice', role: 'engineer', prefs: { theme: 'midnight' } } },
    config: {
      theme: 'dark',
      font_size: 14,
      language: 'en',
      notifications: true,
      sidebar: 'left',
      autosave: false,
    },
    // The branch-story document (section 2, finance domain 2026-06-12):
    // nobody experiments on live money — which is exactly what branching is
    // for. The risky branch tries the aggressive allocation.
    portfolio: {
      strategy: 'balanced',
      stocks: 60,
      bonds: 30,
      cash: 10,
      rebalance: 'quarterly',
      currency: 'USD',
    },
  },
  vectors: {
    collection: 'docs',
    dimension: 384,
    docs: [
      { id: 'd1', text: 'Deploys read config.theme at startup; invalid values fail the healthcheck.' },
      { id: 'd2', text: 'Branch experiments before changing production configuration.' },
    ],
  },
  graph: {
    nodes: [
      { id: 'alice', type: 'user' },
      { id: 'bob', type: 'user' },
      { id: 'deploy-v2.3', type: 'deploy' },
    ],
    edges: [
      { from: 'alice', rel: 'knows', to: 'bob' },
      { from: 'alice', rel: 'triggered', to: 'deploy-v2.3' },
    ],
  },
};
