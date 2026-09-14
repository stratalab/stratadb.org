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

Colonies runs the same engine as the rest of the site. `fetch-wasm.mjs` stages
the release named in `src/data/release.json` into `public/playground/pkg`, and
`stage-colonies.mjs` copies it to `assets/pkg/` where the game's worker expects
it. One version, one fetch, one thing to upgrade.

This replaced an independent pin: a `wasm-manifest.json` naming an exact version
with byte counts and SHA-256 digests, plus its own download path to that
release. The intent was to stop the demo drifting onto an untested engine, but
the cost was two engines on two upgrade schedules, and they were byte-identical
in practice. If `website:sync` still ships a `wasm-manifest.json`, it is no
longer read and can stop being copied.

What replaces the pin is a stronger check. `visual-smoke.mjs` loads
`/demos/colonies/`, waits for the worker to report six colonies, presses play,
and requires a generation to actually advance, on three viewports, failing on
any console error. A bad engine fails the build by breaking the game rather than
by mismatching a digest. So when the site's engine moves, run `npm run check`
and the demo is either fine or loudly not.

The generated `assets/pkg/` directory is ignored by Git. The game's own source
files remain hash-guarded by `verify-colonies.mjs` against
`source-manifest.json`; that contract is unchanged.

## Publishing

The existing GitHub Pages workflow builds and deploys changes pushed to `main`.
This integration does not push or deploy by itself. Review the route, listing,
and synced assets before publishing through that workflow.
