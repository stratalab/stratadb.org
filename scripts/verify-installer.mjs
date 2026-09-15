// public/install.sh must tell a visitor with no build the truth about why.
//
// The installer used to carry its own list of six platform triples while the
// release shipped three. A user on one of the other three saw
// `Download failed. URL: ...` after being told their platform was detected,
// which reads as a network problem rather than "there is no build for you"
// (strata-core issue 3060).
//
// The fix was to delete the installer's list rather than correct it: the
// release's own checksums-sha256.txt is now the single answer to what exists,
// and this gate proves the script reads it that way. Every case below runs the
// REAL install.sh, sourced with STRATA_INSTALL_SH_NO_MAIN so nothing installs,
// against a fixture manifest in the shape sha256sum writes.
//
// Site CI installs the CLI from the LIVE stratadb.org/install.sh, not from this
// working tree, so a change here is not exercised anywhere else until it
// deploys. That is precisely why this gate is local.
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const INSTALLER = join(ROOT, 'public/install.sh');
const VERSION = '9.9.9';

// Two shipped targets, each with its -local sibling, plus the two non-binary
// assets every release carries. sha256sum separates hash from name with two
// spaces, and that separator is what the script anchors on.
const MANIFEST = [
  `aaaa1111  strata-v${VERSION}-aarch64-apple-darwin.tar.gz`,
  `bbbb2222  strata-v${VERSION}-aarch64-apple-darwin-local.tar.gz`,
  `cccc3333  strata-v${VERSION}-x86_64-unknown-linux-gnu.tar.gz`,
  `dddd4444  strata-v${VERSION}-x86_64-unknown-linux-gnu-local.tar.gz`,
  'eeee5555  strata-idl-docs.tar.gz',
  'ffff6666  strata-wasm-web.tar.gz',
].join('\n');

/** Source the installer and run one function against the fixture manifest. */
function runAgainstManifest(target, body, manifest = MANIFEST) {
  const script = `
    set -eu
    . "${INSTALLER}"
    setup_colors
    TMPDIR=$(mktemp -d)
    trap 'rm -rf "$TMPDIR"' EXIT
    MANIFEST="$TMPDIR/checksums-sha256.txt"
    printf '%s\\n' "$FIXTURE" > "$MANIFEST"
    VERSION='${VERSION}'
    TARGET='${target}'
    ARCHIVE_NAME="strata-v${VERSION}-${target}.tar.gz"
    ${body}
  `;
  const result = spawnSync('sh', ['-c', script], {
    encoding: 'utf8',
    env: { ...process.env, STRATA_INSTALL_SH_NO_MAIN: '1', FIXTURE: manifest },
  });
  return { status: result.status, stdout: result.stdout ?? '', stderr: result.stderr ?? '' };
}

const failures = [];
const check = (label, condition, detail) => {
  if (!condition) failures.push(`${label}: ${detail}`);
};

// 1. A target the release ships installs. Without this the gate would pass on a
//    script that refused every platform.
{
  const ok = runAgainstManifest('x86_64-unknown-linux-gnu', 'require_build_for_target');
  check(
    'shipped target accepted',
    ok.status === 0,
    `expected exit 0 for a target in the manifest, got ${ok.status}: ${ok.stderr.trim()}`,
  );
}

// 2. A target the release does not ship is refused, by name, with the version,
//    and with what it could have had instead. This is the message issue 3060
//    asked for.
{
  const missing = runAgainstManifest('x86_64-pc-windows-msvc', 'require_build_for_target');
  check(
    'missing target refused',
    missing.status !== 0,
    'a target absent from the manifest was accepted, so a 404 would be reported as a failed download',
  );
  check(
    'refusal names the target',
    missing.stderr.includes('x86_64-pc-windows-msvc'),
    `refusal does not name the target: ${missing.stderr.trim()}`,
  );
  check(
    'refusal names the version',
    missing.stderr.includes(`v${VERSION}`),
    `refusal does not say which release has no build: ${missing.stderr.trim()}`,
  );
  for (const shipped of ['aarch64-apple-darwin', 'x86_64-unknown-linux-gnu']) {
    check(
      'refusal lists what shipped',
      missing.stderr.includes(shipped),
      `refusal omits the available target ${shipped}: ${missing.stderr.trim()}`,
    );
  }
  // The -local variants bundle a local inference runtime and are not what this
  // script installs, so offering one as an alternative would send the reader to
  // an archive the installer cannot use.
  check(
    'refusal offers no -local variant',
    !missing.stderr.includes('-local'),
    `refusal offers a -local archive as an alternative: ${missing.stderr.trim()}`,
  );
}

// 3. The adjacent legal case, in the other direction: a target that ships only
//    as a `-local` asset has no default build of its own, so it is refused like
//    any other absent target rather than being served the inference-bundled
//    archive. (The exact-filename anchor in the grep is defensive only. With
//    `-local` sitting before `.tar.gz`, no asset name can contain another, so
//    removing the anchor changes nothing and no test here covers it.)
{
  const localOnly = runAgainstManifest(
    'aarch64-unknown-linux-gnu',
    'require_build_for_target',
    `${MANIFEST}\ngggg7777  strata-v${VERSION}-aarch64-unknown-linux-gnu-local.tar.gz`,
  );
  check(
    'local-only target refused',
    localOnly.status !== 0,
    'a target present only as a -local asset satisfied a default install',
  );
}

// 4. A release that published nothing installable says that, rather than
//    printing an empty list of alternatives.
{
  const empty = runAgainstManifest(
    'x86_64-unknown-linux-gnu',
    'require_build_for_target',
    ['eeee5555  strata-idl-docs.tar.gz', 'ffff6666  strata-wasm-web.tar.gz'].join('\n'),
  );
  check(
    'empty release refused',
    empty.status !== 0 && /published no installable binaries/.test(empty.stderr),
    `expected a "no installable binaries" refusal, got ${empty.status}: ${empty.stderr.trim()}`,
  );
}

// The last two checks read the script itself, so they read only its CODE. The
// first draft scanned the whole file and failed on the comment explaining why
// there is no .zip handling, which would have made the guard unfixable without
// deleting its own rationale.
const code = (await (await import('node:fs/promises')).readFile(INSTALLER, 'utf8'))
  .split('\n')
  .filter((line) => !line.trim().startsWith('#'))
  .join('\n');

// 5. The asset check has to run BEFORE the download, or the reader pays for a
//    404 first and the message arrives too late to be the reason.
{
  const gate = code.indexOf('require_build_for_target\n');
  const download = code.search(/curl -fsSL "\$DOWNLOAD_URL"/);
  check(
    'asset check precedes download',
    gate !== -1 && download !== -1 && gate < download,
    'require_build_for_target does not run before the archive download',
  );
}

// 6. Nothing but .tar.gz can reach a release: the release job uploads with
//    `gh release create ... strata-v*.tar.gz`. An installer that asked for a
//    .zip would name an archive that cannot exist and then report its absence
//    as a missing platform. The .exe handling went with it, and was broken
//    anyway: it installed strata.exe and then chmod'd strata, which aborts
//    under `set -e` after the binary has already been moved.
{
  check(
    'no archive extension a release cannot publish',
    !/\.zip|unzip|\.exe/.test(code),
    'install.sh still handles a .zip or .exe, neither of which a release publishes',
  );
}

if (failures.length > 0) {
  console.error(`verify-installer: ${failures.length} failure(s)`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('verify-installer: platform support is read from the release manifest');
