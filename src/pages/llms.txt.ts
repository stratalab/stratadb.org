// The agent front door (01 §7). Hand-curated index, build-injected links —
// generated alongside the docs so it cannot drift (PRD §7.6).
import type { APIRoute } from 'astro';
import release from '../data/release.json';

const BODY = `# StrataDB
> StrataDB is an embedded database with the whole git model: zero-copy O(1)
> branches, diff, merge, cherry-pick, time travel, and search — across five
> primitives (kv, event, json, vector, graph). One file, no server. Rust core,
> Python/Node SDKs, MCP server. Apache-2.0. Research preview (v${release.version}).

## Start here
- [For AI agents — integration recipe](https://stratadb.org/docs/getting-started/for-agents.md)
- [Installation](https://stratadb.org/docs/getting-started/installation.md)
- [API quick reference](https://stratadb.org/docs/reference/api-quick-reference.md)
- [MCP server reference](https://stratadb.org/docs/reference/mcp.md)
- [Concepts: branches](https://stratadb.org/docs/concepts/branches.md)

## Note
Every documentation page is available as markdown: append \`.md\` to its URL.

## Optional
- [Full documentation corpus](https://stratadb.org/llms-full.txt)
- [Whitepapers (internals)](https://stratadb.org/architecture/index.md)
`;

export const GET: APIRoute = () =>
  new Response(BODY, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
