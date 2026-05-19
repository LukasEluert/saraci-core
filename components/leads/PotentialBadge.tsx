import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LeadPotential } from "@/lib/leads/types";

const STYLES: Record<LeadPotential, string> = {
  high: "bg-red-500 text-white",
  medium: "bg-yellow-500 text-black",
  low: "bg-green-500 text-white",
};

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
    return <span className="text-[var(--text-tertiary)]">—</span>;
  }

  return (
    <Badge className={cn("border-0", STYLES[potential])}>
      {LABELS[potential]}
    </Badge>
  );
}
