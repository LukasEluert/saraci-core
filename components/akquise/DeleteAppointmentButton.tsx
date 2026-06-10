"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { deleteAppointment } from "@/app/actions/akquise";

export function DeleteAppointmentButton({
  id,
  leadId,
}: {
  id: string;
  leadId?: string;
}) {
  const router = useRouter();

  return (
    <ConfirmButton
      triggerLabel="Wiedervorlage loeschen"
      triggerClassName="focus-ring inline-flex size-7 shrink-0 items-center justify-center rounded-md text-[var(--text-tertiary)] hover:bg-red-500/10 hover:text-red-400"
      title="Wiedervorlage loeschen?"
      description="Diese Wiedervorlage wird dauerhaft entfernt. Erledigte kannst du stattdessen einfach abhaken."
      confirmLabel="Loeschen"
      successMessage="Wiedervorlage geloescht"
      onConfirm={async () => {
        try {
          await deleteAppointment(id, leadId);
        } catch (err) {
          console.error("[DeleteAppointmentButton] Loeschen fehlgeschlagen:", {
            appointmentId: id,
            leadId,
            err,
          });
          throw err;
        }
      }}
      onDone={() => router.refresh()}
    >
      <Trash2 className="size-3.5" strokeWidth={1.75} aria-hidden />
    </ConfirmButton>
  );
}
