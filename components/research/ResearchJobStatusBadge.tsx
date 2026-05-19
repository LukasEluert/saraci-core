import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STYLES: Record<string, string> = {
  running: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  completed: "bg-green-500/15 text-green-400 border-green-500/30",
  failed: "bg-red-500/15 text-red-400 border-red-500/30",
};

const LABELS: Record<string, string> = {
  running: "Läuft",
  completed: "Abgeschlossen",
  failed: "Fehlgeschlagen",
};

export function ResearchJobStatusBadge({ status }: { status: string | null }) {
  const key = (status ?? "running").toLowerCase();
  return (
    <Badge
      variant="outline"
      className={cn(STYLES[key] ?? "bg-zinc-500/15 text-zinc-400 border-zinc-500/30")}
    >
      {LABELS[key] ?? status ?? "—"}
    </Badge>
  );
}
