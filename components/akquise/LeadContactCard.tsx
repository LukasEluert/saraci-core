"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateLeadContact } from "@/app/actions/akquise";

export function LeadContactCard({
  leadId,
  telefon,
  email,
}: {
  leadId: string;
  telefon: string | null;
  email: string | null;
}) {
  const router = useRouter();
  const [tel, setTel] = useState(telefon ?? "");
  const [mail, setMail] = useState(email ?? "");
  const [, startTransition] = useTransition();

  const save = (field: "telefon" | "email", value: string, original: string) => {
    if (value.trim() === original.trim()) return;
    startTransition(async () => {
      try {
        await updateLeadContact({ leadId, [field]: value });
        toast.success("Gespeichert");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Fehler");
      }
    });
  };

  return (
    <div className="grid gap-3">
      <label className="block space-y-1">
        <span className="label-caps">Telefon</span>
        <input
          value={tel}
          onChange={(e) => setTel(e.target.value)}
          onBlur={() => save("telefon", tel, telefon ?? "")}
          inputMode="tel"
          className="focus-ring w-full rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)]"
        />
      </label>
      <label className="block space-y-1">
        <span className="label-caps">Mail</span>
        <input
          value={mail}
          onChange={(e) => setMail(e.target.value)}
          onBlur={() => save("email", mail, email ?? "")}
          inputMode="email"
          className="focus-ring w-full rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)]"
        />
      </label>
    </div>
  );
}
