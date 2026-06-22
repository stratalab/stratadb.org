// Markdown mirrors (01 §7, 06 §6): every docs URL + ".md" returns the page as
// clean CommonMark — generated from the same collection as the HTML, so the
// two front doors cannot drift (PRD §7.6).
import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

export async function getStaticPaths() {
  const docs = await getCollection('docs');
  return docs.map((entry) => ({
    params: { slug: entry.slug },
    props: { entry },
  }));
}

export const GET: APIRoute = ({ props }) => {
  const { entry } = props as { entry: { data: { title: string }; slug: string; body: string } };
  const header = `# ${entry.data.title}\n\nSource: https://stratadb.org/docs/${entry.slug === 'index' ? '' : entry.slug}\n\n`;
  return new Response(header + entry.body, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
