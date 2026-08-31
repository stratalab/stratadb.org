# stratadb.org

The public website and documentation for StrataDB.

This repo builds a static Astro site for GitHub Pages. The source of truth is deliberately split:

- Product and remediation decisions live in `docs/product/`.
- Narrative docs live in `src/content/docs/` and `src/content/architecture/`.
- Generated command and error reference data lives in `src/content/docs/reference/`, `src/data/command-index.json`, and `src/data/error-registry.json`.
- Design tokens live in `src/styles/tokens.css`; raw color literals should not appear in live source outside that file.

## Requirements

- Node `22.19.0` or newer
- npm `11` or newer
- Rust/Cargo, for installing the released `strata` CLI used by transcript checks
- Chromium for the Playwright visual smoke test

Use the pinned local Node version when available:

```bash
nvm use
npm ci
npm run setup:browsers
```

## Local Development

```bash
npm run dev
```

Astro serves the site locally and watches content, components, and styles.

## Build And Verify

The full contributor gate is:

```bash
npm run check
```

That runs formatting, ESLint, source hygiene checks, type checking, source-data verification, the production build, internal link checks, transcript checks, visual smoke checks, and the runtime dependency audit.

Useful narrower commands:

```bash
npm run format:check
npm run lint
npm run typecheck
npm run verify:source
npm run build
npm run visual:smoke
npm run audit:runtime
```

Transcript verification shells out to the released `strata` CLI. Install the version recorded in `src/data/release.json`:

```bash
cargo install strata-cli --locked --version "$(node -p "require('./src/data/release.json').version")" --force
```

## Release Data And Generated Docs

`npm run build` runs `prebuild`, which fetches:

- release metadata via `scripts/fetch-release.mjs`
- generated command/error docs via `scripts/fetch-docs.mjs`
- the browser playground wasm bundle via `scripts/fetch-wasm.mjs`

Generated docs are committed as the clean-checkout floor. A successful release fetch overwrites them in place during build. If a release fetch is unavailable, the build keeps the committed floor and the verification scripts decide whether the result is still valid.

## Deployment

Production deploys use GitHub Pages from `.github/workflows/deploy.yml` on pushes to `main` and `repository_dispatch: docs-update`.

The current deployment mode is intentionally unchanged during remediation. `/playground` is a live product surface, and Foundry is frozen and out of the current acquisition flow.

## Repo Hygiene Rules

- Keep build/runtime package inputs in `devDependencies`; this is a static site with no production Node server.
- Keep design-token values in `src/styles/tokens.css`.
- Do not hand-maintain generated command or error facts in narrative docs.
- Do not add dead links, placeholder CTAs, or unsupported launch claims.
- Treat `DESIGN.md` and older product docs as historical unless `docs/product/README.md` marks them current.
