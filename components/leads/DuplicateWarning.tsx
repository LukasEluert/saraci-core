"use client";

import { useEffect, useState } from "react";
import { AkquiseStatusBadge } from "@/components/akquise/AkquiseStatusBadge";
import { AKQUISE_STATUS_VALUES } from "@/lib/akquise/constants";
import type { AkquiseStatus } from "@/lib/akquise/types";
import { formatCreatedAt } from "@/lib/leads/format";

type DuplicateLead = {
  id: string;
  firma: string | null;
  domain: string;
  status: string | null;
  created_at: string | null;
};

export function DuplicateWarning({
  domain,
  firma,
}: {
  domain: string;
  firma?: string;
}) {
  const [duplicates, setDuplicates] = useState<DuplicateLead[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      const trimmedDomain = domain.trim();
      const trimmedFirma = firma?.trim() ?? "";

      if (trimmedDomain.length < 3 && trimmedFirma.length < 2) {
        setDuplicates([]);
        return;
      }

      try {
        const res = await fetch("/api/leads/check-duplicate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            domain: trimmedDomain,
            firma: trimmedFirma || undefined,
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          setDuplicates([]);
          return;
        }

        const data = (await res.json()) as { duplicates?: DuplicateLead[] };
        setDuplicates(data.duplicates ?? []);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setDuplicates([]);
      }
    }, 400);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [domain, firma]);

  if (duplicates.length === 0) {
    return null;
  }

  return (
    <div
      className="rounded-md border border-[var(--warning)]/40 bg-[var(--warning)]/10 p-3 text-sm"
      role="status"
    >
      <p className="font-medium text-[var(--warning)]">
        Ähnliche Leads existieren bereits ({duplicates.length}):
      </p>
      <ul className="mt-2 space-y-1.5">
        {duplicates.map((lead) => (
          <li key={lead.id}>
            <a
              href={`/leads/${lead.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded px-1 py-0.5 transition-colors hover:bg-[var(--warning)]/10"
            >
              <span className="font-medium text-[var(--text-primary)]">
                {lead.firma ?? "—"}
              </span>
              <span className="text-[var(--text-secondary)]">{lead.domain}</span>
              {lead.status && AKQUISE_STATUS_VALUES.has(lead.status) ? (
                <AkquiseStatusBadge status={lead.status as AkquiseStatus} />
              ) : null}
              <span className="text-xs text-[var(--text-tertiary)]">
                {formatCreatedAt(lead.created_at)}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
