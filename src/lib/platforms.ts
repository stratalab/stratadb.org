// What the release actually runs on.
//
// Every fact here comes from the release assets recorded in release.json, so
// the site cannot claim a platform the release does not ship a binary for. It
// did exactly that: the homepage advertised "macOS, Linux, Windows" in its
// structured data while v1.1.1 shipped three targets and none of them was
// Windows.
//
// Targets are parsed rather than looked up, so a Windows or musl build appears
// here the day it ships without anyone editing this file.
import release from '../data/release.json';

export interface ReleaseTarget {
  target: string;
  asset: string;
  url: string;
  size: number;
  /** From the release's own checksums-sha256.txt, the file install.sh verifies against. */
  sha256?: string;
}

export interface Platform extends ReleaseTarget {
  /** Stable key for selection, e.g. "macos". */
  osKey: string;
  /** As a reader would name it, e.g. "macOS". */
  os: string;
  /** As a reader would name it, e.g. "Apple Silicon". */
  arch: string;
}

const OS_NAMES: Record<string, { key: string; label: string }> = {
  darwin: { key: 'macos', label: 'macOS' },
  linux: { key: 'linux', label: 'Linux' },
  windows: { key: 'windows', label: 'Windows' },
};

// Apple names its two architectures; everyone else uses the machine name.
const ARCH_NAMES: Record<string, string> = {
  x86_64: 'x86-64',
  aarch64: 'ARM64',
};
const APPLE_ARCH_NAMES: Record<string, string> = {
  x86_64: 'Intel',
  aarch64: 'Apple Silicon',
};

/** A target triple, e.g. "aarch64-apple-darwin", named for a reader. */
export function describeTarget(target: string): Omit<Platform, keyof ReleaseTarget> | null {
  const parts = target.split('-');
  const arch = parts[0];
  const osPart = parts.find((part) => part in OS_NAMES);
  if (!osPart || !arch) return null;
  const os = OS_NAMES[osPart];
  const names = os.key === 'macos' ? APPLE_ARCH_NAMES : ARCH_NAMES;
  return { osKey: os.key, os: os.label, arch: names[arch] ?? arch };
}

/** Every platform the current release ships a binary for. */
export function platforms(): Platform[] {
  const targets = (release as { targets?: ReleaseTarget[] }).targets ?? [];
  return targets.flatMap((t) => {
    const described = describeTarget(t.target);
    return described ? [{ ...t, ...described }] : [];
  });
}

/** Operating systems with at least one binary, in the order they are shipped. */
export function operatingSystems(): { key: string; label: string; builds: Platform[] }[] {
  const byOs = new Map<string, { key: string; label: string; builds: Platform[] }>();
  for (const p of platforms()) {
    const entry = byOs.get(p.osKey) ?? { key: p.osKey, label: p.os, builds: [] };
    entry.builds.push(p);
    byOs.set(p.osKey, entry);
  }
  return [...byOs.values()];
}
