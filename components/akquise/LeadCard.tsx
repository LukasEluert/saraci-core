"use client";

import { useRouter } from "next/navigation";
import { Mail, Phone } from "lucide-react";
import { AkquiseStatusBadge } from "@/components/akquise/AkquiseStatusBadge";
import { ArchiveLeadButton } from "@/components/akquise/ArchiveLeadButton";
import { BearbeitungBadge } from "@/components/akquise/BearbeitungBadge";
import type { AkquiseLead } from "@/lib/akquise/types";

// Mobile-Ansicht der Lead-Liste: nach der Kern-Taetigkeit "anrufen" gebaut.
// Karte ist tappbar -> Detail; tel:/mailto:/Anrufen stoppen die Navigation.
export function LeadCard({
  lead,
  archived = false,
  bearbeiterName = null,
}: {
  lead: AkquiseLead;
  archived?: boolean;
  bearbeiterName?: string | null;
}) {
  const router = useRouter();

  const open = () => router.push(`/akquise/${lead.id}?from=akquise`);

  const meta = [lead.branche, lead.region].filter(Boolean).join(" · ");

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      }}
      className="focus-ring flex cursor-pointer flex-col gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 transition-colors active:bg-[var(--surface-hover)]"
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="min-w-0 flex-1 truncate text-lg font-semibold tracking-tight text-[var(--text-primary)]">
          {lead.firma || lead.domain || "Lead"}
        </h2>
        <AkquiseStatusBadge status={lead.akquise_status} />
      </div>

      {meta && (
        <p className="-mt-1 truncate text-sm text-[var(--text-tertiary)]">{meta}</p>
      )}

      {lead.bearbeitung_von && (
        <BearbeitungBadge name={bearbeiterName} className="w-fit" />
      )}

      {lead.notiz && (
        <p className="truncate text-sm text-[var(--text-secondary)]">{lead.notiz}</p>
      )}

      <div className="flex flex-col gap-1 text-sm">
        {lead.telefon ? (
          <a
            href={`tel:${lead.telefon}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex w-fit items-center gap-2 text-[var(--text-secondary)]"
          >
            <Phone className="size-4 text-[var(--text-tertiary)]" strokeWidth={1.75} aria-hidden />
            {lead.telefon}
          </a>
        ) : (
          <span className="inline-flex items-center gap-2 text-[var(--text-tertiary)]">
            <Phone className="size-4" strokeWidth={1.75} aria-hidden />
            Keine Nummer
          </span>
        )}
        {lead.email && (
          <a
            href={`mailto:${lead.email}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex w-fit items-center gap-2 truncate text-[var(--text-secondary)]"
          >
            <Mail className="size-4 text-[var(--text-tertiary)]" strokeWidth={1.75} aria-hidden />
            <span className="truncate">{lead.email}</span>
          </a>
        )}
      </div>

      <div className="flex items-center gap-2">
        {lead.telefon ? (
          <a
            href={`tel:${lead.telefon}`}
            onClick={(e) => e.stopPropagation()}
            className="focus-ring inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md bg-[var(--accent)] px-4 text-sm font-semibold text-white active:bg-[var(--accent-hover)]"
          >
            <Phone className="size-4" strokeWidth={2} aria-hidden />
            Anrufen
          </a>
        ) : (
          <span className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-4 text-sm font-semibold text-[var(--text-tertiary)]">
            <Phone className="size-4" strokeWidth={2} aria-hidden />
            Anrufen
          </span>
        )}
        {archived && (
          <span onClick={(e) => e.stopPropagation()}>
            <ArchiveLeadButton leadId={lead.id} archiviert />
          </span>
        )}
      </div>
    </div>
  );
}
