import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  new: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  qualified: "bg-green-500/15 text-green-400 border-green-500/30",
  contacted: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  won: "bg-emerald-600/20 text-emerald-300 border-emerald-600/30",
  lost: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
  rejected: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
  later: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
};

const STATUS_LABELS: Record<string, string> = {
  new: "Neu",
  qualified: "Qualifiziert",
  contacted: "Kontaktiert",
  won: "Gewonnen",
  lost: "Verloren",
  rejected: "Verworfen",
  later: "Später",
  neu: "Neu",
};

export function StatusBadge({ status }: { status: string | null }) {
  const key = (status ?? "new").toLowerCase();
  return (
    <Badge
      variant="outline"
      className={cn(STATUS_STYLES[key] ?? STATUS_STYLES.new)}
    >
      {STATUS_LABELS[key] ?? status ?? "—"}
    </Badge>
  );
}
