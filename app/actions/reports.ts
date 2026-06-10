"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/profile";
import { createAdminClient } from "@/lib/supabase/admin";

export async function deleteLeadReport(id: string) {
  await requireAdmin();

  const supabase = createAdminClient();
  const { error } = await supabase.from("lead_reports").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/berichte");
  revalidatePath("/overview");
  return { ok: true as const };
}
