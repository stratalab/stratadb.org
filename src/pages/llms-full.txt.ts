// The full corpus, one file (01 §7): build-time concatenation of all docs +
// whitepapers, section-delimited with stable source URLs for precise citation.
import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const docs = await getCollection('docs');
  const papers = await getCollection('architecture');

  const sections = [
    ...docs.map(
      (e) =>
        `# ${e.data.title}\nSource: https://stratadb.org/docs/${e.slug === 'index' ? '' : e.slug}\n\n${e.body}`
    ),
    ...papers.map(
      (e) => `# ${e.data.title} (whitepaper)\nSource: https://stratadb.org/architecture/${e.slug}\n\n${e.body}`
    ),
  ];

  return new Response(sections.join('\n\n---\n\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
