"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight, UserRound } from "lucide-react";
import {
  assignToDiego,
  assignToLukas,
  assignToSelf,
} from "@/app/actions/akquise";

type Props = {
  leadId: string;
  assignedTo: string | null;
  assignedName: string | null;
  currentUserId: string;
  currentUserDisplayName?: string | null;
  adminUserId: string;
  vertriebUserId: string;
};

function normalizeId(id: string | null | undefined): string {
  return id?.trim() ?? "";
}

function assignedLabel(
  assignedTo: string | null,
  assignedName: string | null,
  currentUserId: string,
  currentUserDisplayName?: string | null
): string {
  const assigned = normalizeId(assignedTo);
  if (!assigned) return "Niemand zugewiesen";

  if (assigned === normalizeId(currentUserId)) {
    const name = currentUserDisplayName?.trim();
    return name ? `Zugewiesen an ${name}` : "Zugewiesen an dich";
  }

  const name = assignedName?.trim();
  return name ? `Zugewiesen an ${name}` : "Zugewiesen (Unbekannt)";
}

export function AssignmentControl({
  leadId,
  assignedTo,
  assignedName,
  currentUserId,
  currentUserDisplayName,
  adminUserId,
  vertriebUserId,
}: Props) {
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

  const assigned = normalizeId(assignedTo);
  const atLukas = assigned === normalizeId(adminUserId);
  const atDiego = assigned === normalizeId(vertriebUserId);
  const atSelf = assigned === normalizeId(currentUserId);
  const display = assignedLabel(
    assignedTo,
    assignedName,
    currentUserId,
    currentUserDisplayName
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-secondary)]">
          <UserRound className="size-4" strokeWidth={1.75} aria-hidden />
        </div>
        <div>
          <p className="text-xs text-[var(--text-tertiary)]">Aktuell zugewiesen an</p>
          <p className="text-sm font-medium text-[var(--text-primary)]">{display}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {!atLukas && (
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => assignToLukas(leadId), "An Lukas zugewiesen")}
            className="focus-ring inline-flex items-center justify-center gap-2 rounded-md border border-orange-500/40 bg-orange-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-orange-300 hover:bg-orange-500/20 disabled:opacity-40"
          >
            <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
            An Lukas zuweisen
          </button>
        )}
        {!atDiego && (
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => assignToDiego(leadId), "An Diego zugewiesen")}
            className="focus-ring inline-flex items-center justify-center gap-2 rounded-md border border-blue-500/40 bg-blue-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-blue-300 hover:bg-blue-500/20 disabled:opacity-40"
          >
            <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
            An Diego zuweisen
          </button>
        )}
        {!atSelf && (
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => assignToSelf(leadId), "Dir zugewiesen")}
            className="focus-ring inline-flex items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-40"
          >
            <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
            Mir zuweisen
          </button>
        )}
      </div>
    </div>
  );
}
