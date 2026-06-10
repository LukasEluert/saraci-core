import Link from "next/link";
import { StatusSelect } from "@/components/akquise/StatusSelect";
import { ArchiveLeadButton } from "@/components/akquise/ArchiveLeadButton";
import { LeadCard } from "@/components/akquise/LeadCard";
import { BearbeitungBadge } from "@/components/akquise/BearbeitungBadge";
import { isLeadInArbeit } from "@/lib/akquise/inArbeit";
import { formatCreatedAt } from "@/lib/leads/format";
import type { AkquiseLead } from "@/lib/akquise/types";
import { cn } from "@/lib/utils";

function websiteHref(domain: string): string {
  return domain.startsWith("http") ? domain : `https://${domain}`;
}

export function AkquiseLeadListSection({
  leads,
  adminUserId,
  assigneeLabels,
  showArchived,
  latestNotes = {},
  highlight = false,
}: {
  leads: AkquiseLead[];
  adminUserId: string;
  assigneeLabels: Record<string, string>;
  showArchived: boolean;
  latestNotes?: Record<string, string>;
  highlight?: boolean;
}) {
  const wrapperClass = highlight
    ? "rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)]/30 p-2"
    : undefined;

  return (
    <>
      <div className={cn("min-h-0 flex-1 space-y-2 overflow-auto md:hidden", wrapperClass)}>
        {leads.map((lead) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            archived={showArchived}
            adminUserId={adminUserId}
            assigneeLabels={assigneeLabels}
            latestNote={latestNotes[lead.id] ?? null}
          />
        ))}
      </div>

      <div
        className={cn(
          "hidden min-h-0 flex-1 overflow-auto rounded-md border border-[var(--border)] bg-[var(--surface)] md:block",
          highlight && "border-[var(--border)] bg-[var(--bg-elevated)]/30"
        )}
      >
        <table className="w-full border-collapse text-left text-[13px] tracking-[-0.01em]">
          <thead className="sticky top-0 z-10 bg-[var(--surface-hover)]">
            <tr className="label-caps text-[10px] text-[var(--text-tertiary)] [&>th]:border-b [&>th]:border-[var(--border)] [&>th]:px-4 [&>th]:py-3 [&>th]:font-semibold">
              <th>Firma</th>
              <th className="hidden md:table-cell">Branche</th>
              <th className="hidden lg:table-cell">Stadt</th>
              <th>Status</th>
              <th className="hidden sm:table-cell">Telefon</th>
              <th className="hidden xl:table-cell">Mail</th>
              <th className="hidden lg:table-cell">Website</th>
              <th className="hidden xl:table-cell">Notiz</th>
              <th>Erstellt</th>
              {showArchived && <th className="text-right">Aktion</th>}
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => {
              const inArbeit = isLeadInArbeit(lead.assigned_to, adminUserId);
              const assigneeName =
                lead.assigned_to != null
                  ? assigneeLabels[lead.assigned_to] ?? null
                  : null;

              return (
                <tr
                  key={lead.id}
                  className="border-b border-[var(--border-subtle)] transition-colors hover:bg-[var(--surface-hover)] [&>td]:px-4 [&>td]:py-3"
                >
                  <td className="font-medium text-[var(--text-primary)]">
                    <Link
                      href={`/akquise/${lead.id}?from=akquise`}
                      className="hover:text-[var(--accent)] hover:underline"
                    >
                      {lead.firma || lead.domain}
                    </Link>
                    {inArbeit && (
                      <div className="mt-1">
                        <BearbeitungBadge name={assigneeName} />
                      </div>
                    )}
                  </td>
                  <td className="hidden text-[var(--text-secondary)] md:table-cell">
                    {lead.branche || "—"}
                  </td>
                  <td className="hidden text-[var(--text-secondary)] lg:table-cell">
                    {lead.region || "—"}
                  </td>
                  <td>
                    <StatusSelect leadId={lead.id} value={lead.akquise_status} />
                  </td>
                  <td className="hidden text-[var(--text-secondary)] sm:table-cell">
                    {lead.telefon ? (
                      <a href={`tel:${lead.telefon}`} className="hover:text-[var(--accent)]">
                        {lead.telefon}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="hidden text-[var(--text-secondary)] xl:table-cell">
                    {lead.email ? (
                      <a href={`mailto:${lead.email}`} className="hover:text-[var(--accent)]">
                        {lead.email}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="hidden lg:table-cell">
                    {lead.domain ? (
                      <a
                        href={websiteHref(lead.domain)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-[12px] text-[var(--accent)] hover:underline"
                      >
                        {lead.domain}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="hidden max-w-[260px] xl:table-cell">
                    <span
                      className="block truncate text-[var(--text-tertiary)]"
                      title={latestNotes[lead.id] ?? undefined}
                    >
                      {latestNotes[lead.id] || "—"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap text-[var(--text-tertiary)]">
                    {formatCreatedAt(lead.created_at)}
                  </td>
                  {showArchived && (
                    <td className="text-right">
                      <div className="flex justify-end">
                        <ArchiveLeadButton leadId={lead.id} archiviert />
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
