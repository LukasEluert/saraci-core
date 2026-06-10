"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { setAkquiseStatus } from "@/app/actions/akquise";
import { StatusSelect } from "@/components/akquise/StatusSelect";
import type { AkquiseStatus } from "@/lib/akquise/types";

type Props = {
  leadId: string;
  status: AkquiseStatus;
};

export function LeadStatusCard({ leadId, status }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const runStatus = (next: AkquiseStatus, logNote: string, msg: string) =>
    startTransition(async () => {
      try {
        await setAkquiseStatus(leadId, next, { logNote });
        toast.success(msg);
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Fehler");
      }
    });

  return (
    <div className="space-y-4">
      <StatusSelect leadId={leadId} value={status} className="w-full py-2 text-sm" />

      {(status === "angebot_schreiben" || status === "email_schreiben") && (
        <div className="space-y-2 border-t border-[var(--border)] pt-4">
          <p className="label-caps">Schnellaktionen</p>
          <div className="flex flex-col gap-2">
            {status === "angebot_schreiben" && (
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  runStatus("angebot_raus", "Angebot raus", "Status: Angebot raus")
                }
                className="focus-ring rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-40"
              >
                Angebot raus
              </button>
            )}
            {status === "email_schreiben" && (
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  runStatus("email_raus", "Email raus", "Status: Email raus")
                }
                className="focus-ring rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-40"
              >
                Email raus
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
