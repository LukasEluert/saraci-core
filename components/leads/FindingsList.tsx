import type { TriggeredRule } from "@/lib/core/checks/types";
import { cn } from "@/lib/utils";
import { BADGE_BASE } from "@/lib/ui/badge-styles";

const SEVERITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const SEVERITY_STYLES: Record<string, string> = {
  critical: "bg-red-500/10 text-red-400 border-red-500/30",
  high: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  low: "bg-neutral-500/10 text-neutral-400 border-neutral-500/30",
};

export function FindingsList({ findings }: { findings: TriggeredRule[] }) {
  const sorted = [...findings].sort(
    (a, b) =>
      (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9)
  );

  if (sorted.length === 0) {
    return (
      <p className="text-sm text-[var(--text-secondary)]">Keine Findings.</p>
    );
  }

  return (
    <ul className="space-y-3">
      {sorted.map((f) => (
        <li
          key={`${f.rule_key}-${f.evidence}`}
          className="rounded-md border border-[var(--border)] bg-[var(--bg-elevated-2)] p-3"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{f.label}</span>
            <span
              className={cn(
                BADGE_BASE,
                SEVERITY_STYLES[f.severity] ??
                  "bg-neutral-500/10 text-neutral-400 border-neutral-500/30"
              )}
            >
              {f.severity}
            </span>
            <span className="font-mono text-xs text-[var(--text-tertiary)]">
              {f.points} Pkt
            </span>
          </div>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">{f.evidence}</p>
        </li>
      ))}
    </ul>
  );
}
