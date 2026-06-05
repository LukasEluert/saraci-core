import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Role = "admin" | "vertrieb";

export interface CurrentProfile {
  id: string;
  email: string | null;
  role: Role;
  full_name: string | null;
  calendar_token: string;
}

export async function getCurrentProfile(): Promise<CurrentProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, role, full_name, calendar_token")
    .eq("id", user.id)
    .maybeSingle();

  if (!data) return null;

  return {
    id: data.id,
    email: user.email ?? null,
    role: (data.role as Role) ?? "vertrieb",
    full_name: data.full_name ?? null,
    calendar_token: data.calendar_token as string,
  };
}

export async function requireUser(): Promise<CurrentProfile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  return profile;
}

export async function requireAdmin(): Promise<CurrentProfile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "admin") redirect("/akquise");
  return profile;
}
