// Markdown mirrors (01 §7, 06 §6): every docs URL + ".md" returns the page as
// clean CommonMark from the same collection as the HTML.
import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

const markdownSlug = (id: string) => (id === 'index' ? 'index' : id.replace(/\/index$/, ''));
const sourcePath = (id: string) => {
  if (id === 'index') return '';
  return id.replace(/\/index$/, '');
};

export async function getStaticPaths() {
  const docs = await getCollection('docs');
  return docs.map((entry) => ({
    params: { slug: markdownSlug(entry.id) },
    props: { entry },
  }));
}

export const GET: APIRoute = ({ props }) => {
  const { entry } = props as { entry: { data: { title: string }; id: string; body: string } };
  const header = `# ${entry.data.title}\n\nSource: https://stratadb.org/docs/${sourcePath(entry.id)}\n\n`;
  return new Response(header + entry.body, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
