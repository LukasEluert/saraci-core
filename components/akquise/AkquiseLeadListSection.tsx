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
  swimlaneLayout = false,
}: {
  leads: AkquiseLead[];
  adminUserId: string;
  assigneeLabels: Record<string, string>;
  showArchived: boolean;
  latestNotes?: Record<string, string>;
  highlight?: boolean;
  swimlaneLayout?: boolean;
}) {
  const wrapperClass = highlight
    ? "rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)]/30 p-2"
    : undefined;

  return (
    <>
      <div className={cn("space-y-2 md:hidden", wrapperClass)}>
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
          "hidden overflow-auto rounded-md border border-[var(--border)] bg-[var(--surface)] md:block",
          swimlaneLayout && "border-0 bg-transparent",
          highlight && !swimlaneLayout && "border-[var(--border)] bg-[var(--bg-elevated)]/30"
        )}
      >
        <table className="w-full border-collapse text-left text-[13px] tracking-[-0.01em]">
          <thead className="sticky top-0 z-[1] bg-[var(--surface-hover)]">
            <tr className="label-caps text-[10px] text-[var(--text-tertiary)] [&>th]:border-b [&>th]:border-[var(--border)] [&>th]:px-4 [&>th]:py-3 [&>th]:font-semibold">
              <th>Firma</th>
              {!swimlaneLayout && (
                <>
                  <th className="hidden md:table-cell">Branche</th>
                  <th className="hidden lg:table-cell">Stadt</th>
                </>
              )}
              <th>Status</th>
              {swimlaneLayout && <th className="hidden lg:table-cell">Notiz</th>}
              <th className={swimlaneLayout ? "hidden sm:table-cell" : "hidden sm:table-cell"}>
                Telefon
              </th>
              {!swimlaneLayout && (
                <>
                  <th className="hidden xl:table-cell">Mail</th>
                  <th className="hidden lg:table-cell">Website</th>
                  <th className="hidden xl:table-cell">Notiz</th>
                </>
              )}
              {swimlaneLayout && (
                <th className="hidden md:table-cell">Zugewiesen</th>
              )}
              <th>Erstellt</th>
              {showArchived && <th className="text-right">Aktion</th>}
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => {
              const inArbeit = isLeadInArbeit(lead.assigned_to, adminUserId);
              const assigneeName =
                lead.assigned_to != null
                  ? assigneeLabels[lead.assigned_to] ?? "—"
                  : "—";
              const meta = [lead.branche, lead.region].filter(Boolean).join(" · ");

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
                    {swimlaneLayout && meta && (
                      <div className="mt-0.5 text-xs text-[var(--text-tertiary)]">{meta}</div>
                    )}
                    {inArbeit && (
                      <div className="mt-1">
                        <BearbeitungBadge
                          name={
                            lead.assigned_to != null
                              ? assigneeLabels[lead.assigned_to] ?? null
                              : null
                          }
                        />
                      </div>
                    )}
                  </td>
                  {!swimlaneLayout && (
                    <>
                      <td className="hidden text-[var(--text-secondary)] md:table-cell">
                        {lead.branche || "—"}
                      </td>
                      <td className="hidden text-[var(--text-secondary)] lg:table-cell">
                        {lead.region || "—"}
                      </td>
                    </>
                  )}
                  <td>
                    <StatusSelect leadId={lead.id} value={lead.akquise_status} />
                  </td>
                  {swimlaneLayout && (
                    <td className="hidden max-w-[240px] lg:table-cell">
                      <span
                        className="block truncate text-[var(--text-tertiary)]"
                        title={latestNotes[lead.id] ?? undefined}
                      >
                        {latestNotes[lead.id] || "—"}
                      </span>
                    </td>
                  )}
                  <td className="hidden text-[var(--text-secondary)] sm:table-cell">
                    {lead.telefon ? (
                      <a href={`tel:${lead.telefon}`} className="hover:text-[var(--accent)]">
                        {lead.telefon}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  {!swimlaneLayout && (
                    <>
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
                    </>
                  )}
                  {swimlaneLayout && (
                    <td className="hidden text-[var(--text-secondary)] md:table-cell">
                      {assigneeName}
                    </td>
                  )}
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
