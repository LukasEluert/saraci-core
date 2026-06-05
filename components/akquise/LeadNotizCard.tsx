"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateLeadNotiz } from "@/app/actions/akquise";

export function LeadNotizCard({
  leadId,
  notiz,
}: {
  leadId: string;
  notiz: string | null;
}) {
  const router = useRouter();
  const [text, setText] = useState(notiz ?? "");
  const [pending, startTransition] = useTransition();

  const dirty = text.trim() !== (notiz ?? "").trim();

  const save = () => {
    startTransition(async () => {
      try {
        await updateLeadNotiz(leadId, text);
        toast.success("Notiz gespeichert");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Konnte nicht speichern.");
      }
    });
  };

  return (
    <div className="space-y-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder="Kontext zu diesem Lead (aus dem Import oder eigene Notizen)…"
        className="focus-ring w-full resize-y rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)]"
      />
      <button
        type="button"
        disabled={pending || !dirty}
        onClick={save}
        className="focus-ring rounded-md bg-[var(--accent)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white disabled:opacity-40"
      >
        {pending ? "Speichert…" : "Notiz speichern"}
      </button>
    </div>
  );
}
