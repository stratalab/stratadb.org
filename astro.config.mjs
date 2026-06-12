import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://stratadb.org',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404') && !page.includes('/specimen') && !page.includes('/playground'),
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
