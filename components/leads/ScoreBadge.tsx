import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BADGE_BASE, scoreBadgeVariant } from "@/lib/ui/badge-styles";
import type { LeadPotential } from "@/lib/leads/types";

export function ScoreBadge({
  score,
  potential: _potential,
}: {
  score: number | null;
  potential?: LeadPotential | null;
}) {
  const variant = scoreBadgeVariant(score);

  if (score === null || score === undefined) {
    return (
      <span className={cn(BADGE_BASE, "font-mono tabular-nums", variant)}>
        —
      </span>
    );
  }

  return (
    <span className={cn(BADGE_BASE, "font-mono tabular-nums", variant)}>
      {score}
    </span>
  );
}
