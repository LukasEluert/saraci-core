import type { Metadata } from "next";
import { listUsers } from "@/lib/admin/queries";
import { UsersAdmin } from "@/components/admin/UsersAdmin";

export const metadata: Metadata = { title: "Nutzer" };
export const dynamic = "force-dynamic";

export default async function NutzerPage() {
  const users = await listUsers();

  return (
    <div className="space-y-6">
      <div>
        <div className="label-caps">Admin</div>
        <h1 className="text-xl font-medium tracking-tight">Nutzerverwaltung</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Nutzer anlegen, Rolle setzen und Kalender-Link einsehen.
        </p>
      </div>
      <UsersAdmin users={users} />
    </div>
  );
}
