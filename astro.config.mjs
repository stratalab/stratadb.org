import { defineConfig } from 'astro/config';
import { redirects } from './src/lib/redirects.mjs';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://stratadb.org',
  redirects,
  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes('/404') && !page.includes('/specimen') && !page.includes('/internals'),
    }),
    mdx({
      shikiConfig: {
        theme: 'github-dark-default',
        langs: ['bash', 'rust', 'python', 'javascript', 'typescript', 'json', 'toml', 'yaml'],
        wrap: true,
      },
    }),
    react(),
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-dark-default',
      langs: ['bash', 'rust', 'python', 'javascript', 'typescript', 'json', 'toml', 'yaml'],
      wrap: true,
    },
  },
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ['framer-motion'],
    },
  },
});
