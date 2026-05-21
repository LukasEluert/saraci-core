import { cn } from "@/lib/utils";
import { BADGE_BASE } from "@/lib/ui/badge-styles";

const STYLES: Record<string, string> = {
  new: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  checked: "bg-green-500/10 text-green-400 border-green-500/30",
  saved: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  dismissed: "bg-neutral-500/10 text-neutral-400 border-neutral-500/30",
  duplicate: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  converted: "bg-green-500/10 text-green-400 border-green-500/30",
  failed: "bg-red-500/10 text-red-400 border-red-500/30",
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
