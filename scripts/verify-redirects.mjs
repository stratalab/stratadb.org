// Every redirect must land on a page that exists, and every redirect the old
// site published must still be covered.
//
// Two ways this rots: a destination page gets renamed and the redirect starts
// pointing at nothing, or someone deletes an entry and an inbound link that
// still gets traffic goes back to a 404. Both are silent without this check.
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { redirects } from '../src/lib/redirects.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const DIST = join(ROOT, 'dist');

if (!existsSync(DIST)) {
  console.log('verify-redirects: no dist to check; run after the build');
  process.exit(0);
}

const failures = [];
for (const [from, to] of Object.entries(redirects)) {
  if (!to.startsWith('/')) failures.push(`${from}: destination is not site-absolute (${to})`);
  if (redirects[to]) failures.push(`${from} -> ${to}, which is itself a redirect`);
  if (!existsSync(join(DIST, to, 'index.html'))) failures.push(`${from} -> ${to} does not exist`);
  if (!existsSync(join(DIST, from, 'index.html')))
    failures.push(`${from} emitted no redirect page`);
}

// The other direction: a URL this site published in the past, that is now
// neither a live page nor a redirect, is a dead inbound link. The first
// version of the redirect map was built from one sitemap snapshot and missed
// 37 v0.12.5 URLs that had been retired before it was taken, so the set of
// URLs ever published is committed rather than rediscovered (CI checks out
// shallow, so git history is not available at build time).
const published = JSON.parse(readFileSync(join(ROOT, 'src/data/published-urls.json'), 'utf8'));
for (const url of published) {
  if (redirects[url]) continue;
  if (existsSync(join(DIST, url, 'index.html'))) continue;
  failures.push(`${url} was published once and now 404s: add a redirect`);
}

if (failures.length) {
  console.error(`verify-redirects: ${failures.length} failure(s)`);
  for (const f of failures) console.error(`- ${f}`);
  process.exit(1);
}
console.log(
  `verify-redirects: ${Object.keys(redirects).length} redirect(s) resolve; ` +
    `all ${published.length} URL(s) ever published still reachable`,
);
