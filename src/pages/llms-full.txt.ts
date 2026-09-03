// The full corpus, one file (01 §7): build-time concatenation of docs and
// architecture pages with stable source URLs for precise citation.
import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const docs = await getCollection('docs');
  const architecture = await getCollection('architecture');

  const sections = [
    ...docs.map(
      (e) =>
        `# ${e.data.title}\nSource: https://stratadb.org/docs/${e.id === 'index' ? '' : e.id.replace(/\/index$/, '')}\n\n${e.body}`,
    ),
    ...architecture.map(
      (e) =>
        `# ${e.data.title} (architecture)\nSource: https://stratadb.org/architecture/${e.id}\n\n${e.body}`,
    ),
  ];

  // Docs rebuild: the collections are empty until pages are restored. Emit a
  // pointer rather than a zero-byte file so agents fetching this get an answer.
  const body = sections.length
    ? sections.join('\n\n---\n\n')
    : [
        '# StrataDB documentation corpus',
        '',
        'The documentation is being rebuilt and no pages are published yet.',
        'Run `strata agents guide` for the complete version-matched guide, or see',
        'https://stratadb.org/llms.txt for the current live surfaces.',
      ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
