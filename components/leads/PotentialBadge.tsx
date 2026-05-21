import { cn } from "@/lib/utils";
import { BADGE_BASE, POTENTIAL_BADGE_STYLES } from "@/lib/ui/badge-styles";
import type { LeadPotential } from "@/lib/leads/types";

const LABELS: Record<LeadPotential, string> = {
  high: "Hoch",
  medium: "Mittel",
  low: "Niedrig",
};

export function PotentialBadge({
  potential,
}: {
  potential: LeadPotential | null;
}) {
  if (!potential) {
    return <span className="text-xs text-[var(--text-muted)]">—</span>;
  }

  return (
    <span className={cn(BADGE_BASE, POTENTIAL_BADGE_STYLES[potential])}>
      {LABELS[potential]}
    </span>
  );
}
