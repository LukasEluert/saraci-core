"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { deleteActivity } from "@/app/actions/akquise";

export function DeleteActivityButton({
  id,
  leadId,
}: {
  id: string;
  leadId: string;
}) {
  const router = useRouter();

  return (
    <ConfirmButton
      triggerLabel="Aktivitaet loeschen"
      triggerClassName="focus-ring inline-flex size-7 shrink-0 items-center justify-center rounded-md text-[var(--text-tertiary)] hover:bg-red-500/10 hover:text-red-400"
      title="Aktivitaet loeschen?"
      description="Dieser Verlaufseintrag wird dauerhaft entfernt. Das laesst sich nicht rueckgaengig machen."
      confirmLabel="Loeschen"
      successMessage="Aktivitaet geloescht"
      onConfirm={() => deleteActivity(id, leadId)}
      onDone={() => router.refresh()}
    >
      <Trash2 className="size-3.5" strokeWidth={1.75} aria-hidden />
    </ConfirmButton>
  );
}
