import type { Metadata } from "next";
import { listAssignedLeads, getLastActivityMap } from "@/lib/akquise/queries";
import { listUsers } from "@/lib/admin/queries";
import { getCurrentProfile } from "@/lib/auth/profile";
import { AdminOverview } from "@/components/admin/AdminOverview";

export const metadata: Metadata = { title: "Handlungsbedarf" };
export const dynamic = "force-dynamic";

export default async function AdminUebersichtPage() {
  // listAssignedLeads laeuft ueber den eingeloggten Client; als Admin liefert RLS alle Leads.
  const [leads, users, lastActivity, profile] = await Promise.all([
    listAssignedLeads(),
    listUsers(),
    getLastActivityMap(),
    getCurrentProfile(),
  ]);

  const userLabels: Record<string, string> = Object.fromEntries(
    users.map((u) => [
      u.id,
      u.full_name ? `${u.full_name}` : u.email ?? u.id,
    ])
  );

  return (
    <div className="space-y-6">
      <div>
        <div className="label-caps">Admin</div>
        <h1 className="text-xl font-medium tracking-tight">Handlungsübersicht</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Wo du ran musst: angeforderte Aktionen und warme Interessenten zuerst.
        </p>
      </div>
      <AdminOverview
        leads={leads}
        userLabels={userLabels}
        lastActivity={lastActivity}
        currentUserId={profile?.id ?? ""}
      />
    </div>
  );
}
