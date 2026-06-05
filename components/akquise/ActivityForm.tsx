"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { logActivity } from "@/app/actions/akquise";
import { ACTIVITY_TYPES } from "@/lib/akquise/constants";
import type { ActivityTyp } from "@/lib/akquise/types";

export function ActivityForm({ leadId }: { leadId: string }) {
  const router = useRouter();
  const [typ, setTyp] = useState<ActivityTyp>("anruf");
  const [ergebnis, setErgebnis] = useState("");
  const [notiz, setNotiz] = useState("");
  const [pending, startTransition] = useTransition();

  const submit = () => {
    startTransition(async () => {
      try {
        await logActivity({ leadId, typ, ergebnis, notiz });
        setErgebnis("");
        setNotiz("");
        toast.success("Aktivität gespeichert");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Fehler");
      }
    });
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <span className="label-caps">Typ</span>
        <div className="flex gap-2">
          {ACTIVITY_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTyp(t.value)}
              className={
                "focus-ring rounded-md border px-3 py-1.5 text-xs font-medium transition-colors " +
                (typ === t.value
                  ? "border-[var(--accent)] bg-[var(--accent-dim)] text-[var(--text-primary)]"
                  : "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]")
              }
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <label className="block space-y-1">
        <span className="label-caps">Ergebnis</span>
        <input
          value={ergebnis}
          onChange={(e) => setErgebnis(e.target.value)}
          placeholder="z. B. nicht erreicht, Interesse, Termin"
          className="focus-ring w-full rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)]"
        />
      </label>

      <label className="block space-y-1">
        <span className="label-caps">Notiz</span>
        <textarea
          value={notiz}
          onChange={(e) => setNotiz(e.target.value)}
          rows={3}
          className="focus-ring w-full resize-none rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)]"
        />
      </label>

      <button
        type="button"
        disabled={pending}
        onClick={submit}
        className="focus-ring w-full rounded-md bg-[var(--accent)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white disabled:opacity-40"
      >
        {pending ? "Speichert…" : "Aktivität loggen"}
      </button>
    </div>
  );
}
