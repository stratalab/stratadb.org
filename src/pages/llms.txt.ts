// The agent front door (01 §7). A curated index over build-injected facts.
//
// This said "the documentation site is being rebuilt" for as long as that was
// true and then for a while after it was not, which is the failure mode of a
// hand-written status line: nothing breaks when it goes stale. The counts and
// the family list are now read from the same data the pages are built from, so
// the file cannot claim the site is empty while pages ship, and a family that
// is restored appears here without anyone remembering to add it.
import type { APIRoute } from 'astro';
import release from '../data/release.json';
import index from '../data/command-index.json';
import registry from '../data/error-registry.json';
import {
  FAMILY_ORDER,
  FAMILY_TITLES,
  commandsInFamily,
  isFamilyPublished,
  publishedCommands,
} from '../lib/publishedCommands';
import { operatingSystems } from '../lib/platforms';

const SITE = 'https://stratadb.org';

const published = publishedCommands();
const families = FAMILY_ORDER.filter(isFamilyPublished);
const familyLines = families
  .map((family) => {
    const count = commandsInFamily(family).length;
    const title = FAMILY_TITLES[family] ?? family;
    return `- [${title}](${SITE}/docs/reference/${family}) - ${count} commands`;
  })
  .join('\n');

// The example of the .md convention is a real published command rather than a
// path typed out here. verify-reference-ia rejects a hand-written URL to a
// generated page, and it is right to: this file would otherwise keep pointing
// at kv/put after kv/put stopped existing.
const sample = published.find((c) => c.id === 'kv.put') ?? published[0];

const platforms = operatingSystems()
  .map((os) => `${os.label} (${os.builds.map((b) => b.arch).join(', ')})`)
  .join(', ');

const BODY = `# StrataDB
> StrataDB is an embedded database with git-style semantics: zero-copy O(1)
> branches, forks at any version or timestamp, and time travel - across five
> data models (kv, json, event, vector, graph). One directory, no server. Rust
> core, MCP server built into the binary. Apache-2.0. v${release.version}.

## Reading these docs as an agent
Every reference page has a markdown twin at the same path with \`.md\` appended:

- ${SITE}${sample.docs}
- ${SITE}${sample.docs}.md

The whole corpus is one file:

- ${SITE}/llms-full.txt

Each command page carries its CLI and Python spelling, its wire type, its MCP
tool name, its parameters, what it returns and the error codes it can raise.

## Command reference
${published.length} of ${index.commands.length} commands are published, across ${families.length} families.

${familyLines}

## Other pages
- [Documentation home](${SITE}/docs)
- [Reference overview](${SITE}/docs/reference)
- [Installation](${SITE}/docs/get-started/installation) - builds for ${platforms}
- [Error code registry](${SITE}/e/) - ${registry.errors.length} codes, each with retry policy and commit outcome
- [Browser playground](${SITE}/playground) - the engine compiled to wasm
- [Strata Hub dataset catalog](${SITE}/hub)
- [Changelog](${SITE}/changelog)

## Offline, from the binary
The installed binary answers the same questions without a network, matched to
the version installed:

- \`strata agents guide\` - the complete usage guide
- \`strata agents commands --json\` - the machine-readable command catalog
- \`strata agents errors --json\` - the public error-code registry
- \`strata <db> mcp serve\` - Model Context Protocol server over stdio

## Source
- [strata-core on GitHub](https://github.com/stratalab/strata-core)
`;

export const GET: APIRoute = () =>
  new Response(BODY, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
