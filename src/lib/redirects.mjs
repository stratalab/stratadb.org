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
};
