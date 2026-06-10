import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Role } from "@/lib/auth/profile";

export interface AdminUser {
  id: string;
  role: Role;
  full_name: string | null;
  calendar_token: string;
  email: string | null;
  created_at: string | null;
}

export interface AssignableLead {
  id: string;
  firma: string | null;
  branche: string | null;
  region: string | null;
  domain: string;
  assigned_to: string | null;
  akquise_status: string | null;
}

export async function listUsers(): Promise<AdminUser[]> {
  const admin = createAdminClient();

  const { data: profiles, error } = await admin
    .from("profiles")
    .select("id, role, full_name, calendar_token, created_at")
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  const { data: authUsers } = await admin.auth.admin.listUsers();
  const emailById = new Map(
    (authUsers?.users ?? []).map((u) => [u.id, u.email ?? null])
  );

  return (profiles ?? []).map((p) => ({
    id: p.id,
    role: (p.role as Role) ?? "vertrieb",
    full_name: p.full_name ?? null,
    calendar_token: p.calendar_token as string,
    email: emailById.get(p.id) ?? null,
    created_at: p.created_at ?? null,
  }));
}

/**
 * Loest User-IDs zu Anzeigenamen (full_name) auf - server-only, read-only.
 * Noetig, weil RLS dem Vertrieb fremde profiles-Zeilen verbirgt; hier wird
 * ausschliesslich der Anzeigename fuer das "in Bearbeitung"-Badge geholt.
 */
export async function resolveUserNames(
  ids: string[]
): Promise<Record<string, string | null>> {
  const unique = Array.from(new Set(ids.filter(Boolean)));
  if (unique.length === 0) return {};

  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("id, full_name")
    .in("id", unique);

  return Object.fromEntries(
    (data ?? []).map((p) => [p.id as string, (p.full_name as string) ?? null])
  );
}

/** Anzeigename: full_name, sonst E-Mail-Lokalteil, sonst „Unbekannt“. */
export function formatUserDisplayName(
  fullName: string | null | undefined,
  email: string | null | undefined
): string {
  const name = fullName?.trim();
  if (name) return name;

  const mail = email?.trim();
  if (mail) {
    const local = mail.split("@")[0]?.trim();
    if (local) return local;
  }

  return "Unbekannt";
}

/** Wie resolveUserNames, aber mit E-Mail-Fallback fuer Verlauf-Autoren etc. */
export async function resolveUserDisplayNames(
  ids: string[]
): Promise<Record<string, string>> {
  const unique = Array.from(new Set(ids.filter(Boolean)));
  if (unique.length === 0) return {};

  const admin = createAdminClient();
  const { data: profiles } = await admin
    .from("profiles")
    .select("id, full_name")
    .in("id", unique);

  const fullNameById = new Map(
    (profiles ?? []).map((p) => [p.id as string, (p.full_name as string | null) ?? null])
  );

  const entries = await Promise.all(
    unique.map(async (id) => {
      const { data } = await admin.auth.admin.getUserById(id);
      return [id, formatUserDisplayName(fullNameById.get(id), data.user?.email ?? null)] as const;
    })
  );

  return Object.fromEntries(entries);
}

export async function listAllLeadsForAssignment(): Promise<AssignableLead[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("leads")
    .select("id, firma, branche, region, domain, assigned_to, akquise_status")
    .eq("archiviert", false)
    .order("firma", { ascending: true, nullsFirst: false })
    .limit(2000);

  if (error) throw new Error(error.message);
  return (data ?? []) as AssignableLead[];
}
