// Markdown mirrors for the architecture collection (06 §6).
import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

export async function getStaticPaths() {
  const architecture = await getCollection('architecture');
  return architecture.map((entry) => ({ params: { slug: entry.id }, props: { entry } }));
}

export const GET: APIRoute = ({ props }) => {
  const { entry } = props as { entry: { data: { title: string }; id: string; body: string } };
  const header = `# ${entry.data.title}\n\nSource: https://stratadb.org/architecture/${entry.id}\n\n`;
  return new Response(header + entry.body, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
