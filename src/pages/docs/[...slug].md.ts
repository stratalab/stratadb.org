// Markdown twins for the prose pages, the counterpart to the reference twins.
//
// The source is MDX, so the body carries component tags a reader cannot use.
// A <Figure> is the only component allowed in this collection and it always
// carries a caption describing what it shows, so the twin substitutes that
// caption. An agent reading the markdown gets the information the animation
// carries, rather than a tag it has to guess at or a hole where a figure was.
import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

const SITE = 'https://stratadb.org';

/** Strip the MDX scaffolding, keeping what a reader can actually use. */
export function proseMarkdown(body: string): string {
  return (
    body
      // Component imports are machinery, not content.
      .replace(/^import\s+.*?;\s*$/gm, '')
      // A figure becomes the sentence that describes it.
      .replace(
        /<Figure\b[^>]*?caption=(?:"([^"]*)"|\{'([^']*)'\})[^>]*\/>/g,
        (_m, a, b) => `> **Figure.** ${a ?? b}`,
      )
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  );
}

export async function getStaticPaths() {
  const docs = await getCollection('docs');
  return docs.map((entry) => ({
    params: { slug: entry.id.replace(/\/index$/, '') },
    props: { entry },
  }));
}

export const GET: APIRoute = ({ props }) => {
  const { entry } = props as { entry: { data: { title: string }; id: string; body: string } };
  const slug = entry.id.replace(/\/index$/, '');
  const header = `# ${entry.data.title}\n\nSource: ${SITE}/docs/${slug}\n\n`;
  return new Response(header + proseMarkdown(entry.body ?? ''), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
