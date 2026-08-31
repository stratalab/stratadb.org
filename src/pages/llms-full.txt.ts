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

  return new Response(sections.join('\n\n---\n\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
