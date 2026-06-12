// The executor contract (05 §4, 03 §4). ScriptedExecutor replays authored events;
// WasmExecutor (R8, future) emits the same stream from the real engine.

export type Tone = 'default' | 'ok' | 'nil' | 'err';
export type PanelId = 'main' | 'fork';

export type ScriptEvent =
  | { type: 'cmd'; panel: PanelId; branch: string; text: string }
  | { type: 'output'; panel: PanelId; text: string; tone?: Tone }
  | { type: 'pause'; ms: number }
  | { type: 'split' }
  | { type: 'merge' };

export interface TermLineData {
  kind: 'cmd' | 'output';
  text: string;
  branch?: string;
  tone?: Tone;
}

export interface TerminalState {
  main: TermLineData[];
  fork: TermLineData[];
  split: boolean;
  merged: boolean;
}

/** Fold a script into its final visual state — the SSR first frame (03 §7). */
export function completedState(script: ScriptEvent[]): TerminalState {
  const state: TerminalState = { main: [], fork: [], split: false, merged: false };
  for (const e of script) {
    if (e.type === 'cmd') state[e.panel].push({ kind: 'cmd', text: e.text, branch: e.branch });
    else if (e.type === 'output') state[e.panel].push({ kind: 'output', text: e.text, tone: e.tone });
    else if (e.type === 'split') state.split = true;
    else if (e.type === 'merge') state.merged = true;
  }
  return state;
}
