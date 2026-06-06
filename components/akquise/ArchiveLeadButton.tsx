"use client";

import { useRouter } from "next/navigation";
import { Archive, ArchiveRestore } from "lucide-react";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { setLeadArchived } from "@/app/actions/akquise";

export function ArchiveLeadButton({
  leadId,
  archiviert,
}: {
  leadId: string;
  archiviert: boolean;
}) {
  const router = useRouter();

  if (archiviert) {
    return (
      <ConfirmButton
        triggerLabel="Lead wiederherstellen"
        triggerClassName="focus-ring inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        title="Lead wiederherstellen?"
        description="Der Lead erscheint danach wieder in deiner Liste."
        confirmLabel="Wiederherstellen"
        successMessage="Lead wiederhergestellt"
        destructive={false}
        onConfirm={() => setLeadArchived(leadId, false)}
        onDone={() => router.refresh()}
      >
        <ArchiveRestore className="size-4" strokeWidth={1.75} aria-hidden />
        Wiederherstellen
      </ConfirmButton>
    );
  }

  return (
    <ConfirmButton
      triggerLabel="Lead archivieren"
      triggerClassName="focus-ring inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)] hover:border-red-500/40 hover:text-red-400"
      title="Lead archivieren?"
      description="Der Lead wird aus den Listen ausgeblendet, bleibt aber mit Kontakt und Historie erhalten und kann jederzeit wiederhergestellt werden."
      confirmLabel="Archivieren"
      successMessage="Lead archiviert"
      onConfirm={() => setLeadArchived(leadId, true)}
      onDone={() => router.push("/akquise")}
    >
      <Archive className="size-4" strokeWidth={1.75} aria-hidden />
      Archivieren
    </ConfirmButton>
  );
}
