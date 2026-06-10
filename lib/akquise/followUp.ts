import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

const FOLLOW_UP_DAYS = 7;
const AUTO_NOTIZ = "Auto-Follow-up: Angebot vor 7+ Tagen rausgegangen";

function referenceTimestamp(lead: {
  aktion_seit: string | null;
  updated_at: string | null;
}): Date | null {
  const raw = lead.aktion_seit ?? lead.updated_at;
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function ensureFollowUps(): Promise<{ updated: number }> {
  const supabase = createAdminClient();
  const cutoff = new Date(Date.now() - FOLLOW_UP_DAYS * 24 * 60 * 60 * 1000);

  const { data, error } = await supabase
    .from("leads")
    .select("id, aktion_seit, updated_at")
    .eq("akquise_status", "angebot_raus")
    .eq("aktion_benoetigt", "keine")
    .eq("archiviert", false);

  if (error) {
    throw new Error(error.message);
  }

  const ids = (data ?? [])
    .filter((lead) => {
      const ref = referenceTimestamp(lead);
      return ref !== null && ref <= cutoff;
    })
    .map((lead) => lead.id);

  if (ids.length === 0) {
    return { updated: 0 };
  }

  const now = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("leads")
    .update({
      aktion_benoetigt: "angebot",
      aktion_notiz: AUTO_NOTIZ,
      aktion_seit: now,
    })
    .in("id", ids);

  if (updateError) {
    throw new Error(updateError.message);
  }

  return { updated: ids.length };
}
