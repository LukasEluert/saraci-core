"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createAppointment } from "@/app/actions/akquise";

function defaultDue(): string {
  // Morgen, 09:00 lokal, im datetime-local-Format YYYY-MM-DDTHH:MM
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(9, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export function AppointmentForm({ leadId }: { leadId: string }) {
  const router = useRouter();
  const [titel, setTitel] = useState("Rückruf");
  const [faelligAm, setFaelligAm] = useState<string>(defaultDue);
  const [pending, startTransition] = useTransition();

  const submit = () => {
    if (!titel.trim()) {
      toast.error("Titel fehlt");
      return;
    }
    startTransition(async () => {
      try {
        await createAppointment({ leadId, titel, faelligAm });
        toast.success("Wiedervorlage angelegt");
        setTitel("Rückruf");
        setFaelligAm(defaultDue());
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Fehler");
      }
    });
  };

  return (
    <div className="space-y-3">
      <label className="block space-y-1">
        <span className="label-caps">Titel</span>
        <input
          value={titel}
          onChange={(e) => setTitel(e.target.value)}
          className="focus-ring w-full rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)]"
        />
      </label>

      <label className="block space-y-1">
        <span className="label-caps">Fällig am</span>
        <input
          type="datetime-local"
          value={faelligAm}
          onChange={(e) => setFaelligAm(e.target.value)}
          className="focus-ring w-full rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)]"
        />
      </label>

      <button
        type="button"
        disabled={pending}
        onClick={submit}
        className="focus-ring w-full rounded-md border border-[var(--border)] bg-[var(--bg-elevated-2)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-primary)] hover:border-[var(--accent)] disabled:opacity-40"
      >
        {pending ? "Legt an…" : "Wiedervorlage anlegen"}
      </button>
    </div>
  );
}
