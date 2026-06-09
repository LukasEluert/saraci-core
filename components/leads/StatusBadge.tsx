import { cn } from "@/lib/utils";
import { BADGE_BASE } from "@/lib/ui/badge-styles";

const STATUS_STYLES: Record<string, string> = {
  new: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  qualified: "bg-green-500/10 text-green-400 border-green-500/30",
  contacted: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  won: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  lost: "bg-neutral-500/10 text-neutral-400 border-neutral-500/30",
  rejected: "bg-neutral-500/10 text-neutral-400 border-neutral-500/30",
  later: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
};

const STATUS_LABELS: Record<string, string> = {
  new: "Neu",
  qualified: "Qualifiziert",
  contacted: "Kontaktiert",
  won: "Gewonnen",
  lost: "Verloren",
  rejected: "Verworfen",
  later: "Später",
};

export function StatusBadge({ status }: { status: string | null }) {
  if (!status) {
    return (
      <span className={cn(BADGE_BASE, STATUS_STYLES.new)}>
        —
      </span>
    );
  }
  const key = status.toLowerCase();
  return (
    <span className={cn(BADGE_BASE, STATUS_STYLES[key] ?? STATUS_STYLES.new)}>
      {STATUS_LABELS[key] ?? "—"}
    </span>
  );
}
