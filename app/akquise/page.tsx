import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth/profile";
import { listAssignedLeads } from "@/lib/akquise/queries";
import { StatusSelect } from "@/components/akquise/StatusSelect";
import { SubscribeButton } from "@/components/akquise/SubscribeButton";
import { NewLeadDialog } from "@/components/akquise/NewLeadDialog";
import { ArchiveLeadButton } from "@/components/akquise/ArchiveLeadButton";
import { LeadCard } from "@/components/akquise/LeadCard";

export const metadata: Metadata = { title: "Akquise" };
export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function websiteHref(domain: string): string {
  return domain.startsWith("http") ? domain : `https://${domain}`;
}

export default async function AkquisePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : undefined;
  const showArchived = params.archiv === "1";

  const [leads, profile] = await Promise.all([
    listAssignedLeads(q, { archived: showArchived }),
    getCurrentProfile(),
  ]);

  const toggleHref = showArchived
    ? q
      ? `/akquise?q=${encodeURIComponent(q)}`
      : "/akquise"
    : q
      ? `/akquise?archiv=1&q=${encodeURIComponent(q)}`
      : "/akquise?archiv=1";

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="label-caps">Akquise</div>
          <h1 className="text-xl font-medium tracking-tight">
            {showArchived ? "Archiv" : "Meine Leads"}
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            {leads.length} {leads.length === 1 ? "Eintrag" : "Einträge"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={toggleHref}
            className="focus-ring rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            {showArchived ? "Aktive Leads" : "Archiv"}
          </Link>
          {!showArchived && <NewLeadDialog />}
          {profile && <SubscribeButton token={profile.calendar_token} />}
        </div>
      </div>

      <form method="get" className="flex gap-2">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Firma, Branche, Stadt oder Website suchen…"
          className="focus-ring w-full max-w-[420px] rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)]"
        />
        <button
          type="submit"
          className="focus-ring rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          Suchen
        </button>
      </form>

      {/* Mobile (< md): Karten-Liste, auf "anrufen" optimiert */}
      <div className="min-h-0 flex-1 space-y-2 overflow-auto md:hidden">
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} archived={showArchived} />
        ))}
        {leads.length === 0 && (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-10 text-center text-sm text-[var(--text-secondary)]">
            {showArchived ? "Keine archivierten Leads." : "Keine zugewiesenen Leads."}
          </div>
        )}
      </div>

      {/* Desktop (>= md): bestehende Tabelle unveraendert */}
      <div className="hidden min-h-0 flex-1 overflow-auto rounded-md border border-[var(--border)] bg-[var(--surface)] md:block">
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
              {showArchived && <th className="text-right">Aktion</th>}
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr
                key={lead.id}
                className="border-b border-[var(--border-subtle)] transition-colors hover:bg-[var(--surface-hover)] [&>td]:px-4 [&>td]:py-3"
              >
                <td className="font-medium text-[var(--text-primary)]">
                  <Link
                    href={`/akquise/${lead.id}`}
                    className="hover:text-[var(--accent)] hover:underline"
                  >
                    {lead.firma || lead.domain}
                  </Link>
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
                    <a
                      href={`tel:${lead.telefon}`}
                      className="hover:text-[var(--accent)]"
                    >
                      {lead.telefon}
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="hidden text-[var(--text-secondary)] xl:table-cell">
                  {lead.email ? (
                    <a
                      href={`mailto:${lead.email}`}
                      className="hover:text-[var(--accent)]"
                    >
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
                    title={lead.notiz ?? undefined}
                  >
                    {lead.notiz || "—"}
                  </span>
                </td>
                {showArchived && (
                  <td className="text-right">
                    <div className="flex justify-end">
                      <ArchiveLeadButton leadId={lead.id} archiviert />
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {leads.length === 0 && (
          <div className="p-10 text-center text-sm text-[var(--text-secondary)]">
            {showArchived ? "Keine archivierten Leads." : "Keine zugewiesenen Leads."}
          </div>
        )}
      </div>
    </div>
  );
}
