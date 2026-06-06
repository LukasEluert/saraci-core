"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { setAkquiseStatus } from "@/app/actions/akquise";
import { AKQUISE_STATUS, AKQUISE_STATUS_STYLES } from "@/lib/akquise/constants";
import type { AkquiseStatus } from "@/lib/akquise/types";
import { cn } from "@/lib/utils";

export function StatusSelect({
  leadId,
  value,
  className,
}: {
  leadId: string;
  value: AkquiseStatus;
  className?: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<AkquiseStatus>(value);
  const [pending, startTransition] = useTransition();

  return (
    <select
      value={status}
      disabled={pending}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => {
        const next = e.target.value as AkquiseStatus;
        const prev = status;
        setStatus(next);
        startTransition(async () => {
          try {
            await setAkquiseStatus(leadId, next);
            toast.success("Status aktualisiert");
            router.refresh();
          } catch (err) {
            setStatus(prev);
            toast.error(err instanceof Error ? err.message : "Fehler");
          }
        });
      }}
      className={cn(
        "focus-ring rounded-md border px-2 py-1 text-xs font-medium disabled:opacity-50",
        AKQUISE_STATUS_STYLES[status],
        className
      )}
    >
      {AKQUISE_STATUS.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  );
}
