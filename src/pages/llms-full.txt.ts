// The full corpus, one file (01 §7): every published page concatenated, with a
// stable source URL on each so an agent can cite the exact page it used.
//
// This emitted a "no pages are published yet" placeholder long after that
// stopped being true. It concatenated the docs and architecture content
// collections, and the restored reference is not in a collection: it is
// composed from the staged JSON in src/data, so the collections stayed empty
// and the fallback kept firing while 147 pages shipped.
//
// So the corpus is assembled from the same sources the pages are. Commands go
// through commandMarkdown, the generator behind the `.md` twins, which means an
// agent reading this file and an agent fetching a single page get byte-identical
// documents. Collections are still concatenated, for narrative pages as they
// land.
import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { commandMarkdown } from '../lib/commandMarkdown';
import { publishedCommands } from '../lib/publishedCommands';
import release from '../data/release.json';

const SITE = 'https://stratadb.org';

export const GET: APIRoute = async () => {
  const docs = await getCollection('docs');
  const architecture = await getCollection('architecture');
  const commands = publishedCommands();
  const published = commands.map((c) => c.id);

  const sections = [
    ...docs.map(
      (e) =>
        `# ${e.data.title}\nSource: ${SITE}/docs/${e.id === 'index' ? '' : e.id.replace(/\/index$/, '')}\n\n${e.body}`,
    ),
    ...commands.map((command) => commandMarkdown(command.id, { site: SITE, published })),
    ...architecture.map(
      (e) => `# ${e.data.title} (architecture)\nSource: ${SITE}/architecture/${e.id}\n\n${e.body}`,
    ),
  ];

  const header = [
    '# StrataDB documentation corpus',
    '',
    `Version ${release.version}. ${sections.length} pages, every one generated from the`,
    'released interface definition rather than written by hand.',
    '',
    'Each page below carries the URL it is served at. The same document is also',
    'available on its own by appending `.md` to that URL.',
  ].join('\n');

  return new Response([header, ...sections].join('\n\n---\n\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
