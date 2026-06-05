"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/profile";
import { createAdminClient } from "@/lib/supabase/admin";

type Role = "admin" | "vertrieb";

export async function setUserRole(userId: string, role: Role) {
  await requireAdmin();
  if (!["admin", "vertrieb"].includes(role)) {
    throw new Error("Ungültige Rolle.");
  }
  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ role })
    .eq("id", userId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/nutzer");
}

export async function createUser(input: {
  email: string;
  password: string;
  fullName?: string;
  role: Role;
}) {
  await requireAdmin();

  const email = input.email.trim().toLowerCase();
  if (!email || !input.password || input.password.length < 8) {
    throw new Error("E-Mail und Passwort (min. 8 Zeichen) erforderlich.");
  }

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: input.password,
    email_confirm: true,
  });

  if (error || !data.user) {
    throw new Error(error?.message || "Nutzer konnte nicht angelegt werden.");
  }

  // Profil wird per Trigger angelegt; Rolle + Name setzen.
  const { error: profileError } = await admin
    .from("profiles")
    .update({
      role: input.role,
      full_name: input.fullName?.trim() || null,
    })
    .eq("id", data.user.id);

  if (profileError) throw new Error(profileError.message);

  revalidatePath("/admin/nutzer");
  return { ok: true as const };
}

export async function regenerateCalendarToken(userId: string) {
  await requireAdmin();
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .update({ calendar_token: crypto.randomUUID() })
    .eq("id", userId)
    .select("calendar_token")
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/admin/nutzer");
  return { token: data.calendar_token as string };
}

export async function assignLeads(leadIds: string[], assignedTo: string | null) {
  await requireAdmin();
  if (leadIds.length === 0) return { ok: true as const, count: 0 };

  const admin = createAdminClient();
  const { error, count } = await admin
    .from("leads")
    .update({ assigned_to: assignedTo }, { count: "exact" })
    .in("id", leadIds);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/zuweisung");
  revalidatePath("/akquise");
  return { ok: true as const, count: count ?? leadIds.length };
}
