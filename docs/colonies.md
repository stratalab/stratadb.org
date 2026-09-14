# Strata Colonies

The interactive demo lives at `/demos/colonies/` and is linked from
`/resources/demos/`. It runs the real Strata engine in a dedicated browser worker.
Every tab has its own temporary database segments. There is no simulation backend.
Playback continues when switching futures and has no generation cap. Rewind
retains the latest 1,200 checkpoints per colony; expired segments are freed.

## Updating the game

The source of truth is `strata-apps/strata-colonies/web`. From that repository:

```bash
npm ci
npm run test:browser
npm run test:retention
npm run test:ui
npm run test:interactions
npm run test:branching
npm run website:sync -- /path/to/stratadb.org
```

The sync command updates only the game's owned files under
`public/demos/colonies/assets/` and `src/demos/colonies/`. Avoid editing those
copies directly. The source manifest detects accidental drift during the website
build. The Astro route uses the synced full-page shell and injects the current
website tokens; fonts come from the website's existing `/fonts/` assets.

From this website repository, using the Node version in `.nvmrc`:

```bash
npm run check
npm run preview
```

The full check includes formatting, lint, type checks, generated-source checks,
asset integrity, production build, internal links, redirects, CLI transcripts,
visual smoke on desktop/compact/mobile, and the runtime dependency audit.
The visual smoke suite loads the actual Colonies worker and advances a generation.

For the complete browser journey and automated accessibility checks, run from
`strata-colonies` against the built website preview:

```bash
npm run setup:browsers
COLONIES_SITE_URL=http://127.0.0.1:4321/demos/colonies/ npm run test:release
```

Use the port reported by your preview server. Playwright's Firefox and WebKit
runtimes require their normal host libraries (`playwright install-deps` on Linux).
The release suite uses Chromium, Firefox, and WebKit. Automated accessibility
checks supplement keyboard, focus, and responsive interaction checks; they do
not certify every assistive technology or physical device.

## Engine artifacts

`stage-colonies.mjs` stages the pinned engine from the committed
`wasm-manifest.json`. It checks exact sizes and SHA-256 digests before accepting
any bundle. It tries the existing Colonies cache, the website playground bundle,
and then the pinned GitHub release. `COLONIES_WASM_DIR` selects an explicit local
bundle and fails if it does not match. A missing or altered bundle fails the
build; it never silently upgrades Colonies to the latest playground engine.

The generated `assets/pkg/` directory is ignored by Git. The build fetches it
from the release, so the website checkout does not need the app checkout or
committed WASM binaries. Review the game's engine version, tests, and manifest
together when upgrading.

## Publishing

The existing GitHub Pages workflow builds and deploys changes pushed to `main`.
This integration does not push or deploy by itself. Review the route, listing,
and synced assets before publishing through that workflow.
