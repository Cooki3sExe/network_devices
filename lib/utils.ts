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

/** Formats uptime (in centiseconds) to 'Xh Ym'. Returns '—' if null. */
export function formatUptime(ticks: number | null): string {
  if (ticks === null) return "—";
  const totalSeconds = Math.floor(ticks / 100);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/** Returns true if the timestamp is within the last X minutes. */
export function isRecent(timestamp: string | null, minutes = 30): boolean {
  if (!timestamp) return false;
  const lastSeen = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - lastSeen.getTime();
  const diffMins = diffMs / (1000 * 60);
  return diffMins <= minutes;
}

/** Returns a human-readable relative time string (e.g., "hace 5m"). */
export function formatTimeAgo(timestamp: string | null): string {
  if (!timestamp) return "—";
  const lastSeen = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - lastSeen.getTime();
  
  if (diffMs < 0) return "ahora mismo"; // In case of clock skew
  
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "ahora mismo";
  if (minutes < 60) return `hace ${minutes}m`;
  if (hours < 24) return `hace ${hours}h`;
  if (days < 7) return `hace ${days}d`;
  
  return lastSeen.toLocaleDateString();
}
