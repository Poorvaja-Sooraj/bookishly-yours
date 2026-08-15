/**
 * Formats a Date or date-string into "D MMM YYYY" format (e.g. 15 Aug 2026).
 * Returns fallback (default "—") for null/undefined/invalid dates.
 */
export function formatDate(
  date: string | Date | null | undefined,
  fallback = "—"
): string {
  if (!date) return fallback;
  const d = new Date(date);
  if (isNaN(d.getTime())) return fallback;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Formats seconds into human readable duration strings.
 * - 'hm': e.g. "1h 30m" or "45m" or "0m"
 * - 'mmss': e.g. "01:30" or "00:45"
 */
export function formatDuration(
  totalSeconds: number,
  format: "hm" | "mmss" = "hm"
): string {
  if (format === "mmss") {
    const m = Math.floor(totalSeconds / 60);
    const s = Math.round(totalSeconds % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  if (!totalSeconds || totalSeconds === 0) return "0m";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
