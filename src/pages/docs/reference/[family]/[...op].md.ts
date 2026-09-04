// Markdown twins for the reference pages. Static hosting cannot negotiate on
// Accept, so an agent gets the same document by appending `.md` to the path.
// The HTML advertises it with <link rel="alternate">.
import type { APIRoute } from 'astro';
import { commandMarkdown } from '../../../../lib/commandMarkdown';
import { publishedCommands } from '../../../../lib/publishedCommands';

export function getStaticPaths() {
  return publishedCommands().map((command) => ({
    params: { family: command.family, op: command.segments.join('/') },
    props: { id: command.id },
  }));
}

const PUBLISHED = publishedCommands().map((command) => command.id);

export const GET: APIRoute = ({ props }) =>
  new Response(commandMarkdown((props as { id: string }).id, { published: PUBLISHED }), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
