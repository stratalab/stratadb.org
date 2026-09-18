// Transcript verifier (06 §5.2): runs every demo exchange
// through the REAL strata CLI and diffs outputs. Demos that lie fail the build.
// Usage: STRATA_BIN=/path/to/strata node scripts/verify-transcripts.mjs
// In CI: cargo install strata-cli at src/data/release.json's version. To build
// without a CLI intentionally, set STRATA_TRANSCRIPTS_OFFLINE=1.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BIN = process.env.STRATA_BIN || 'strata';
const OFFLINE = process.env.STRATA_TRANSCRIPTS_OFFLINE === '1';
const RELEASE = JSON.parse(
  readFileSync(new URL('../src/data/release.json', import.meta.url), 'utf8'),
);

// One session per scenario; expectations are substring matches per command.
// These mirror what the homepage sections claim the binary prints -
// keep in sync (single-source extraction is a noted follow-up).
const SCENARIOS = [
  {
    // The homepage tiles run these against the engine compiled to wasm, and
    // stream whatever comes back, so nothing here is a claim about output that
    // could go stale. What can break is the script itself: a renamed verb or a
    // changed flag would leave a tile printing an error on the front page. This
    // runs the KV tile against the real binary and checks the two values that
    // make its point, 10 on default and 5 on the fork.
    name: 'hero KV tile (homepage)',
    exchanges: [
      ['kv put portfolio.cash 10', 'created portfolio.cash'],
      ['branch fork default risky', 'forked risky from default'],
      ['--branch risky kv put portfolio.cash 5', 'updated portfolio.cash'],
      ['kv get portfolio.cash', '10'],
      ['--branch risky kv get portfolio.cash', '5'],
    ],
  },
  {
    name: 'branching (homepage section)',
    exchanges: [
      ['json set portfolio $.strategy "balanced"', 'created portfolio'],
      ['json set portfolio $.stocks 60', 'updated portfolio'],
      ['json set portfolio $.bonds 30', 'updated portfolio'],
      ['json set portfolio $.cash 10', 'updated portfolio'],
      ['branch fork default risky', 'forked risky from default'],
      ['--branch risky json set portfolio $.strategy "aggressive"', 'updated portfolio'],
      ['--branch risky json set portfolio $.stocks 80', 'updated portfolio'],
      ['--branch risky json set portfolio $.bonds 15', 'updated portfolio'],
      ['--branch risky json set portfolio $.cash 5', 'updated portfolio'],
      ['branch diff default risky', 'branch_a  default'],
      ['branch preview risky default', 'conflicts                 -'],
      ['branch merge risky default', 'merged risky into default'],
    ],
  },
  {
    name: 'install (first write)',
    exchanges: [
      ['kv put hello world', 'created hello'],
      ['kv get hello', 'world'],
      ['ping', 'pong'],
    ],
  },
];

// The CLI's own surface - init, doctor, agents, the raw command escape hatch -
// cannot be checked by the sessions above. Those pipe lines into one
// `strata --cache` shell, and these commands are not shell lines: `command
// print` is handled before a database is opened and refuses inside a session,
// and the shell's tokenizer mangles a JSON argument. So they run as their own
// processes, with argv passed through untouched.
//
// `home` is redirected per scenario so nothing here touches the real one, and
// nothing that changes the installation is run: `update` only with --check,
// `uninstall` never.
const ARGV_SCENARIOS = [
  {
    name: 'init (CLI reference)',
    freshHome: true,
    exchanges: [
      [['init'], 'next steps'],
      [['init'], 'already initialized'],
    ],
  },
  {
    name: 'doctor (CLI reference)',
    exchanges: [[['doctor'], 'binary']],
  },
  {
    name: 'agents (CLI reference)',
    exchanges: [
      [['agents', 'guide'], 'agent usage guide'],
      [['agents', 'skill'], 'name: strata'],
    ],
  },
  {
    name: 'update --check (CLI reference)',
    // --check reports; it must never install during a build.
    exchanges: [[['update', '--check'], 'strata']],
  },
  {
    // The trap the page exists to warn about: the raw surface takes base64 KV
    // keys, so a plain key made only of base64 characters is decoded to other
    // bytes and silently addresses the wrong record rather than failing.
    name: 'command print (CLI reference)',
    exchanges: [
      [['command', 'print', '--command-json', '{"type":"kv_get","key":"Z3JlZXRpbmc="}'], 'kv_get'],
      [
        ['command', 'print', '--command-json', '{"type":"kv.get","key":"Z3JlZXRpbmc="}'],
        'unknown variant',
      ],
    ],
  },
];

const probe = spawnSync(BIN, ['--version'], { encoding: 'utf8' });
if (probe.error) {
  if (OFFLINE) {
    console.warn(
      `verify-transcripts: '${BIN}' not available (${probe.error.code}); skipped because STRATA_TRANSCRIPTS_OFFLINE=1.`,
    );
    process.exit(0);
  }
  console.error(`verify-transcripts: '${BIN}' not available (${probe.error.code}).`);
  console.error(
    'Install strata or set STRATA_TRANSCRIPTS_OFFLINE=1 for an explicit offline build.',
  );
  process.exit(1);
}
const reportedVersion = probe.stdout.trim() || BIN;
if (!reportedVersion.includes(RELEASE.version)) {
  console.error(
    `verify-transcripts: '${BIN}' reports '${reportedVersion}', but release.json is ${RELEASE.version}.`,
  );
  console.error('Install the matching strata release or point STRATA_BIN at the matching binary.');
  process.exit(1);
}
console.log(`verifying against: ${reportedVersion}`);

let failures = 0;
for (const scenario of SCENARIOS) {
  const input = scenario.exchanges.map(([cmd]) => cmd).join('\n') + '\nquit\n';
  const run = spawnSync(BIN, ['--cache'], { input, encoding: 'utf8', timeout: 30_000 });
  const out = (run.stdout || '') + (run.stderr || '');
  for (const [cmd, expected] of scenario.exchanges) {
    if (expected && !out.includes(expected)) {
      console.error(`✗ [${scenario.name}] '${cmd}' - expected output containing '${expected}'`);
      failures++;
    } else {
      console.log(`✓ [${scenario.name}] ${cmd}`);
    }
  }
}

const argvHome = mkdtempSync(join(tmpdir(), 'strata-transcripts-'));
for (const scenario of ARGV_SCENARIOS) {
  // A fresh home makes "initialized" vs "already initialized" reproducible
  // rather than a function of whatever ran before.
  const home = scenario.freshHome ? join(argvHome, scenario.name.replace(/\W+/g, '-')) : argvHome;
  for (const [argv, expected] of scenario.exchanges) {
    const run = spawnSync(BIN, argv, {
      encoding: 'utf8',
      timeout: 60_000,
      env: { ...process.env, STRATA_HOME: home },
    });
    const out = (run.stdout || '') + (run.stderr || '');
    const shown = `strata ${argv.join(' ')}`;
    if (expected && !out.includes(expected)) {
      console.error(`✗ [${scenario.name}] '${shown}' - expected output containing '${expected}'`);
      failures++;
    } else {
      console.log(`✓ [${scenario.name}] ${shown}`);
    }
  }
}
rmSync(argvHome, { recursive: true, force: true });

if (failures) {
  console.error(`\n${failures} transcript assertion(s) failed - a demo is lying.`);
  process.exit(1);
}
console.log('\nAll transcripts verified against the real CLI.');
