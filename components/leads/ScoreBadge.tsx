import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LeadPotential } from "@/lib/leads/types";

function scoreBadgeClass(score: number | null | undefined): string {
  if (score === null || score === undefined) {
    return "bg-neutral-700 text-neutral-300";
  }
  if (score <= 40) return "bg-red-500 text-white";
  if (score <= 70) return "bg-yellow-500 text-black";
  return "bg-green-500 text-white";
}

export function ScoreBadge({
  score,
  potential: _potential,
}: {
  score: number | null;
  potential?: LeadPotential | null;
}) {
  if (score === null || score === undefined) {
    return (
      <Badge className={cn("border-0 font-mono", scoreBadgeClass(score))}>
        —
      </Badge>
    );
  }

  return (
    <Badge
      className={cn("border-0 font-mono tabular-nums", scoreBadgeClass(score))}
    >
      {score}
    </Badge>
  );
}
