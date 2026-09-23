import js from '@eslint/js';
import astro from 'eslint-plugin-astro';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '.astro/**',
      '.claude/worktrees/**',
      'dist/**',
      'node_modules/**',
      'public/playground/pkg/**',
      'public/demos/colonies/assets/pkg/**',
      // The KSP browser build, staged from a release by scripts/fetch-ksp.mjs.
      // Its app.js is linted in strata-apps, where it is source.
      'public/demos/ksp/**',
      'src/content/docs/reference/**',
      'src/content-archive/**',
      'src/docs-ui-archive/**',
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
