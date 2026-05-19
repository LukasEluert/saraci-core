import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STYLES: Record<string, string> = {
  new: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  checked: "bg-green-500/15 text-green-400 border-green-500/30",
  saved: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  dismissed: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
  duplicate: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  pending: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  converted: "bg-green-500/15 text-green-400 border-green-500/30",
  failed: "bg-red-500/15 text-red-400 border-red-500/30",
};

const LABELS: Record<string, string> = {
  new: "Neu",
  checked: "Geprüft",
  saved: "Gespeichert",
  dismissed: "Verworfen",
  duplicate: "Duplikat",
  pending: "Ausstehend",
  converted: "Übernommen",
  failed: "Fehlgeschlagen",
};

export function ResearchResultStatusBadge({
  status,
}: {
  status: string | null;
}) {
  const key = (status ?? "new").toLowerCase();
  return (
    <Badge
      variant="outline"
      className={cn(STYLES[key] ?? "bg-zinc-500/15 text-zinc-400 border-zinc-500/30")}
    >
      {LABELS[key] ?? status ?? "—"}
    </Badge>
  );
}
