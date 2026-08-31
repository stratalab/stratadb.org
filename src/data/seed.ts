// The curated fictional seed world (Doc 04 decision, 2026-06-11).
// ONE world feeds every demo on the page — and, when R8 lands, the live hero
// engine. Authored so each demo beat has a true answer in the data
// (the portfolio branch journey carries from hero through inference).

export interface SeedWorld {
  kv: Record<
    string,
    { value: unknown; history?: { value: unknown; version: number; at: string }[] }
  >;
  events: Record<string, { at: string; payload: Record<string, unknown> }[]>;
  json: Record<string, unknown>;
  vectors: { collection: string; dimension: number; docs: { id: string; text: string }[] };
  graph: {
    nodes: { id: string; type: string }[];
    edges: { from: string; rel: string; to: string }[];
  };
}

export const SEED: SeedWorld = {
  kv: {
    // The finance thread, part 2 (time travel, 2026-06-12): the portfolio's
    // VALUE over the three days. It dips on 06-10, then the aggressive
    // strategy — merged in the branch story on 06-11 — pays off. Scrubbing
    // the timeline tells that story in dollars.
    'portfolio.value': {
      value: 111080,
      history: [
        { value: 98400, version: 1, at: '2026-06-09T14:02:11Z' },
        { value: 91750, version: 2, at: '2026-06-10T09:31:47Z' },
        { value: 111080, version: 3, at: '2026-06-11T16:55:03Z' },
      ],
    },
    'portfolio.currency': { value: 'USD' },
    'portfolio.branch': { value: 'default' },
    'portfolio.risk': { value: 'aggressive' },
  },
  events: {
    portfolio: [
      {
        at: '2026-06-09T14:02:11Z',
        payload: { action: 'portfolio.seed', detail: 'portfolio.value 98400' },
      },
      {
        at: '2026-06-10T09:31:47Z',
        payload: { action: 'branch.fork', detail: 'risky allocation isolated' },
      },
      {
        at: '2026-06-11T16:55:03Z',
        payload: { action: 'branch.merge', detail: 'portfolio.value 111080' },
      },
    ],
  },
  json: {
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
    'allocation.policy': {
      max_drawdown: '12%',
      rebalance: 'quarterly',
      currency: 'USD',
    },
    'merge.preview': {
      source: 'risky',
      target: 'default',
      conflicts: 0,
    },
  },
  vectors: {
    collection: 'notes',
    dimension: 384,
    docs: [
      { id: 'd1', text: 'portfolio.value moved after the risky allocation merged into default.' },
      { id: 'd2', text: 'The merge preview showed no conflicts before the portfolio promotion.' },
    ],
  },
  graph: {
    nodes: [
      { id: 'portfolio', type: 'document' },
      { id: 'default', type: 'branch' },
      { id: 'risky', type: 'branch' },
    ],
    edges: [
      { from: 'portfolio', rel: 'on', to: 'default' },
      { from: 'portfolio', rel: 'tested_in', to: 'risky' },
    ],
  },
};
