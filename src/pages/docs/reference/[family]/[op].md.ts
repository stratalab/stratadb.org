// Markdown twins for the reference pages. Static hosting cannot negotiate on
// Accept, so an agent gets the same document by appending `.md` to the path.
// The HTML advertises it with <link rel="alternate">.
import type { APIRoute } from 'astro';
import { commandMarkdown } from '../../../../lib/commandMarkdown';

// Only the commands whose pages are restored. Grows with them.
const PUBLISHED = ['branch.merge', 'json.set'];

export function getStaticPaths() {
  return PUBLISHED.map((id) => {
    const [family, ...rest] = id.split('.');
    return { params: { family, op: rest.join('/') }, props: { id } };
  });
}

export const GET: APIRoute = ({ props }) =>
  new Response(commandMarkdown((props as { id: string }).id, { published: PUBLISHED }), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
