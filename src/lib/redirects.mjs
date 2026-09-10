// Old URLs kept alive.
//
// The docs were rebuilt from a different information architecture, which
// stranded 73 URLs that the previous site had published and that search
// engines and inbound links still point at. Astro renders each of these as a
// redirecting page in the static output, so they keep working without a server.
//
// Destinations are checked by scripts/verify-redirects.mjs against the built
// output, so a redirect cannot quietly start pointing at a page that no longer
// exists.
//
// Keep an entry until the traffic to it is gone; deleting one turns a working
// old link back into a 404.

export const redirects = {
  // The 2026 architecture section, folded into Learn and the error reference.
  '/architecture': '/docs/learn/embedded-databases',
  '/architecture/commits-and-versioning': '/docs/learn/commits-and-versions',
  '/architecture/data-capabilities': '/docs/learn/working-with-data',
  '/architecture/durability-and-recovery': '/docs/learn/embedded-databases',
  '/architecture/errors-and-diagnostics': '/docs/reference/errors',
  '/architecture/layered-stack': '/docs/learn/embedded-databases',
  '/architecture/runtime-modes': '/docs/learn/embedded-databases',
  '/architecture/storage-substrate': '/docs/learn/embedded-databases',

  // The agent pages, which became one page under Get Started.
  '/docs/agents': '/docs/get-started/agents',
  '/docs/agents/agents-guide': '/docs/get-started/agents',
  '/docs/agents/command-index': '/docs/reference',
  '/docs/agents/machine-docs': '/docs/get-started/agents',
  '/docs/agents/mcp-server': '/docs/get-started/agents',

  // Concepts, renamed to Learn.
  '/docs/concepts': '/docs/learn',
  '/docs/concepts/branches': '/docs/learn/branches',
  '/docs/concepts/commits': '/docs/learn/commits-and-versions',
  '/docs/concepts/durability': '/docs/learn/embedded-databases',
  '/docs/concepts/embedded-architecture': '/docs/learn/embedded-databases',
  '/docs/concepts/errors': '/docs/reference/errors',
  '/docs/concepts/hub-and-clone': '/docs/learn',
  '/docs/concepts/primitives': '/docs/learn/working-with-data',
  '/docs/concepts/spaces': '/docs/learn/spaces',
  '/docs/concepts/time-travel': '/docs/learn/time-travel',
  '/docs/concepts/value-types': '/docs/reference',

  // The cookbook, whose recipes are now Guides or the Learn page for the model.
  '/docs/cookbook': '/docs/guides',
  '/docs/cookbook/ab-testing-with-branches': '/docs/learn/branches',
  '/docs/cookbook/agent-state-management': '/docs/get-started/agents',
  '/docs/cookbook/deterministic-replay': '/docs/learn/time-travel',
  '/docs/cookbook/multi-agent-coordination': '/docs/get-started/agents',
  '/docs/cookbook/rag-with-vectors': '/docs/learn/vectors',

  // The data section, renamed to Learn / Working with data.
  '/docs/data': '/docs/learn/working-with-data',
  '/docs/data/combining-primitives': '/docs/learn/working-with-data',
  '/docs/data/events': '/docs/learn/events',
  '/docs/data/graph': '/docs/learn/graph',
  '/docs/data/json': '/docs/learn/json',
  '/docs/data/key-value': '/docs/learn/key-value',
  '/docs/data/vectors': '/docs/learn/vectors',

  // Getting started, renamed to Get Started.
  '/docs/getting-started': '/docs/get-started',
  '/docs/getting-started/first-database': '/docs/get-started/quickstart',
  '/docs/getting-started/installation': '/docs/get-started/installation',
  '/docs/getting-started/quickstart-agents': '/docs/get-started/agents',

  // Guides that were prose pages before the section was rebuilt.
  '/docs/guides/branching-workflows': '/docs/learn/branches',
  '/docs/guides/cloning-datasets': '/docs/guides',
  '/docs/guides/configuration': '/docs/reference',
  '/docs/guides/deploying': '/docs/guides',
  '/docs/guides/error-handling': '/docs/reference/errors',
  '/docs/guides/import-export': '/docs/guides',
  '/docs/guides/migrating': '/docs/guides',
  '/docs/guides/observability': '/docs/guides',
  '/docs/guides/spaces': '/docs/learn/spaces',
  '/docs/guides/time-travel': '/docs/learn/time-travel',

  // Inference, folded into Learn.
  '/docs/inference': '/docs/learn/inference',
  '/docs/inference/local-models': '/docs/learn/inference',
  '/docs/inference/providers-and-keys': '/docs/learn/inference',

  // The Python section, pending its rebuild under Develop.
  '/docs/python': '/docs/get-started/python-quickstart',
  '/docs/python/agents': '/docs/get-started/agents',
  '/docs/python/errors': '/docs/reference/errors',
  '/docs/python/inference': '/docs/learn/inference',
  '/docs/python/installation': '/docs/get-started/installation',
  '/docs/python/namespaces': '/docs/get-started/python-quickstart',

  // Hand-written reference pages, replaced by the generated reference.
  '/docs/reference/api-quick-reference': '/docs/reference',
  '/docs/reference/cli': '/docs/reference',
  '/docs/reference/command-reference': '/docs/reference',
  '/docs/reference/configuration-reference': '/docs/reference',
  '/docs/reference/error-reference': '/docs/reference/errors',
  '/docs/reference/value-type-reference': '/docs/reference',

  // Error codes retired from the registry at 1.2.1.
  '/e/invalid_argument.executor.arrow_feature_disabled': '/docs/reference/errors',
  '/e/invalid_argument.executor.hub_feature_disabled': '/docs/reference/errors',

  // Single pages with no section.
  '/docs/faq': '/docs',
  '/docs/troubleshooting': '/docs/reference/errors',
  '/docs/why-strata': '/docs/learn/introduction',
  '/docs/why-strata/comparisons': '/docs/learn/introduction',
  '/docs/why-strata/when-to-use': '/docs/learn/introduction',

  // Retired before the last successful deploy, so these were not in the
  // sitemap the redirect map was first built from. They were live on main,
  // which means they were crawled, and they 404ed until this was added.
  // The v0.12.5 architecture pages, replaced by the V1 whitepapers and then by Learn.
  '/architecture/boundary-conditions': '/docs/learn/embedded-databases',
  '/architecture/branch-primitive': '/docs/learn/branches',
  '/architecture/concurrency-invariants': '/docs/learn/embedded-databases',
  '/architecture/concurrency-model': '/docs/learn/embedded-databases',
  '/architecture/crate-structure': '/docs/learn/embedded-databases',
  '/architecture/durability-modes': '/docs/learn/embedded-databases',
  '/architecture/error-propagation': '/docs/reference/errors',
  '/architecture/event-primitive': '/docs/learn/events',
  '/architecture/json-primitive': '/docs/learn/json',
  '/architecture/kv-primitive': '/docs/learn/key-value',
  '/architecture/session-transaction-completeness': '/docs/learn/commits-and-versions',
  '/architecture/state-primitive': '/docs/learn/working-with-data',
  '/architecture/storage-engine': '/docs/learn/embedded-databases',
  '/architecture/vector-primitive': '/docs/learn/vectors',
  '/architecture/version-semantics': '/docs/learn/commits-and-versions',

  // v0.12.5 guides, from when each data model had a guide rather than a Learn page.
  '/docs/guides/agents-and-mcp': '/docs/get-started/agents',
  '/docs/guides/arrow': '/docs/guides',
  '/docs/guides/branch-bundles': '/docs/learn/branches',
  '/docs/guides/branch-management': '/docs/learn/branches',
  '/docs/guides/database-configuration': '/docs/reference',
  '/docs/guides/event-log': '/docs/learn/events',
  '/docs/guides/graph': '/docs/learn/graph',
  '/docs/guides/inference': '/docs/learn/inference',
  '/docs/guides/json-store': '/docs/learn/json',
  '/docs/guides/kv-store': '/docs/learn/key-value',
  '/docs/guides/search': '/docs/learn/vectors',
  '/docs/guides/sessions-and-transactions': '/docs/learn/commits-and-versions',
  '/docs/guides/state-cell': '/docs/learn/working-with-data',
  '/docs/guides/vector-store': '/docs/learn/vectors',

  // Other v0.12.5 pages.
  '/docs/concepts/transactions': '/docs/learn/commits-and-versions',
  '/docs/getting-started/for-agents': '/docs/get-started/agents',
  '/docs/reference/json/create': '/docs/reference/json',
  '/docs/reference/json/drop': '/docs/reference/json',
  '/docs/reference/mcp': '/docs/get-started/agents',
  '/docs/reference/node-sdk': '/docs/get-started/installation',
  '/docs/reference/python-sdk': '/docs/get-started/python-quickstart',
  '/pitch': '/internals',
};
