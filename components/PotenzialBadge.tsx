import type { PotenzialLevel } from "@/lib/types/core";

function classes(p: string | null | undefined) {
  const v = (p ?? "").toLowerCase();
  if (v === "hoch") {
    return "border-[var(--accent)] bg-[var(--accent-dim)] text-[var(--accent)]";
  }
  if (v === "mittel") {
    return "border-[rgba(245,158,11,0.35)] bg-[rgba(245,158,11,0.08)] text-[var(--amber)]";
  }
  if (v === "niedrig") {
    return "border-[rgba(34,197,94,0.35)] bg-[rgba(34,197,94,0.08)] text-[var(--green)]";
  }
  return "border-[var(--border)] bg-[var(--surface-hover)] text-[var(--text-secondary)]";
}

function label(p: string | null | undefined): string {
  const v = (p ?? "").toLowerCase() as PotenzialLevel | string;
  if (v === "hoch") return "Hoch";
  if (v === "mittel") return "Mittel";
  if (v === "niedrig") return "Niedrig";
  return p ? String(p) : "—";
}

export function PotenzialBadge({
  potenzial,
  showDot = true,
}: {
  potenzial: string | null | undefined;
  showDot?: boolean;
}) {
  if (!potenzial || potenzial.trim().length === 0) {
    return <span className="text-[11px] text-[var(--text-tertiary)]">—</span>;
  }

  const v = potenzial.toLowerCase();
  const dot =
    v === "hoch"
      ? "bg-[var(--accent)]"
      : v === "mittel"
        ? "bg-[var(--amber)]"
        : v === "niedrig"
          ? "bg-[var(--green)]"
          : "bg-[var(--text-tertiary)]";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium tracking-[-0.01em] ${classes(potenzial)}`}
    >
      {showDot ? <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} /> : null}
      {label(potenzial)}
    </span>
  );
}
