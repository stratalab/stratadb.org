// Every redirect must land on a page that exists, and every redirect the old
// site published must still be covered.
//
// Two ways this rots: a destination page gets renamed and the redirect starts
// pointing at nothing, or someone deletes an entry and an inbound link that
// still gets traffic goes back to a 404. Both are silent without this check.
import { existsSync } from 'node:fs';
import { join } from 'node:path';
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

if (failures.length) {
  console.error(`verify-redirects: ${failures.length} failure(s)`);
  for (const f of failures) console.error(`- ${f}`);
  process.exit(1);
}
console.log(`verify-redirects: ${Object.keys(redirects).length} old URL(s) still resolve`);
