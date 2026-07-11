// The agent front door (01 §7). Hand-curated index, build-injected links —
// generated alongside the docs so it cannot drift (PRD §7.6).
import type { APIRoute } from 'astro';
import release from '../data/release.json';

const BODY = `# StrataDB
> StrataDB is an embedded database with git-style semantics: zero-copy O(1)
> branches, forks at any version or timestamp, and time travel — across five
> primitives (kv, json, event, vector, graph). One directory, no server. Rust
> core, MCP server built into the binary. Apache-2.0. v${release.version}.

## Start here
- [For AI agents — integration recipe](https://stratadb.org/docs/getting-started/for-agents.md)
- [Installation](https://stratadb.org/docs/getting-started/installation.md)
- [API quick reference](https://stratadb.org/docs/reference/api-quick-reference.md)
- [MCP server reference](https://stratadb.org/docs/reference/mcp.md)
- [Concepts: branches](https://stratadb.org/docs/concepts/branches.md)
- [Error code registry](https://stratadb.org/e/)

## Note
Every documentation page is available as markdown: append \`.md\` to its URL.

## Optional
- [Full documentation corpus](https://stratadb.org/llms-full.txt)
- [Whitepapers (internals)](https://stratadb.org/architecture/index.md)
`;

export const GET: APIRoute = () =>
  new Response(BODY, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
