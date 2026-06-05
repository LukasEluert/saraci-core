"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { markAngebotRaus, setLeadAktion } from "@/app/actions/akquise";
import { LEAD_AKTION } from "@/lib/akquise/constants";
import type { LeadAktion } from "@/lib/akquise/types";

export function ActionFlagControl({
  leadId,
  aktion,
  aktionNotiz,
}: {
  leadId: string;
  aktion: LeadAktion;
  aktionNotiz: string | null;
}) {
  const router = useRouter();
  const [value, setValue] = useState<LeadAktion>(aktion);
  const [notiz, setNotiz] = useState(aktionNotiz ?? "");
  const [pending, startTransition] = useTransition();

  const save = () => {
    startTransition(async () => {
      try {
        await setLeadAktion({ leadId, aktion: value, aktionNotiz: notiz });
        toast.success("Aktion gesetzt");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Fehler");
      }
    });
  };

  const angebotRaus = () => {
    startTransition(async () => {
      try {
        await markAngebotRaus(leadId);
        setValue("keine");
        toast.success("Als erledigt markiert");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Fehler");
      }
    });
  };

  return (
    <div className="space-y-3">
      <label className="block space-y-1">
        <span className="label-caps">Handlungsbedarf</span>
        <select
          value={value}
          onChange={(e) => setValue(e.target.value as LeadAktion)}
          disabled={pending}
          className="focus-ring w-full rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] disabled:opacity-50"
        >
          {LEAD_AKTION.map((a) => (
            <option key={a.value} value={a.value}>
              {a.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-1">
        <span className="label-caps">Aktions-Notiz</span>
        <input
          value={notiz}
          onChange={(e) => setNotiz(e.target.value)}
          placeholder="z. B. Angebot an info@… senden"
          className="focus-ring w-full rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)]"
        />
      </label>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={save}
          className="focus-ring rounded-md border border-[var(--border)] bg-[var(--bg-elevated-2)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-primary)] hover:border-[var(--accent)] disabled:opacity-40"
        >
          {pending ? "…" : "Aktion speichern"}
        </button>
        {aktion !== "keine" && (
          <button
            type="button"
            disabled={pending}
            onClick={angebotRaus}
            className="focus-ring inline-flex items-center justify-center gap-2 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-40"
          >
            <CheckCircle2 className="size-4" strokeWidth={1.75} aria-hidden />
            Angebot raus / erledigt
          </button>
        )}
      </div>
    </div>
  );
}
