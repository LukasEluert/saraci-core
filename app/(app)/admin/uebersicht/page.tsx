import type { Metadata } from "next";
import { listAssignedLeads, getLastActivityMap } from "@/lib/akquise/queries";
import { ensureBackgroundTasks } from "@/lib/akquise/backgroundTasks";
import { getLatestLeadNotesMap } from "@/lib/akquise/leadNotes";
import { listUsers } from "@/lib/admin/queries";
import { getCurrentProfile } from "@/lib/auth/profile";
import { getAdminUser } from "@/lib/auth/users";
import { AdminOverview } from "@/components/admin/AdminOverview";

export const metadata: Metadata = { title: "Handlungsbedarf" };
export const dynamic = "force-dynamic";

export default async function AdminUebersichtPage() {
  let followUpUpdated = 0;
  try {
    const result = await ensureBackgroundTasks();
    followUpUpdated = result.followUpUpdated;
  } catch (err) {
    console.error("[ensureBackgroundTasks]", err);
  }

  // listAssignedLeads laeuft ueber den eingeloggten Client; als Admin liefert RLS alle Leads.
  const [leads, users, lastActivity, profile, adminUser] = await Promise.all([
    listAssignedLeads(),
    listUsers(),
    getLastActivityMap(),
    getCurrentProfile(),
    getAdminUser(),
  ]);

  const userLabels: Record<string, string> = Object.fromEntries(
    users.map((u) => [
      u.id,
      u.full_name ? `${u.full_name}` : u.email ?? u.id,
    ])
  );
  const latestNotes = await getLatestLeadNotesMap(leads.map((l) => l.id));

  return (
    <div className="space-y-6">
      <div>
        <div className="label-caps">Admin</div>
        <h1 className="text-xl font-medium tracking-tight">Handlungsübersicht</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Wo du ran musst: angeforderte Aktionen und warme Interessenten zuerst.
        </p>
      </div>

      {followUpUpdated > 0 && (
        <div className="rounded-md border border-[var(--warning)]/40 bg-[var(--warning)]/10 px-4 py-3 text-sm text-[var(--text-secondary)]">
          {followUpUpdated}{" "}
          {followUpUpdated === 1 ? "Lead" : "Leads"} automatisch auf Nachfassen gesetzt
          (Angebot/Email vor 7+ Tagen).
        </div>
      )}

      <AdminOverview
        leads={leads}
        userLabels={userLabels}
        lastActivity={lastActivity}
        currentUserId={profile?.id ?? ""}
        adminUserId={adminUser.id}
        latestNotes={latestNotes}
      />
    </div>
  );
}
