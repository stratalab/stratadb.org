import js from '@eslint/js';
import astro from 'eslint-plugin-astro';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '.astro/**',
      'dist/**',
      'node_modules/**',
      'public/playground/pkg/**',
      'src/content/docs/reference/**',
      'src/env.d.ts',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs['flat/recommended'],
  ...astro.configs['flat/jsx-a11y-recommended'],
  {
    files: ['**/*.{js,mjs,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'no-console': 'off',
    },
  },
  {
    files: ['src/**/*.astro'],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
);
