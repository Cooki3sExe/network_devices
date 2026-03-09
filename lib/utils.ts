// lib/utils.ts — Shared helper functions

/** Converts KB to a human-readable string (e.g. "23.7 MB"). Returns "—" if null. */
export function formatBytes(kb: number | null): string {
  if (kb === null) return "—";
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

/** Formats a timestamp string to HH:MM:SS for compact chart axis labels. */
export function shortTimestamp(ts: string): string {
  const d = new Date(ts);
  if (isNaN(d.getTime())) return ts.slice(-8);
  return d.toLocaleTimeString();
}
