import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth/profile";
import { listAssignedLeads } from "@/lib/akquise/queries";
import { ensureBackgroundTasks } from "@/lib/akquise/backgroundTasks";
import { isUpdatedTodayBerlin } from "@/lib/akquise/dates";
import { resolveUserNames } from "@/lib/admin/queries";
import { SubscribeButton } from "@/components/akquise/SubscribeButton";
import { NewLeadDialog } from "@/components/akquise/NewLeadDialog";
import { AkquiseLeadListSection } from "@/components/akquise/AkquiseLeadListSection";

export const metadata: Metadata = { title: "Akquise" };
export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AkquisePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : undefined;
  const showArchived = params.archiv === "1";

  try {
    await ensureBackgroundTasks();
  } catch (err) {
    console.error("[ensureBackgroundTasks]", err);
  }

  const [leads, profile] = await Promise.all([
    listAssignedLeads(q, { archived: showArchived }),
    getCurrentProfile(),
  ]);

  const todayLeads = leads.filter((lead) => isUpdatedTodayBerlin(lead.updated_at));
  const pipelineLeads = leads.filter((lead) => !isUpdatedTodayBerlin(lead.updated_at));
  const hasTodaySection = todayLeads.length > 0;

  const bearbeiterNames = await resolveUserNames(
    leads.map((l) => l.bearbeitung_von).filter((v): v is string => !!v)
  );

  const toggleHref = showArchived
    ? q
      ? `/akquise?q=${encodeURIComponent(q)}`
      : "/akquise"
    : q
      ? `/akquise?archiv=1&q=${encodeURIComponent(q)}`
      : "/akquise?archiv=1";

  const emptyMessage = showArchived
    ? "Keine archivierten Leads."
    : "Keine zugewiesenen Leads.";

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

      {leads.length === 0 ? (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-10 text-center text-sm text-[var(--text-secondary)] md:rounded-md">
          {emptyMessage}
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-6">
          {hasTodaySection && (
            <section className="flex min-h-0 flex-col gap-2">
              <h2 className="text-sm font-medium text-[var(--text-secondary)]">
                Heute bearbeitet ({todayLeads.length})
              </h2>
              <AkquiseLeadListSection
                leads={todayLeads}
                bearbeiterNames={bearbeiterNames}
                showArchived={showArchived}
                highlight
              />
            </section>
          )}

          {pipelineLeads.length > 0 && (
            <section className="flex min-h-0 flex-1 flex-col gap-2">
              {hasTodaySection && (
                <h2 className="text-sm font-medium text-[var(--text-secondary)]">Pipeline</h2>
              )}
              <AkquiseLeadListSection
                leads={pipelineLeads}
                bearbeiterNames={bearbeiterNames}
                showArchived={showArchived}
              />
            </section>
          )}
        </div>
      )}
    </div>
  );
}
