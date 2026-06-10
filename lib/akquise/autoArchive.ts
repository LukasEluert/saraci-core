import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

const ARCHIVE_AFTER_HOURS = 24;

export async function ensureAutoArchive(): Promise<{ archived: number }> {
  const supabase = createAdminClient();
  const cutoff = new Date(Date.now() - ARCHIVE_AFTER_HOURS * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("leads")
    .select("id")
    .eq("akquise_status", "kein_interesse")
    .eq("archiviert", false)
    .lte("updated_at", cutoff);

  if (error) {
    throw new Error(error.message);
  }

  const ids = (data ?? []).map((lead) => lead.id);
  if (ids.length === 0) {
    return { archived: 0 };
  }

  const { error: updateError } = await supabase
    .from("leads")
    .update({ archiviert: true })
    .in("id", ids);

  if (updateError) {
    throw new Error(updateError.message);
  }

  return { archived: ids.length };
}
