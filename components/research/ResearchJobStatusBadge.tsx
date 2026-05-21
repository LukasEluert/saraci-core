import { cn } from "@/lib/utils";
import { BADGE_BASE } from "@/lib/ui/badge-styles";

const STYLES: Record<string, string> = {
  running: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  completed: "bg-green-500/10 text-green-400 border-green-500/30",
  failed: "bg-red-500/10 text-red-400 border-red-500/30",
};

const LABELS: Record<string, string> = {
  running: "Läuft",
  completed: "Abgeschlossen",
  failed: "Fehlgeschlagen",
};

export function ResearchJobStatusBadge({ status }: { status: string | null }) {
  const key = (status ?? "running").toLowerCase();
  return (
    <span
      className={cn(
        BADGE_BASE,
        STYLES[key] ?? "bg-neutral-500/10 text-neutral-400 border-neutral-500/30"
      )}
    >
      {LABELS[key] ?? status ?? "—"}
    </span>
  );
}
