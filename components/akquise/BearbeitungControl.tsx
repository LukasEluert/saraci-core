"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Hand, Undo2 } from "lucide-react";
import { endBearbeitung, startBearbeitung } from "@/app/actions/akquise";
import { formatDateTime } from "@/lib/leads/format";

export function BearbeitungControl({
  leadId,
  bearbeitungVon,
  bearbeitungSeit,
  currentUserId,
  bearbeiterName,
}: {
  leadId: string;
  bearbeitungVon: string | null;
  bearbeitungSeit: string | null;
  currentUserId: string;
  bearbeiterName: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const run = (fn: () => Promise<void>, msg: string) =>
    startTransition(async () => {
      try {
        await fn();
        toast.success(msg);
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Fehler");
      }
    });

  const mine = bearbeitungVon === currentUserId;

  if (!bearbeitungVon) {
    return (
      <button
        type="button"
        disabled={pending}
        onClick={() => run(() => startBearbeitung(leadId), "Du bearbeitest diesen Lead")}
        className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white hover:bg-[var(--accent-hover)] disabled:opacity-40"
      >
        <Hand className="size-4" strokeWidth={1.75} aria-hidden />
        Ich übernehme das
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-[var(--text-secondary)]">
        {mine ? "In Arbeit von dir" : `In Arbeit von ${bearbeiterName ?? "jemandem"}`}
        {bearbeitungSeit && (
          <>
            {" "}
            seit{" "}
            <span className="text-[var(--text-primary)]">
              {formatDateTime(bearbeitungSeit)}
            </span>
          </>
        )}
      </p>

      <button
        type="button"
        disabled={pending}
        onClick={() => run(() => endBearbeitung(leadId), "Freigegeben")}
        className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-40"
      >
        <Undo2 className="size-4" strokeWidth={1.75} aria-hidden />
        Freigeben
      </button>
    </div>
  );
}
