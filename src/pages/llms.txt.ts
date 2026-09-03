// The agent front door (01 §7). Hand-curated index with build-injected release facts.
//
// Docs rebuild: the narrative pages this used to index are frozen under
// src/content-archive/. Their entries return here as each page is restored.
// Everything listed below is a live route or a command the shipped binary answers.
import type { APIRoute } from 'astro';
import release from '../data/release.json';

const BODY = `# StrataDB
> StrataDB is an embedded database with git-style semantics: zero-copy O(1)
> branches, forks at any version or timestamp, and time travel - across five
> data models (kv, json, event, vector, graph). One directory, no server. Rust
> core, MCP server built into the binary. Apache-2.0. v${release.version}.

## Status
The documentation site is being rebuilt. Until it lands, the binary is the
authority and answers offline, matched to the version installed:

- \`strata agents guide\` - the complete usage guide
- \`strata agents commands --json\` - the machine-readable command catalog
- \`strata agents errors --json\` - the public error-code registry
- \`strata agents skill --write --for all\` - install the agent skill in a repo
- \`strata <db> mcp serve\` - Model Context Protocol server over stdio

## Live pages
- [Documentation status](https://stratadb.org/docs)
- [Error code registry](https://stratadb.org/e/)
- [Browser playground](https://stratadb.org/playground)
- [Strata Hub dataset catalog](https://stratadb.org/hub)
- [Changelog](https://stratadb.org/changelog)

## Source
- [strata-core on GitHub](https://github.com/stratalab/strata-core)
`;

export const GET: APIRoute = () =>
  new Response(BODY, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
