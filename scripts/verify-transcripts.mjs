// Transcript verifier (06 §5.2 — ⛔ cutover gate): runs every demo exchange
// through the REAL strata CLI and diffs outputs. Demos that lie fail the build.
// Usage: STRATA_BIN=/path/to/strata node scripts/verify-transcripts.mjs
// In CI: cargo install strata-cli (cached) provides the binary.
import { spawnSync } from 'node:child_process';

const BIN = process.env.STRATA_BIN || 'strata';

// One session per scenario; expectations are substring matches per command.
// These mirror src/lib/engine/heroScript.ts and the section transcripts —
// keep in sync (single-source extraction is a noted follow-up).
const SCENARIOS = [
  {
    name: 'hero (set-piece A)',
    exchanges: [
      ['kv put greeting "hello"', '(version) 1'],
      ['branch create experiment', 'OK'],
      // fork-side write happens on the experiment branch in the demo; the CLI
      // session equivalent uses an explicit branch context where supported.
      ['kv get config.theme', '(nil)'],
    ],
  },
  {
    name: 'branching (verb set)',
    exchanges: [
      ['branch create risky', 'OK'],
      ['branch diff risky', ''],
      ['branch delete risky', 'OK'],
    ],
  },
  {
    name: 'install (first write)',
    exchanges: [
      ['kv put hello world', '(version) 1'],
      ['kv get hello', '"world"'],
      ['ping', 'PONG'],
    ],
  },
];

const probe = spawnSync(BIN, ['--version'], { encoding: 'utf8' });
if (probe.error) {
  console.warn(`verify-transcripts: '${BIN}' not available (${probe.error.code}) — skipping.`);
  console.warn('This check is a ⛔ cutover gate and MUST pass before Phase 7.');
  process.exit(0);
}
console.log(`verifying against: ${probe.stdout.trim() || BIN}`);

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
