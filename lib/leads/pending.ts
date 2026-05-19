import { createAdminClient } from "@/lib/supabase/admin";

export async function getPendingLeadIds(): Promise<Set<string>> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("core_events")
    .select("metadata")
    .eq("type", "lead.check_requested")
    .eq("processed", false);

  if (error || !data) return new Set();

  const ids = new Set<string>();
  for (const row of data) {
    const meta = row.metadata as { lead_id?: string } | null;
    if (meta?.lead_id) ids.add(meta.lead_id);
  }
  return ids;
}
