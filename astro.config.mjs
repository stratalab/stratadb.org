import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://stratadb.org',
  integrations: [
    mdx({
      shikiConfig: {
        theme: 'github-dark-dimmed',
        langs: ['bash', 'rust', 'python', 'javascript', 'typescript', 'json', 'toml', 'yaml'],
        wrap: true,
      },
    }),
    react(),
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-dark-dimmed',
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
