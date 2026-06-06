import { cn } from "@/lib/utils";
import { BADGE_BASE } from "@/lib/ui/badge-styles";

// Eigene Achse "in Bearbeitung" - optisch klar getrennt vom Status-Badge.
export function BearbeitungBadge({
  name,
  className,
}: {
  name?: string | null;
  className?: string;
}) {
  return (
    <span
      className={cn(
        BADGE_BASE,
        "gap-1.5 border-sky-500/40 bg-sky-500/15 text-sky-300",
        className
      )}
    >
      <span className="size-1.5 rounded-full bg-sky-400" aria-hidden />
      Angebot in Arbeit{name ? ` (${name})` : ""}
    </span>
  );
}
