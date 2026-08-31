// Set-piece A, the seven beats (04 §2 storyboard). Every cmd/output string is
// subject to the build-time transcript verification rule (06 §5.2).
import type { ScriptEvent } from './types';

export const HERO_SCRIPT: ScriptEvent[] = [
  // First frame context (also part of the SSR completed state)
  { type: 'cmd', panel: 'main', branch: 'default', text: 'kv put portfolio.value 98400' },
  { type: 'output', panel: 'main', text: 'created portfolio.value applied=true' },

  // Beat 1 - create the branch
  { type: 'cmd', panel: 'main', branch: 'default', text: 'branch fork default risky' },
  { type: 'output', panel: 'main', text: '"name": "risky"', tone: 'ok' },

  // Beat 2 - the fork
  { type: 'split' },
  { type: 'pause', ms: 700 },

  // Beat 3 - write on the fork
  { type: 'cmd', panel: 'fork', branch: 'risky', text: 'kv put portfolio.value 111080' },
  { type: 'output', panel: 'fork', text: 'updated portfolio.value applied=true' },

  // Beat 4 - the isolation beat: main is untouched
  { type: 'cmd', panel: 'main', branch: 'default', text: 'kv get portfolio.value' },
  { type: 'output', panel: 'main', text: '98400' },

  // Beat 5 - the verb beat: diff before merge
  { type: 'cmd', panel: 'main', branch: 'default', text: 'branch diff default risky' },
  { type: 'output', panel: 'main', text: '"branch_b": "risky"', tone: 'ok' },

  // Beat 6 - preview the promotion before applying it
  { type: 'cmd', panel: 'main', branch: 'default', text: 'branch preview risky default' },
  { type: 'output', panel: 'main', text: '"conflicts": []', tone: 'ok' },

  // Beat 7 - merge; panels rejoin
  { type: 'cmd', panel: 'main', branch: 'default', text: 'branch merge risky default' },
  { type: 'output', panel: 'main', text: '"target": "default"', tone: 'ok' },
  { type: 'merge' },
  { type: 'pause', ms: 700 },

  // Beat 8 - payoff
  { type: 'cmd', panel: 'main', branch: 'default', text: 'kv get portfolio.value' },
  { type: 'output', panel: 'main', text: '111080' },
];

/** Hold on the completed state before the loop restarts (03 §4: ≥4s). */
export const HERO_HOLD_MS = 4500;
