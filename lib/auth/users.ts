import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type AppUserRef = {
  id: string;
  full_name: string | null;
};

export async function getAdminUser(): Promise<AppUserRef> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("id, full_name")
    .eq("role", "admin")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    throw new Error("Kein Admin-Benutzer gefunden.");
  }

  return { id: data.id as string, full_name: data.full_name as string | null };
}

export async function getVertriebUser(): Promise<AppUserRef> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("id, full_name")
    .eq("role", "vertrieb")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    throw new Error("Kein Vertrieb-Benutzer gefunden.");
  }

  return { id: data.id as string, full_name: data.full_name as string | null };
}
