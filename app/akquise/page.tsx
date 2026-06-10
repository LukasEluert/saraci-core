import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth/profile";
import { listAkquiseLeads } from "@/lib/akquise/queries";
import { ensureBackgroundTasks } from "@/lib/akquise/backgroundTasks";
import { deriveFilterOptions } from "@/lib/akquise/swimlanes";
import { getAdminUser } from "@/lib/auth/users";
import { resolveUserDisplayNames } from "@/lib/admin/queries";
import { getLatestLeadNotesMap } from "@/lib/akquise/leadNotes";
import { AkquiseSwimlaneView } from "@/components/akquise/AkquiseSwimlaneView";
import { AkquiseLeadListSection } from "@/components/akquise/AkquiseLeadListSection";

export const metadata: Metadata = { title: "Akquise" };
export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AkquisePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const showArchived = params.archiv === "1";

  try {
    await ensureBackgroundTasks();
  } catch (err) {
    console.error("[ensureBackgroundTasks]", err);
  }

  const [leads, profile, adminUser] = await Promise.all([
    listAkquiseLeads({ archived: showArchived }),
    getCurrentProfile(),
    getAdminUser(),
  ]);

  const { branchen, regionen, assigneeIds } = deriveFilterOptions(leads);
  const assigneeLabels = await resolveUserDisplayNames(assigneeIds);
  const latestNotes = await getLatestLeadNotesMap(leads.map((l) => l.id));

  const assigneeOptions = assigneeIds.map((id) => ({
    id,
    label: assigneeLabels[id] ?? id,
  }));

  const archiveHref = showArchived ? "/akquise" : "/akquise?archiv=1";

  if (showArchived) {
    return (
      <div className="flex h-full flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="label-caps">Akquise</div>
            <h1 className="text-xl font-medium tracking-tight">Archiv</h1>
            <p className="text-sm text-[var(--text-secondary)]">
              {leads.length} {leads.length === 1 ? "Eintrag" : "Einträge"}
            </p>
          </div>
          <Link
            href={archiveHref}
            className="focus-ring rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            Aktive Leads
          </Link>
        </div>

        {leads.length === 0 ? (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-10 text-center text-sm text-[var(--text-secondary)] md:rounded-md">
            Keine archivierten Leads.
          </div>
        ) : (
          <AkquiseLeadListSection
            leads={leads}
            adminUserId={adminUser.id}
            assigneeLabels={assigneeLabels}
            showArchived
            latestNotes={latestNotes}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div>
        <div className="label-caps">Akquise</div>
        <h1 className="text-xl font-medium tracking-tight">Meine Leads</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          {leads.length} {leads.length === 1 ? "Eintrag" : "Einträge"} gesamt
        </p>
      </div>

      {profile ? (
        <AkquiseSwimlaneView
          leads={leads}
          adminUserId={adminUser.id}
          assigneeLabels={assigneeLabels}
          latestNotes={latestNotes}
          branchen={branchen}
          regionen={regionen}
          assigneeOptions={assigneeOptions}
          calendarToken={profile.calendar_token}
          archiveHref={archiveHref}
          showArchived={false}
        />
      ) : (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-10 text-center text-sm text-[var(--text-secondary)]">
          Bitte anmelden.
        </div>
      )}
    </div>
  );
}
