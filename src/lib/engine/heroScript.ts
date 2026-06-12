// Set-piece A, the seven beats (04 §2 storyboard). Every cmd/output string is
// subject to the build-time transcript verification rule (06 §5.2).
import type { ScriptEvent } from './types';

export const HERO_SCRIPT: ScriptEvent[] = [
  // First frame context (also part of the SSR completed state)
  { type: 'cmd', panel: 'main', branch: 'main', text: 'kv put greeting "hello"' },
  { type: 'output', panel: 'main', text: '(version) 1' },

  // Beat 1 — create the branch
  { type: 'cmd', panel: 'main', branch: 'main', text: 'branch create experiment' },
  { type: 'output', panel: 'main', text: 'OK' },

  // Beat 2 — the fork
  { type: 'split' },
  { type: 'pause', ms: 700 },

  // Beat 3 — write on the fork
  { type: 'cmd', panel: 'fork', branch: 'experiment', text: 'kv put config.theme "midnight"' },
  { type: 'output', panel: 'fork', text: '(version) 1' },

  // Beat 4 — the isolation beat: main is untouched
  { type: 'cmd', panel: 'main', branch: 'main', text: 'kv get config.theme' },
  { type: 'output', panel: 'main', text: '(nil)', tone: 'nil' },

  // Beat 5 — the verb beat: diff before merge
  { type: 'cmd', panel: 'main', branch: 'main', text: 'branch diff experiment' },
  { type: 'output', panel: 'main', text: '+1 key · config.theme', tone: 'ok' },

  // Beat 6 — merge; panels rejoin
  { type: 'cmd', panel: 'main', branch: 'main', text: 'branch merge experiment' },
  { type: 'output', panel: 'main', text: 'merged', tone: 'ok' },
  { type: 'merge' },
  { type: 'pause', ms: 700 },

  // Beat 7 — payoff
  { type: 'cmd', panel: 'main', branch: 'main', text: 'kv get config.theme' },
  { type: 'output', panel: 'main', text: '"midnight"' },
];

/** Hold on the completed state before the loop restarts (03 §4: ≥4s). */
export const HERO_HOLD_MS = 4500;
