export const BADGE_BASE =
  "inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium";

export function scoreBadgeVariant(score: number | null | undefined): string {
  if (score === null || score === undefined) {
    return "bg-[var(--bg-elevated-2)] text-[var(--text-muted)] border-[var(--border)]";
  }
  if (score <= 40) {
    return "bg-red-500/10 text-red-400 border-red-500/30";
  }
  if (score <= 70) {
    return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
  }
  return "bg-green-500/10 text-green-400 border-green-500/30";
}

export const POTENTIAL_BADGE_STYLES = {
  high: "bg-red-500/10 text-red-400 border-red-500/30",
  medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  low: "bg-green-500/10 text-green-400 border-green-500/30",
} as const;
