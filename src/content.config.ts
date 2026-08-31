import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const markdownId = ({ entry }: { entry: string }) =>
  entry.replace(/\.(?:md|mdx)$/, '').replaceAll('\\', '/');

const docsCollection = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/docs',
    generateId: markdownId,
  }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    order: z.number().optional(),
    section: z.string().optional(),
    // Sourcing policy §2: which repo@version this page documents.
    source: z.string().optional(),
  }),
});

const architectureCollection = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/architecture',
    generateId: markdownId,
  }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    order: z.number().optional(),
  }),
});

export const collections = {
  docs: docsCollection,
  architecture: architectureCollection,
};
