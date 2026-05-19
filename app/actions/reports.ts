"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function deleteLeadReport(id: string) {
  const supabaseAuth = await createClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  if (!user) {
    throw new Error("Nicht angemeldet.");
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("lead_reports").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/berichte");
  revalidatePath("/overview");
  return { ok: true as const };
}
