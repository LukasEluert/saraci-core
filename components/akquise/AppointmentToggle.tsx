"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { setAppointmentDone } from "@/app/actions/akquise";

export function AppointmentToggle({
  id,
  erledigt,
}: {
  id: string;
  erledigt: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          try {
            await setAppointmentDone(id, !erledigt);
            toast.success(erledigt ? "Wieder offen" : "Erledigt");
            router.refresh();
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Fehler");
          }
        })
      }
      className={
        "focus-ring inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50 " +
        (erledigt
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
          : "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]")
      }
    >
      <Check className="size-3.5" strokeWidth={2} aria-hidden />
      {erledigt ? "Erledigt" : "Erledigen"}
    </button>
  );
}
