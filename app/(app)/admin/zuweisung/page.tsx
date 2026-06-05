import type { Metadata } from "next";
import { listAllLeadsForAssignment, listUsers } from "@/lib/admin/queries";
import { AssignmentClient } from "@/components/admin/AssignmentClient";

export const metadata: Metadata = { title: "Zuweisung" };
export const dynamic = "force-dynamic";

export default async function ZuweisungPage() {
  const [leads, users] = await Promise.all([
    listAllLeadsForAssignment(),
    listUsers(),
  ]);

  const userOptions = users.map((u) => ({
    id: u.id,
    label: u.full_name ? `${u.full_name} (${u.email ?? "?"})` : u.email ?? u.id,
  }));

  return (
    <div className="space-y-6">
      <div>
        <div className="label-caps">Admin</div>
        <h1 className="text-xl font-medium tracking-tight">Lead-Zuweisung</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Leads filtern, auswählen und einem Vertriebsnutzer zuweisen.
        </p>
      </div>
      <AssignmentClient leads={leads} users={userOptions} />
    </div>
  );
}
