import { Badge } from "@/components/ui/badge";
import type { TriggeredRule } from "@/lib/core/checks/types";

const SEVERITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const SEVERITY_STYLES: Record<string, string> = {
  critical: "bg-red-500/20 text-red-300",
  high: "bg-orange-500/20 text-orange-300",
  medium: "bg-yellow-500/20 text-yellow-300",
  low: "bg-zinc-500/20 text-zinc-400",
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
          className="rounded-md border border-[var(--border)] p-3"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{f.label}</span>
            <Badge
              variant="secondary"
              className={SEVERITY_STYLES[f.severity] ?? ""}
            >
              {f.severity}
            </Badge>
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
