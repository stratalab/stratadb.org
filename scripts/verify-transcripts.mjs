// Transcript verifier (06 §5.2): runs every demo exchange
// through the REAL strata CLI and diffs outputs. Demos that lie fail the build.
// Usage: STRATA_BIN=/path/to/strata node scripts/verify-transcripts.mjs
// In CI: cargo install strata-cli at src/data/release.json's version. To build
// without a CLI intentionally, set STRATA_TRANSCRIPTS_OFFLINE=1.
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const BIN = process.env.STRATA_BIN || 'strata';
const OFFLINE = process.env.STRATA_TRANSCRIPTS_OFFLINE === '1';
const RELEASE = JSON.parse(
  readFileSync(new URL('../src/data/release.json', import.meta.url), 'utf8'),
);

// One session per scenario; expectations are substring matches per command.
// These mirror src/lib/engine/heroScript.ts and the section transcripts —
// keep in sync (single-source extraction is a noted follow-up).
const SCENARIOS = [
  {
    name: 'hero (homepage)',
    exchanges: [
      ['kv put portfolio.value 98400', 'created portfolio.value applied=true'],
      ['branch fork default risky', '"name": "risky"'],
      ['--branch risky kv put portfolio.value 111080', 'updated portfolio.value applied=true'],
      ['--branch default kv get portfolio.value', '98400'],
      ['branch diff default risky', '"branch_b": "risky"'],
      ['branch preview risky default', '"conflicts": []'],
      ['branch merge risky default', '"target": "default"'],
      ['--branch default kv get portfolio.value', '111080'],
    ],
  },
  {
    name: 'branching (homepage section)',
    exchanges: [
      ['json set portfolio $.strategy "balanced"', 'created portfolio applied=true'],
      ['json set portfolio $.stocks 60', 'updated portfolio applied=true'],
      ['json set portfolio $.bonds 30', 'updated portfolio applied=true'],
      ['json set portfolio $.cash 10', 'updated portfolio applied=true'],
      ['branch fork default risky', '"name": "risky"'],
      [
        '--branch risky json set portfolio $.strategy "aggressive"',
        'updated portfolio applied=true',
      ],
      ['--branch risky json set portfolio $.stocks 80', 'updated portfolio applied=true'],
      ['--branch risky json set portfolio $.bonds 15', 'updated portfolio applied=true'],
      ['--branch risky json set portfolio $.cash 5', 'updated portfolio applied=true'],
      ['branch diff default risky', '"branch_a": "default"'],
      ['branch preview risky default', '"conflicts": []'],
      ['branch merge risky default', '"target": "default"'],
    ],
  },
  {
    name: 'install (first write)',
    exchanges: [
      ['kv put hello world', 'created hello applied=true'],
      ['kv get hello', 'world'],
      ['ping', 'pong'],
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
      console.error(`✗ [${scenario.name}] '${cmd}' — expected output containing '${expected}'`);
      failures++;
    } else {
      console.log(`✓ [${scenario.name}] ${cmd}`);
    }
  }
}

if (failures) {
  console.error(`\n${failures} transcript assertion(s) failed — a demo is lying.`);
  process.exit(1);
}
console.log('\nAll transcripts verified against the real CLI.');
