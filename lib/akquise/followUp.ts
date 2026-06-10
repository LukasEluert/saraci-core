import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { getVertriebUser } from "@/lib/auth/users";

const FOLLOW_UP_DAYS = 7;

export async function ensureFollowUps(): Promise<{ updated: number }> {
  const supabase = createAdminClient();
  const diego = await getVertriebUser();
  const cutoff = new Date(Date.now() - FOLLOW_UP_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("leads")
    .select("id")
    .in("akquise_status", ["angebot_raus", "email_raus"])
    .eq("archiviert", false)
    .lte("updated_at", cutoff);

  if (error) {
    throw new Error(error.message);
  }

  const ids = (data ?? []).map((lead) => lead.id);
  if (ids.length === 0) {
    return { updated: 0 };
  }

  const { error: updateError } = await supabase
    .from("leads")
    .update({ akquise_status: "nachfassen", assigned_to: diego.id })
    .in("id", ids);

  if (updateError) {
    throw new Error(updateError.message);
  }

  return { updated: ids.length };
}
